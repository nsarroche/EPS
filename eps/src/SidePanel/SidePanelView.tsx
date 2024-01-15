import { Dispatcher } from 'tea-cup-core';
import { SidePanel } from '@carbon/ibm-products';
import { Select, SelectItem, TextInput } from 'carbon-components-react';
import React, { useState } from 'react';
import { Model, PanelItem } from '../Model';
import { defaultRightPanelState, Msg } from '../Update';

/*
          onChange=
 */

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
  rowIndex: number,
  itemIndex: number
) {
  return (
    <>
      <div>
        {renderSidePanelItemInputOrTitle(dispatch, item, rowIndex, itemIndex)}
      </div>
      <div>
        <Select id="right-panel-power-edit">
          {renderSelectByItemKind(item)}
        </Select>
      </div>
    </>
  );
}

function renderSidePanelItemInputOrTitle(
  dispatch: Dispatcher<Msg>,
  item: PanelItem,
  rowIndex: number,
  itemIndex: number
) {
  if (item.kind === 'CIRCUIT_BREAKER') {
    const [name, updateName] = useState(item.name);
    return (
      <TextInput
        id="right-panel-name-edit"
        labelText="Edit name"
        value={name}
        onChange={(evt) => updateName(evt.target.value)}
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
    );
  }
  return (
    <h3>Differentiel</h3>
  );
}

function renderSelectByItemKind(item: PanelItem) {
  switch (item.kind) {
    case 'NONE':
      break;
    case 'DIFFERENTIAL':
      return (<>{[40, 63].map((v) => (<SelectItem text={`${v}A`} value={v} />))}</>);
    case 'CIRCUIT_BREAKER':
      return (<>{[10, 20, 32].map((v) => (<SelectItem text={`${v}A`} value={v} />))}</>);
  }
}
