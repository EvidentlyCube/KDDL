import {ValidLanguage} from "../src.framework/net/retrocade/camel/RecamelLang";
import {HoldOptions} from "./platform/PlatformSpecific";

export const S = {
	DEBUG: false,
	EngineVersion: 'V1.6.8-JS',
	currentHoldOptions: undefined as (HoldOptions | undefined),

	isSpiderMode: false,

	pagedHoldOptions: [] as HoldOptions[][],
	allHoldOptions: [] as HoldOptions[],

	get version(): string {
		return `Beta.8\nEngine ${S.EngineVersion}`;
	},

	get saveStorageName(): string {
		const holdOptions = S.currentHoldOptions;

		if (!holdOptions) {
			throw new Error("Hold options are not yet loaded");
		}

		return holdOptions.saveStorageName;
	},

	get BASE_LANGUAGES(): ValidLanguage[] {
		return ["de", 'en', 'es', 'fi', 'fr', 'nl', 'pt', 'ru', 'pl'];
	},

	get LANGUAGES(): ValidLanguage[] {
		const holdOptions = S.currentHoldOptions;

		if (!holdOptions) {
			throw new Error("Hold options are not yet loaded");
		}

		return holdOptions.supportedLanguages;
	},

	SAVE_SHARED_STORAGE: "drod-lite/shared",


	// ::::::::::::::::::::::::::::::::::::::::::::::
	// :: Game Data
	// ::::::::::::::::::::::::::::::::::::::::::::::

	SIZE_GAME_WIDTH: 760,
	SIZE_GAME_HEIGHT: 600,

	LEVEL_OFFSET_X: 159,
	LEVEL_OFFSET_Y: 43,

	RoomWidth: 27,
	RoomWidthOriginal: 38,
	RoomHeight: 25,
	RoomHeightOriginal: 32,
	RoomTileWidth: 22,
	RoomTileHeight: 22,
	RoomTileWidthHalf: 11,
	RoomTileHeightHalf: 11,
	RoomTotalTiles: 675,
	RoomTotalTilesOriginal: 38 * 32,

	RoomWidthPixels: 594,
	RoomHeightPixels: 550,

	LANGUAGE_NAMES: {
		de: "Deutsch",
		en: "English",
		es: "Español",
		fi: "Suomi",
		fr: "Français",
		nl: "Nederlands",
		pt: "Português",
		ru: "Русский",
		pl: "Polski",
	},
};

export function HoldInfo() {
	const { currentHoldOptions } = S;

	if (!currentHoldOptions) {
		throw new Error("Hold options are not set yet");
	}

	return currentHoldOptions;
}