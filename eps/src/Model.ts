import { Maybe } from 'tea-cup-core';
import { PanelState } from './SidePanel/SidePanelModel';

export interface Model {
  panelRows: PanelRow[]
  panelWidth: number
  rightPanelState: PanelState
  errorMsgs: ErrorMsg[]
}

export interface PanelRow {
  items: PanelItem[]
}

export type CircuitBreakerSize = 10 | 16 | 20 | 32
export type DifferentialSize = 40 | 63

export type PanelItem = Differential | CircuitBreaker | Plug | None
export type DifferentialType = 'A' | 'AC'
export type CircuitBreakerSpecific = 'HEATING' | 'WATER_HEATER'

export interface None {
  kind: 'NONE'
  size: 1
}

export interface Plug {
  kind: 'PLUG'
  size: 2
}

export interface Differential {
  kind: 'DIFFERENTIAL'
  value: DifferentialSize
  type: DifferentialType
  size: 2
}

export interface CircuitBreaker {
  kind: 'CIRCUIT_BREAKER'
  value: CircuitBreakerSize
  name: string
  size: 1
  isSpecific: Maybe<CircuitBreakerSpecific>
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
  message: string
  rowIndex: number
  itemIndex: number
}
