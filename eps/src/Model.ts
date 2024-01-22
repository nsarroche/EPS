import { Maybe } from 'tea-cup-core';
import { PanelState } from './SidePanel/SidePanelModel';

export interface Model {
  readonly panel: Panel
  readonly undoStack: Panel[]
  readonly redoStack: Panel[]
}

export interface Panel {
  readonly panelRows: PanelRow[]
  readonly panelWidth: number
  readonly rightPanelState: PanelState
  readonly errorMsgs: ErrorMsg[]
}

export interface PanelRow {
  readonly items: PanelItem[]
}

export type CircuitBreakerSize = 10 | 16 | 20 | 32
export type DifferentialSize = 40 | 63

export type PanelItem = Differential | CircuitBreaker | Plug | None
export type DifferentialType = 'A' | 'AC'
export type CircuitBreakerSpecific = 'HEATING' | 'WATER_HEATER'

export interface None {
  readonly kind: 'NONE'
  readonly size: 1
}

export interface Plug {
  readonly kind: 'PLUG'
  readonly size: 2
}

export interface Differential {
  readonly kind: 'DIFFERENTIAL'
  readonly value: DifferentialSize
  readonly type: DifferentialType
  readonly size: 2
}

export interface CircuitBreaker {
  readonly kind: 'CIRCUIT_BREAKER'
  readonly value: CircuitBreakerSize
  readonly name: string
  readonly size: 1
  readonly isSpecific: Maybe<CircuitBreakerSpecific>
}

export const NONE: None = {
  kind: 'NONE',
  size: 1
};

export const PLUG: Plug = {
  kind: 'PLUG',
  size: 2
};

export interface ErrorMsg {
  readonly message: string
  readonly rowIndex: number
  readonly itemIndex: number
}
