export enum ConflictAction {
  REMOVE,
  KEEP,
}

export interface IKeymapXml {
  keymap: {
    $: {
      name: string;
      version: string;
      'disable-mnemonics'?: string;
      parent?: string;
    };
    action: IKeymapXmlAction[];
  };
}

export interface IKeymapXmlAction {
  $: {
    id: string;
  };
  'keyboard-shortcut'?: {
    $: {
      'first-keystroke': string;
      'second-keystroke'?: string;
    };
  }[];
  'mouse-shortcut'?: {
    $: {
      keystroke: string;
    };
  }[];
}
