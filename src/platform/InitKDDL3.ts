import {PlatformOptions} from "./PlatformOptions";
import {C, HoldId} from "../C";

import * as HoldPath from "../../src.assets/level/kdd3.tss.hold";
import * as SubtitlePath from "../../src.assets/gfx/by_maurycy/ui/logo_kdd3.png";
import * as LocalEnPath from "../../src.assets/i18n/en/hold.kdd3.yml";
import * as LocalNlPath from "../../src.assets/i18n/nl/nl.kdd3.txt";
import * as LocalDePath from "../../src.assets/i18n/de/de.kdd3.txt";
import * as LocalFiPath from "../../src.assets/i18n/fi/fi.kdd3.txt";
import * as LocalEsPath from "../../src.assets/i18n/es/es.kdd3.txt";
import * as LocalPtPath from "../../src.assets/i18n/pt/pt.kdd3.txt";
import * as LocalFrPath from "../../src.assets/i18n/fr/fr.kdd3.txt";
import * as LocalRuPath from "../../src.assets/i18n/ru/ru.kdd3.txt";
import * as LocalPlPath from "../../src.assets/i18n/pl/pl.kdd3.txt";
import {AchievementsListKdd3} from "../game/achievements/AchievementsListKdd3";
import {HoldOptions} from "./PlatformSpecific";

export const Kddl3HoldOptions: HoldOptions = {
	id: HoldId.KDDL3,
	holdDisplayName: "KDD Episode 3",
	defaultStyle: 'Aboveground', // And City
	styleAbo: true,
	styleCit: true,
	styleDee: false,
	styleFor: false,
	styleFou: false,
	styleIce: false,
	isHoldKdd1: false,
	isHoldKdd2: false,
	isHoldKdd3: true,
	isHoldKdd4: false,
	isHoldKdd5: false,
	isHoldKdd6: false,
	saveStorageName: 'drod-lite/kddl3',
	supportedLanguages: ['de', 'en', 'es', 'fi', 'fr', 'nl', 'pt', 'pl'],
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