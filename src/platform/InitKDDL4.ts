import {PlatformOptions} from "./PlatformOptions";
import {C, HoldId} from "../C";

import * as HoldPath from "../../src.assets/level/kdd4.tss.hold";
import * as SubtitlePath from "../../src.assets/gfx/by_maurycy/ui/logo_kdd4.png";
import * as LocalEnPath from "../../src.assets/i18n/en/hold.kdd4.yml";
import * as LocalNlPath from "../../src.assets/i18n/nl/nl.kdd4.txt";
import * as LocalDePath from "../../src.assets/i18n/de/de.kdd4.txt";
import * as LocalFiPath from "../../src.assets/i18n/fi/fi.kdd4.txt";
import * as LocalEsPath from "../../src.assets/i18n/es/es.kdd4.txt";
import * as LocalPtPath from "../../src.assets/i18n/pt/pt.kdd4.txt";
import * as LocalFrPath from "../../src.assets/i18n/fr/fr.kdd4.txt";
import * as LocalPlPath from "../../src.assets/i18n/pl/pl.kdd4.txt";
import {AchievementsListKdd4} from "../game/achievements/AchievementsListKdd4";
import {HoldOptions} from "./PlatformSpecific";

export const Kddl4HoldOptions: HoldOptions = {
	id: HoldId.KDDL4,
	holdDisplayName: "KDD Episode 4",
	defaultStyle: 'Foundation', // And Deep Spaces
	styleAbo: false,
	styleCit: false,
	styleDee: true,
	styleFor: false,
	styleFou: true,
	styleIce: false,
	isHoldKdd1: false,
	isHoldKdd2: false,
	isHoldKdd3: true,
	isHoldKdd4: false,
	isHoldKdd5: false,
	isHoldKdd6: false,
	saveStorageName: 'drod-lite/kddl4',
	supportedLanguages: ['de', 'en', 'es', 'fi', 'fr', 'nl', 'pt', 'pl'],
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