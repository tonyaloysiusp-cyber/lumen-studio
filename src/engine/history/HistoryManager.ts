// ---------------------------------------------------------------------
// engine/history/HistoryManager.ts
// Real, memory-capped undo/redo over a command stack. Built in Phase 1
// with no editable operation to plug in yet; Phase 2's layer commands are
// the first real consumer, including jumpTo() for a clickable History
// panel (Photoshop-style: click any past or future entry to revert to
// exactly that state).
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

  /** Command labels, oldest first. The current position is always "after the last entry". */
  get entries(): readonly string[] {
    return this.undoStack.map((c) => c.label);
  }

  /** Redo-stack labels, nearest-future first -- the History panel's "steps you've undone" section. */
  get redoEntries(): readonly string[] {
    return [...this.redoStack].reverse().map((c) => c.label);
  }

  /**
   * Reverts/replays to the state right after the undo-stack command at `index`
   * (0 = oldest), or index -1 for the original state before any command --
   * exactly what clicking an entry in a History panel means. Returns null if
   * `index` is already the current position.
   */
  jumpTo(state: S, index: number): S | null {
    const currentIndex = this.undoStack.length - 1;
    if (index === currentIndex) return null;
    let result = state;
    if (index < currentIndex) {
      for (let i = currentIndex; i > index; i--) {
        const command = this.undoStack.pop()!;
        this.redoStack.push(command);
        result = command.undo(result);
      }
    } else {
      for (let i = currentIndex; i < index; i++) {
        const command = this.redoStack.pop()!;
        this.undoStack.push(command);
        result = command.do(result);
      }
    }
    return result;
  }
}
