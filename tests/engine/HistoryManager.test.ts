import { describe, it, expect } from 'vitest';
import { HistoryManager } from '../../src/engine/history/HistoryManager';
import type { Command } from '../../src/engine/history/Command';

function addCommand(amount: number): Command<number> {
  return {
    label: `add ${amount}`,
    do: (state) => state + amount,
    undo: (state) => state - amount,
  };
}

describe('HistoryManager', () => {
  it('applies a command and tracks it as undoable', () => {
    const history = new HistoryManager<number>();
    expect(history.canUndo()).toBe(false);
    const next = history.execute(0, addCommand(5));
    expect(next).toBe(5);
    expect(history.canUndo()).toBe(true);
    expect(history.canRedo()).toBe(false);
  });

  it('undoes and redoes back to the same states', () => {
    const history = new HistoryManager<number>();
    let state = 0;
    state = history.execute(state, addCommand(5));
    state = history.execute(state, addCommand(3));
    expect(state).toBe(8);

    const afterUndo = history.undo(state);
    expect(afterUndo).toBe(5);
    expect(history.canRedo()).toBe(true);

    const afterUndoAgain = history.undo(afterUndo!);
    expect(afterUndoAgain).toBe(0);
    expect(history.canUndo()).toBe(false);

    const afterRedo = history.redo(afterUndoAgain!);
    expect(afterRedo).toBe(5);
    const afterRedoAgain = history.redo(afterRedo!);
    expect(afterRedoAgain).toBe(8);
    expect(history.canRedo()).toBe(false);
  });

  it('returns null from undo/redo when there is nothing to do', () => {
    const history = new HistoryManager<number>();
    expect(history.undo(0)).toBeNull();
    expect(history.redo(0)).toBeNull();
  });

  it('clears the redo stack when a new command is executed', () => {
    const history = new HistoryManager<number>();
    let state = history.execute(0, addCommand(5));
    state = history.undo(state) ?? state;
    expect(history.canRedo()).toBe(true);

    history.execute(state, addCommand(10));
    expect(history.canRedo()).toBe(false);
  });

  it('caps the undo stack at maxEntries, dropping the oldest command', () => {
    const history = new HistoryManager<number>(2);
    let state = 0;
    state = history.execute(state, addCommand(1)); // dropped once the 3rd executes
    state = history.execute(state, addCommand(2));
    state = history.execute(state, addCommand(3));
    expect(state).toBe(6);
    expect(history.entries).toEqual(['add 2', 'add 3']);

    // Undoing twice should only unwind the 2 remembered commands (back to 1, the state
    // after the dropped first command), not all the way to 0.
    state = history.undo(state)!;
    state = history.undo(state)!;
    expect(state).toBe(1);
    expect(history.canUndo()).toBe(false);
  });

  it('clear() resets both stacks', () => {
    const history = new HistoryManager<number>();
    const state = history.execute(0, addCommand(5));
    history.undo(state);
    history.clear();
    expect(history.canUndo()).toBe(false);
    expect(history.canRedo()).toBe(false);
    expect(history.entries).toEqual([]);
  });

  it('exposes command labels oldest-first via entries', () => {
    const history = new HistoryManager<number>();
    let state = 0;
    state = history.execute(state, addCommand(1));
    history.execute(state, addCommand(2));
    expect(history.entries).toEqual(['add 1', 'add 2']);
  });

  it('rejects a maxEntries below 1', () => {
    expect(() => new HistoryManager<number>(0)).toThrow();
    expect(() => new HistoryManager<number>(-1)).toThrow();
  });
});
