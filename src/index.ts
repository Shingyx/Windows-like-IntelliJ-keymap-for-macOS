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
      const keystroke = processKeystroke(actionId, shortcut.$.keystroke);
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

function processKeystroke(actionId: string, keystroke: string | undefined): string | undefined {
  if (!keystroke) {
    return;
  }
  keystroke = keystroke.toLowerCase();
  if (/\balt\b/.test(keystroke)) {
    if (altConflicts[actionId] === ConflictAction.REMOVE) {
      return;
    }
    if (altConflicts[actionId] == null) {
      keystroke = keystroke.replace(/\balt\b/, 'meta');
    }
  }
  keystroke = keystroke.replace(/\binsert\b/, 'help');
  keystroke = keystroke.replace(/\bcontrol\b/, 'ctrl');
  return keystroke;
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
