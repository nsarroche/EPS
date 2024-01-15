import React from 'react';
import './App.scss';
import { Program } from 'react-tea-cup';
import { Dispatcher, just, Sub } from 'tea-cup-core';
import {
  Button, OverflowMenu, OverflowMenuItem
} from 'carbon-components-react';
import { Add16, Edit16 } from '@carbon/icons-react';
import {
  CircuitBreakerSize,
  DifferentialSize,
  DifferentialType,
  Model,
  PanelItem
} from './Model';
import { initState, Msg, update } from './Update';
import { DisplaySidePanel } from './SidePanel/SidePanelView';

function view(dispatch:Dispatcher<Msg>, model: Model) {
  return (
    <div className="App">
      <header className="App-header">
        {DisplayRowCounter(dispatch, model)}
        {DisplayRadio(dispatch, model)}
        {DisplayPanel(dispatch, model)}
        {DisplaySidePanel(dispatch, model)}
      </header>
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
          <div className="panel-row">
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
    name: 'UPDATE ME',
    value,
    size: 1
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
  if (panelItem.kind === 'DIFFERENTIAL') {
    return (
      <div className="panel-cell differential-wrapper">
        <div>{panelItem.type}</div>
        <div>
          {panelItem.value}
          A
        </div>
      </div>
    );
  }
  if (panelItem.kind === 'CIRCUIT_BREAKER') {
    return (
      <div className="panel-cell">
        <div>
          {panelItem.value}
          A
        </div>
        <Button
          hasIconOnly
          renderIcon={Edit16}
          kind="ghost"
          onClick={() => dispatch(
            {
              kind: 'openOrClosePanel',
              item: just(panelItem),
              rowIndex,
              itemIndex
            }
          )}
        />
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

function DisplayRowCounter(dispatch:Dispatcher<Msg>, model: Model) {
  return (
    <form>
      <input
        value={model.panelRows.length}
        type="number"
        min={1}
        max={5}
        onChange={(evt) => dispatch({ kind: 'updateHeight', size: Number(evt.target.value) })}
      />
    </form>
  );
}

function DisplayRadio(dispatch:Dispatcher<Msg>, model: Model) {
  return (
    <form>
      <div className="radio">
        <label>
          <input type="radio" value="13" checked={model.panelWidth === 13} onChange={() => dispatch({ kind: 'updateWidth', size: 13 })} />
          13 Modules
        </label>
      </div>
      <div className="radio">
        <label>
          <input type="radio" value="18" checked={model.panelWidth === 18} onChange={() => dispatch({ kind: 'updateWidth', size: 18 })} />
          18 Modules
        </label>
      </div>
    </form>
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
