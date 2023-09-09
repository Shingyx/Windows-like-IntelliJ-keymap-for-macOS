#!/usr/bin/env node

import fs from 'fs';

import { regenKeymap } from '.';

async function main() {
  const keymapXmlText = await regenKeymap();

  fs.writeFileSync('Windows-like for macOS.xml', keymapXmlText);

  console.log(`Created "Windows-like for macOS.xml" in "${process.cwd()}".`);
  console.log('Copy it to "~/Library/Application Support/JetBrains/<IDE-NAME>/keymaps" to use it.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
