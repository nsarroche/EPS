import {
  Cmd, just, Maybe, noCmd, nothing
} from 'tea-cup-core';
import {
  CircuitBreaker,
  ErrorMsg,
  Model, NONE, Panel, PanelItem, PanelRow
} from './Model';
import { PanelState } from './SidePanel/SidePanelModel';

// todo
// - recap
// - validation
// - import / export
// - print

export type Msg
    = { kind: 'updateWidth', size: number}
    | { kind: 'updateHeight', size: number}
    | { kind: 'updateItem', item: PanelItem, rowIndex: number, itemIndex: number}
    | { kind: 'openOrClosePanel', item: Maybe<PanelItem>, rowIndex: number, itemIndex: number}
    | { kind: 'updatePanelState', item: Maybe<PanelItem>, editItemName: Maybe<string>, rowIndex: number, itemIndex: number}
    | { kind: 'undo' }
    | { kind: 'redo' }

function emptyRow(size: 13|18): PanelRow {
  return {
    items: Array.from(Array(size - 1).keys()).map((value, index) => (index === 0 ? ({
      value: 63,
      kind: 'DIFFERENTIAL',
      type: 'AC',
      size: 2
    }) : NONE))
  };
}

export const defaultRightPanelState: PanelState = {
  panelItem: nothing,
  itemIndex: -1,
  rowIndex: -1,
  editItemName: nothing,
};

export function initState(): [Model, Cmd<Msg>] {
  const panel: Panel = {
    panelRows: [emptyRow(13)],
    panelWidth: 13,
    rightPanelState: defaultRightPanelState,
    errorMsgs: [],
  };
  const model: Model = {
    panel,
    undoStack: [],
    redoStack: []
  };
  return [model, Cmd.none() as Cmd<Msg>];
}

export function update(msg: Msg, model: Model) : [Model, Cmd<Msg>] {
  switch (msg.kind) {
    case 'updateWidth': {
      // decrease width
      if (msg.size < model.panel.panelWidth) {
        return noCmd({
          ...model,
          panel: {
            ...model.panel,
            panelRows: model.panel.panelRows.map((r) => {
              let sum = 0;
              return ({
                ...r,
                items: r.items.slice(1).reduce((prev, cur) => {
                  // eslint-disable-next-line no-cond-assign
                  if ((sum += cur.size) < msg.size - 1) {
                    prev.push(cur);
                  }
                  return prev;
                }, [r.items[0]] as PanelItem[])
              });
            }),
            panelWidth: msg.size,
          },
          undoStack: [...model.undoStack, model.panel],
          redoStack: []
        });
      }
      // increase width
      return noCmd({
        ...model,
        panel: {
          ...model.panel,
          panelRows: model.panel.panelRows
            .map((r) => ({
              ...r,
              items: [...r.items, ...Array.from(Array(msg.size - model.panel.panelWidth).keys()).map(() => NONE)]
            })),
          panelWidth: msg.size,
        },
        undoStack: [...model.undoStack, model.panel],
        redoStack: []
      });
    }
    case 'updateHeight': {
      if (model.panel.panelRows.length > msg.size) {
        return noCmd({
          ...model,
          panel: {
            ...model.panel,
            panelRows: model.panel.panelRows.slice(0, msg.size),
          },
          undoStack: [...model.undoStack, model.panel],
          redoStack: []
        });
      }
      return noCmd({
        ...model,
        panel: {
          ...model.panel,
          panelRows: [
            ...model.panel.panelRows,
            ...Array.from(Array(msg.size - model.panel.panelRows.length).keys())
              .map(() => emptyRow(model.panel.panelWidth as 13|18))
          ],
        },
        undoStack: [...model.undoStack, model.panel],
        redoStack: []
      });
    }
    case 'updateItem': {
      const newRows = replaceItemInRow(
        model.panel.panelRows,
        msg.item,
        msg.rowIndex,
        msg.itemIndex,
        model.panel.panelWidth
      );
      const errors: ErrorMsg[] = computeErrorMsgs(newRows);
      const shouldCloseSidePanel = msg.item.kind === 'NONE'
          || newRows[msg.rowIndex].items.length !== model.panel.panelRows[msg.rowIndex].items.length;
      return noCmd({
        ...model,
        panel: {
          ...model.panel,
          panelRows: newRows,
          errorMsgs: errors,
          rightPanelState: shouldCloseSidePanel ? defaultRightPanelState : model.panel.rightPanelState,
        },
        undoStack: [...model.undoStack, model.panel],
        redoStack: []
      });
    }
    case 'openOrClosePanel': {
      return noCmd({
        ...model,
        panel: {
          ...model.panel,
          rightPanelState: {
            ...model.panel.rightPanelState,
            rowIndex: msg.rowIndex,
            itemIndex: msg.itemIndex,
            panelItem: msg.item,
            editItemName: msg.item
              .map((item) => (item.kind === 'CIRCUIT_BREAKER' ? just(item.name) : nothing))
              .withDefault(nothing),
          }
        }
      });
    }
    case 'updatePanelState': {
      return noCmd({
        ...model,
        panel: {
          ...model.panel,
          rightPanelState: {
            ...model.panel.rightPanelState,
            panelItem: msg.item,
            editItemName: msg.editItemName
          },
        },
        undoStack: [...model.undoStack, model.panel],
        redoStack: []
      });
    }
    case 'undo': {
      const undoStack = [...model.undoStack];
      const previousPanel = undoStack.pop();
      if (previousPanel) {
        return noCmd({
          ...model,
          panel: previousPanel,
          undoStack: model.undoStack.slice(0, -1),
          redoStack: [...model.redoStack, model.panel]
        });
      }
      return noCmd(model);
    }
    case 'redo': {
      const redoStack = [...model.redoStack];
      const nextPanel = redoStack.pop();
      if (nextPanel) {
        return noCmd({
          ...model,
          panel: nextPanel,
          undoStack: [...model.undoStack, model.panel],
          redoStack: model.redoStack.slice(0, -1)
        });
      }
      return noCmd(model);
    }
  }
}

export function computeErrorMsgs(rows: PanelRow[]) {
  return rows.flatMap((row, rowIndex) => row.items.flatMap((item, itemIndex) => {
    if (item.kind === 'DIFFERENTIAL') {
      const errs : CircuitBreaker[] = [];
      for (let i = itemIndex + 1; i < row.items.length - 1; i++) {
        if (row.items[i].kind !== 'CIRCUIT_BREAKER') {
          break;
        }
        errs.push(row.items[i] as CircuitBreaker);
      }
      const sum = item.type === 'A'
        ? errs.map((item) => item.value as number).reduce((a, b) => a + b, 0)
        : errs.map((item) => (item.isSpecific.isNothing() ? Math.ceil(item.value / 2) : item.value) as number)
          .reduce((a, b) => a + b, 0);
      if (sum >= item.value) {
        return [{
          message: `La somme des disjoncteurs (${sum}A) dépasse la puissance du différentiel (${item.value}A)`,
          rowIndex,
          itemIndex,
        }];
      }
      if (row.items[itemIndex + 1] && row.items[itemIndex + 1].kind === 'DIFFERENTIAL') {
        return [{
          message: 'Un différentiel ne doit pas être suivi d\'un autre differentiel',
          rowIndex,
          itemIndex,
        }];
      }
      return [];
    }
    if (item.kind === 'CIRCUIT_BREAKER' && row.items[itemIndex - 1] !== undefined && row.items[itemIndex - 1].kind === 'NONE') {
      return [{
        message: 'Ne doit pas être isolé',
        rowIndex,
        itemIndex,
      }];
    }
    return [];
  }));
}

export function replaceItemInRow(
  panelRows: PanelRow[],
  item: PanelItem,
  rowIndex: number,
  itemIndex: number,
  panelWidth: number,
) {
  return panelRows.map((r, ri) => {
    if (ri === rowIndex) {
      // Replace item at indicated position
      const items: PanelItem[] = [...r.items];
      if (item.size === 2) { // trying to insert an item with a size of 2
        if (itemIndex && r.items[itemIndex - 1].kind === 'NONE' && r.items[itemIndex].kind === 'NONE') {
          // replace current and previous NONE
          items.splice(itemIndex - 1, 2, item);
        } else if (itemIndex < panelWidth - 1 && r.items[itemIndex + 1].kind === 'NONE' && r.items[itemIndex].kind === 'NONE') {
          // replace current and next NONE
          items.splice(itemIndex, 2, item);
        } else if (r.items[itemIndex].size === 2) {
          // standard update
          items.splice(itemIndex, 1, item);
        }
      } else if (item.kind === 'NONE') { // deleting an item
        if (r.items[itemIndex].size === 2) {
          // delete 1 item at index itemIndex, insert 2 item
          items.splice(itemIndex, 1, item, item);
        } else {
          // delete 1 item at index itemIndex, insert 1 item
          items.splice(itemIndex, 1, item);
        }
      } else { // default case
        items.splice(itemIndex, 1, item);
      }
      return {
        ...r,
        items
      };
    }
    return r;
  });
}

export function getRowWidth(items: PanelItem[]): number {
  return items.map((i) => i.size).reduce((a, b) => a + b, 0);
}
