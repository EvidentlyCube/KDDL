import { HoldId } from "../C";
import { PlatformOptions } from "./PlatformOptions";

import * as SubtitlePath from "../../src.assets/gfx/by_maurycy/ui/logo_kdd3.png";
import * as LocalDePath from "../../src.assets/i18n/de/hold.kdd3.yml";
import * as LocalEnPath from "../../src.assets/i18n/en/hold.kdd3.yml";
import * as LocalEsPath from "../../src.assets/i18n/es/hold.kdd3.yml";
import * as LocalFiPath from "../../src.assets/i18n/fi/hold.kdd3.yml";
import * as LocalFrPath from "../../src.assets/i18n/fr/hold.kdd3.yml";
import * as LocalNlPath from "../../src.assets/i18n/nl/hold.kdd3.yml";
import * as LocalPlPath from "../../src.assets/i18n/pl/hold.kdd3.yml";
import * as LocalPtPath from "../../src.assets/i18n/pt/hold.kdd3.yml";
import * as LocalRuPath from "../../src.assets/i18n/ru/hold.kdd3.yml";
import * as HoldPath from "../../src.assets/level/kdd3.tss.hold";
import { AchievementsListKdd3 } from "../game/achievements/AchievementsListKdd3";
import { HoldOptions } from "./PlatformSpecific";

export const Kddl3HoldOptions: HoldOptions = {
	id: HoldId.KDDL3,
	holdDisplayName: "KDD Episode 3",
	defaultStyle: 'Aboveground', // And City
	supportedLanguages: ['en'],
	achievementsInRow: 9,
	achievementsSetter: AchievementsListKdd3,
	music: {
		ambient: "RES_MUSIC_AMBIENT_3",
		winLevel: "RES_MUSIC_WIN_LEVEL_3",
		attack1: "RES_MUSIC_ATTACK_5",
		attack2: "RES_MUSIC_ATTACK_6",
		puzzle1: "RES_MUSIC_PUZZLE_5",
		puzzle2: "RES_MUSIC_PUZZLE_6",
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
			'pl': LocalPlPath.default,
		},
		subtitle: SubtitlePath.default,
		hold: HoldPath.default,
	},
};

PlatformOptions.isGame = true;