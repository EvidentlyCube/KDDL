## 1.6.5 — ????-??-??
 - [BUGFIX] KDDL Episode 1 ⟶ Third Level: 3S1W, fixed incorrectly assigned translation keys which would have caused strings in this room to not be translatable
 - [OTHER] KDDL Episode 2 ⟶ Tutorial Level: 2E, removed redundant scroll from (17,14) since it duplicates information that's in the next room and isn't useful in this room either way
 - [FEATURE] Added debug console that can be opened with backtick
 - [FEATURE] Debug Console: added `copy-i18n`, command to copy data used in localization

## 1.6.4 — 2025-05-13
 - [OTHER] KDDL Episode 1 ⟶ Adjusted thresholds for the counting achievements
 - [OTHER] The Ancient Palace ⟶ Restored it to the original state (removed the secret room and minor changes in Entrance)
 - [BUGFIX] Pause menu's "Restart Room" option now restarts the room from the start, not from the checkpoint
 - [BUGFIX] Achievement for killing X roaches now activates in rooms that contain queens
 - [BUGFIX] It is no longer possible to cause the game to crash by using "Restore to a Different Room". This happened because the last played room was not updated on Restore, only when going between rooms/walking down the stairs/Go To Entrance command; on the other hand the commands are updated on every move. You could enter one room, use "Restore to a Different Room", make some moves without triggering save then reload the game. On pressing continue it would input those moves into the last saved room (the one before you restored) which could cause ASSERTs by dying/leaving the room in the middle of playing the moves back. This should fix existing broken saves by just dropping the stored moves.
 - [BUGFIX] When continuing game and there were any moves restored the minimap will now draw.
 - [BUGFIX] Hold Completion and Mastery is no longer lost when you change episode form a Completed/Mastered hold and switch to another/same Completed/Mastered one.
 - [FEATURE] Pressing "Enter" now closes "Your Stats" window
 - [FEATURE] Changed slightly how the global score for holds is calculated so that having hold completion and hold mastery has value.
 - [OTHER] Released the source code

## 1.6.3 — 2025-05-12
 - Initial release of Beta 8 of KDDL JS