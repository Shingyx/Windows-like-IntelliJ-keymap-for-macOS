#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

import { regenKeymap } from '.';

async function main() {
  const keymapXmlText = await regenKeymap();

  const outputDir = path.resolve('output');
  const filename = 'Windows-like for macOS.xml';

  fs.writeFileSync(path.join(outputDir, filename), keymapXmlText);

  console.log(`Created "${filename}" in "${outputDir}".`);
  console.log('Copy it to "~/Library/Application Support/JetBrains/<IDE-NAME>/keymaps" to use it.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
