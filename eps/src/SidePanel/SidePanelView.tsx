import {
  Dispatcher, just, Maybe, nothing
} from 'tea-cup-core';
import { SidePanel } from '@carbon/ibm-products';
import {
  Button, RadioButton, RadioButtonGroup, Select, SelectItem, TextInput
} from 'carbon-components-react';
import React from 'react';
import { TrashCan16 } from '@carbon/icons-react';
import {
  CircuitBreaker,
  CircuitBreakerSize,
  CircuitBreakerSpecific, Differential, DifferentialSize, Model, NONE, PanelItem
} from '../Model';
import { defaultRightPanelState, Msg } from '../Update';

export function DisplaySidePanel(
  dispatch: Dispatcher<Msg>,
  model: Model
) {
  return (
    <SidePanel
      open={model.rightPanelState.panelItem.isJust()}
      onRequestClose={() => dispatch({
        kind: 'openOrClosePanel',
        item: defaultRightPanelState.panelItem,
        rowIndex: defaultRightPanelState.rowIndex,
        itemIndex: defaultRightPanelState.itemIndex
      })}
      title="Edition de l'élément"
    >
      {
        model.rightPanelState.panelItem.map((item: PanelItem) => renderSidePanelItemContent(
          dispatch,
          item,
          model.rightPanelState.editItemName,
          model.rightPanelState.rowIndex,
          model.rightPanelState.itemIndex
        ))
          .withDefault(<></>)
      }
    </SidePanel>
  );
}

function renderSidePanelItemContent(
  dispatch: Dispatcher<Msg>,
  item: PanelItem,
  editItemName: Maybe<string>,
  rowIndex: number,
  itemIndex: number
) {
  return (
    <>
      <div>
        <Button
          hasIconOnly
          renderIcon={TrashCan16}
          kind="danger"
          onClick={() => dispatch(
            {
              kind: 'updateItem',
              item: NONE,
              rowIndex,
              itemIndex
            }
          )}
        />
      </div>
      <div>
        {item.kind === 'DIFFERENTIAL'
          ? renderDifferentialContent(dispatch, item, rowIndex, itemIndex)
          : (<></>)}
        {item.kind === 'CIRCUIT_BREAKER'
          ? renderCircuitBreakerContent(dispatch, item as CircuitBreaker, editItemName, rowIndex, itemIndex)
          : (<></>)}
        {item.kind === 'PLUG'
          ? (<h3>Prise 2P + T</h3>)
          : (<></>)}
      </div>
    </>
  );
}

function renderDifferentialContent(
  dispatch: Dispatcher<Msg>,
  item: Differential,
  rowIndex: number,
  itemIndex: number
) {
  return (
    <>
      <h3>Differentiel</h3>
      <Select
        id="right-panel-power-edit"
        onChange={(evt) => dispatch({
          kind: 'updateItem',
          item: {
            ...item,
            value: Number.parseInt(evt.target.value, 10) as DifferentialSize
          },
          rowIndex,
          itemIndex
        })}
      >
        {[40, 63].map((v) => (<SelectItem selected={v === item.value} text={`${v}A`} value={v} />))}
      </Select>
    </>
  );
}

function renderCircuitBreakerContent(
  dispatch: Dispatcher<Msg>,
  item: CircuitBreaker,
  editItemName: Maybe<string>,
  rowIndex: number,
  itemIndex: number
) {
  return (
    <>
      <TextInput
        id="right-panel-name-edit"
        labelText="Edit name"
        value={editItemName.withDefault(item.name)}
        onChange={(evt) => dispatch({
          kind: 'updatePanelState',
          editItemName: just(evt.target.value),
          item: just(item),
          rowIndex,
          itemIndex
        })}
        onBlur={(evt) => dispatch({
          kind: 'updateItem',
          item: {
            ...item,
            name: evt.target.value
          },
          rowIndex,
          itemIndex
        })}
      />

      <Select
        id="right-panel-power-edit"
        onChange={(evt) => dispatch({
          kind: 'updateItem',
          item: {
            ...item,
            value: Number.parseInt(evt.target.value, 10) as CircuitBreakerSize
          },
          rowIndex,
          itemIndex
        })}
      >
        {[10, 16, 20, 32].map((v) => (<SelectItem selected={v === item.value} text={`${v}A`} value={v} />))}
      </Select>

      {renderCircuitBreakerSpecification(dispatch, item, rowIndex, itemIndex)}
    </>

  );
}

function renderCircuitBreakerSpecification(
  dispatch: Dispatcher<Msg>,
  item: CircuitBreaker,
  rowIndex: number,
  itemIndex: number
) {
  return (
    <div>
      <RadioButtonGroup
        name="Specific"
        valueSelected={item.isSpecific.map((s) => s as string).withDefault('')}
        onChange={(v) => dispatch({
          kind: 'updateItem',
          item: {
            ...item,
            isSpecific: v === '' ? nothing : just(v as CircuitBreakerSpecific),
          },
          itemIndex,
          rowIndex
        })}
      >
        <RadioButton
          checked={item.isSpecific.map((s) => s === 'HEATING').withDefault(false)}
          value="HEATING"
          labelText="Chauffage"
        />
        <RadioButton
          checked={item.isSpecific.map((s) => s === 'WATER_HEATER').withDefault(false)}
          value="WATER_HEATER"
          labelText="Chauffe eau"
        />
        <RadioButton
          checked={item.isSpecific.isNothing()}
          value=""
          labelText="Autre"
        />
      </RadioButtonGroup>
    </div>
  );
}
