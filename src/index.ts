import https from 'https';
import xml2js from 'xml2js';

import { additionalMacShortcuts, altConflicts } from './config';
import { ConflictAction, IKeymapXml } from './interfaces';

export async function regenKeymap(): Promise<string> {
  const defaultXmlText = await fetchDefaultKeymap();

  const xml: IKeymapXml = await xml2js.parseStringPromise(defaultXmlText);

  modifyKeymapXml(xml);

  const xmlBuilder = new xml2js.Builder({ headless: true });
  return xmlBuilder.buildObject(xml);
}

function modifyKeymapXml(xml: IKeymapXml): void {
  // Rename and add parent
  xml.keymap.$.name = 'Windows-like for macOS';
  xml.keymap.$.parent = '$default';

  // Modify existing keystrokes
  const processedActionIds = new Set<string>();
  for (const action of xml.keymap.action) {
    const actionId = action.$.id;
    const keyboardShortcuts = action['keyboard-shortcut'];
    const mouseShortcuts = action['mouse-shortcut'];

    if (keyboardShortcuts) {
      processExistingKeystrokes(actionId, keyboardShortcuts, 'first-keystroke');

      const additionalKeystrokes = additionalMacShortcuts[actionId];
      if (additionalKeystrokes) {
        for (const keystroke of additionalKeystrokes) {
          keyboardShortcuts.push({ $: { 'first-keystroke': keystroke } });
        }
      }
    }

    if (mouseShortcuts) {
      processExistingKeystrokes(actionId, mouseShortcuts, 'keystroke');
    }

    processedActionIds.add(actionId);
  }

  // Add any missing additional keystrokes
  for (const [actionId, additionalKeystrokes] of Object.entries(additionalMacShortcuts)) {
    if (processedActionIds.has(actionId)) {
      continue;
    }
    for (const keystroke of additionalKeystrokes) {
      xml.keymap.action.push({
        $: { id: actionId },
        'keyboard-shortcut': [{ $: { 'first-keystroke': keystroke } }],
      });
    }
  }
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
