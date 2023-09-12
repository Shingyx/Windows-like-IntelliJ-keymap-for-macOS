import https from 'https';
import xml2js from 'xml2js';

import { additionalMacShortcuts, altConflicts } from './config';
import { ConflictAction, IKeymapXml, IKeymapXmlAction } from './interfaces';

export async function regenKeymap(): Promise<string> {
  const defaultXmlText = await fetchDefaultKeymap();

  const inputXml: IKeymapXml = await xml2js.parseStringPromise(defaultXmlText);

  const processedXml = processKeymapXml(inputXml);

  const xmlBuilder = new xml2js.Builder({ headless: true });
  let outputXmlText = xmlBuilder.buildObject(processedXml);
  // Add spaces before closing tags
  outputXmlText = outputXmlText.replace(/"\/>\n/g, '" />\n');
  return outputXmlText;
}

function processKeymapXml(xml: IKeymapXml): IKeymapXml {
  const actionMap: { [actionId: string]: IKeymapXmlAction } = {};

  // Modify existing keystrokes
  for (const action of xml.keymap.action) {
    const actionId = action.$.id;
    actionMap[actionId] = processAction(action);
  }

  // Add additional keystrokes
  for (const [actionId, additionalKeystrokes] of Object.entries(additionalMacShortcuts)) {
    let action = actionMap[actionId];
    if (!action) {
      action = { $: { id: actionId } };
      actionMap[actionId] = action;
    }
    if (!action['keyboard-shortcut']) {
      action['keyboard-shortcut'] = [];
    }
    for (const keystroke of additionalKeystrokes) {
      action['keyboard-shortcut'].push({ $: { 'first-keystroke': keystroke } });
    }
  }

  // Sort by actionId
  const sortedActions = Object.keys(actionMap)
    .sort()
    .map((actionId) => actionMap[actionId]);

  return {
    keymap: {
      $: { version: '1', name: 'Windows-like for macOS', parent: '$default' },
      action: sortedActions,
    },
  };
}

function processAction(action: IKeymapXmlAction): IKeymapXmlAction {
  const actionId = action.$.id;
  const result: IKeymapXmlAction = {
    $: { id: actionId },
  };

  if (action['keyboard-shortcut']) {
    result['keyboard-shortcut'] = [];
    for (const shortcut of action['keyboard-shortcut']) {
      const firstKeystroke = processKeystroke(actionId, shortcut.$['first-keystroke']);
      if (!firstKeystroke) {
        continue;
      }
      const secondKeystroke = processKeystroke(actionId, shortcut.$['second-keystroke']);
      result['keyboard-shortcut'].push({
        $: { 'first-keystroke': firstKeystroke, 'second-keystroke': secondKeystroke },
      });
    }
  }

  if (action['mouse-shortcut']) {
    result['mouse-shortcut'] = [];
    for (const shortcut of action['mouse-shortcut']) {
      const keystroke = processKeystroke(actionId, shortcut.$.keystroke, true);
      if (!keystroke) {
        continue;
      }
      result['mouse-shortcut'].push({
        $: { keystroke: keystroke },
      });
    }
  }

  return result;
}

function processKeystroke(
  actionId: string,
  keystroke: string | undefined,
  isMouse?: boolean,
): string | undefined {
  if (!keystroke) {
    return;
  }
  const { shift, ctrl, alt, keys } = parseKeystroke(keystroke);

  if (alt && altConflicts[actionId] === ConflictAction.REMOVE) {
    return;
  }

  const outputKeys = [];
  if (shift) {
    outputKeys.push('shift');
  }
  if (ctrl) {
    // Mouse shortcuts use "control" instead of "ctrl" for some reason
    outputKeys.push(isMouse ? 'control' : 'ctrl');
  }
  if (alt) {
    if (altConflicts[actionId] === ConflictAction.KEEP) {
      outputKeys.push('alt');
    } else {
      outputKeys.push('meta');
    }
  }
  for (const key of keys) {
    if (key === 'insert') {
      outputKeys.push('help');
    } else if (key === 'doubleclick') {
      outputKeys.push('doubleClick');
    } else {
      outputKeys.push(key);
    }
  }
  return outputKeys.join(' ');
}

function parseKeystroke(keystroke: string): {
  shift: boolean;
  ctrl: boolean;
  alt: boolean;
  keys: string[];
} {
  let shift = false;
  let ctrl = false;
  let alt = false;
  const keys: string[] = [];

  for (const key of keystroke.toLowerCase().split(' ')) {
    if (key === 'shift') {
      shift = true;
    } else if (key === 'control' || key === 'ctrl') {
      ctrl = true;
    } else if (key === 'alt') {
      alt = true;
    } else {
      keys.push(key);
    }
  }
  return { shift, ctrl, alt, keys };
}

async function fetchDefaultKeymap(): Promise<string> {
  return new Promise((resolve, reject) => {
    const url =
      'https://raw.githubusercontent.com/JetBrains/intellij-community/master/platform/platform-resources/src/keymaps/%24default.xml';
    const req = https.get(url, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`Status code is not 200: ${res.statusCode}`));
        return;
      }
      let data = '';
      res.on('data', (d) => {
        data += d;
      });
      res.on('end', () => {
        resolve(data);
      });
    });
    req.on('error', (e) => {
      reject(e);
    });
  });
}
