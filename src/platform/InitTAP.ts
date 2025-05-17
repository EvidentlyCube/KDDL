import {PlatformOptions} from "./PlatformOptions";
import {C, HoldId} from "../C";

import * as HoldPath from "../../src.assets/level/TheAncientPalace.tss.hold";
import * as SubtitlePath from "../../src.assets/gfx/by_maurycy/ui/logo_tap.png";
import * as LocalEnPath from "../../src.assets/i18n/en/hold.tap.yml";
import * as LocalNlPath from "../../src.assets/i18n/nl/hold.tap.yml";
import * as LocalDePath from "../../src.assets/i18n/de/hold.tap.yml";
import * as LocalFiPath from "../../src.assets/i18n/fi/hold.tap.yml";
import * as LocalEsPath from "../../src.assets/i18n/es/hold.tap.yml";
import * as LocalPtPath from "../../src.assets/i18n/pt/hold.tap.yml";
import * as LocalFrPath from "../../src.assets/i18n/fr/hold.tap.yml";
import * as LocalPlPath from "../../src.assets/i18n/pl/hold.tap.yml";
import {HoldOptions} from "./PlatformSpecific";
import { AchievementsListTAP } from "src/game/achievements/AchievementsListTAP";

export const TAPHoldOptions: HoldOptions = {
	id: HoldId.TheAncientPalace,
	holdDisplayName: "The Ancient Palace",
	defaultStyle: 'Foundation',
	supportedLanguages: ['en'],
	achievementsInRow: 6,
	achievementsSetter: AchievementsListTAP,
	music: {
		ambient: "RES_MUSIC_AMBIENT_1",
		winLevel: "RES_MUSIC_WIN_LEVEL_1",
		attack1: "RES_MUSIC_ATTACK_1",
		attack2: "RES_MUSIC_ATTACK_2",
		puzzle1: "RES_MUSIC_PUZZLE_1",
		puzzle2: "RES_MUSIC_PUZZLE_2",
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