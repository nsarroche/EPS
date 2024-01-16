import React from 'react';
import './App.scss';
import { Program } from 'react-tea-cup';
import {
  Dispatcher, just, nothing, Sub
} from 'tea-cup-core';
import {
  Button, ContentSwitcher, OverflowMenu, OverflowMenuItem, Switch, TextInput, TooltipIcon
} from 'carbon-components-react';
import { Add16, Edit16, Warning16 } from '@carbon/icons-react';
import {
  CircuitBreakerSize,
  DifferentialSize,
  DifferentialType, ErrorMsg,
  Model,
  PanelItem
} from './Model';
import { initState, Msg, update } from './Update';
import { DisplaySidePanel } from './SidePanel/SidePanelView';

function view(dispatch:Dispatcher<Msg>, model: Model) {
  return (
    <div className="App">
      <header className="App-header">
        <h2>Electric Panel Simulator</h2>
      </header>
      <div className="panel-config-row">
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
    <div className="panel-wrapper">
      {
        model.panelRows.map((row, rowIndex) => (
          <div className="panel-row" style={{ width: model.panelWidth * (64 + 10) }}>
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
  itemKind: 'CIRCUIT_BREAKER'|'DIFFERENTIAL',
  value: number,
  diffType?: DifferentialType
): Msg {
  const item: PanelItem = itemKind === 'CIRCUIT_BREAKER'
    ? defaultCircuitBreaker(value as CircuitBreakerSize)
    : defaultDifferential(value as DifferentialSize, diffType || 'A');
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
  const isSelected = model.rightPanelState.rowIndex === rowIndex && model.rightPanelState.itemIndex === itemIndex;
  if (panelItem.kind === 'DIFFERENTIAL') {
    const e = findError(model.errorMsgs, rowIndex, itemIndex);
    return (
      <div className={`panel-cell differential-wrapper ${e ? 'error-cell' : ''} ${isSelected ? 'selected-cell' : ''}`}>
        <div>{panelItem.type}</div>
        <div>
          {panelItem.value}
          A
        </div>
        {renderOpenSidePanelButton(dispatch, panelItem, rowIndex, itemIndex)}
        {renderErrorMsg(e)}
      </div>
    );
  }
  if (panelItem.kind === 'CIRCUIT_BREAKER') {
    const e = findError(model.errorMsgs, rowIndex, itemIndex);
    return (
      <div className={`panel-cell ${e ? 'error-cell' : ''} ${isSelected ? 'selected-cell' : ''}`}>
        <div className="panel-cell-empty-name" />
        <div>
          {panelItem.value}
          A
        </div>
        {renderOpenSidePanelButton(dispatch, panelItem, rowIndex, itemIndex)}
        {renderErrorMsg(e)}
      </div>
    );
  }
  return (
    <div className="panel-cell">
      <OverflowMenu
        className="overflow-menu-wrapper"
        renderIcon={Add16}
        iconDescription="ADD"
      >
        <OverflowMenuItem itemText="Diff A 40A" onClick={() => dispatch(addItem(rowIndex, itemIndex, 'DIFFERENTIAL', 40, 'A'))} />
        <OverflowMenuItem itemText="Diff A 63A" onClick={() => dispatch(addItem(rowIndex, itemIndex, 'DIFFERENTIAL', 63, 'A'))} />
        <OverflowMenuItem itemText="Diff AC 40A" onClick={() => dispatch(addItem(rowIndex, itemIndex, 'DIFFERENTIAL', 40, 'AC'))} />
        <OverflowMenuItem itemText="Diff AC 63A" onClick={() => dispatch(addItem(rowIndex, itemIndex, 'DIFFERENTIAL', 63, 'AC'))} />
        <OverflowMenuItem itemText="Disj 16A" onClick={() => dispatch(addItem(rowIndex, itemIndex, 'CIRCUIT_BREAKER', 16))} />
        <OverflowMenuItem itemText="Disj 20A" onClick={() => dispatch(addItem(rowIndex, itemIndex, 'CIRCUIT_BREAKER', 20))} />
        <OverflowMenuItem itemText="Disj 32A" onClick={() => dispatch(addItem(rowIndex, itemIndex, 'CIRCUIT_BREAKER', 32))} />
      </OverflowMenu>
    </div>
  );
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
        value={model.panelRows.length}
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
        selectedIndex={model.panelWidth === 13 ? 0 : 1}
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
