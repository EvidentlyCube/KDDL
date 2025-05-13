import {PlatformOptions} from "./PlatformOptions";
import {C, HoldId} from "../C";

import * as HoldPath from "../../src.assets/level/kdd6.tss.hold";
import * as SubtitlePath from "../../src.assets/gfx/by_maurycy/ui/logo_kdd6.png";
import * as LocalEnPath from "../../src.assets/i18n/en/hold.kdd6.yml";
import {HoldOptions} from "./PlatformSpecific";
import { AchievementsListKdd6 } from "src/game/achievements/AchievementsListKdd6";

export const Kddl6HoldOptions: HoldOptions = {
	id: HoldId.KDDL6,
	holdDisplayName: "KDD Episode 6",
	defaultStyle: 'Aboveground', // And Fortress
	styleAbo: true,
	styleCit: true,
	styleDee: false,
	styleFor: true,
	styleFou: false,
	styleIce: false,
	isHoldKdd1: false,
	isHoldKdd2: false,
	isHoldKdd3: false,
	isHoldKdd4: false,
	isHoldKdd5: false,
	isHoldKdd6: true,
	saveStorageName: 'drod-lite/kddl6',
	supportedLanguages: ['en'],
	achievementsInRow: 8,
	achievementsSetter: AchievementsListKdd6,
	music: {
		ambient: "RES_MUSIC_AMBIENT_3",
		winLevel: "RES_MUSIC_WIN_LEVEL_3",
		attack1: "RES_MUSIC_ATTACK_3",
		attack2: "RES_MUSIC_ATTACK_6",
		puzzle1: "RES_MUSIC_PUZZLE_3",
		puzzle2: "RES_MUSIC_PUZZLE_6",
	},
	resources: {
		lang: {
			'en': LocalEnPath.default,
		},
		subtitle: SubtitlePath.default,
		hold: HoldPath.default,
	},
};

PlatformOptions.isGame = true;