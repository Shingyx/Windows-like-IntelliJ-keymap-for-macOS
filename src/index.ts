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

    if (action['keyboard-shortcut']) {
      processExistingKeystrokes(actionId, action['keyboard-shortcut'], 'first-keystroke');
    }

    if (action['mouse-shortcut']) {
      processExistingKeystrokes(actionId, action['mouse-shortcut'], 'keystroke');
    }

    actionMap[actionId] = action;
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

function processExistingKeystrokes<T extends string>(
  actionId: string,
  shortcuts: { $: { [key in T]: string } }[],
  keystrokeId: T,
): void {
  for (let i = shortcuts.length - 1; i >= 0; i--) {
    const shortcut = shortcuts[i];

    if (/\balt\b/.test(shortcut.$[keystrokeId])) {
      if (altConflicts[actionId] == null) {
        shortcut.$[keystrokeId] = shortcut.$[keystrokeId].replace(/\balt\b/, 'meta');
      } else if (altConflicts[actionId] === ConflictAction.REMOVE) {
        shortcuts.splice(i, 1);
      }
    }

    if (/\bINSERT\b/.test(shortcut.$[keystrokeId])) {
      shortcut.$[keystrokeId] = shortcut.$[keystrokeId].replace(/\bINSERT\b/, 'help');
    }
  }
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
