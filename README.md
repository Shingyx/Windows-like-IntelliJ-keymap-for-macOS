# Windows-like IntelliJ keymap for macOS

## TL;DR

Take the file <https://github.com/Shingyx/windows-like-intellij-keymap-for-macos/blob/master/Windows-like%20for%20macOS.xml> and place it inside "~/Library/Application Support/JetBrains/\<IDE-NAME>/keymaps".

## Overview

A node script to generate a Windows-like keymap for all of your JetBrains IDEs on macOS, based on the Windows default keymap for IntelliJ IDEA Community Edition. This is for when you have already memorized many of the shortcuts on Windows and you have recently migrated to macOS, to do iOS development for example.

The IntelliJ default keymap can be found here: <https://github.com/JetBrains/intellij-community/blob/master/platform/platform-resources/src/keymaps/%24default.xml>.

Please note that this project assumes your keyboard is of the Mac layout, where the bottom row starts with "Ctrl -> Option -> Cmd". Alternatively, take a keyboard where the bottom row starts with "Ctrl -> Win -> Alt" and swap the Win and Alt inputs using the OS or Karabiner-Elements.

The script performs three main tasks:

-   Updates every shortcut using the Alt modifier to use Command instead. Where there are conflicts, the shortcut is either removed, unchanged, or ported from the [Mac OS X 10.5+ IntelliJ keymap](https://github.com/JetBrains/intellij-community/blob/master/platform/platform-resources/src/keymaps/Mac%20OS%20X%2010.5%2B.xml).
-   Replaces the Insert key with the Help key. Insert on a full-sized keyboard is interpreted as Help on macOS.
-   Adds additional shortcuts which are common on macOS, such as Cmd+X/C/V to Cut/Copy/Paste, Cmd(+Shift)+Z to Undo/Redo, Cmd/Option+arrow keys to navigate to the start/end of words or lines, and more.

Because all JetBrains IDEs are based on IntelliJ, the keymap should be compatible with all of them, including WebStorm and Android Studio. However, you may want to make small adjustments to the keymap afterwards for some shortcuts unique to specific IDEs.

## Run it yourself

Method 1: npx

```
npx github:shingyx/windows-like-intellij-keymap-for-macos
```

Method 2: Clone, build, run

```
git clone https://github.com/Shingyx/Windows-like-IntelliJ-keymap-for-macOS
yarn        # install dependencies (also runs `yarn build` to build the project)
node .      # run the main script
```
