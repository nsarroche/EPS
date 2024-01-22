import { Maybe } from 'tea-cup-core';
import { PanelItem } from '../Model';

export interface PanelState {
  readonly panelItem: Maybe<PanelItem>
  readonly editItemName: Maybe<string>
  readonly rowIndex: number
  readonly itemIndex: number
}
