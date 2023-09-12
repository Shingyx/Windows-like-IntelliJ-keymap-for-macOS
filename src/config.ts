import { ConflictAction } from './interfaces';

/**
 * Represents how conflicting default shortcuts should be handled.
 * REMOVE if both alt and meta conflict, otherwise KEEP.
 */
export const altConflicts: { [actionId: string]: ConflictAction } = {
  $Undo: ConflictAction.REMOVE, // alt back_space
  $Redo: ConflictAction.REMOVE, // shift alt back_space
  PreviousTab: ConflictAction.REMOVE, // alt left
  PreviousEditorTab: ConflictAction.REMOVE, // shift alt left
  NextTab: ConflictAction.REMOVE, // alt right
  NextEditorTab: ConflictAction.REMOVE, // shift alt right
  'Diff.PrevChange': ConflictAction.REMOVE, // alt left
  'Diff.NextChange': ConflictAction.REMOVE, // alt right
  'Diff.ApplyLeftSide': ConflictAction.REMOVE, // shift alt right
  'Diff.ApplyRightSide': ConflictAction.REMOVE, // shift alt left
  'Vcs.QuickListPopupAction': ConflictAction.KEEP, // alt back_quote
  EditorContextInfo: ConflictAction.KEEP, // alt q
  EditorAddCaretPerSelectedLine: ConflictAction.KEEP, // shift alt g
};

/**
 * Additional shortcuts from "Mac OS X 10.5+.xml" and more,
 * for a more consistent text editor experience.
 */
export const additionalMacShortcuts: { [actionId: string]: string[] } = {
  // Text editing
  EditorPreviousWord: ['alt left'],
  EditorNextWord: ['alt right'],
  EditorPreviousWordWithSelection: ['shift alt left'],
  EditorNextWordWithSelection: ['shift alt right'],
  EditorDeleteToWordStart: ['alt back_space'],
  EditorDeleteToWordEnd: ['alt delete'],
  EditorLineStart: ['meta left'],
  EditorLineEnd: ['meta right'],
  EditorLineStartWithSelection: ['shift meta left'],
  EditorLineEndWithSelection: ['shift meta right'],
  EditorDeleteLine: ['meta back_space'],
  // Editor actions
  $Cut: ['meta x'],
  $Copy: ['meta c'],
  $Paste: ['meta v'],
  $Undo: ['meta z'],
  $Redo: ['shift meta z'],
  $SelectAll: ['meta a'],
  $Delete: ['back_space', 'meta back_space'],
  Find: ['meta f'],
  FindNext: ['meta g'],
  FindPrevious: ['shift meta g'],
  FindInPath: ['shift meta f'],
  PreviousTab: ['shift meta open_bracket'],
  NextTab: ['shift meta close_bracket'],
  'Diff.PrevChange': ['shift meta open_bracket'],
  'Diff.NextChange': ['shift meta close_bracket'],
  'UsageView.Include': ['shift back_space'],
  Generate: ['meta n'],
  NewElement: ['meta n'],
  NewElementSamePlace: ['ctrl alt n'],
  NewScratchFile: ['shift meta n'],
  // Navigation
  Exit: ['meta q'],
  CloseContent: ['meta w'],
  NextWindow: ['meta back_quote'],
  PreviousWindow: ['shift meta back_quote'],
  ShowSettings: ['meta comma'],
  ShowProjectStructureSettings: ['meta semicolon'],
};
