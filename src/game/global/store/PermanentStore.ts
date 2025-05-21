import { HoldId } from "src/C";
import { EncodedAchievement } from "../../achievements/Achievement";
import { PermanentStoreSlot } from "./PermanentStoreSlot";
import type { HoldScores } from "../GlobalHoldScore";
import { ValidLanguage } from "src.framework/net/retrocade/camel/RecamelLang";

export const PermanentStore = {
    version: new PermanentStoreSlot<number>(`save-version`, 1),
    shared: {
        holdScore: new PermanentStoreSlot<HoldScores>('shared/hold-scores', getEmptyHoldScores()),
    },
    settings: {
        language: new PermanentStoreSlot<ValidLanguage>('settings/language', 'en'),

        volumeSfx: new PermanentStoreSlot('settings/volume-sfx',0.6),
        volumeMusic: new PermanentStoreSlot('settings/volume-music', 0.8),
        volumeVoices: new PermanentStoreSlot('settings/volume-voices', 1),
        repeatRate: new PermanentStoreSlot('settings/repeat-rate', 0.25),
        repeatDelay: new PermanentStoreSlot('settings/repeat-delay', 300),

        showMoveCount: new PermanentStoreSlot(`settings/move-count`, false),
    },

    keymap: {
        moveNW: new PermanentStoreSlot('keymap/move_nw', '7'),
        moveN: new PermanentStoreSlot('keymap/move_n', '8'),
        moveNE: new PermanentStoreSlot('keymap/move_ne', '9'),
        moveW: new PermanentStoreSlot('keymap/move_w', 'u'),
        moveE: new PermanentStoreSlot('keymap/move_e', 'o'),
        moveSW: new PermanentStoreSlot('keymap/move_sw', 'j'),
        moveS: new PermanentStoreSlot('keymap/move_s', 'k'),
        moveSE: new PermanentStoreSlot('keymap/move_se', 'l'),
        wait: new PermanentStoreSlot('keymap/wait', 'i'),
        turnCW: new PermanentStoreSlot('keymap/turn_cw', 'w'),
        turnCCW: new PermanentStoreSlot('keymap/turn_ccw', 'q'),
        undo: new PermanentStoreSlot('keymap/undo', 'Backspace'),
        restart: new PermanentStoreSlot('keymap/restart', 'r'),
        battle: new PermanentStoreSlot('keymap/battle', 'a'),
        lock: new PermanentStoreSlot('keymap/lock', 'x'),
    },

    holds: {
        [HoldId.KDDL1]: getEmptyPerHoldStore(HoldId.KDDL1),
        [HoldId.KDDL2]: getEmptyPerHoldStore(HoldId.KDDL2),
        [HoldId.KDDL3]: getEmptyPerHoldStore(HoldId.KDDL3),
        [HoldId.KDDL4]: getEmptyPerHoldStore(HoldId.KDDL4),
        [HoldId.KDDL5]: getEmptyPerHoldStore(HoldId.KDDL5),
        [HoldId.KDDL6]: getEmptyPerHoldStore(HoldId.KDDL6),
        [HoldId.TheAncientPalace]: getEmptyPerHoldStore(HoldId.TheAncientPalace)
    } satisfies Record<HoldId, ReturnType<typeof getEmptyPerHoldStore>>
}


function getEmptyPerHoldStore(key: string) {
    return {
        achievements: new PermanentStoreSlot<EncodedAchievement[]>(`${key}/achievements`, []),
        globalStats: new PermanentStoreSlot(`${key}/global-stats`, ""),
        isCompleted: new PermanentStoreSlot(`${key}/is-completed`, false),
        isMastered: new PermanentStoreSlot(`${key}/is-mastered`, false),
        globalVisitedRoomPids: new PermanentStoreSlot<string[]>(`${key}/global-visited-room-pids`, []),
        globalConqueredRoomPids: new PermanentStoreSlot<string[]>(`${key}/global-conquered-rooms-pids`, []),
        saveStates: new PermanentStoreSlot<string[]>(`${key}/save-states`, []),
        currentState: new PermanentStoreSlot<string>(`${key}/current-state`, ''),
        currentStateCommands: new PermanentStoreSlot(`${key}/current-state-commands`,  ''),
        demos: new PermanentStoreSlot<string[]>(`${key}/demo`, []),
    };
}



export function getEmptyHoldScores(): HoldScores {
	return {
		[HoldId.KDDL1]: 0,
		[HoldId.KDDL2]: 0,
		[HoldId.KDDL3]: 0,
		[HoldId.KDDL4]: 0,
		[HoldId.KDDL5]: 0,
		[HoldId.KDDL6]: 0,
		[HoldId.TheAncientPalace]: 0
	};
}