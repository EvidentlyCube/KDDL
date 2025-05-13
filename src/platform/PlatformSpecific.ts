import { HoldId, StyleName } from "../C";
import { ValidLanguage } from "../../src.framework/net/retrocade/camel/RecamelLang";
import type { Achievement } from "src/game/achievements/Achievement";

export interface PlatformSpecific {
	isGame: boolean;
	hasNoHold: boolean;
	isDebug: boolean;
	defaultStyle: StyleName;
}

export interface HoldOptions {
	id: HoldId;
	holdDisplayName: string;
	defaultStyle: StyleName;

	styleAbo: boolean;
	styleCit: boolean;
	styleDee: boolean;
	styleFor: boolean;
	styleFou: boolean;
	styleIce: boolean;
	isHoldKdd1: boolean;
	isHoldKdd2: boolean;
	isHoldKdd3: boolean;
	isHoldKdd4: boolean;
	isHoldKdd5: boolean;
	isHoldKdd6: boolean;

	saveStorageName: string;
	supportedLanguages: ValidLanguage[];

	achievementsInRow: number;
	achievementsSetter: (toArray: Achievement[]) => void;

	music: {
		ambient: 'RES_MUSIC_AMBIENT_1' | 'RES_MUSIC_AMBIENT_2' | 'RES_MUSIC_AMBIENT_3',
		winLevel: 'RES_MUSIC_WIN_LEVEL_1' | 'RES_MUSIC_WIN_LEVEL_2' | 'RES_MUSIC_WIN_LEVEL_3',
		attack1: 'RES_MUSIC_ATTACK_1' | 'RES_MUSIC_ATTACK_2' | 'RES_MUSIC_ATTACK_3' | 'RES_MUSIC_ATTACK_4' | 'RES_MUSIC_ATTACK_5' | 'RES_MUSIC_ATTACK_6',
		attack2: 'RES_MUSIC_ATTACK_1' | 'RES_MUSIC_ATTACK_2' | 'RES_MUSIC_ATTACK_3' | 'RES_MUSIC_ATTACK_4' | 'RES_MUSIC_ATTACK_5' | 'RES_MUSIC_ATTACK_6',
		puzzle1: 'RES_MUSIC_PUZZLE_1' | 'RES_MUSIC_PUZZLE_2' | 'RES_MUSIC_PUZZLE_3' | 'RES_MUSIC_PUZZLE_4' | 'RES_MUSIC_PUZZLE_5' | 'RES_MUSIC_PUZZLE_6',
		puzzle2: 'RES_MUSIC_PUZZLE_1' | 'RES_MUSIC_PUZZLE_2' | 'RES_MUSIC_PUZZLE_3' | 'RES_MUSIC_PUZZLE_4' | 'RES_MUSIC_PUZZLE_5' | 'RES_MUSIC_PUZZLE_6',
	},
	resources: {
		lang: {
			[key: string]: string
		},
		subtitle: string,
		hold: string,

	}
}