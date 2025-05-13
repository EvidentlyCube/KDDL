import * as PIXI from 'pixi.js';
import {C, CanvasImageSource, StyleName, StyleTilesets} from "../../C";
import {ResourcesQueue} from "../../resources/mainGame/ResourcesQueue";
import {T} from "../../T";
import {HoldOptions} from "../../platform/PlatformSpecific";

export const Gfx = {
	ButtonSystemTexture: null! as PIXI.Texture,
	ButtonDownSystemTexture: null! as PIXI.Texture,
	WindowSystemTexture: null! as PIXI.Texture,
	TooltipSystemTexture: null! as PIXI.Texture,
	InputSystemTexture: null! as PIXI.Texture,

	LevelStartBgTexture: null! as PIXI.Texture,
	TitleScreenBgTexture: null! as PIXI.Texture,
	MenuBgTexture: null! as PIXI.Texture,
	GameLogoTexture: null! as PIXI.Texture,
	CaravelLogoTexture: null! as PIXI.Texture,
	RetrocadeLogoTexture: null! as PIXI.Texture,
	TutorialKeysTexture: null! as PIXI.Texture,

	TUTORIAL_KEYS: null! as HTMLImageElement,

	BUTTON_SYSTEM: null! as HTMLImageElement,
	BUTTON_DOWN_SYSTEM: null! as HTMLImageElement,
	WINDOW_BG_SYSTEM: null! as HTMLImageElement,
	TOOLTIP_BG_SYSTEM: null! as HTMLImageElement,
	INPUT_BG_SYSTEM: null! as HTMLImageElement,

	IN_GAME_SCREEN: null! as HTMLImageElement,
	GENERAL_TILES: null! as HTMLImageElement,
	BOLTS: null! as HTMLImageElement,
	EFFECTS: null! as HTMLImageElement,

	MENU_BACKGROUND: null! as HTMLImageElement,
	LEVEL_START_BACKGROUND: null! as HTMLImageElement,
	TITLE_SCREEN_BACKGROUND: null! as HTMLImageElement,
	LOGO_GAME: null! as HTMLImageElement,
	LOGO_CARAVEL: null! as HTMLImageElement,
	LOGO_RETROCADE: null! as HTMLImageElement,
	SCROLLS: null! as HTMLImageElement,
	EYES: null! as HTMLImageElement,
	FACES: null! as HTMLImageElement,
	ACHIEVEMENT: null! as HTMLImageElement,
	LOCK: null! as HTMLImageElement,

	STYLES: new Map<StyleName, Map<StyleTilesets, CanvasImageSource>>(),

	initialize() {
		Gfx.TUTORIAL_KEYS = ResourcesQueue.getImg(C.RES_TUTORIAL_KEYS);

		Gfx.BUTTON_SYSTEM = ResourcesQueue.getImg(C.RES_BUTTON_SYSTEM);
		Gfx.BUTTON_DOWN_SYSTEM = ResourcesQueue.getImg(C.RES_BUTTON_DOWN_SYSTEM);
		Gfx.WINDOW_BG_SYSTEM = ResourcesQueue.getImg(C.RES_WINDOW_BG_SYSTEM);
		Gfx.TOOLTIP_BG_SYSTEM = ResourcesQueue.getImg(C.RES_TOOLTIP_BG_SYSTEM);
		Gfx.INPUT_BG_SYSTEM = ResourcesQueue.getImg(C.RES_INPUT_BG_SYSTEM);

		Gfx.IN_GAME_SCREEN = ResourcesQueue.getImg(C.RES_GAME_SCREEN);
		Gfx.GENERAL_TILES = ResourcesQueue.getImg(C.RES_GENERAL_TILES);
		Gfx.BOLTS = ResourcesQueue.getImg(C.RES_BOLTS);
		Gfx.EFFECTS = ResourcesQueue.getImg(C.RES_EFFECTS);

		Gfx.MENU_BACKGROUND = ResourcesQueue.getImg(C.RES_MENU_BG);
		Gfx.LEVEL_START_BACKGROUND = ResourcesQueue.getImg(C.RES_LEVEL_START_BG);
		Gfx.TITLE_SCREEN_BACKGROUND = ResourcesQueue.getImg(C.RES_TITLE_BG);
		Gfx.LOGO_GAME = ResourcesQueue.getImg(C.RES_LOGO_GAME);
		Gfx.LOGO_CARAVEL = ResourcesQueue.getImg(C.RES_LOGO_CARAVEL);
		Gfx.LOGO_RETROCADE = ResourcesQueue.getImg(C.RES_LOGO_RETROCADE);
		Gfx.SCROLLS = ResourcesQueue.getImg(C.RES_SCROLLS);
		Gfx.EYES = ResourcesQueue.getImg(C.RES_EYES);
		Gfx.FACES = ResourcesQueue.getImg(C.RES_FACES);
		Gfx.ACHIEVEMENT = ResourcesQueue.getImg(C.RES_ACHIEVEMENT);
		Gfx.LOCK = ResourcesQueue.getImg(C.RES_LOCK);

	},

	initializeHold(hold: HoldOptions) {
		if (hold.styleAbo) {
			Gfx.STYLES.set(T.STYLE_ABOVEGROUND, new Map([
				[T.TILES_WALL, ResourcesQueue.getImg(C.RES_ABOVEGROUND_WALL)],
				[T.TILES_FLOOR, ResourcesQueue.getImg(C.RES_ABOVEGROUND_FLOOR)],
				[T.TILES_FLOOR_ALT, ResourcesQueue.getImg(C.RES_ABOVEGROUND_FLOORALT)],
				[T.TILES_FLOOR_DIRT, ResourcesQueue.getImg(C.RES_ABOVEGROUND_FLOORDIRT)],
				[T.TILES_FLOOR_GRASS, ResourcesQueue.getImg(C.RES_ABOVEGROUND_FLOORGRASS)],
				[T.TILES_FLOOR_MOSAIC, ResourcesQueue.getImg(C.RES_ABOVEGROUND_FLOORMOSAIC)],
				[T.TILES_FLOOR_ROAD, ResourcesQueue.getImg(C.RES_ABOVEGROUND_FLOORROAD)],
				[T.TILES_PIT, ResourcesQueue.getImg(C.RES_ABOVEGROUND_PIT)],
				[T.TILES_PITSIDE, ResourcesQueue.getImg(C.RES_ABOVEGROUND_PITSIDE)],
				[T.TILES_PITSIDE_SMALL, ResourcesQueue.getImg(C.RES_ABOVEGROUND_PITSIDESMALL)],
				[T.TILES_STYLE, ResourcesQueue.getImg(C.RES_ABOVEGROUND_TILES)],
			]));
		}

		if (hold.styleCit) {
			Gfx.STYLES.set(T.STYLE_CITY, new Map([
				[T.TILES_WALL, ResourcesQueue.getImg(C.RES_CITY_WALL)],
				[T.TILES_FLOOR, ResourcesQueue.getImg(C.RES_CITY_FLOOR)],
				[T.TILES_FLOOR_ALT, ResourcesQueue.getImg(C.RES_CITY_FLOORALT)],
				[T.TILES_FLOOR_DIRT, ResourcesQueue.getImg(C.RES_CITY_FLOORDIRT)],
				[T.TILES_FLOOR_GRASS, ResourcesQueue.getImg(C.RES_CITY_FLOORGRASS)],
				[T.TILES_FLOOR_MOSAIC, ResourcesQueue.getImg(C.RES_CITY_FLOORMOSAIC)],
				[T.TILES_FLOOR_ROAD, ResourcesQueue.getImg(C.RES_CITY_FLOORROAD)],
				[T.TILES_PIT, ResourcesQueue.getImg(C.RES_CITY_PIT)],
				[T.TILES_PITSIDE, ResourcesQueue.getImg(C.RES_CITY_PITSIDE)],
				[T.TILES_PITSIDE_SMALL, ResourcesQueue.getImg(C.RES_CITY_PITSIDESMALL)],
				[T.TILES_STYLE, ResourcesQueue.getImg(C.RES_CITY_TILES)],
			]));
		}

		if (hold.styleDee) {
			Gfx.STYLES.set(T.STYLE_DEEP_SPACES, new Map([
				[T.TILES_WALL, ResourcesQueue.getImg(C.RES_DEEP_SPACES_WALL)],
				[T.TILES_FLOOR, ResourcesQueue.getImg(C.RES_DEEP_SPACES_FLOOR)],
				[T.TILES_FLOOR_ALT, ResourcesQueue.getImg(C.RES_DEEP_SPACES_FLOORALT)],
				[T.TILES_FLOOR_DIRT, ResourcesQueue.getImg(C.RES_DEEP_SPACES_FLOORDIRT)],
				[T.TILES_FLOOR_GRASS, ResourcesQueue.getImg(C.RES_DEEP_SPACES_FLOORGRASS)],
				[T.TILES_FLOOR_MOSAIC, ResourcesQueue.getImg(C.RES_DEEP_SPACES_FLOORMOSAIC)],
				[T.TILES_FLOOR_ROAD, ResourcesQueue.getImg(C.RES_DEEP_SPACES_FLOORROAD)],
				[T.TILES_PIT, ResourcesQueue.getImg(C.RES_DEEP_SPACES_PIT)],
				[T.TILES_PITSIDE, ResourcesQueue.getImg(C.RES_DEEP_SPACES_PITSIDE)],
				[T.TILES_PITSIDE_SMALL, ResourcesQueue.getImg(C.RES_DEEP_SPACES_PITSIDESMALL)],
				[T.TILES_STYLE, ResourcesQueue.getImg(C.RES_DEEP_SPACES_TILES)],
			]));
		}

		if (hold.styleFor) {
			Gfx.STYLES.set(T.STYLE_FORTRESS, new Map([
				[T.TILES_WALL, ResourcesQueue.getImg(C.RES_FORTRESS_WALL)],
				[T.TILES_FLOOR, ResourcesQueue.getImg(C.RES_FORTRESS_FLOOR)],
				[T.TILES_FLOOR_ALT, ResourcesQueue.getImg(C.RES_FORTRESS_FLOORALT)],
				[T.TILES_FLOOR_DIRT, ResourcesQueue.getImg(C.RES_FORTRESS_FLOORDIRT)],
				[T.TILES_FLOOR_GRASS, ResourcesQueue.getImg(C.RES_FORTRESS_FLOORGRASS)],
				[T.TILES_FLOOR_MOSAIC, ResourcesQueue.getImg(C.RES_FORTRESS_FLOORMOSAIC)],
				[T.TILES_FLOOR_ROAD, ResourcesQueue.getImg(C.RES_FORTRESS_FLOORROAD)],
				[T.TILES_PIT, ResourcesQueue.getImg(C.RES_FORTRESS_PIT)],
				[T.TILES_PITSIDE, ResourcesQueue.getImg(C.RES_FORTRESS_PITSIDE)],
				[T.TILES_PITSIDE_SMALL, ResourcesQueue.getImg(C.RES_FORTRESS_PITSIDESMALL)],
				[T.TILES_STYLE, ResourcesQueue.getImg(C.RES_FORTRESS_TILES)],
			]));
		}

		if (hold.styleFou) {
			Gfx.STYLES.set(T.STYLE_FOUNDATION, new Map([
				[T.TILES_WALL, ResourcesQueue.getImg(C.RES_FOUNDATION_WALL)],
				[T.TILES_FLOOR, ResourcesQueue.getImg(C.RES_FOUNDATION_FLOOR)],
				[T.TILES_FLOOR_ALT, ResourcesQueue.getImg(C.RES_FOUNDATION_FLOORALT)],
				[T.TILES_FLOOR_DIRT, ResourcesQueue.getImg(C.RES_FOUNDATION_FLOORDIRT)],
				[T.TILES_FLOOR_GRASS, ResourcesQueue.getImg(C.RES_FOUNDATION_FLOORGRASS)],
				[T.TILES_FLOOR_MOSAIC, ResourcesQueue.getImg(C.RES_FOUNDATION_FLOORMOSAIC)],
				[T.TILES_FLOOR_ROAD, ResourcesQueue.getImg(C.RES_FOUNDATION_FLOORROAD)],
				[T.TILES_PIT, ResourcesQueue.getImg(C.RES_FOUNDATION_PIT)],
				[T.TILES_PITSIDE, ResourcesQueue.getImg(C.RES_FOUNDATION_PITSIDE)],
				[T.TILES_PITSIDE_SMALL, ResourcesQueue.getImg(C.RES_FOUNDATION_PITSIDESMALL)],
				[T.TILES_STYLE, ResourcesQueue.getImg(C.RES_FOUNDATION_TILES)],
			]));
		}

		if (hold.styleIce) {
			Gfx.STYLES.set(T.STYLE_ICEWORKS, new Map([
				[T.TILES_WALL, ResourcesQueue.getImg(C.RES_ICEWORKS_WALL)],
				[T.TILES_FLOOR, ResourcesQueue.getImg(C.RES_ICEWORKS_FLOOR)],
				[T.TILES_FLOOR_ALT, ResourcesQueue.getImg(C.RES_ICEWORKS_FLOORALT)],
				[T.TILES_FLOOR_DIRT, ResourcesQueue.getImg(C.RES_ICEWORKS_FLOORDIRT)],
				[T.TILES_FLOOR_GRASS, ResourcesQueue.getImg(C.RES_ICEWORKS_FLOORGRASS)],
				[T.TILES_FLOOR_MOSAIC, ResourcesQueue.getImg(C.RES_ICEWORKS_FLOORMOSAIC)],
				[T.TILES_FLOOR_ROAD, ResourcesQueue.getImg(C.RES_ICEWORKS_FLOORROAD)],
				[T.TILES_PIT, ResourcesQueue.getImg(C.RES_ICEWORKS_PIT)],
				[T.TILES_PITSIDE, ResourcesQueue.getImg(C.RES_ICEWORKS_PITSIDE)],
				[T.TILES_PITSIDE_SMALL, ResourcesQueue.getImg(C.RES_ICEWORKS_PITSIDESMALL)],
				[T.TILES_STYLE, ResourcesQueue.getImg(C.RES_ICEWORKS_TILES)],
			]));
		}

		Gfx.ButtonSystemTexture = new PIXI.Texture(new PIXI.BaseTexture(Gfx.BUTTON_SYSTEM));
		Gfx.ButtonDownSystemTexture = new PIXI.Texture(new PIXI.BaseTexture(Gfx.BUTTON_DOWN_SYSTEM));
		Gfx.WindowSystemTexture = new PIXI.Texture(new PIXI.BaseTexture(Gfx.WINDOW_BG_SYSTEM));
		Gfx.TooltipSystemTexture = new PIXI.Texture(new PIXI.BaseTexture(Gfx.TOOLTIP_BG_SYSTEM));
		Gfx.InputSystemTexture = new PIXI.Texture(new PIXI.BaseTexture(Gfx.INPUT_BG_SYSTEM));

		Gfx.TutorialKeysTexture = new PIXI.Texture(new PIXI.BaseTexture(Gfx.TUTORIAL_KEYS));

		Gfx.LevelStartBgTexture = new PIXI.Texture(new PIXI.BaseTexture(Gfx.LEVEL_START_BACKGROUND));
		Gfx.TitleScreenBgTexture = new PIXI.Texture(new PIXI.BaseTexture(Gfx.TITLE_SCREEN_BACKGROUND));
		Gfx.MenuBgTexture = new PIXI.Texture(new PIXI.BaseTexture(Gfx.MENU_BACKGROUND));
		Gfx.GameLogoTexture = new PIXI.Texture(new PIXI.BaseTexture(Gfx.LOGO_GAME));
		Gfx.CaravelLogoTexture = new PIXI.Texture(new PIXI.BaseTexture(Gfx.LOGO_CARAVEL));
		Gfx.RetrocadeLogoTexture = new PIXI.Texture(new PIXI.BaseTexture(Gfx.LOGO_RETROCADE));
	},
};