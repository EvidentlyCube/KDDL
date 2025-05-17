import {PlatformOptions} from "./PlatformOptions";
import {C, HoldId} from "../C";

import * as HoldPath from "../../src.assets/level/kdd4.tss.hold";
import * as SubtitlePath from "../../src.assets/gfx/by_maurycy/ui/logo_kdd4.png";
import * as LocalEnPath from "../../src.assets/i18n/en/hold.kdd4.yml";
import * as LocalNlPath from "../../src.assets/i18n/nl/hold.kdd4.yml";
import * as LocalDePath from "../../src.assets/i18n/de/hold.kdd4.yml";
import * as LocalFiPath from "../../src.assets/i18n/fi/hold.kdd4.yml";
import * as LocalEsPath from "../../src.assets/i18n/es/hold.kdd4.yml";
import * as LocalPtPath from "../../src.assets/i18n/pt/hold.kdd4.yml";
import * as LocalFrPath from "../../src.assets/i18n/fr/hold.kdd4.yml";
import * as LocalPlPath from "../../src.assets/i18n/pl/hold.kdd4.yml";
import {AchievementsListKdd4} from "../game/achievements/AchievementsListKdd4";
import {HoldOptions} from "./PlatformSpecific";

export const Kddl4HoldOptions: HoldOptions = {
	id: HoldId.KDDL4,
	holdDisplayName: "KDD Episode 4",
	defaultStyle: 'Foundation', // And Deep Spaces
	supportedLanguages: ['en'],
	achievementsInRow: 9,
	achievementsSetter: AchievementsListKdd4,
	music: {
		ambient: "RES_MUSIC_AMBIENT_1",
		winLevel: "RES_MUSIC_WIN_LEVEL_1",
		attack1: "RES_MUSIC_ATTACK_1",
		attack2: "RES_MUSIC_ATTACK_4",
		puzzle1: "RES_MUSIC_PUZZLE_1",
		puzzle2: "RES_MUSIC_PUZZLE_4",
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
			'pl': LocalPlPath.default,
		},
		subtitle: SubtitlePath.default,
		hold: HoldPath.default,
	},
};

PlatformOptions.isGame = true;