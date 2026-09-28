// ---------------------------------------------------------------------
// engine/history/Command.ts
// Generic command-pattern interface, parameterized over whatever state
// it edits (a LumenDocument in practice, but kept generic so it's cheap
// to unit test and reusable for non-document state later, e.g. a
// selection or the UI's own undo-able settings).
// ---------------------------------------------------------------------

export interface Command<S> {
  /** Shown in the History panel (Phase 2+) and used for merge/coalesce heuristics later. */
  label: string;
  do(state: S): S;
  undo(state: S): S;
}
