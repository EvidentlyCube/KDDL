import { HoldId } from "../C";
import { PlatformOptions } from "./PlatformOptions";

import { AchievementsListKdd6 } from "src/game/achievements/AchievementsListKdd6";
import * as SubtitlePath from "../../src.assets/gfx/by_maurycy/ui/logo_kdd6.png";
import * as LocalDePath from "../../src.assets/i18n/de/hold.kdd6.yml";
import * as LocalEnPath from "../../src.assets/i18n/en/hold.kdd6.yml";
import * as LocalEsPath from "../../src.assets/i18n/es/hold.kdd6.yml";
import * as LocalFiPath from "../../src.assets/i18n/fi/hold.kdd6.yml";
import * as LocalFrPath from "../../src.assets/i18n/fr/hold.kdd6.yml";
import * as LocalNlPath from "../../src.assets/i18n/nl/hold.kdd6.yml";
import * as LocalPlPath from "../../src.assets/i18n/pl/hold.kdd6.yml";
import * as LocalPtPath from "../../src.assets/i18n/pt/hold.kdd6.yml";
import * as HoldPath from "../../src.assets/level/kdd6.tss.hold";
import { HoldOptions } from "./PlatformSpecific";

export const Kddl6HoldOptions: HoldOptions = {
	id: HoldId.KDDL6,
	holdDisplayName: "KDD Episode 6",
	defaultStyle: 'Aboveground', // And Fortress
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