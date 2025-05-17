import { HoldId } from "../C";
import { PlatformOptions } from "./PlatformOptions";

import * as SubtitlePath from "../../src.assets/gfx/by_maurycy/ui/logo_kdd2.png";
import * as LocalDePath from "../../src.assets/i18n/de/hold.kdd2.yml";
import * as LocalEnPath from "../../src.assets/i18n/en/hold.kdd2.yml";
import * as LocalEsPath from "../../src.assets/i18n/es/hold.kdd2.yml";
import * as LocalFiPath from "../../src.assets/i18n/fi/hold.kdd2.yml";
import * as LocalFrPath from "../../src.assets/i18n/fr/hold.kdd2.yml";
import * as LocalNlPath from "../../src.assets/i18n/nl/hold.kdd2.yml";
import * as LocalPlPath from "../../src.assets/i18n/pl/hold.kdd2.yml";
import * as LocalPtPath from "../../src.assets/i18n/pt/hold.kdd2.yml";
import * as LocalRuPath from "../../src.assets/i18n/ru/hold.kdd2.yml";
import * as HoldPath from "../../src.assets/level/kdd2.tss.hold";
import { AchievementsListKdd2 } from "../game/achievements/AchievementsListKdd2";
import { HoldOptions } from "./PlatformSpecific";

export const Kddl2HoldOptions: HoldOptions = {
	id: HoldId.KDDL2,
	holdDisplayName: "KDD Episode 2",
	defaultStyle: 'Fortress', // And Iceworks
	supportedLanguages: ['en'],
	achievementsInRow: 7,
	achievementsSetter: AchievementsListKdd2,
	music: {
		ambient: "RES_MUSIC_AMBIENT_2",
		winLevel: "RES_MUSIC_WIN_LEVEL_2",
		attack1: "RES_MUSIC_ATTACK_3",
		attack2: "RES_MUSIC_ATTACK_4",
		puzzle1: "RES_MUSIC_PUZZLE_3",
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
			'ru': LocalRuPath.default,
			'pl': LocalPlPath.default,
		},
		subtitle: SubtitlePath.default,
		hold: HoldPath.default,
	},
};

PlatformOptions.isGame = true;