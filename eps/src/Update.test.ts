import { describe, test } from '@jest/globals';
import { nothing } from 'tea-cup-core';
import { getRowWidth, replaceItemInRow } from './Update';
import {
  CircuitBreaker, Differential, NONE, PanelItem, PanelRow
} from './Model';

function testingPanelRow(items: PanelItem[]): PanelRow[] {
  return [{
    items
  }];
}

const DEFAULT_CIRCUIT_BREAKER: CircuitBreaker = {
  kind: 'CIRCUIT_BREAKER',
  value: 20,
  size: 1,
  isSpecific: nothing,
  name: 'default'
};

const DEFAULT_DIFFERENTIAL: Differential = {
  kind: 'DIFFERENTIAL',
  value: 63,
  size: 2,
  type: 'AC'
};

describe('Update tests', () => {
  test('"updateItem" should keep the same array width - delete DIFFERENTIAL', () => {
    // SETUP
    const PANEL_WIDTH = 7;
    const panelRow: PanelRow[] = testingPanelRow([
      DEFAULT_DIFFERENTIAL, DEFAULT_CIRCUIT_BREAKER, NONE, DEFAULT_DIFFERENTIAL, NONE
    ]);
    expect(getRowWidth(panelRow[0].items)).toBe(PANEL_WIDTH);

    // UPDATE
    const array: PanelRow[] = replaceItemInRow(panelRow, NONE, 0, 0, PANEL_WIDTH);
    // ASSERTIONS
    expect(getRowWidth(array[0].items)).toBe(PANEL_WIDTH);
    expect(array[0].items.length).toBe(6);

    // test structure
    expect(array[0].items[0].kind).toBe('NONE');
    expect(array[0].items[1].kind).toBe('NONE');
    expect(array[0].items[2].kind).toBe('CIRCUIT_BREAKER');
    expect(array[0].items[3].kind).toBe('NONE');
    expect(array[0].items[4].kind).toBe('DIFFERENTIAL');
    expect(array[0].items[5].kind).toBe('NONE');
  });
  test('"updateItem" should keep the same array width - delete CIRCUIT_BREAKER', () => {
    // SETUP
    const PANEL_WIDTH = 7;
    const panelRow: PanelRow[] = testingPanelRow([
      DEFAULT_DIFFERENTIAL, DEFAULT_CIRCUIT_BREAKER, NONE, DEFAULT_DIFFERENTIAL, NONE
    ]);
    expect(getRowWidth(panelRow[0].items)).toBe(PANEL_WIDTH);

    // UPDATE
    const array: PanelRow[] = replaceItemInRow(panelRow, NONE, 0, 1, PANEL_WIDTH);
    // ASSERTIONS
    expect(getRowWidth(array[0].items)).toBe(PANEL_WIDTH);
    expect(array[0].items.length).toBe(5);

    // test structure
    expect(array[0].items[0].kind).toBe('DIFFERENTIAL');
    expect(array[0].items[1].kind).toBe('NONE');
    expect(array[0].items[2].kind).toBe('NONE');
    expect(array[0].items[3].kind).toBe('DIFFERENTIAL');
    expect(array[0].items[4].kind).toBe('NONE');
  });
  test('"updateItem" should keep the same array width - insert DIFFERENTIAL before', () => {
    // SETUP
    const PANEL_WIDTH = 6;
    const panelRow: PanelRow[] = testingPanelRow([
      DEFAULT_DIFFERENTIAL, DEFAULT_CIRCUIT_BREAKER, NONE, NONE, DEFAULT_CIRCUIT_BREAKER
    ]);
    expect(getRowWidth(panelRow[0].items)).toBe(PANEL_WIDTH);
    expect(panelRow[0].items.length).toBe(5);

    // UPDATE
    const array: PanelRow[] = replaceItemInRow(panelRow, DEFAULT_DIFFERENTIAL, 0, 3, PANEL_WIDTH);
    // ASSERTIONS
    expect(getRowWidth(array[0].items)).toBe(PANEL_WIDTH);
    expect(array[0].items.length).toBe(4);

    // test structure
    expect(array[0].items[0].kind).toBe('DIFFERENTIAL');
    expect(array[0].items[1].kind).toBe('CIRCUIT_BREAKER');
    expect(array[0].items[2].kind).toBe('DIFFERENTIAL');
    expect(array[0].items[3].kind).toBe('CIRCUIT_BREAKER');
  });
  test('"updateItem" should keep the same array width - insert DIFFERENTIAL after', () => {
    // SETUP
    const PANEL_WIDTH = 6;
    const panelRow: PanelRow[] = testingPanelRow([
      DEFAULT_DIFFERENTIAL, DEFAULT_CIRCUIT_BREAKER, NONE, NONE, DEFAULT_CIRCUIT_BREAKER
    ]);
    expect(getRowWidth(panelRow[0].items)).toBe(PANEL_WIDTH);
    expect(panelRow[0].items.length).toBe(5);

    // UPDATE
    const array: PanelRow[] = replaceItemInRow(panelRow, DEFAULT_DIFFERENTIAL, 0, 2, PANEL_WIDTH);
    // ASSERTIONS
    expect(getRowWidth(array[0].items)).toBe(PANEL_WIDTH);
    expect(array[0].items.length).toBe(4);

    // test structure
    expect(array[0].items[0].kind).toBe('DIFFERENTIAL');
    expect(array[0].items[1].kind).toBe('CIRCUIT_BREAKER');
    expect(array[0].items[2].kind).toBe('DIFFERENTIAL');
    expect(array[0].items[3].kind).toBe('CIRCUIT_BREAKER');
  });
  test('"updateItem" should keep the same array width - replace with CIRCUIT_BREAKER', () => {
    // SETUP
    const PANEL_WIDTH = 6;
    const panelRow: PanelRow[] = testingPanelRow([
      DEFAULT_DIFFERENTIAL, DEFAULT_CIRCUIT_BREAKER, NONE, NONE, DEFAULT_CIRCUIT_BREAKER
    ]);
    expect(getRowWidth(panelRow[0].items)).toBe(PANEL_WIDTH);
    expect(panelRow[0].items.length).toBe(5);

    // UPDATE
    const array: PanelRow[] = replaceItemInRow(panelRow, DEFAULT_CIRCUIT_BREAKER, 0, 2, PANEL_WIDTH);
    // ASSERTIONS
    expect(getRowWidth(array[0].items)).toBe(PANEL_WIDTH);
    expect(array[0].items.length).toBe(5);

    // test structure
    expect(array[0].items[0].kind).toBe('DIFFERENTIAL');
    expect(array[0].items[1].kind).toBe('CIRCUIT_BREAKER');
    expect(array[0].items[2].kind).toBe('CIRCUIT_BREAKER');
    expect(array[0].items[3].kind).toBe('NONE');
    expect(array[0].items[4].kind).toBe('CIRCUIT_BREAKER');
  });
  test('"updateItem" should keep the same array width - replace with DIFFERENTIAL', () => {
    // SETUP
    const PANEL_WIDTH = 6;
    const panelRow: PanelRow[] = testingPanelRow([
      DEFAULT_DIFFERENTIAL, DEFAULT_CIRCUIT_BREAKER, NONE, NONE, DEFAULT_CIRCUIT_BREAKER
    ]);
    expect(getRowWidth(panelRow[0].items)).toBe(PANEL_WIDTH);
    expect(panelRow[0].items.length).toBe(5);
    expect(panelRow[0].items[0].kind).toBe('DIFFERENTIAL');
    expect((panelRow[0].items[0] as Differential).value).toBe(63);

    // UPDATE
    const newDiff: Differential = {
      ...DEFAULT_DIFFERENTIAL,
      value: 40
    };
    const array: PanelRow[] = replaceItemInRow(panelRow, newDiff, 0, 0, PANEL_WIDTH);
    // ASSERTIONS
    expect(getRowWidth(array[0].items)).toBe(PANEL_WIDTH);
    expect(array[0].items.length).toBe(5);

    // test structure
    expect(array[0].items[0].kind).toBe('DIFFERENTIAL');
    expect((array[0].items[0] as Differential).value).toBe(40);
    expect(array[0].items[1].kind).toBe('CIRCUIT_BREAKER');
    expect(array[0].items[2].kind).toBe('NONE');
    expect(array[0].items[3].kind).toBe('NONE');
    expect(array[0].items[4].kind).toBe('CIRCUIT_BREAKER');
  });

  test('"updateItem" should update the right row - replace with CIRCUIT_BREAKER', () => {
    // SETUP
    const PANEL_WIDTH = 3;
    const panelRow: PanelRow[] = [
      { items: [DEFAULT_DIFFERENTIAL, NONE] },
      { items: [DEFAULT_DIFFERENTIAL, NONE] },
    ];
    expect(getRowWidth(panelRow[0].items)).toBe(PANEL_WIDTH);
    expect(getRowWidth(panelRow[1].items)).toBe(PANEL_WIDTH);
    expect(panelRow[0].items.length).toBe(2);
    expect(panelRow[1].items.length).toBe(2);

    // UPDATE
    const array: PanelRow[] = replaceItemInRow(panelRow, DEFAULT_CIRCUIT_BREAKER, 0, 1, PANEL_WIDTH);
    // ASSERTIONS
    expect(getRowWidth(array[0].items)).toBe(PANEL_WIDTH);
    expect(array[0].items.length).toBe(2);

    expect(getRowWidth(array[1].items)).toBe(PANEL_WIDTH);
    expect(array[1].items.length).toBe(2);

    // test structure
    expect(array[0].items[0].kind).toBe('DIFFERENTIAL');
    expect(array[0].items[1].kind).toBe('CIRCUIT_BREAKER');

    expect(array[1].items[0].kind).toBe('DIFFERENTIAL');
    expect(array[1].items[1].kind).toBe('NONE');
  });
});
