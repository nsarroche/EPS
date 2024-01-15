import { Maybe } from 'tea-cup-core';
import { PanelItem } from '../Model';

export interface PanelState {
  panelItem: Maybe<PanelItem>
  rowIndex: number
  itemIndex: number
}
