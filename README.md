# Windows-like IntelliJ keymap for macOS

A node script to generate a Windows-like keymap for all of your JetBrains IDEs on macOS, based on the Windows default keymap for IntelliJ IDEA Community Edition. This is for when you have already memorized many of the shortcuts on Windows and you have recently migrated to macOS, to do iOS development for example.

The IntelliJ default keymap can be found here: <https://github.com/JetBrains/intellij-community/blob/master/platform/platform-resources/src/keymaps/%24default.xml>.

Please note this project assumes that your keyboard has a Command key in place of the Alt key and an Option key in place of the Windows key.

The script performs three main tasks:

* Updates every shortcut using the Alt modifier to use Command instead. Where there are conflicts, the shortcut is either removed, unchanged, or ported from the "Mac OS X 10.5+" keymap.
* Replaces the Insert key with the Help key. Insert on a full-sized keyboard is interpreted as Help on macOS.
* Adds additional shortcuts which are common on macOS, such as Cmd+X/C/V to Cut/Copy/Paste, Cmd(+Shift)+Z to Undo/Redo, Cmd/Option+arrow keys to navigate to the start/end of words or lines, and more.

Because all JetBrains IDEs are based on IntelliJ, the keymap should be compatible with all of them, including WebStorm and Android Studio. However, you may want to make small adjustments to the keymap afterwards for some shortcuts unique to specific IDEs.

A version of this custom keymap is checked in and can be seen here: <https://github.com/Shingyx/windows-like-intellij-keymap-for-macos/blob/master/Windows-like%20for%20macOS.xml>.
