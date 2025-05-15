## 1.6.7 — ????-??-??
 - [BUGFIX] Fixed incorrect line heights that one player had.
 - [BUGFIX] Fixed another incorrect hold score case. Because achievements were loaded AFTER hold score was loaded it was possible for the score to incorrectly change when going between episodes
 - [OTHER] Adjusted the weights for hold completion and mastery when calculating hold score

## 1.6.6 — 2025-05-14
 - [BUGFIX] KDDL Episode 2 ⟶ Level 5: 2S2E, removed duplicate achievement "Can't Stand Yellow"
 - [BUGFIX] KDDL Episode 2 ⟶ Level 5: 2N, updated achievement "Orb Avoider" to reward at the room edge to ensure the player is not stuck

## 1.6.5 — 2025-05-14
 - [BUGFIX] KDDL Episode 1 ⟶ Third Level: 3S1W, fixed incorrectly assigned translation keys which would have caused strings in this room to not be translatable
 - [OTHER] KDDL Episode 2 ⟶ Tutorial Level: 2E, removed redundant scroll from (17,14) since it duplicates information that's in the next room and isn't useful in this room either way
 - [BUGFIX] KDDL Episode 5 ⟶ Twentieth Level: 3N1W, fixed missing translation for speech
 - [FEATURE] Added debug console that can be opened with backtick
 - [FEATURE] Debug Console: added `copy-i18n`, command to copy data used in localization
 - [FEATURE] Debug Console: added `debug-text-dimensions`, command to debug issue with too tall text
 - [BUGFIX] System's keyboard repeat rate no longer overrides "Key repeat rate" setting if it's faster
 - [BUGFIX] Also game's repeat rate was adjusted to be in sync with the animation speed of the movement

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