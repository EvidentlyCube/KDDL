import {PlatformOptions} from "./PlatformOptions";
import {C, HoldId} from "../C";

import * as HoldPath from "../../src.assets/level/kdd1.tss.hold";
import * as SubtitlePath from "../../src.assets/gfx/by_maurycy/ui/logo_kdd1.png";
import * as LocalEnPath from "../../src.assets/i18n/en/hold.kdd1.yml";
import * as LocalNlPath from "../../src.assets/i18n/nl/hold.kdd1.yml";
import * as LocalDePath from "../../src.assets/i18n/de/hold.kdd1.yml";
import * as LocalFiPath from "../../src.assets/i18n/fi/hold.kdd1.yml";
import * as LocalEsPath from "../../src.assets/i18n/es/hold.kdd1.yml";
import * as LocalPtPath from "../../src.assets/i18n/pt/hold.kdd1.yml";
import * as LocalFrPath from "../../src.assets/i18n/fr/hold.kdd1.yml";
import * as LocalRuPath from "../../src.assets/i18n/ru/hold.kdd1.yml";
import * as LocalPlPath from "../../src.assets/i18n/pl/hold.kdd1.yml";
import {AchievementsListKdd1} from "../game/achievements/AchievementsListKdd1";
import {HoldOptions} from "./PlatformSpecific";

export const Kddl1HoldOptions: HoldOptions = {
	id: HoldId.KDDL1,
	holdDisplayName: "KDD Episode 1",
	defaultStyle: 'Deep Spaces', // And Foundation
	styleAbo: false,
	styleCit: false,
	styleDee: true,
	styleFor: false,
	styleFou: true,
	styleIce: false,
	isHoldKdd1: true,
	isHoldKdd2: false,
	isHoldKdd3: false,
	isHoldKdd4: false,
	isHoldKdd5: false,
	isHoldKdd6: false,
	saveStorageName: 'drod-lite/kddl1',
	supportedLanguages: ['de', 'en', 'es', 'fi', 'fr', 'nl', 'pt', 'ru', 'pl'],
	achievementsInRow: 8,
	achievementsSetter: AchievementsListKdd1,
	music: {
		ambient: "RES_MUSIC_AMBIENT_1",
		winLevel: "RES_MUSIC_WIN_LEVEL_1",
		attack1: "RES_MUSIC_ATTACK_1",
		attack2: "RES_MUSIC_ATTACK_2",
		puzzle1: "RES_MUSIC_PUZZLE_1",
		puzzle2: "RES_MUSIC_PUZZLE_2"
	},
	resources: {
		lang: {
			'en': LocalEnPath.default,
			'nl': LocalNlPath.default,
			'de': LocalDePath.default,
			'fi': LocalFiPath.default,
			'es': LocalEsPath.default,
			'pt': LocalPtPath.default,
			'fr': LocalFrPath.default,
			'ru': LocalRuPath.default,
			'pl': LocalPlPath.default
		},
		subtitle: SubtitlePath.default,
		hold: HoldPath.default
	}
}

PlatformOptions.isGame = true;