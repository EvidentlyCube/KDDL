import { BaseTexture, Texture } from "pixi.js";
import { C, CanvasImageSource, StyleName, StyleTilesets } from "../../C";
import { ResourcesQueue } from "../../resources/mainGame/ResourcesQueue";
import { T } from "../../T";

const generalTilesCache: Texture[] = [];

export const Gfx = {
	GeneralTilesTexture: null! as Texture,
	ButtonSystemTexture: null! as Texture,
	ButtonDownSystemTexture: null! as Texture,
	WindowSystemTexture: null! as Texture,
	TooltipSystemTexture: null! as Texture,
	InputSystemTexture: null! as Texture,
	InGameScreenTexture: null! as Texture,
	ScrollsTexture: null! as Texture,

	LevelStartBgTexture: null! as Texture,
	TitleScreenBgTexture: null! as Texture,
	MenuBgTexture: null! as Texture,
	GameLogoTexture: null! as Texture,
	CaravelLogoTexture: null! as Texture,
	RetrocadeLogoTexture: null! as Texture,
	TutorialKeysTexture: null! as Texture,
	FacesTexture: null! as Texture,
	FaceEyesTexture: null! as Texture,
	EffectsTexture: null! as Texture,
	BoltsTexture: null! as Texture,
	LockTexture: null! as Texture,

	BUTTON_SYSTEM: null! as HTMLImageElement,

	GENERAL_TILES: null! as HTMLImageElement,

	ACHIEVEMENT: null! as HTMLImageElement,

	StyleTextures: new Map<StyleName, Map<StyleTilesets, BaseTexture>>(),
	STYLES: new Map<StyleName, Map<StyleTilesets, CanvasImageSource>>(),

	initialize() {
		Gfx.BUTTON_SYSTEM = ResourcesQueue.getImg(C.RES_BUTTON_SYSTEM);

		Gfx.GENERAL_TILES = ResourcesQueue.getImg(C.RES_GENERAL_TILES);

		Gfx.ACHIEVEMENT = ResourcesQueue.getImg(C.RES_ACHIEVEMENT);

	},

	async initializeHoldResources() {
		// @FIXME - replace when no longer used by chievos
		Gfx.STYLES.set(T.STYLE_ABOVEGROUND, new Map([
			[T.TILES_WALL, ResourcesQueue.getImg(C.RES_ABOVEGROUND_WALL)],
			[T.TILES_FLOOR, ResourcesQueue.getImg(C.RES_ABOVEGROUND_FLOOR)],
			[T.TILES_FLOOR_ALT, ResourcesQueue.getImg(C.RES_ABOVEGROUND_FLOOR_ALT)],
			[T.TILES_FLOOR_DIRT, ResourcesQueue.getImg(C.RES_ABOVEGROUND_FLOOR_DIRT)],
			[T.TILES_FLOOR_GRASS, ResourcesQueue.getImg(C.RES_ABOVEGROUND_FLOOR_GRASS)],
			[T.TILES_FLOOR_MOSAIC, ResourcesQueue.getImg(C.RES_ABOVEGROUND_FLOOR_MOSAIC)],
			[T.TILES_FLOOR_ROAD, ResourcesQueue.getImg(C.RES_ABOVEGROUND_FLOOR_ROAD)],
			[T.TILES_PIT, ResourcesQueue.getImg(C.RES_ABOVEGROUND_PIT)],
			[T.TILES_PIT_SIDE, ResourcesQueue.getImg(C.RES_ABOVEGROUND_PIT_SIDE)],
			[T.TILES_PIT_SIDE_SMALL, ResourcesQueue.getImg(C.RES_ABOVEGROUND_PIT_SIDE_SMALL)],
			[T.TILES_STYLE, ResourcesQueue.getImg(C.RES_ABOVEGROUND_TILES)],
		]));

		Gfx.STYLES.set(T.STYLE_CITY, new Map([
			[T.TILES_WALL, ResourcesQueue.getImg(C.RES_CITY_WALL)],
			[T.TILES_FLOOR, ResourcesQueue.getImg(C.RES_CITY_FLOOR)],
			[T.TILES_FLOOR_ALT, ResourcesQueue.getImg(C.RES_CITY_FLOOR_ALT)],
			[T.TILES_FLOOR_DIRT, ResourcesQueue.getImg(C.RES_CITY_FLOOR_DIRT)],
			[T.TILES_FLOOR_GRASS, ResourcesQueue.getImg(C.RES_CITY_FLOOR_GRASS)],
			[T.TILES_FLOOR_MOSAIC, ResourcesQueue.getImg(C.RES_CITY_FLOOR_MOSAIC)],
			[T.TILES_FLOOR_ROAD, ResourcesQueue.getImg(C.RES_CITY_FLOOR_ROAD)],
			[T.TILES_PIT, ResourcesQueue.getImg(C.RES_CITY_PIT)],
			[T.TILES_PIT_SIDE, ResourcesQueue.getImg(C.RES_CITY_PIT_SIDE)],
			[T.TILES_PIT_SIDE_SMALL, ResourcesQueue.getImg(C.RES_CITY_PIT_SIDE_SMALL)],
			[T.TILES_STYLE, ResourcesQueue.getImg(C.RES_CITY_TILES)],
		]));

		Gfx.STYLES.set(T.STYLE_DEEP_SPACES, new Map([
			[T.TILES_WALL, ResourcesQueue.getImg(C.RES_DEEP_SPACES_WALL)],
			[T.TILES_FLOOR, ResourcesQueue.getImg(C.RES_DEEP_SPACES_FLOOR)],
			[T.TILES_FLOOR_ALT, ResourcesQueue.getImg(C.RES_DEEP_SPACES_FLOOR_ALT)],
			[T.TILES_FLOOR_DIRT, ResourcesQueue.getImg(C.RES_DEEP_SPACES_FLOOR_DIRT)],
			[T.TILES_FLOOR_GRASS, ResourcesQueue.getImg(C.RES_DEEP_SPACES_FLOOR_GRASS)],
			[T.TILES_FLOOR_MOSAIC, ResourcesQueue.getImg(C.RES_DEEP_SPACES_FLOOR_MOSAIC)],
			[T.TILES_FLOOR_ROAD, ResourcesQueue.getImg(C.RES_DEEP_SPACES_FLOOR_ROAD)],
			[T.TILES_PIT, ResourcesQueue.getImg(C.RES_DEEP_SPACES_PIT)],
			[T.TILES_PIT_SIDE, ResourcesQueue.getImg(C.RES_DEEP_SPACES_PIT_SIDE)],
			[T.TILES_PIT_SIDE_SMALL, ResourcesQueue.getImg(C.RES_DEEP_SPACES_PIT_SIDE_SMALL)],
			[T.TILES_STYLE, ResourcesQueue.getImg(C.RES_DEEP_SPACES_TILES)],
		]));

		Gfx.STYLES.set(T.STYLE_FORTRESS, new Map([
			[T.TILES_WALL, ResourcesQueue.getImg(C.RES_FORTRESS_WALL)],
			[T.TILES_FLOOR, ResourcesQueue.getImg(C.RES_FORTRESS_FLOOR)],
			[T.TILES_FLOOR_ALT, ResourcesQueue.getImg(C.RES_FORTRESS_FLOOR_ALT)],
			[T.TILES_FLOOR_DIRT, ResourcesQueue.getImg(C.RES_FORTRESS_FLOOR_DIRT)],
			[T.TILES_FLOOR_GRASS, ResourcesQueue.getImg(C.RES_FORTRESS_FLOOR_GRASS)],
			[T.TILES_FLOOR_MOSAIC, ResourcesQueue.getImg(C.RES_FORTRESS_FLOOR_MOSAIC)],
			[T.TILES_FLOOR_ROAD, ResourcesQueue.getImg(C.RES_FORTRESS_FLOOR_ROAD)],
			[T.TILES_PIT, ResourcesQueue.getImg(C.RES_FORTRESS_PIT)],
			[T.TILES_PIT_SIDE, ResourcesQueue.getImg(C.RES_FORTRESS_PIT_SIDE)],
			[T.TILES_PIT_SIDE_SMALL, ResourcesQueue.getImg(C.RES_FORTRESS_PIT_SIDE_SMALL)],
			[T.TILES_STYLE, ResourcesQueue.getImg(C.RES_FORTRESS_TILES)],
		]));

		Gfx.STYLES.set(T.STYLE_FOUNDATION, new Map([
			[T.TILES_WALL, ResourcesQueue.getImg(C.RES_FOUNDATION_WALL)],
			[T.TILES_FLOOR, ResourcesQueue.getImg(C.RES_FOUNDATION_FLOOR)],
			[T.TILES_FLOOR_ALT, ResourcesQueue.getImg(C.RES_FOUNDATION_FLOOR_ALT)],
			[T.TILES_FLOOR_DIRT, ResourcesQueue.getImg(C.RES_FOUNDATION_FLOOR_DIRT)],
			[T.TILES_FLOOR_GRASS, ResourcesQueue.getImg(C.RES_FOUNDATION_FLOOR_GRASS)],
			[T.TILES_FLOOR_MOSAIC, ResourcesQueue.getImg(C.RES_FOUNDATION_FLOOR_MOSAIC)],
			[T.TILES_FLOOR_ROAD, ResourcesQueue.getImg(C.RES_FOUNDATION_FLOOR_ROAD)],
			[T.TILES_PIT, ResourcesQueue.getImg(C.RES_FOUNDATION_PIT)],
			[T.TILES_PIT_SIDE, ResourcesQueue.getImg(C.RES_FOUNDATION_PIT_SIDE)],
			[T.TILES_PIT_SIDE_SMALL, ResourcesQueue.getImg(C.RES_FOUNDATION_PIT_SIDE_SMALL)],
			[T.TILES_STYLE, ResourcesQueue.getImg(C.RES_FOUNDATION_TILES)],
		]));

		Gfx.STYLES.set(T.STYLE_ICEWORKS, new Map([
			[T.TILES_WALL, ResourcesQueue.getImg(C.RES_ICEWORKS_WALL)],
			[T.TILES_FLOOR, ResourcesQueue.getImg(C.RES_ICEWORKS_FLOOR)],
			[T.TILES_FLOOR_ALT, ResourcesQueue.getImg(C.RES_ICEWORKS_FLOOR_ALT)],
			[T.TILES_FLOOR_DIRT, ResourcesQueue.getImg(C.RES_ICEWORKS_FLOOR_DIRT)],
			[T.TILES_FLOOR_GRASS, ResourcesQueue.getImg(C.RES_ICEWORKS_FLOOR_GRASS)],
			[T.TILES_FLOOR_MOSAIC, ResourcesQueue.getImg(C.RES_ICEWORKS_FLOOR_MOSAIC)],
			[T.TILES_FLOOR_ROAD, ResourcesQueue.getImg(C.RES_ICEWORKS_FLOOR_ROAD)],
			[T.TILES_PIT, ResourcesQueue.getImg(C.RES_ICEWORKS_PIT)],
			[T.TILES_PIT_SIDE, ResourcesQueue.getImg(C.RES_ICEWORKS_PIT_SIDE)],
			[T.TILES_PIT_SIDE_SMALL, ResourcesQueue.getImg(C.RES_ICEWORKS_PIT_SIDE_SMALL)],
			[T.TILES_STYLE, ResourcesQueue.getImg(C.RES_ICEWORKS_TILES)],
		]));

		for (const [style, bitmapDatas] of Gfx.STYLES.entries()) {
			const textures = Gfx.StyleTextures.get(style) ?? new Map();
			Gfx.StyleTextures.set(style, textures);

			for (const [tileset, bitmapData] of bitmapDatas.entries()) {
				if (textures.has(tileset)) {
					continue;
				}

				textures.set(tileset, new BaseTexture(bitmapData));
			}
		}

		Gfx.GeneralTilesTexture = Texture.from(Gfx.GENERAL_TILES);
		Gfx.InGameScreenTexture = Texture.from(ResourcesQueue.getImg(C.RES_GAME_SCREEN));
		Gfx.ButtonSystemTexture = Texture.from(ResourcesQueue.getImg(C.RES_BUTTON_SYSTEM));
		Gfx.ButtonDownSystemTexture = Texture.from(ResourcesQueue.getImg(C.RES_BUTTON_DOWN_SYSTEM));
		Gfx.WindowSystemTexture = Texture.from(ResourcesQueue.getImg(C.RES_WINDOW_BG_SYSTEM));
		Gfx.TooltipSystemTexture = Texture.from(ResourcesQueue.getImg(C.RES_TOOLTIP_BG_SYSTEM));
		Gfx.InputSystemTexture = Texture.from(ResourcesQueue.getImg(C.RES_INPUT_BG_SYSTEM));
		Gfx.TutorialKeysTexture = Texture.from(ResourcesQueue.getImg(C.RES_TUTORIAL_KEYS));
		Gfx.LevelStartBgTexture = Texture.from(ResourcesQueue.getImg(C.RES_LEVEL_START_BG));
		Gfx.TitleScreenBgTexture = Texture.from(ResourcesQueue.getImg(C.RES_TITLE_BG));
		Gfx.MenuBgTexture = Texture.from(ResourcesQueue.getImg(C.RES_MENU_BG));
		Gfx.GameLogoTexture = Texture.from(ResourcesQueue.getImg(C.RES_LOGO_GAME));
		Gfx.CaravelLogoTexture = Texture.from(ResourcesQueue.getImg(C.RES_LOGO_CARAVEL));
		Gfx.RetrocadeLogoTexture = Texture.from(ResourcesQueue.getImg(C.RES_LOGO_RETROCADE));
		Gfx.ScrollsTexture = Texture.from(ResourcesQueue.getImg(C.RES_SCROLLS));
		Gfx.FacesTexture = Texture.from(ResourcesQueue.getImg(C.RES_FACES));
		Gfx.FaceEyesTexture = Texture.from(ResourcesQueue.getImg(C.RES_FACE_EYES));
		Gfx.EffectsTexture = Texture.from(ResourcesQueue.getImg(C.RES_EFFECTS));
		Gfx.BoltsTexture = Texture.from(ResourcesQueue.getImg(C.RES_BOLTS));
		Gfx.LockTexture = Texture.from(ResourcesQueue.getImg(C.RES_LOCK));
	},

	getGeneralTilesTexture(tileId: number): Texture {
		return generalTilesCache[tileId]
			?? (generalTilesCache[tileId] = new Texture(Gfx.GeneralTilesTexture.baseTexture, T.TILES[tileId]))
	}
};