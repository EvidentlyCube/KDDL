import { HoldId } from "src/C";
import { EncodedAchievement } from "../../achievements/Achievement";
import { PermanentStoreSlot } from "./PermanentStoreSlot";
import type { HoldScores } from "../GlobalHoldScore";
import { ValidLanguage } from "src.framework/net/retrocade/camel/RecamelLang";

export const PermanentStore = {
    version: PermanentStoreSlot.create<number>(`save-version`, 1),
    shared: {
        holdScore: PermanentStoreSlot.create<HoldScores>('shared/hold-scores', getEmptyHoldScores()),
    },
    settings: {
        language: PermanentStoreSlot.create<ValidLanguage>('settings/language', 'en'),

        volumeSfx: PermanentStoreSlot.create('settings/volume-sfx',0.6),
        volumeMusic: PermanentStoreSlot.create('settings/volume-music', 0.8),
        volumeVoices: PermanentStoreSlot.create('settings/volume-voices', 1),
        repeatRate: PermanentStoreSlot.create('settings/repeat-rate', 0.25),
        repeatDelay: PermanentStoreSlot.create('settings/repeat-delay', 300),

        showMoveCount: PermanentStoreSlot.create(`settings/move-count`, false),
    },

    keymap: {
        moveNW: PermanentStoreSlot.create('keymap/move_nw', '7'),
        moveN: PermanentStoreSlot.create('keymap/move_n', '8'),
        moveNE: PermanentStoreSlot.create('keymap/move_ne', '9'),
        moveW: PermanentStoreSlot.create('keymap/move_w', 'u'),
        moveE: PermanentStoreSlot.create('keymap/move_e', 'o'),
        moveSW: PermanentStoreSlot.create('keymap/move_sw', 'j'),
        moveS: PermanentStoreSlot.create('keymap/move_s', 'k'),
        moveSE: PermanentStoreSlot.create('keymap/move_se', 'l'),
        wait: PermanentStoreSlot.create('keymap/wait', 'i'),
        turnCW: PermanentStoreSlot.create('keymap/turn_cw', 'w'),
        turnCCW: PermanentStoreSlot.create('keymap/turn_ccw', 'q'),
        undo: PermanentStoreSlot.create('keymap/undo', 'Backspace'),
        restart: PermanentStoreSlot.create('keymap/restart', 'r'),
        battle: PermanentStoreSlot.create('keymap/battle', 'a'),
        lock: PermanentStoreSlot.create('keymap/lock', 'x'),
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
        achievements: PermanentStoreSlot.create<EncodedAchievement[]>(`${key}/achievements`, []),
        globalStats: PermanentStoreSlot.create(`${key}/global-stats`, ""),
        isCompleted: PermanentStoreSlot.create(`${key}/is-completed`, false),
        isMastered: PermanentStoreSlot.create(`${key}/is-mastered`, false),
        globalVisitedRoomPids: PermanentStoreSlot.create<string[]>(`${key}/global-visited-room-pids`, []),
        globalConqueredRoomPids: PermanentStoreSlot.create<string[]>(`${key}/global-conquered-rooms-pids`, []),
        saveStates: PermanentStoreSlot.create<string[]>(`${key}/save-states`, []),
        currentState: PermanentStoreSlot.create<string>(`${key}/current-state`, ''),
        currentStateCommands: PermanentStoreSlot.create(`${key}/current-state-commands`,  ''),
        demos: PermanentStoreSlot.create<string[]>(`${key}/demo`, []),
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