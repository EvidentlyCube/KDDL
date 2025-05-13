import {PlatformOptions} from "./PlatformOptions";
import {C, HoldId} from "../C";

import * as HoldPath from "../../src.assets/level/kdd2.tss.hold";
import * as SubtitlePath from "../../src.assets/gfx/by_maurycy/ui/logo_kdd2.png";
import * as LocalEnPath from "../../src.assets/i18n/en/hold.kdd2.yml";
import * as LocalNlPath from "../../src.assets/i18n/nl/nl.kdd2.txt";
import * as LocalDePath from "../../src.assets/i18n/de/de.kdd2.txt";
import * as LocalFiPath from "../../src.assets/i18n/fi/fi.kdd2.txt";
import * as LocalEsPath from "../../src.assets/i18n/es/es.kdd2.txt";
import * as LocalPtPath from "../../src.assets/i18n/pt/pt.kdd2.txt";
import * as LocalFrPath from "../../src.assets/i18n/fr/fr.kdd2.txt";
import * as LocalRuPath from "../../src.assets/i18n/ru/ru.kdd2.txt";
import * as LocalPlPath from "../../src.assets/i18n/pl/pl.kdd2.txt";
import {AchievementsListKdd2} from "../game/achievements/AchievementsListKdd2";
import {HoldOptions} from "./PlatformSpecific";

export const Kddl2HoldOptions: HoldOptions = {
	id: HoldId.KDDL2,
	holdDisplayName: "KDD Episode 2",
	defaultStyle: 'Fortress', // And Iceworks
	styleAbo: false,
	styleCit: false,
	styleDee: false,
	styleFor: true,
	styleFou: false,
	styleIce: true,
	isHoldKdd1: false,
	isHoldKdd2: true,
	isHoldKdd3: false,
	isHoldKdd4: false,
	isHoldKdd5: false,
	isHoldKdd6: false,
	saveStorageName: 'drod-lite/kddl2',
	supportedLanguages: ['de', 'en', 'es', 'fi', 'fr', 'nl', 'pt', 'ru', 'pl'],
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