#!/usr/bin/env node

import fs from 'fs';
import https from 'https';
import xml2js from 'xml2js';

enum BlacklistAction {
    REMOVE,
    KEEP,
}

interface IKeymapXml {
    keymap: {
        $: {
            name: string;
            version: string;
            'disable-mnemonics': string;
            parent?: string;
        };
        action: IKeymapXmlAction[];
    };
}

interface IKeymapXmlAction {
    $: {
        id: string;
    };
    'keyboard-shortcut'?: Array<{
        $: {
            'first-keystroke': string;
            'second-keystroke'?: string;
        };
    }>;
    'mouse-shortcut'?: Array<{
        $: {
            keystroke: string;
        };
    }>;
}

async function main() {
    const defaultXmlText = await requestDefaultKeymap();
    fs.writeFileSync('$default.xml', defaultXmlText);

    const xml: IKeymapXml = await xml2js.parseStringPromise(defaultXmlText);

    modifyKeymapXml(xml);

    const xmlBuilder = new xml2js.Builder({ headless: true });
    const customXmlText = xmlBuilder.buildObject(xml);
    fs.writeFileSync('Windows-like for macOS.xml', customXmlText);
}

/**
 * Represents how conflicting default shortcuts should be handled.
 * REMOVE if both alt and meta conflict, otherwise KEEP.
 */
function getAltBlacklist(): { [actionId: string]: BlacklistAction } {
    return {
        $Undo: BlacklistAction.REMOVE, // alt BACK_SPACE
        $Redo: BlacklistAction.REMOVE, // alt shift BACK_SPACE
        PreviousTab: BlacklistAction.REMOVE, // alt LEFT
        PreviousEditorTab: BlacklistAction.REMOVE, // alt shift LEFT
        NextTab: BlacklistAction.REMOVE, // alt RIGHT
        NextEditorTab: BlacklistAction.REMOVE, // alt shift RIGHT
        'Diff.PrevChange': BlacklistAction.REMOVE, // alt LEFT
        'Diff.NextChange': BlacklistAction.REMOVE, // alt RIGHT
        'Diff.ApplyLeftSide': BlacklistAction.REMOVE, // alt shift RIGHT
        'Diff.ApplyRightSide': BlacklistAction.REMOVE, // alt shift LEFT
        'Vcs.QuickListPopupAction': BlacklistAction.KEEP, // alt BACK_QUOTE
        EditorContextInfo: BlacklistAction.KEEP, // alt q
    };
}

/**
 * Returns additional shortcuts from "Mac OS X 10.5+.xml" and more,
 * for a more consistent text editor experience.
 */
function getAdditionalMacShortcuts(): { [actionId: string]: string[] } {
    return {
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
        // Navigation
        Exit: ['meta Q'],
        NextWindow: ['meta BACK_QUOTE'],
        PreviousWindow: ['meta shift BACK_QUOTE'],
        ShowSettings: ['meta COMMA'],
        ShowProjectStructureSettings: ['meta SEMICOLON'],
    };
}

function modifyKeymapXml(xml: IKeymapXml): void {
    // Rename and add parent
    xml.keymap.$.name = 'Windows-like for macOS';
    xml.keymap.$.parent = '$default';

    const additionalMacShortcuts = getAdditionalMacShortcuts();

    // Modify existing keystrokes
    for (const action of xml.keymap.action) {
        const actionId = action.$.id;
        const keyboardShortcuts = action['keyboard-shortcut'];
        const mouseShortcuts = action['mouse-shortcut'];

        if (keyboardShortcuts) {
            updateExistingKeystrokes(actionId, keyboardShortcuts, 'first-keystroke');

            const additionalKeystrokes = additionalMacShortcuts[actionId];
            if (additionalKeystrokes) {
                for (const keystroke of additionalKeystrokes) {
                    keyboardShortcuts.push({ $: { 'first-keystroke': keystroke } });
                }
                delete additionalMacShortcuts[actionId];
            }
        }

        if (mouseShortcuts) {
            updateExistingKeystrokes(actionId, mouseShortcuts, 'keystroke');
        }
    }

    // Add any missing additional keystrokes
    for (const [actionId, additionalKeystrokes] of Object.entries(additionalMacShortcuts)) {
        for (const keystroke of additionalKeystrokes) {
            xml.keymap.action.push({
                $: { id: actionId },
                'keyboard-shortcut': [{ $: { 'first-keystroke': keystroke } }],
            });
        }
    }
}

function updateExistingKeystrokes<T extends string>(
    actionId: string,
    shortcuts: Array<{ $: { [key in T]: string } }>,
    keystrokeId: T,
): void {
    const altBlacklist = getAltBlacklist();
    for (let i = shortcuts.length - 1; i >= 0; i--) {
        const shortcut = shortcuts[i];

        if (
            altBlacklist[actionId] !== BlacklistAction.KEEP &&
            /\balt\b/.test(shortcut.$[keystrokeId])
        ) {
            if (altBlacklist[actionId] === BlacklistAction.REMOVE) {
                shortcuts.splice(i, 1);
            } else {
                shortcut.$[keystrokeId] = shortcut.$[keystrokeId].replace(/\balt\b/, 'meta');
            }
        }

        if (/\bINSERT\b/.test(shortcut.$[keystrokeId])) {
            shortcut.$[keystrokeId] = shortcut.$[keystrokeId].replace(/\bINSERT\b/, 'help');
        }
    }
}

async function requestDefaultKeymap(): Promise<string> {
    return new Promise((resolve, reject) => {
        const url =
            'https://raw.githubusercontent.com/JetBrains/intellij-community/master/platform/platform-resources/src/keymaps/%24default.xml';
        https
            .get(url, (res) => {
                if (res.statusCode !== 200) {
                    reject(new Error(`Status code is not 200: ${res.statusCode}`));
                    return;
                }
                let data = '';
                res.on('data', (d) => {
                    data += d;
                }).on('end', () => {
                    resolve(data);
                });
            })
            .on('error', (e) => {
                reject(e);
            });
    });
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
