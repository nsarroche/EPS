import React from 'react';
import './App.scss';
import { Program } from 'react-tea-cup';
import {
  Dispatcher, just, nothing, Sub
} from 'tea-cup-core';
import {
  Button, ContentSwitcher, OverflowMenu, OverflowMenuItem, Switch, TextInput, TooltipIcon
} from 'carbon-components-react';
import {
  Add16, ArrowLeft16, ArrowRight16, Edit16, Warning16
} from '@carbon/icons-react';
import {
  CircuitBreakerSize,
  DifferentialSize,
  DifferentialType, ErrorMsg,
  Model, NONE,
  PanelItem, PLUG
} from './Model';
import { initState, Msg, update } from './Update';
import { DisplaySidePanel } from './SidePanel/SidePanelView';
import { heatingSvg, plugSvg, waterHeaterSvg } from './Icons';

function renderUndoRedoBtns(dispatch: Dispatcher<Msg>, model: Model) {
  return (
    <div>
      <Button
        hasIconOnly
        iconDescription="Annuler"
        disabled={model.undoStack.length === 0}
        onClick={() => dispatch({ kind: 'undo' })}
        kind="ghost"
      >
        <ArrowLeft16 />
      </Button>
      <Button
        hasIconOnly
        iconDescription="Refaire"
        disabled={model.redoStack.length === 0}
        onClick={() => dispatch({ kind: 'redo' })}
        kind="ghost"
      >
        <ArrowRight16 />
      </Button>
    </div>
  );
}

function view(dispatch:Dispatcher<Msg>, model: Model) {
  return (
    <div className="App">
      <header className="App-header">
        <h2>Electric Panel Simulator</h2>
      </header>
      <div className="panel-config-row">
        {renderUndoRedoBtns(dispatch, model)}
        {DisplayRowCounter(dispatch, model)}
        {DisplayRowWidth(dispatch, model)}
      </div>
      {DisplayPanel(dispatch, model)}
      {DisplaySidePanel(dispatch, model)}
    </div>
  );
}

function DisplayPanel(
  dispatch: Dispatcher<Msg>,
  model: Model
) {
  return (
    <div className="panel-wrapper" key={`panel-${model.undoStack.length}-${model.redoStack.length}`}>
      {
        model.panel.panelRows.map((row, rowIndex) => (
          <div
            // eslint-disable-next-line react/no-array-index-key
            key={`row_${rowIndex}`}
            className="panel-row"
            style={{ width: model.panel.panelWidth * (64 + 10) }}
          >
            {
              row.items.map((r, itemIndex) => DisplayRowItem(r, rowIndex, itemIndex, model, dispatch))
            }
          </div>
        ))
      }

    </div>
  );
}

function defaultDifferential(value: DifferentialSize, diffType: DifferentialType): PanelItem {
  return {
    kind: 'DIFFERENTIAL',
    type: diffType,
    value,
    size: 2
  };
}

function defaultCircuitBreaker(value: CircuitBreakerSize): PanelItem {
  return {
    kind: 'CIRCUIT_BREAKER',
    name: 'Nouveau nom',
    value,
    size: 1,
    isSpecific: nothing
  };
}

function addItem(
  rowIndex: number,
  itemIndex: number,
  itemKind: 'CIRCUIT_BREAKER'|'DIFFERENTIAL'|'PLUG',
  value: DifferentialSize | CircuitBreakerSize,
  diffType?: DifferentialType
): Msg {
  let item: PanelItem = NONE;
  if (itemKind === 'CIRCUIT_BREAKER') item = defaultCircuitBreaker(value as CircuitBreakerSize);
  if (itemKind === 'DIFFERENTIAL') item = defaultDifferential(value as DifferentialSize, diffType || 'A');
  if (itemKind === 'PLUG') item = PLUG;
  return {
    kind: 'updateItem',
    item,
    rowIndex,
    itemIndex
  };
}

function DisplayRowItem(
  panelItem: PanelItem,
  rowIndex: number,
  itemIndex: number,
  model: Model,
  dispatch: Dispatcher<Msg>
) {
  const isSelected = model.panel.rightPanelState.rowIndex === rowIndex
      && model.panel.rightPanelState.itemIndex === itemIndex;
  function canAddSizeTwo() {
    return model.panel.panelRows[rowIndex].items[itemIndex - 1].kind === 'NONE' || model.panel.panelRows[rowIndex].items[itemIndex + 1].kind === 'NONE';
  }
  if (panelItem.kind === 'DIFFERENTIAL') {
    const e = findError(model.panel.errorMsgs, rowIndex, itemIndex);
    return (
      <div className={`panel-cell wide-cell ${e ? 'error-cell' : ''} ${isSelected ? 'selected-cell' : ''}`}>
        <div className="differential-type">{panelItem.type}</div>
        <div>
          {`${panelItem.value}A`}
        </div>
        {renderOpenSidePanelButton(dispatch, panelItem, rowIndex, itemIndex)}
        {renderErrorMsg(e)}
      </div>
    );
  }
  if (panelItem.kind === 'CIRCUIT_BREAKER') {
    const e = findError(model.panel.errorMsgs, rowIndex, itemIndex);
    return (
      <div className={`panel-cell ${e ? 'error-cell' : ''} ${isSelected ? 'selected-cell' : ''}`}>
        {renderIcon(panelItem)}
        <div>
          {panelItem.value}
          A
        </div>
        {renderOpenSidePanelButton(dispatch, panelItem, rowIndex, itemIndex)}
        {renderErrorMsg(e)}
      </div>
    );
  }
  if (panelItem.kind === 'PLUG') {
    return (
      <div className={`panel-cell wide-cell ${isSelected ? 'selected-cell' : ''}`}>
        {renderIcon(panelItem)}
        <div>Prise</div>
        {renderOpenSidePanelButton(dispatch, panelItem, rowIndex, itemIndex)}
      </div>
    );
  }
  return (
    <div className="panel-cell">
      <OverflowMenu
        className="overflow-menu-wrapper"
        renderIcon={Add16}
        iconDescription="Ajouter"
      >
        {
          // enough space to add the differential
          canAddSizeTwo()
            ? (
              <OverflowMenuItem
                itemText="Differentiel"
                onClick={() => dispatch(addItem(rowIndex, itemIndex, 'DIFFERENTIAL', 40, 'A'))}
              />
            ) : (<></>)
        }
        <OverflowMenuItem
          itemText="Disjoncteur"
          onClick={() => dispatch(addItem(rowIndex, itemIndex, 'CIRCUIT_BREAKER', 10))}
        />
        {
          // enough space to add the differential
          canAddSizeTwo()
            ? (
              <OverflowMenuItem
                itemText="Prise"
                onClick={() => dispatch(addItem(rowIndex, itemIndex, 'PLUG', 40, 'A'))}
              />
            ) : (<></>)
        }
      </OverflowMenu>
    </div>
  );
}

function renderIcon(item: PanelItem) {
  if (item.kind === 'CIRCUIT_BREAKER') {
    return (
      <div className="panel-cell-icon-wrapper">
        {item.isSpecific.map((t) => (t === 'HEATING' ? heatingSvg() : waterHeaterSvg())).withDefault(<></>)}
      </div>
    );
  }
  if (item.kind === 'PLUG') {
    return (
      <div className="panel-cell-icon-wrapper">{plugSvg()}</div>
    );
  }
  return <div className="panel-cell-icon-wrapper" />;
}

function renderOpenSidePanelButton(
  dispatch: Dispatcher<Msg>,
  panelItem: PanelItem,
  rowIndex: number,
  itemIndex: number
) {
  return (
    <Button
      hasIconOnly
      renderIcon={Edit16}
      kind="ghost"
      className="open-side-panel-button"
      onClick={() => dispatch(
        {
          kind: 'openOrClosePanel',
          item: just(panelItem),
          rowIndex,
          itemIndex
        }
      )}
    />
  );
}

function findError(
  errors: ErrorMsg[],
  rowIndex: number,
  itemIndex: number
) {
  return errors.find((e) => e.rowIndex === rowIndex && e.itemIndex === itemIndex);
}

function renderErrorMsg(error: ErrorMsg | undefined) {
  return error
    ? (
      <TooltipIcon
        align="center"
        tooltipText={error.message}
        className="error-message-tooltip"
      >
        <Warning16 />
      </TooltipIcon>
    )
    : <></>;
}

function DisplayRowCounter(dispatch:Dispatcher<Msg>, model: Model) {
  return (
    <div className="panel-config-height-input-wrapper">
      <TextInput
        value={model.panel.panelRows.length}
        type="number"
        min={1}
        max={5}
        onChange={(evt) => dispatch({ kind: 'updateHeight', size: Number(evt.target.value) })}
        id="row-counter"
        labelText="Hauteur du tableau"
      />
    </div>
  );
}

function DisplayRowWidth(dispatch:Dispatcher<Msg>, model: Model) {
  return (
    <div className="panel-width-content-switcher-wrapper">
      <ContentSwitcher
        onChange={(v) => dispatch({ kind: 'updateWidth', size: (v.name as number) })}
        selectedIndex={model.panel.panelWidth === 13 ? 0 : 1}
      >
        <Switch
          name="13"
          text="13 modules"
          value={13}
        />
        <Switch
          name="18"
          value={18}
          text="18 modules"
        />
      </ContentSwitcher>
    </div>
  );
}

function App() {
  return (
    <Program
      init={initState}
      view={view}
      update={update}
      subscriptions={Sub.none}
    />
  );
}

export default App;
