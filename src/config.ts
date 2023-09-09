import { ConflictAction } from './interfaces';

/**
 * Represents how conflicting default shortcuts should be handled.
 * REMOVE if both alt and meta conflict, otherwise KEEP.
 */
export const altConflicts: { [actionId: string]: ConflictAction } = {
  $Undo: ConflictAction.REMOVE, // alt BACK_SPACE
  $Redo: ConflictAction.REMOVE, // alt shift BACK_SPACE
  PreviousTab: ConflictAction.REMOVE, // alt LEFT
  PreviousEditorTab: ConflictAction.REMOVE, // alt shift LEFT
  NextTab: ConflictAction.REMOVE, // alt RIGHT
  NextEditorTab: ConflictAction.REMOVE, // alt shift RIGHT
  'Diff.PrevChange': ConflictAction.REMOVE, // alt LEFT
  'Diff.NextChange': ConflictAction.REMOVE, // alt RIGHT
  'Diff.ApplyLeftSide': ConflictAction.REMOVE, // alt shift RIGHT
  'Diff.ApplyRightSide': ConflictAction.REMOVE, // alt shift LEFT
  'Vcs.QuickListPopupAction': ConflictAction.KEEP, // alt BACK_QUOTE
  EditorContextInfo: ConflictAction.KEEP, // alt q
  EditorAddCaretPerSelectedLine: ConflictAction.KEEP, // alt shift G
};

/**
 * Additional shortcuts from "Mac OS X 10.5+.xml" and more,
 * for a more consistent text editor experience.
 */
export const additionalMacShortcuts: { [actionId: string]: string[] } = {
  // Text editing
  EditorPreviousWord: ['alt LEFT'],
  EditorNextWord: ['alt RIGHT'],
  EditorPreviousWordWithSelection: ['alt shift LEFT'],
  EditorNextWordWithSelection: ['alt shift RIGHT'],
  EditorDeleteToWordStart: ['alt BACK_SPACE'],
  EditorDeleteToWordEnd: ['alt DELETE'],
  EditorLineStart: ['meta LEFT'],
  EditorLineEnd: ['meta RIGHT'],
  EditorLineStartWithSelection: ['meta shift LEFT'],
  EditorLineEndWithSelection: ['meta shift RIGHT'],
  EditorDeleteLine: ['meta BACK_SPACE'],
  // Editor actions
  $Cut: ['meta X'],
  $Copy: ['meta C'],
  $Paste: ['meta V'],
  $Undo: ['meta Z'],
  $Redo: ['meta shift Z'],
  $SelectAll: ['meta A'],
  $Delete: ['BACK_SPACE', 'meta BACK_SPACE'],
  Find: ['meta F'],
  FindNext: ['meta G'],
  FindPrevious: ['meta shift G'],
  FindInPath: ['meta shift F'],
  PreviousTab: ['meta shift OPEN_BRACKET'],
  NextTab: ['meta shift CLOSE_BRACKET'],
  'Diff.PrevChange': ['meta shift OPEN_BRACKET'],
  'Diff.NextChange': ['meta shift CLOSE_BRACKET'],
  'UsageView.Include': ['shift BACK_SPACE'],
  Generate: ['meta N'],
  NewElement: ['meta N'],
  NewElementSamePlace: ['control alt N'],
  NewScratchFile: ['meta shift N'],
  // Navigation
  Exit: ['meta Q'],
  CloseContent: ['meta W'],
  NextWindow: ['meta BACK_QUOTE'],
  PreviousWindow: ['meta shift BACK_QUOTE'],
  ShowSettings: ['meta COMMA'],
  ShowProjectStructureSettings: ['meta SEMICOLON'],
};
