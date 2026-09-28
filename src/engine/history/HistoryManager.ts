// ---------------------------------------------------------------------
// engine/history/HistoryManager.ts
// Real, memory-capped undo/redo over a command stack -- not tied to any
// UI action yet (Phase 1 has no editable operation that produces a
// command; that starts with Phase 2's layer operations), but built and
// tested now so every later phase's edits plug into one already-proven
// mechanism instead of each inventing its own undo logic.
// ---------------------------------------------------------------------

import type { Command } from './Command';

export class HistoryManager<S> {
  private undoStack: Command<S>[] = [];
  private redoStack: Command<S>[] = [];
  private readonly maxEntries: number;

  constructor(maxEntries = 100) {
    if (maxEntries < 1) throw new Error('maxEntries must be at least 1');
    this.maxEntries = maxEntries;
  }

  /** Applies `command` to `state`, returning the new state and recording it on the undo stack. Executing a new command always clears any redo history, matching every editor's own convention. */
  execute(state: S, command: Command<S>): S {
    const next = command.do(state);
    this.undoStack.push(command);
    if (this.undoStack.length > this.maxEntries) this.undoStack.shift();
    this.redoStack = [];
    return next;
  }

  /** Returns the previous state, or null if there's nothing to undo. */
  undo(state: S): S | null {
    const command = this.undoStack.pop();
    if (!command) return null;
    this.redoStack.push(command);
    return command.undo(state);
  }

  /** Returns the re-applied state, or null if there's nothing to redo. */
  redo(state: S): S | null {
    const command = this.redoStack.pop();
    if (!command) return null;
    this.undoStack.push(command);
    return command.do(state);
  }

  canUndo(): boolean {
    return this.undoStack.length > 0;
  }

  canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  clear(): void {
    this.undoStack = [];
    this.redoStack = [];
  }

  /** Command labels, oldest first -- backs the History panel in a later phase. */
  get entries(): readonly string[] {
    return this.undoStack.map((c) => c.label);
  }
}
