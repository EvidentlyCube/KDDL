import {PlatformOptions} from "./PlatformOptions";
import {C, HoldId} from "../C";

import * as HoldPath from "../../src.assets/level/kdd5.tss.hold";
import * as SubtitlePath from "../../src.assets/gfx/by_maurycy/ui/logo_kdd5.png";
import * as LocalEnPath from "../../src.assets/i18n/en/hold.kdd5.yml";
import {AchievementsListKdd5} from "../game/achievements/AchievementsListKdd5";
import {HoldOptions} from "./PlatformSpecific";

export const Kddl5HoldOptions: HoldOptions = {
	id: HoldId.KDDL5,
	holdDisplayName: "KDD Episode 5",
	defaultStyle: 'Iceworks', // And Fortress
	styleAbo: false,
	styleCit: false,
	styleDee: false,
	styleFor: true,
	styleFou: false,
	styleIce: true,
	isHoldKdd1: false,
	isHoldKdd2: false,
	isHoldKdd3: false,
	isHoldKdd4: false,
	isHoldKdd5: true,
	isHoldKdd6: false,
	saveStorageName: 'drod-lite/kddl5',
	supportedLanguages: ['en'],
	achievementsInRow: 8,
	achievementsSetter: AchievementsListKdd5,
	music: {
		ambient: "RES_MUSIC_AMBIENT_2",
		winLevel: "RES_MUSIC_WIN_LEVEL_2",
		attack1: "RES_MUSIC_ATTACK_2",
		attack2: "RES_MUSIC_ATTACK_5",
		puzzle1: "RES_MUSIC_PUZZLE_2",
		puzzle2: "RES_MUSIC_PUZZLE_5",
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