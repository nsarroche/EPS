import {
  Cmd, Maybe, noCmd, nothing
} from 'tea-cup-core';
import {
  Model, NONE, PanelItem, PanelRow
} from './Model';
import { PanelState } from './SidePanel/SidePanelModel';

// todo
// - update panel properly
// - recap
// - validation
// - undo / redo
// - import / export
// - print

export type Msg
    = { kind: 'NoOp' }
    | { kind: 'updateWidth', size: number}
    | { kind: 'updateHeight', size: number}
    | { kind: 'updateItem', item: PanelItem, rowIndex: number, itemIndex: number}
    | { kind: 'openOrClosePanel', item: Maybe<PanelItem>, rowIndex: number, itemIndex: number}

const emptyRow: PanelRow = {
  items: Array.from(Array(12).keys()).map((value, index) => (index === 0 ? ({
    value: 63,
    kind: 'DIFFERENTIAL',
    type: 'AC',
    size: 2
  }) : NONE))
};

export const defaultRightPanelState: PanelState = {
  panelItem: nothing,
  itemIndex: -1,
  rowIndex: -1
};

export function initState(): [Model, Cmd<Msg>] {
  const model: Model = {
    panelRows: [emptyRow],
    panelWidth: 13,
    rightPanelState: defaultRightPanelState,
    errorMsgs: []
  };
  return [model, Cmd.none() as Cmd<Msg>];
}

export function update(msg: Msg, model: Model) : [Model, Cmd<Msg>] {
  switch (msg.kind) {
    case 'NoOp': return [model, Cmd.none()];
    case 'updateWidth': {
      // decrease width
      if (msg.size < model.panelWidth) {
        return noCmd({
          ...model,
          panelRows: model.panelRows.map((r) => {
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
          panelWidth: msg.size
        });
      }
      // increase width
      return noCmd({
        ...model,
        panelRows: model.panelRows
          .map((r) => ({
            ...r,
            items: [...r.items, ...Array.from(Array(msg.size - model.panelWidth).keys()).map(() => NONE)]
          })),
        panelWidth: msg.size
      });
    }
    case 'updateHeight': {
      if (model.panelRows.length > msg.size) {
        return noCmd({
          ...model,
          panelRows: model.panelRows.slice(0, msg.size)
        });
      }
      return noCmd({
        ...model,
        panelRows: [
          ...model.panelRows,
          ...Array.from(Array(msg.size - model.panelRows.length).keys()).map(() => emptyRow)
        ]
      });
    }
    case 'updateItem': {
      return noCmd({
        ...model,
        panelRows: model.panelRows.map((r, ri) => (ri === msg.rowIndex ? ({
          ...r,
          items: r.items.map((panelItem, panelItemIndex) => (panelItemIndex === msg.itemIndex ? msg.item : panelItem))
        }) : r))
      });
    }
    case 'openOrClosePanel': {
      return noCmd({
        ...model,
        rightPanelState: {

          ...model.rightPanelState,
          rowIndex: msg.rowIndex,
          itemIndex: msg.itemIndex,
          panelItem: msg.item
        }
      });
    }
  }
}
