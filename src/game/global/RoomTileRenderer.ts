import { BaseTexture, Container, IPointData, Rectangle, Sprite, Texture } from "pixi.js";
import { ASSERT } from "../../ASSERT";
import { C, CanvasImageSource, StyleName } from "../../C";
import { F } from "../../F";
import { S } from "../../S";
import { T } from "../../T";
import { VOCheckpoints } from "../managers/VOCheckpoints";
import { Gfx } from "./Gfx";
import { Progress } from "./Progress";

export class RoomTileRenderer extends Container {
	public tilesOpaque: number[] = null!;
	public tilesTransparent: number[] = null!;
	public tilesTransparentParam: number[] = null!;
	public tilesFloor: number[] = null!;

	public checkpoints: VOCheckpoints = null!;

	public opaqueData: number[] = [];
	public transparentData: number[] = [];

	public tilesBitmapData: CanvasImageSource = null!;
	public floorBitmapData: CanvasImageSource = null!;
	public floorAltBitmapData: CanvasImageSource = null!;
	public floorDirtBitmapData: CanvasImageSource = null!;
	public floorGrassBitmapData: CanvasImageSource = null!;
	public floorMosaicBitmapData: CanvasImageSource = null!;
	public floorRoadBitmapData: CanvasImageSource = null!;
	public pitBitmapData: CanvasImageSource = null!;
	public pitSideBitmapData: CanvasImageSource = null!;
	public pitSideSmallBitmapData: CanvasImageSource = null!;
	public wallBitmapData: CanvasImageSource = null!;

	public tilesTexture: BaseTexture = null!;
	public floorTexture: BaseTexture = null!;
	public floorAltTexture: BaseTexture = null!;
	public floorDirtTexture: BaseTexture = null!;
	public floorGrassTexture: BaseTexture = null!;
	public floorMosaicTexture: BaseTexture = null!;
	public floorRoadTexture: BaseTexture = null!;
	public pitTexture: BaseTexture = null!;
	public pitSideTexture: BaseTexture = null!;
	public pitSideSmallTexture: BaseTexture = null!;
	public wallTexture: BaseTexture = null!;

	private blit: Blitter;

	public constructor() {
		super();

		this.blit = new Blitter(this);
	}

	public prepareRoom(
		styleName: StyleName,
		layerO: number[],
		layerT: number[],
		layerTParams: number[],
		layerF: number[],
		checkpoints: VOCheckpoints
	) {
		this.tilesBitmapData = Gfx.STYLES.get(styleName)!.get(T.TILES_STYLE)!;

		this.tilesTexture = Gfx.StyleTextures.get(styleName)!.get(T.TILES_STYLE)!;
		this.floorTexture = Gfx.StyleTextures.get(styleName)!.get(T.TILES_FLOOR)!;
		this.floorAltTexture = Gfx.StyleTextures.get(styleName)!.get(T.TILES_FLOOR_ALT)!;
		this.floorDirtTexture = Gfx.StyleTextures.get(styleName)!.get(T.TILES_FLOOR_DIRT)!;
		this.floorGrassTexture = Gfx.StyleTextures.get(styleName)!.get(T.TILES_FLOOR_GRASS)!;
		this.floorMosaicTexture = Gfx.StyleTextures.get(styleName)!.get(T.TILES_FLOOR_MOSAIC)!;
		this.floorRoadTexture = Gfx.StyleTextures.get(styleName)!.get(T.TILES_FLOOR_ROAD)!;
		this.pitTexture = Gfx.StyleTextures.get(styleName)!.get(T.TILES_PIT)!;
		this.pitSideTexture = Gfx.StyleTextures.get(styleName)!.get(T.TILES_PIT_SIDE)!;
		this.pitSideSmallTexture = Gfx.StyleTextures.get(styleName)!.get(T.TILES_PIT_SIDE_SMALL)!;
		this.wallTexture = Gfx.StyleTextures.get(styleName)!.get(T.TILES_WALL)!;

		this.tilesOpaque = layerO;
		this.tilesTransparent = layerT;
		this.tilesTransparentParam = layerTParams;
		this.tilesFloor = layerF;
		this.checkpoints = checkpoints;

		this.prepareAllRoomTiles();
	}


	public teardown() {
		this.blit.teardown();
	}


	/****************************************************************************************************************/
	/**                                                                                               PREPARATIONS  */

	/****************************************************************************************************************/

	private prepareAllRoomTiles() {
		for (let y: number = 0; y < S.RoomHeight; y++) {
			for (let x: number = 0; x < S.RoomWidth; x++) {
				const arrayIndex: number = x + y * S.RoomWidth;
				this.opaqueData[arrayIndex] = 0;
				this.transparentData[arrayIndex] = 0;

				this.prepareOpaque(x, y);
				this.prepareTransparent(x, y);
				//prepareFloor      (x, y);
			}
		}
	}

	private prepareOpaque(x: number, y: number) {
		switch (this.tilesOpaque[x + y * S.RoomWidth]) {
			case (C.T_WALL):
			case (C.T_WALL2):
			case (C.T_WALL_BROKEN):
			case (C.T_WALL_HIDDEN):
				this.opaqueData[x + y * S.RoomWidth] &= ~C.REND_WALL_TEXTURE;
				this.setWallFillingData(x, y);
				break;

			case (C.T_TRAPDOOR):
			case (C.T_PIT):
				this.setPitData(x, y);
				break;

			case (C.T_STAIRS):
				this.setStairsData(x, y);
				break;

			case (C.T_STAIRS_UP):
				this.setStairsUpData(x, y);
				break;

			default:
				this.opaqueData[x + y * S.RoomWidth] = 0;
				break;
		}
	}

	private prepareTransparent(x: number, y: number) {
		switch (this.tilesTransparent[x + y * S.RoomWidth]) {
			case (C.T_OBSTACLE):
				this.setObstacleData(x, y);
				break;

			default:
				this.transparentData[x + y * S.RoomWidth] = 0;
				break;
		}
	}

	/****************************************************************************************************************/
	/**                                                                                             ACTUAL DRAWING  */

	/****************************************************************************************************************/

	public refreshCache() {
		this.blit.container.cacheAsBitmap = false;
		this.blit.container.cacheAsBitmap = true;
	}

	public redrawTile(x: number, y: number) {
		this.blit.clearTile(x, y);
		this.drawTile(x, y);
	}

	public drawTile(x: number, y: number) {
		const index: number = x + y * S.RoomWidth;

		this._drawTile(this.tilesOpaque[index], x, y);
		this.blit.blitCheckpoint(x, y, this.checkpoints);
		this._drawTile(this.tilesFloor[index], x, y);
		this._drawTile(this.tilesTransparent[index], x, y);
		this.drawShadow(x, y);
		if (this.tilesTransparent[index] === C.T_TAR) {
			this.drawTarstuff(x, y, C.T_TAR);
		}
	}

	public recheckAroundTile(x: number, y: number, plots?: Set<number>) {
		for (let ix: number = x - 2; ix <= x + 2; ix++) {
			for (let iy: number = y - 2; iy <= y + 2; iy++) {
				if (ix >= S.RoomWidth || y >= S.RoomHeight || ix < 0 || iy < 0) {
					continue;
				}

				this.prepareOpaque(ix, iy);
				this.prepareTransparent(ix, iy);
				//prepareFloor(ix, iy);

				if (plots) {
					plots.add(ix + iy * S.RoomWidth);
				}
			}
		}
	}

	/** Performs the draw operation of a given tile **/
	private _drawTile(tile: number, x: number, y: number) {
		if (tile == C.T_EMPTY) {
			return;
		}

		let temp: number;
		switch (tile) {
			case (C.T_FLOOR):
				this.drawFloor(x, y, tile, this.floorTexture);
				break;

			case (C.T_FLOOR_ALT):
				this.drawFloor(x, y, tile, this.floorAltTexture);
				break;

			case (C.T_FLOOR_DIRT):
				this.drawFloor(x, y, tile, this.floorDirtTexture);
				break;

			case (C.T_FLOOR_GRASS):
				this.drawFloor(x, y, tile, this.floorGrassTexture);
				break;

			case (C.T_FLOOR_MOSAIC):
				this.drawFloor(x, y, tile, this.floorMosaicTexture);
				break;

			case (C.T_FLOOR_ROAD):
				this.drawFloor(x, y, tile, this.floorRoadTexture);
				break;


			case (C.T_WALL2):
				this.drawWallGraphic(x, y, 0);
				break;

			case (C.T_WALL):
				this.blit.wrappingTile(this.wallTexture, x, y);
				break;

			case (C.T_WALL_BROKEN):
				this.drawWallGraphic(x, y, 2);
				break;

			case (C.T_WALL_HIDDEN):
				this.drawWallGraphic(x, y, 1);
				break;

			case (C.T_TRAPDOOR):
				this.blit.tile(this.tilesTexture, T.TI_TRAPDOOR, x, y);
				break;

			case (C.T_DOOR_Y):
				temp = T.DOOR_Y[this.getOrthogonalByte(x, y, C.T_DOOR_Y, this.tilesOpaque)];
				this.blit.generalTile(temp, x, y);
				break;

			case (C.T_DOOR_YO):
				temp = T.DOOR_YO[this.getOrthogonalByte(x, y, C.T_DOOR_YO, this.tilesOpaque)];
				this.blit.generalTile(temp, x, y);
				break;

			case (C.T_DOOR_R):
				temp = T.DOOR_R[this.getOrthogonalByte(x, y, C.T_DOOR_R, this.tilesOpaque)];
				this.blit.generalTile(temp, x, y);
				break;

			case (C.T_DOOR_RO):
				temp = T.DOOR_RO[this.getOrthogonalByte(x, y, C.T_DOOR_RO, this.tilesOpaque)];
				this.blit.generalTile(temp, x, y);
				break;

			case (C.T_DOOR_G):
				temp = T.DOOR_G[this.getOrthogonalByte(x, y, C.T_DOOR_G, this.tilesOpaque)];
				this.blit.generalTile(temp, x, y);
				break;

			case (C.T_DOOR_GO):
				temp = T.DOOR_GO[this.getOrthogonalByte(x, y, C.T_DOOR_GO, this.tilesOpaque)];
				this.blit.generalTile(temp, x, y);
				break;

			case (C.T_DOOR_C):
				temp = T.DOOR_C[this.getOrthogonalByte(x, y, C.T_DOOR_C, this.tilesOpaque)];
				this.blit.generalTile(temp, x, y);
				break;

			case (C.T_DOOR_CO):
				temp = T.DOOR_CO[this.getOrthogonalByte(x, y, C.T_DOOR_CO, this.tilesOpaque)];
				this.blit.generalTile(temp, x, y);
				break;

			case (C.T_DOOR_B):
				temp = T.DOOR_B[this.getOrthogonalByte(x, y, C.T_DOOR_B, this.tilesOpaque)];
				this.blit.generalTile(temp, x, y);
				break;

			case (C.T_DOOR_BO):
				temp = T.DOOR_BO[this.getOrthogonalByte(x, y, C.T_DOOR_BO, this.tilesOpaque)];
				this.blit.generalTile(temp, x, y);
				break;

			case (C.T_PIT):
				this.drawPit(x, y);
				break;

			case (C.T_ARROW_N):
				this.blit.tile(this.tilesTexture, T.TI_ARROW_N, x, y);
				break;

			case (C.T_ARROW_NE):
				this.blit.tile(this.tilesTexture, T.TI_ARROW_NE, x, y);
				break;

			case (C.T_ARROW_E):
				this.blit.tile(this.tilesTexture, T.TI_ARROW_E, x, y);
				break;

			case (C.T_ARROW_SE):
				this.blit.tile(this.tilesTexture, T.TI_ARROW_SE, x, y);
				break;

			case (C.T_ARROW_S):
				this.blit.tile(this.tilesTexture, T.TI_ARROW_S, x, y);
				break;

			case (C.T_ARROW_SW):
				this.blit.tile(this.tilesTexture, T.TI_ARROW_SW, x, y);
				break;

			case (C.T_ARROW_W):
				this.blit.tile(this.tilesTexture, T.TI_ARROW_W, x, y);
				break;

			case (C.T_ARROW_NW):
				this.blit.tile(this.tilesTexture, T.TI_ARROW_NW, x, y);
				break;

			case (C.T_ORB):
				this.blit.generalTile(T.TI_ORB, x, y);
				break;

			case (C.T_SCROLL):
				this.blit.generalTile(T.TI_SCROLL, x, y);
				break;

			case (C.T_POTION_M):
				this.blit.generalTile(T.TI_POTION_M, x, y);
				break;

			case (C.T_STAIRS):
			case (C.T_STAIRS_UP):
				this.blit.tile(this.tilesTexture, this.opaqueData[x + y * S.RoomWidth], x, y);
				break;

			case (C.T_POTION_I):
				this.blit.generalTile(T.TI_POTION_I, x, y);
				break;

			case (C.T_OBSTACLE):
				this.blit.tile(this.tilesTexture, this.transparentData[x + y * S.RoomWidth], x, y);
				break;

			case (C.T_WALL_MASTER):
				if (Progress.isGameMastered) {
					this._drawTile(this.getNeighbourFloor(x, y), x, y);
					this.blit.generalTile(T.TI_MASTER_WALL, x, y, 0.5);
				} else {
					this.blit.generalTile(T.TI_MASTER_WALL, x, y, 1);
				}
				break;

			case C.T_TAR:
				// Ignored
				break;

			default:
				console.log("Not drawn: " + tile);
				break;
		}
	}

	private drawFloor(x: number, y: number, floorType: number, texture: BaseTexture) {
		this.blit.wrappingTile(texture, x, y);

		let tile: number;

		if (x > 0) {
			tile = this.tilesOpaque[x - 1 + y * S.RoomWidth];
			if (F.isPlainFloor(tile) && tile != floorType) {
				this.blit.rect(x * S.RoomTileWidth, y * S.RoomTileWidth, 1, S.RoomTileHeight, 0x606060)
			}
		}

		if (y > 0) {
			tile = this.tilesOpaque[x + (y - 1) * S.RoomWidth];
			if (F.isPlainFloor(tile) && tile != floorType) {
				this.blit.rect(x * S.RoomTileWidth, y * S.RoomTileWidth, S.RoomTileWidth, 1, 0x606060)
			}
		}

		if (x > 0 && y > 0) {
			tile = this.tilesOpaque[x - 1 + (y - 1) * S.RoomWidth];
			if (F.isPlainFloor(tile) && tile != floorType) {
				this.blit.rect(x * S.RoomTileWidth, y * S.RoomTileWidth, 1, 1, 0x606060)
			}
		}

	}

	// Type: 0=Normal, 1=Hidden, 2=Broken
	private drawWallGraphic(x: number, y: number, type: number = 0) {
		const bytes: number = this.getSurroundingByte(x, y, C.T_WALL2, this.tilesOpaque, true) |
			this.getSurroundingByte(x, y, C.T_WALL_BROKEN, this.tilesOpaque, true) |
			this.getSurroundingByte(x, y, C.T_WALL_HIDDEN, this.tilesOpaque, true) |
			this.getSurroundingByte(x, y, C.T_WALL_IMAGE, this.tilesOpaque, true);

		type = type == 1 ? T.WALL_SECRET_OFFSET : type == 2 ? T.WALL_BROKEN_OFFSET : 0;

		// Completely surrounded
		if (bytes == 0xFF) {
			this.blit.tile(this.tilesTexture, T.TI_WALL_NSEW1234 + type, x, y);
			return;
		}

		// Single block
		if ((bytes & 0xAA) == 0x00) {
			this.blit.tile(this.tilesTexture, T.TI_WALL + type, x, y);
			return;
		}

		// Single Dead ends
		if ((bytes & 0xAA) == 0x20) {
			this.blit.tile(this.tilesTexture, T.TI_WALL_S + type, x, y);
			return;
		}
		if ((bytes & 0xAA) == 0x08) {
			this.blit.tile(this.tilesTexture, T.TI_WALL_W + type, x, y);
			if (this.opaqueData[x + y * S.RoomWidth] & C.REND_WALL_TEXTURE) {
				this.drawWallTextureTopOverlay(x, y);
			}
			return;
		}
		if ((bytes & 0xAA) == 0x02) {
			this.blit.tile(this.tilesTexture, T.TI_WALL_N + type, x, y);
			if (this.opaqueData[x + y * S.RoomWidth] & C.REND_WALL_TEXTURE) {
				this.drawWallTextureTopOverlay(x, y);
			}
			return;
		}
		if ((bytes & 0xAA) == 0x80) {
			this.blit.tile(this.tilesTexture, T.TI_WALL_E + type, x, y);
			if (this.opaqueData[x + y * S.RoomWidth] & C.REND_WALL_TEXTURE) {
				this.drawWallTextureTopOverlay(x, y);
			}
			return;
		}

		// Single turns
		if ((bytes & 0xEA) == 0xA0) {
			this.blit.tile(this.tilesTexture, T.TI_WALL_SE + type, x, y);
			if (F.isValidColRow(x + 1, y) && this.opaqueData[x + 1 + y * S.RoomWidth] & C.REND_WALL_TEXTURE) {

				this.blit.rect(
					(x + 1) * S.RoomTileWidth - 1,
					y * S.RoomTileHeight + S.RoomTileHeightHalf,
					1,
					S.RoomTileHeightHalf,
					0x000000);
			}
			return;

		}
		if ((bytes & 0xBA) == 0x28) {
			this.blit.tile(this.tilesTexture, T.TI_WALL_SW + type, x, y);
			if (F.isValidColRow(x - 1, y) && this.opaqueData[x - 1 + y * S.RoomWidth] & C.REND_WALL_TEXTURE) {
				this.blit.rect(
					x * S.RoomTileWidth,
					y * S.RoomTileHeight + S.RoomTileHeightHalf,
					1,
					S.RoomTileHeightHalf,
					0x000000);
			}
			return;
		}

		if ((bytes & 0xAE) == 0x0A) {
			this.blit.tile(this.tilesTexture, T.TI_WALL_NW + type, x, y);
			if (this.opaqueData[x + y * S.RoomWidth] & C.REND_WALL_TEXTURE) {
				this.drawWallTextureTopOverlay(x, y);
			}
			return;
		}
		if ((bytes & 0xAB) == 0x82) {
			this.blit.tile(this.tilesTexture, T.TI_WALL_NE + type, x, y);
			if (this.opaqueData[x + y * S.RoomWidth] & C.REND_WALL_TEXTURE) {
				this.drawWallTextureTopOverlay(x, y);
			}
			return;
		}

		// Single corridors
		if ((bytes & 0xAA) == 0x88) {
			this.blit.tile(this.tilesTexture, T.TI_WALL_EW + type, x, y);
			if (this.opaqueData[x + y * S.RoomWidth] & C.REND_WALL_TEXTURE) {
				this.drawWallTextureTopOverlay(x, y);
			}
			return;
		}
		if ((bytes & 0xAA) == 0x22) {
			this.blit.tile(this.tilesTexture, T.TI_WALL_NS + type, x, y);
			return;
		}

		// Single triple conjunction
		if ((bytes & 0xEB) == 0xA2) {
			this.blit.tile(this.tilesTexture, T.TI_WALL_NSE + type, x, y);
			return;
		}
		if ((bytes & 0xFA) == 0xA8) {
			this.blit.tile(this.tilesTexture, T.TI_WALL_SEW + type, x, y);
			if (F.isValidColRow(x + 1, y) && this.opaqueData[x + 1 + y * S.RoomWidth] & C.REND_WALL_TEXTURE) {
				this.blit.rect(
					(x + 1) * S.RoomTileWidth - 1,
					y * S.RoomTileHeight + S.RoomTileHeightHalf,
					1,
					S.RoomTileHeightHalf,
					0x000000);
			}
			if (F.isValidColRow(x - 1, y) && this.opaqueData[x - 1 + y * S.RoomWidth] & C.REND_WALL_TEXTURE) {
				this.blit.rect(
					x * S.RoomTileWidth,
					y * S.RoomTileHeight + S.RoomTileHeightHalf,
					1,
					S.RoomTileHeightHalf,
					0x000000);
			}
			return;
		}
		if ((bytes & 0xBE) == 0x2A) {
			this.blit.tile(this.tilesTexture, T.TI_WALL_NSW + type, x, y);
			return;
		}
		if ((bytes & 0xAF) == 0x8A) {
			this.blit.tile(this.tilesTexture, T.TI_WALL_NEW + type, x, y);
			if (this.opaqueData[x + y * S.RoomWidth] & C.REND_WALL_TEXTURE) {
				this.drawWallTextureTopOverlay(x, y);
			}
			return;
		}

		// Four way crossroad
		if (bytes == 0xAA) {
			this.blit.tile(this.tilesTexture, T.TI_WALL_NSEW + type, x, y);
			if (F.isValidColRow(x + 1, y) && this.opaqueData[x + 1 + y * S.RoomWidth] & C.REND_WALL_TEXTURE) {
				this.blit.rect(
					(x + 1) * S.RoomTileWidth - 1,
					y * S.RoomTileHeight + S.RoomTileHeightHalf,
					1,
					S.RoomTileHeightHalf,
					0x000000);
			}
			if (F.isValidColRow(x - 1, y) && this.opaqueData[x - 1 + y * S.RoomWidth] & C.REND_WALL_TEXTURE) {
				this.blit.rect(
					x * S.RoomTileWidth,
					y * S.RoomTileHeight + S.RoomTileHeightHalf,
					1,
					S.RoomTileHeightHalf,
					0x000000);
			}
			return;
		}

		// Corners
		if ((bytes & 0xEA) == 0xE0) {
			this.blit.tile(this.tilesTexture, T.TI_WALL_SE4 + type, x, y);
			return;
		}
		if ((bytes & 0xBA) == 0x38) {
			this.blit.tile(this.tilesTexture, T.TI_WALL_SW3 + type, x, y);
			return;
		}
		if ((bytes & 0xAE) == 0x0E) {
			this.blit.tile(this.tilesTexture, T.TI_WALL_NW1 + type, x, y);
			if (this.opaqueData[x + y * S.RoomWidth] & C.REND_WALL_TEXTURE) {
				this.drawWallTextureTopOverlay(x, y);
			}
			return;
		}
		if ((bytes & 0xAB) == 0x83) {
			this.blit.tile(this.tilesTexture, T.TI_WALL_NE2 + type, x, y);
			if (this.opaqueData[x + y * S.RoomWidth] & C.REND_WALL_TEXTURE) {
				this.drawWallTextureTopOverlay(x, y);
			}
			return;
		}

		// Sides
		if ((bytes & 0xEB) == 0xE3) {
			this.blit.tile(this.tilesTexture, T.TI_WALL_NSE24 + type, x, y);
			return;
		}
		if ((bytes & 0xFA) == 0xF8) {
			this.blit.tile(this.tilesTexture, T.TI_WALL_SEW34 + type, x, y);
			return;
		}
		if ((bytes & 0xBE) == 0x3E) {
			this.blit.tile(this.tilesTexture, T.TI_WALL_NSW13 + type, x, y);
			return;
		}
		if ((bytes & 0xAF) == 0x8F) {
			this.blit.tile(this.tilesTexture, T.TI_WALL_NEW12 + type, x, y);
			if (this.opaqueData[x + y * S.RoomWidth] & C.REND_WALL_TEXTURE) {
				this.drawWallTextureTopOverlay(x, y);
			}
			return;
		}

		// (Lots of) Inner corners
		if (bytes == 0xFB) {
			this.blit.tile(this.tilesTexture, T.TI_WALL_NSEW234 + type, x, y);
			return;
		}
		if (bytes == 0xFE) {
			this.blit.tile(this.tilesTexture, T.TI_WALL_NSEW134 + type, x, y);
			return;
		}
		if (bytes == 0xBF) {
			this.blit.tile(this.tilesTexture, T.TI_WALL_NSEW123 + type, x, y);
			return;
		}
		if (bytes == 0xEF) {
			this.blit.tile(this.tilesTexture, T.TI_WALL_NSEW124 + type, x, y);
			return;
		}
		if (bytes == 0xFA) {
			this.blit.tile(this.tilesTexture, T.TI_WALL_NSEW34 + type, x, y);
			return;
		}
		if (bytes == 0xBB) {
			this.blit.tile(this.tilesTexture, T.TI_WALL_NSEW23 + type, x, y);
			return;
		}
		if (bytes == 0xEB) {
			this.blit.tile(this.tilesTexture, T.TI_WALL_NSEW24 + type, x, y);
			return;
		}
		if (bytes == 0xBE) {
			this.blit.tile(this.tilesTexture, T.TI_WALL_NSEW13 + type, x, y);
			return;
		}
		if (bytes == 0xEE) {
			this.blit.tile(this.tilesTexture, T.TI_WALL_NSEW14 + type, x, y);
			return;
		}
		if (bytes == 0xAF) {
			this.blit.tile(this.tilesTexture, T.TI_WALL_NSEW12 + type, x, y);
			return;
		}
		if (bytes == 0xBA) {
			this.blit.tile(this.tilesTexture, T.TI_WALL_NSEW3 + type, x, y);
			return;
		}
		if (bytes == 0xEA) {
			this.blit.tile(this.tilesTexture, T.TI_WALL_NSEW4 + type, x, y);
			return;
		}
		if (bytes == 0xAB) {
			this.blit.tile(this.tilesTexture, T.TI_WALL_NSEW2 + type, x, y);
			return;
		}
		if (bytes == 0xAE) {
			this.blit.tile(this.tilesTexture, T.TI_WALL_NSEW1 + type, x, y);
			return;
		}

		// Sides
		if ((bytes & 0xFA) == 0xE8) {
			this.blit.tile(this.tilesTexture, T.TI_WALL_SEW4 + type, x, y);
			if (F.isValidColRow(x - 1, y) && this.opaqueData[x - 1 + y * S.RoomWidth] & C.REND_WALL_TEXTURE) {
				this.blit.rect(
					x * S.RoomTileWidth,
					y * S.RoomTileHeight + S.RoomTileHeightHalf,
					1,
					S.RoomTileHeightHalf,
					0x000000);
			}
			return;
		}
		if ((bytes & 0xFA) == 0xB8) {
			this.blit.tile(this.tilesTexture, T.TI_WALL_SEW3 + type, x, y);
			if (F.isValidColRow(x + 1, y) && this.opaqueData[x + 1 + y * S.RoomWidth] & C.REND_WALL_TEXTURE) {
				this.blit.rect(
					(x + 1) * S.RoomTileWidth - 1,
					y * S.RoomTileHeight + S.RoomTileHeightHalf,
					1,
					S.RoomTileHeightHalf,
					0x000000);
			}
			return;
		}
		if ((bytes & 0xBE) == 0x3A) {
			this.blit.tile(this.tilesTexture, T.TI_WALL_NSW3 + type, x, y);
			return;
		}
		if ((bytes & 0xBE) == 0x2E) {
			this.blit.tile(this.tilesTexture, T.TI_WALL_NSW1 + type, x, y);
			if (F.isValidColRow(x - 1, y) && this.opaqueData[x - 1 + y * S.RoomWidth] & C.REND_WALL_TEXTURE) {
				this.blit.rect(
					x * S.RoomTileWidth,
					y * S.RoomTileHeight + S.RoomTileHeightHalf,
					1,
					S.RoomTileHeightHalf,
					0x000000);
			}
			return;
		}
		if ((bytes & 0xAF) == 0x8B) {
			this.blit.tile(this.tilesTexture, T.TI_WALL_NEW2 + type, x, y);
			if (this.opaqueData[x + y * S.RoomWidth] & C.REND_WALL_TEXTURE) {
				this.drawWallTextureTopOverlay(x, y);
			}
			return;
		}

		if ((bytes & 0xAF) == 0x8E) {
			this.blit.tile(this.tilesTexture, T.TI_WALL_NEW1 + type, x, y);
			if (this.opaqueData[x + y * S.RoomWidth] & C.REND_WALL_TEXTURE) {
				this.drawWallTextureTopOverlay(x, y);
			}
			return;
		}
		if ((bytes & 0xEB) == 0xE2) {
			this.blit.tile(this.tilesTexture, T.TI_WALL_NSE4 + type, x, y);
			return;
		}
		if ((bytes & 0xEB) == 0xA3) {
			this.blit.tile(this.tilesTexture, T.TI_WALL_NSE2 + type, x, y);
			if (F.isValidColRow(x + 1, y) && this.opaqueData[x + 1 + y * S.RoomWidth] & C.REND_WALL_TEXTURE) {
				this.blit.rect(
					(x + 1) * S.RoomTileWidth - 1,
					y * S.RoomTileHeight + S.RoomTileHeightHalf,
					1,
					S.RoomTileHeightHalf,
					0x000000);
			}
			return;
		}
	}

	private drawWallTextureTopOverlay(x: number, y: number) {
		this.blit.wrappingTile(
			this.wallTexture,
			x, y + 0.5,
			S.RoomTileWidth,
			S.RoomTileHeightHalf
		);
		this.blit.rect(
			x * S.RoomTileWidth,
			y * S.RoomTileHeight + S.RoomTileHeightHalf,
			S.RoomTileWidth,
			1,
			0x000000);
	}

	private drawPit(x: number, y: number) {
		const data: number = this.opaqueData[x + y * S.RoomWidth];
		const dataX: number = (data & C.REND_PIT_COORDS_MASK) % C.REND_PIT_COORD_MULTIPLIER;
		const dataY: number = (data & C.REND_PIT_COORDS_MASK) / C.REND_PIT_COORD_MULTIPLIER | 0;

		this.blit.wrappingTile(this.pitTexture, x, y)
		if (data & C.REND_PIT_IS_SIDE_SMALL) {
			this.blit.wrappingTile(
				this.pitSideSmallTexture,
				x, y,
				S.RoomTileWidth, S.RoomTileHeight,
				dataX, dataY
			);

		} else if (data & C.REND_PIT_IS_SIDE) {
			this.blit.wrappingTile(
				this.pitSideTexture,
				x, y,
				S.RoomTileWidth, S.RoomTileHeight,
				dataX, dataY
			);
		}

		if (x > 0 && F.isFloor(this.tilesOpaque[x - 1 + y * S.RoomWidth])) {
			this.blit.rect(x * S.RoomTileWidth, y * S.RoomTileWidth, 1, S.RoomTileHeight, 0x000000);
		}

		if (y > 0 && F.isFloor(this.tilesOpaque[x + (y - 1) * S.RoomWidth])) {
			this.blit.rect(x * S.RoomTileWidth, y * S.RoomTileWidth, S.RoomTileWidth, 1, 0x000000);
		}

		if (x < S.RoomWidth - 1 && F.isFloor(this.tilesOpaque[x + 1 + y * S.RoomWidth])) {
			this.blit.rect((x + 1) * S.RoomTileWidth - 1, y * S.RoomTileWidth, 1, S.RoomTileHeight, 0x000000);
		}

		if (y < S.RoomHeight - 1 && F.isFloor(this.tilesOpaque[x + (y + 1) * S.RoomWidth])) {
			this.blit.rect(x * S.RoomTileWidth, (y + 1) * S.RoomTileWidth - 1, S.RoomTileWidth, 1, 0x000000);
		}

		if (x > 0 && y > 0 && F.isFloor(this.tilesOpaque[x - 1 + (y - 1) * S.RoomWidth])) {
			this.blit.rect(x * S.RoomTileWidth, y * S.RoomTileWidth, 1, 1, 0x000000);
		}

		if (x < S.RoomWidth - 1 && y > 0 && F.isFloor(this.tilesOpaque[x + 1 + (y - 1) * S.RoomWidth])) {
			this.blit.rect((x + 1) * S.RoomTileWidth - 1, y * S.RoomTileWidth, 1, 1, 0x000000);
		}

		if (x > 0 && y < S.RoomHeight - 1 && F.isFloor(this.tilesOpaque[x - 1 + (y + 1) * S.RoomWidth])) {
			this.blit.rect(x * S.RoomTileWidth, (y + 1) * S.RoomTileWidth - 1, 1, 1, 0x000000);
		}

		if (x < S.RoomWidth - 1 && y < S.RoomHeight - 1 && F.isFloor(this.tilesOpaque[x + 1 + (y + 1) * S.RoomWidth])) {
			this.blit.rect((x + 1) * S.RoomTileWidth - 1, (y + 1) * S.RoomTileWidth - 1, 1, 1, 0x000000);
		}


	}

	private drawTarstuff(x: number, y: number, tarType: number) {
		const bytes: number = this.getSurroundingByte(x, y, tarType, this.tilesTransparent);

		// INNER CORNERS
		if (bytes == 0xBF) {
			this.blit.generalTile(T.TI_TAR_ISE, x, y, 0.75);
			return;
		}
		if (bytes == 0xEF) {
			this.blit.generalTile(T.TI_TAR_ISW, x, y, 0.75);
			return;
		}
		if (bytes == 0xFB) {
			this.blit.generalTile(T.TI_TAR_INW, x, y, 0.75);
			return;
		}
		if (bytes == 0xFE) {
			this.blit.generalTile(T.TI_TAR_INE, x, y, 0.75);
			return;
		}

		// DOUBLE CORNERS
		if (bytes == 0xBB) {
			this.blit.generalTile(T.TI_TAR_INWSE, x, y, 0.75);
			return;
		}
		if (bytes == 0xEE) {
			this.blit.generalTile(T.TI_TAR_INESW, x, y, 0.75);
			return;
		}

		// INSIDE
		if (bytes == 0xFF) {
			this.blit.generalTile(T.TI_TAR_NSEW, x, y, 0.75);
			return;
		}

		// FLAT SIDES
		if ((bytes & 0x3E) == 0x3E) {
			this.blit.generalTile(T.TI_TAR_NSW, x, y, 0.75);
			return;
		}
		if ((bytes & 0x8F) == 0x8F) {
			this.blit.generalTile(T.TI_TAR_NEW, x, y, 0.75);
			return;
		}
		if ((bytes & 0xE3) == 0xE3) {
			this.blit.generalTile(T.TI_TAR_NSE, x, y, 0.75);
			return;
		}
		if ((bytes & 0xF8) == 0xF8) {
			this.blit.generalTile(T.TI_TAR_SEW, x, y, 0.75);
			return;
		}

		// CORNERS
		if ((bytes & 0x0E) == 0x0E) {
			this.blit.generalTile(T.TI_TAR_NW, x, y, 0.75);
			return;
		}
		if ((bytes & 0x83) == 0x83) {
			this.blit.generalTile(T.TI_TAR_NE, x, y, 0.75);
			return;
		}
		if ((bytes & 0xE0) == 0xE0) {
			this.blit.generalTile(T.TI_TAR_SE, x, y, 0.75);
			return;
		}
		if ((bytes & 0x38) == 0x38) {
			this.blit.generalTile(T.TI_TAR_SW, x, y, 0.75);
			return;
		}

		this.blit.generalTile(T.TI_TAR_NSEW, x, y, 0.75);
	}

	private drawShadow(x: number, y: number) {
		let tileN: boolean = false;
		let tileW: boolean = false;
		let tile1: boolean = false;
		let tile: number;

		// Check this tile
		tile = this.tilesOpaque[x + y * S.RoomWidth];
		if (tile == C.T_WALL || tile == C.T_WALL_BROKEN || tile == C.T_WALL_HIDDEN || tile == C.T_WALL_IMAGE ||
			tile == C.T_WALL_MASTER || tile == C.T_DOOR_B || tile == C.T_DOOR_C || tile == C.T_DOOR_G ||
			tile == C.T_DOOR_R || tile == C.T_DOOR_Y || tile == C.T_PIT || tile == C.T_WALL2) {
			return;
		}

		// Check N
		tile = this.tilesOpaque[x + (y - 1) * S.RoomWidth];
		tileN = (y > 0 && (tile == C.T_WALL || tile == C.T_WALL_BROKEN || tile == C.T_WALL_HIDDEN || tile == C.T_WALL_IMAGE ||
			tile == C.T_WALL_MASTER || tile == C.T_DOOR_B || tile == C.T_DOOR_C || tile == C.T_DOOR_G ||
			tile == C.T_DOOR_R || tile == C.T_DOOR_Y || tile == C.T_WALL2));

		// Check W
		tile = this.tilesOpaque[x - 1 + y * S.RoomWidth];
		tileW = (x > 0 && (tile == C.T_WALL || tile == C.T_WALL_BROKEN || tile == C.T_WALL_HIDDEN || tile == C.T_WALL_IMAGE ||
			tile == C.T_WALL_MASTER || tile == C.T_DOOR_B || tile == C.T_DOOR_C || tile == C.T_DOOR_G ||
			tile == C.T_DOOR_R || tile == C.T_DOOR_Y || tile == C.T_WALL2));

		// Check 1
		tile = this.tilesOpaque[x - 1 + (y - 1) * S.RoomWidth];
		tile1 = (((x == 0 || y == 0) && (tileN || tileW)) || (x > 0 && y > 0 && (tile == C.T_WALL || tile == C.T_WALL_BROKEN ||
			tile == C.T_WALL_HIDDEN || tile == C.T_WALL_IMAGE || tile == C.T_WALL_MASTER || tile == C.T_DOOR_B || tile == C.T_DOOR_C ||
			tile == C.T_DOOR_G || tile == C.T_DOOR_R || tile == C.T_DOOR_Y || tile == C.T_WALL2)));

		if (tileN) {
			if (tileW) {
				if (tile1) {
					this.blit.generalTile(T.TI_SHADOW_NW1, x, y, 0.25);
				} else {
					this.blit.generalTile(T.TI_SHADOW_NW, x, y, 0.25);
				}
			} else if (tile1) {
				this.blit.generalTile(T.TI_SHADOW_N1, x, y, 0.25);
			} else {
				this.blit.generalTile(T.TI_SHADOW_N, x, y, 0.25);
			}
		} else if (tileW) {
			if (tile1) {
				this.blit.generalTile(T.TI_SHADOW_W1, x, y, 0.25);
			} else {
				this.blit.generalTile(T.TI_SHADOW_W, x, y, 0.25);
			}
		} else if (tile1) {
			this.blit.generalTile(T.TI_SHADOW_1, x, y, 0.25);
		}
	}


	/****************************************************************************************************************/
	/**                                                                                           HELPER FUNCTIONS  */

	/****************************************************************************************************************/

	public getNeighbourFloor(x: number, y: number): number {
		if (y > 0 && F.isPlainFloor(this.tilesOpaque[x + (y - 1) * S.RoomWidth])) {
			return this.tilesOpaque[x + (y - 1) * S.RoomWidth];
		}

		if (x > 0 && F.isPlainFloor(this.tilesOpaque[x - 1 + y * S.RoomWidth])) {
			return this.tilesOpaque[x - 1 + y * S.RoomWidth];
		}

		if (x < S.RoomWidth - 1 && F.isPlainFloor(this.tilesOpaque[x + 1 + y * S.RoomWidth])) {
			return this.tilesOpaque[x + 1 + y * S.RoomWidth];
		}

		if (y < S.RoomHeight - 1 && F.isPlainFloor(this.tilesOpaque[x + (y + 1) * S.RoomWidth])) {
			return this.tilesOpaque[x + (y + 1) * S.RoomWidth];
		}


		if (y > 0 && x > 0 && F.isPlainFloor(this.tilesOpaque[x - 1 + (y - 1) * S.RoomWidth])) {
			return this.tilesOpaque[x - 1 + (y - 1) * S.RoomWidth];
		}

		if (x > 0 && y < S.RoomHeight - 1 && F.isPlainFloor(this.tilesOpaque[x - 1 + (y + 1) * S.RoomWidth])) {
			return this.tilesOpaque[x - 1 + (y + 1) * S.RoomWidth];
		}

		if (x < S.RoomWidth - 1 && y > 0 && F.isPlainFloor(this.tilesOpaque[x + 1 + (y - 1) * S.RoomWidth])) {
			return this.tilesOpaque[x + 1 + (y - 1) * S.RoomWidth];
		}

		if (y < S.RoomHeight - 1 && x < S.RoomWidth - 1 && F.isPlainFloor(this.tilesOpaque[x + 1 + (y + 1) * S.RoomWidth])) {
			return this.tilesOpaque[x + 1 + (y + 1) * S.RoomWidth];
		}

		return C.T_FLOOR;
	}

	/** Checks 4 surrounding neighbors, used for determining Door type **/
	private getOrthogonalByte(x: number, y: number, type: number, layer: number[]): number {
		let data: number = 0;

		if (y > 0 && layer[x + (y - 1) * S.RoomWidth] == type) {
			data |= 8;
		}

		if (x > 0 && layer[x - 1 + y * S.RoomWidth] == type) {
			data |= 1;
		}

		if (x < S.RoomWidth - 1 && layer[x + 1 + y * S.RoomWidth] == type) {
			data |= 4;
		}

		if (y < S.RoomHeight - 1 && layer[x + (y + 1) * S.RoomWidth] == type) {
			data |= 2;
		}

		return data;
	}

	/** Checks 8 surrounding neighbors, used for determining Tar graphic, the order is:
	 *   E, SE, S, SW, W, NW, N, NE **/
	private getSurroundingByte(x: number, y: number, type: number, layer: number[], borderObstacle: boolean = false): number {
		let data: number = 0;

		if ((y > 0 && layer[x + (y - 1) * S.RoomWidth] == type) || (borderObstacle && y <= 0)) {
			data |= 2;
		}

		if ((x > 0 && layer[x - 1 + y * S.RoomWidth] == type) || (borderObstacle && x <= 0)) {
			data |= 8;
		}

		if ((x < S.RoomWidth - 1 && layer[x + 1 + y * S.RoomWidth] == type) || (borderObstacle && x >= S.RoomWidth - 1)) {
			data |= 128;
		}

		if ((y < S.RoomHeight - 1 && layer[x + (y + 1) * S.RoomWidth] == type) ||
			(borderObstacle && y >= S.RoomHeight - 1)) {
			data |= 32;
		}


		if ((y > 0 && x > 0 && layer[x - 1 + (y - 1) * S.RoomWidth] == type) ||
			(borderObstacle && (y <= 0 || x <= 0))) {
			data |= 4;
		}

		if ((x > 0 && y < S.RoomHeight - 1 && layer[x - 1 + (y + 1) * S.RoomWidth] == type) ||
			(borderObstacle && (y >= S.RoomHeight - 1 || x <= 0))) {
			data |= 16;
		}

		if ((x < S.RoomWidth - 1 && y > 0 && layer[x + 1 + (y - 1) * S.RoomWidth] == type) ||
			(borderObstacle && (y <= 0 || x >= S.RoomWidth - 1))) {
			data |= 1;
		}

		if ((y < S.RoomHeight - 1 && x < S.RoomWidth - 1 && layer[x + 1 + (y + 1) * S.RoomWidth] == type) ||
			(borderObstacle && (y >= S.RoomHeight - 1 || x >= S.RoomWidth - 1))) {
			data |= 64;
		}

		return data;
	}

	private setWallFillingData(x: number, y: number) {
		const index: number = x + y * S.RoomWidth;

		if (this.opaqueData[index] & C.REND_WALL_HIDDEN_SECRET) {
			this.opaqueData[index] ^= C.REND_WALL_HIDDEN_SECRET;

			this.tilesOpaque[index] = C.T_WALL_HIDDEN;
		}

		const bytes: number = this.getSurroundingByte(x, y, C.T_WALL, this.tilesOpaque, true) |
			this.getSurroundingByte(x, y, C.T_WALL2, this.tilesOpaque, true) |
			this.getSurroundingByte(x, y, C.T_WALL_HIDDEN, this.tilesOpaque, true) |
			this.getSurroundingByte(x, y, C.T_WALL_BROKEN, this.tilesOpaque, true);

		if (bytes == 0xFF && this.tilesOpaque[index] == C.T_WALL) {
			this.opaqueData[index] = C.REND_WALL_TEXTURE;
			return;

		} else if (bytes == 0xFF && this.tilesOpaque[index] == C.T_WALL_HIDDEN) {
			this.tilesOpaque[index] = C.T_WALL;
			this.opaqueData[index] = C.REND_WALL_TEXTURE | C.REND_WALL_HIDDEN_SECRET;
			return;
		}

		if (this.tilesOpaque[index] == C.T_WALL) {
			this.tilesOpaque[index] = C.T_WALL2;
		}

		if (bytes == 0xFF) {
			if ((this.getSurroundingByte(x, y + 1, C.T_WALL, this.tilesOpaque, true) |
				this.getSurroundingByte(x, y + 1, C.T_WALL2, this.tilesOpaque, true) |
				this.getSurroundingByte(x, y + 1, C.T_WALL_HIDDEN, this.tilesOpaque, true) |
				this.getSurroundingByte(x, y + 1, C.T_WALL_BROKEN, this.tilesOpaque, true))) {
				this.opaqueData[index] = C.REND_WALL_TEXTURE;
				return;
			}
		}

		// Wall SEW34
		if ((bytes & 0xFA) == 0xF8) {
			if ((this.getSurroundingByte(x, y + 1, C.T_WALL, this.tilesOpaque, true) |
				this.getSurroundingByte(x, y + 1, C.T_WALL2, this.tilesOpaque, true) |
				this.getSurroundingByte(x, y + 1, C.T_WALL_HIDDEN, this.tilesOpaque, true) |
				this.getSurroundingByte(x, y + 1, C.T_WALL_BROKEN, this.tilesOpaque, true))) {
				this.opaqueData[index] = C.REND_WALL_TEXTURE;
				return;
			}
		}

		// NSEW234, NSEW134, NSEW34
		if (bytes == 0xFB) {
			if ((this.getSurroundingByte(x, y + 1, C.T_WALL, this.tilesOpaque, true) |
				this.getSurroundingByte(x, y + 1, C.T_WALL2, this.tilesOpaque, true) |
				this.getSurroundingByte(x, y + 1, C.T_WALL_HIDDEN, this.tilesOpaque, true) |
				this.getSurroundingByte(x, y + 1, C.T_WALL_BROKEN, this.tilesOpaque, true))) {
				this.opaqueData[index] = C.REND_WALL_TEXTURE;
				return;
			}
		}
		if (bytes == 0xFE) {
			if ((this.getSurroundingByte(x, y + 1, C.T_WALL, this.tilesOpaque, true) |
				this.getSurroundingByte(x, y + 1, C.T_WALL2, this.tilesOpaque, true) |
				this.getSurroundingByte(x, y + 1, C.T_WALL_HIDDEN, this.tilesOpaque, true) |
				this.getSurroundingByte(x, y + 1, C.T_WALL_BROKEN, this.tilesOpaque, true))) {
				this.opaqueData[index] = C.REND_WALL_TEXTURE;
				return;
			}
		}
		if (bytes == 0xFA) {
			if ((this.getSurroundingByte(x, y + 1, C.T_WALL, this.tilesOpaque, true) |
				this.getSurroundingByte(x, y + 1, C.T_WALL2, this.tilesOpaque, true) |
				this.getSurroundingByte(x, y + 1, C.T_WALL_HIDDEN, this.tilesOpaque, true) |
				this.getSurroundingByte(x, y + 1, C.T_WALL_BROKEN, this.tilesOpaque, true))) {
				this.opaqueData[index] = C.REND_WALL_TEXTURE;
				return;
			}
		}
	}

	private setPitData(roomX: number, roomY: number) {
		let x: number = roomX;
		let y: number = roomY;
		let width;

		let posX;
		let posY;

		let tileAboveEdge: number;
		let tileUnderEdge: number;

		// Retrieve Y position in relation to top-left corner
		tileAboveEdge = this.tilesOpaque[x + y * S.RoomWidth];
		while (y != Number.MAX_VALUE &&
			(tileAboveEdge == C.T_PIT || tileAboveEdge == C.T_TRAPDOOR)) {
			y--;
			tileAboveEdge = this.tilesOpaque[x + y * S.RoomWidth];
		}

		posY = (y == Number.MAX_VALUE ? Number.MAX_VALUE : roomY - y - 1);

		// Retrieve X position in relation to top-left corner
		tileAboveEdge = this.tilesOpaque[x + y * S.RoomWidth];
		tileUnderEdge = this.tilesOpaque[x + (y + 1) * S.RoomWidth];
		while (x != Number.MAX_VALUE &&
			(y == Number.MAX_VALUE || (tileAboveEdge != C.T_PIT && tileAboveEdge != C.T_TRAPDOOR)) &&
			(tileUnderEdge == C.T_PIT || tileUnderEdge == C.T_TRAPDOOR)) {
			x--;
			tileAboveEdge = this.tilesOpaque[x + y * S.RoomWidth];
			tileUnderEdge = this.tilesOpaque[x + (y + 1) * S.RoomWidth];

		}

		const leftEdge: number = x;
		posX = (x == Number.MAX_VALUE ? roomX : roomX - x - 1);

		// Retrieve width of the flat pit chunk
		x = roomX;
		tileAboveEdge = this.tilesOpaque[x + y * S.RoomWidth]; // Tile above edge
		tileUnderEdge = this.tilesOpaque[x + (y + 1) * S.RoomWidth]; // Tile under edge

		while (x < S.RoomWidth &&
			(y == Number.MAX_VALUE || (tileAboveEdge != C.T_PIT && tileAboveEdge != C.T_TRAPDOOR)) &&
			(tileUnderEdge == C.T_PIT || tileUnderEdge == C.T_TRAPDOOR)) {
			x++;
			tileAboveEdge = this.tilesOpaque[x + y * S.RoomWidth];
			tileUnderEdge = this.tilesOpaque[x + (y + 1) * S.RoomWidth];
		}

		width = x - leftEdge - 1;

		let data: number = 0;

		// Touches the top edge, assume it  is not displayed
		if (posY == Number.MAX_VALUE) {
			data = 0;

		// Not wide enough to display the wide pit
		} else if (
			width < this.pitSideTexture.width / S.RoomTileWidth
			&& posY < this.pitSideSmallTexture.height / S.RoomTileHeight
		) {
			data = C.REND_PIT_IS_SIDE_SMALL | (posX + posY * C.REND_PIT_COORD_MULTIPLIER);

		// Wide enough to display the wide pit
		} else if (posY < this.pitSideTexture.height / S.RoomTileHeight) {
			// Wide, but the remainder is not wide enough to fit the whole "wide" so use small-pit
			if (width - posX <= width % (this.pitSideTexture.width / S.RoomTileWidth)) {
				posX = (posX - width + (width % (this.pitSideTexture.width / S.RoomTileWidth)));
				data = C.REND_PIT_IS_SIDE_SMALL | (posX + posY * C.REND_PIT_COORD_MULTIPLIER);
			} else {
				data = C.REND_PIT_IS_SIDE | (posX + posY * C.REND_PIT_COORD_MULTIPLIER);
			}
		}

		this.opaqueData[roomX + roomY * S.RoomWidth] = data;
	}

	private setObstacleData(roomX: number, roomY: number) {
		const obstacleType: number = (this.tilesTransparentParam[roomX + roomY * S.RoomWidth] & (T.OBSTACLE_LEFT - 1));

		ASSERT(obstacleType);

		let index: number = 0;
		let xPos: number = 0;
		let yPos: number = 0;

		// Find obstacle edges:
		let x: number = roomX;
		let y: number = roomY;

		while (x > 0) {
			if (this.tilesTransparentParam[x + roomY * S.RoomWidth] & T.OBSTACLE_LEFT) {
				break;
			}
			if (this.tilesTransparent[x - 1 + roomY * S.RoomWidth] != C.T_OBSTACLE) {
				break;
			}
			if ((this.tilesTransparentParam[x - 1 + roomY * S.RoomWidth] & (T.OBSTACLE_LEFT - 1)) != obstacleType) {
				break;
			}
			xPos++;
			--x;
		}

		if (xPos >= T.OBSTACLE_MAX_SIZE) {
			ASSERT(false, "Invalid obstacle x position");
			xPos = 0;
			x = 1;

		} else {
			x = roomX + 1;
			while (x < S.RoomWidth) {
				if (this.tilesTransparentParam[x + roomY * S.RoomWidth] & T.OBSTACLE_LEFT) {
					break;
				}
				if (this.tilesTransparent[x + roomY * S.RoomWidth] != C.T_OBSTACLE) {
					break;
				}
				if ((this.tilesTransparentParam[x + roomY * S.RoomWidth] & (T.OBSTACLE_LEFT - 1)) != obstacleType) {
					break;
				}
				x++;
			}
			x -= roomX - xPos;
			if (x > T.OBSTACLE_MAX_SIZE) {
				x = T.OBSTACLE_MAX_SIZE;
			}
		}

		ASSERT(xPos < x);

		while (y > 0) {
			if (this.tilesTransparentParam[roomX + y * S.RoomWidth] & T.OBSTACLE_TOP) {
				break;
			}
			if (this.tilesTransparent[roomX + (y - 1) * S.RoomWidth] != C.T_OBSTACLE) {
				break;
			}
			if ((this.tilesTransparentParam[roomX + (y - 1) * S.RoomWidth] & (T.OBSTACLE_LEFT - 1)) != obstacleType) {
				break;
			}
			yPos++;
			--y;
		}

		if (yPos >= T.OBSTACLE_MAX_SIZE) {
			ASSERT(false, "Invalid obstacle y position");
			yPos = 0;
			y = 1;

		} else {
			y = roomY + 1;
			while (y < S.RoomHeight) {
				if (this.tilesTransparentParam[roomX + y * S.RoomWidth] & T.OBSTACLE_TOP) {
					break;
				}
				if (this.tilesTransparent[roomX + y * S.RoomWidth] != C.T_OBSTACLE) {
					break;
				}
				if ((this.tilesTransparentParam[roomX + y * S.RoomWidth] & (T.OBSTACLE_LEFT - 1)) != obstacleType) {
					break;
				}
				y++;
			}
			y -= roomY - yPos;
			if (y > T.OBSTACLE_MAX_SIZE) {
				y = T.OBSTACLE_MAX_SIZE;
			}
		}

		ASSERT(yPos < y);

		for (let i: number = 0; i < T.OBSTACLE_MAX_SIZE; i++) {
			index = T.OBSTACLE_INDICES[obstacleType][i];

			if (!index) {
				ASSERT(false, "Invalid obstacle size");
				index = 0;
				xPos = 0;
				yPos = 0;
				break;
			}

			if (x == T.OBSTACLE_DIMENSIONS[index][0] && y == T.OBSTACLE_DIMENSIONS[index][1]) {
				break;
			}
		}

		this.transparentData[roomX + roomY * S.RoomWidth] = T.OBSTACLE_TILES[index][yPos][xPos];
	}

	private setStairsData(x: number, y: number) {
		const stairs = this.calculateStairPosition(x, y);

		const lastShadedTile: number = (stairs.x * 3) - 2;

		let data: number;

		if (stairs.y > lastShadedTile) {
			data = T.TI_STAIRS_5;
		} else if (stairs.y == lastShadedTile) {
			data = T.TI_STAIRS_4;
		} else if (stairs.y + 1 == lastShadedTile) {
			data = T.TI_STAIRS_3;
		} else if (stairs.y + 2 == lastShadedTile) {
			data = T.TI_STAIRS_2;
		} else {
			data = T.TI_STAIRS_1;
		}

		this.opaqueData[x + y * S.RoomWidth] = data;
	}

	private setStairsUpData(x: number, y: number) {
		const stairs = this.calculateStairUpPosition(x, y);

		let data: number = T.TI_STAIRS_UP_1;

		if (stairs.x == 1 && x > 0) {
			if (stairs.y == 1) {
				data = T.TI_STAIRS_UP_3;
			}
			if (stairs.y == 2) {
				data = T.TI_STAIRS_UP_2;
			}
		}

		this.opaqueData[x + y * S.RoomWidth] = data;
	}

	private calculateStairPosition(x: number, y: number): IPointData {
		const stairs: number = this.tilesOpaque[x + y * S.RoomWidth];

		let tx: number = 0;
		let ty: number = 0;

		let prevTile: number;

		if (x == 0) {
			tx = 1;
		} else {
			prevTile = stairs;
			while (prevTile == stairs) {
				tx++;
				prevTile = (x - tx > 0 ? this.tilesOpaque[x - tx + y * S.RoomWidth] : C.T_WALL);
			}
		}

		if (y == 0) {
			ty = 1;
		} else {
			prevTile = stairs;
			while (prevTile == stairs) {
				ty++;
				prevTile = (y - ty > 0 ? this.tilesOpaque[x + (y - ty) * S.RoomWidth] : C.T_WALL);
			}
		}

		return { x: tx, y: ty };
	}

	private calculateStairUpPosition(x: number, y: number): IPointData {
		const stairs: number = this.tilesOpaque[x + y * S.RoomWidth];

		let tx: number = 0;
		let ty: number = 0;

		let prevTile: number;

		if (x == 0) {
			tx = 1;
		} else {
			prevTile = stairs;
			while (prevTile == stairs) {
				tx++;
				prevTile = (x - tx > 0 ? this.tilesOpaque[x - tx + y * S.RoomWidth] : C.T_WALL);
			}
		}

		if (y == S.RoomHeight - 1) {
			ty = 1;
		} else {
			prevTile = stairs;
			while (prevTile == stairs) {
				ty++;
				prevTile = (y + ty < S.RoomHeight - 1 ? this.tilesOpaque[x + (y + ty) * S.RoomWidth] : C.T_WALL);
			}
		}

		return { x: tx, y: ty };
	}

	public clearTiles() {
		this.blit.clearAllTiles();
	}
}


class Blitter {
	public readonly container: Container;
	public readonly sprites: Sprite[][][];

	public constructor(tilesContainer: Container) {
		this.container = tilesContainer;

		this.sprites = [];
		for (let x = 0; x < S.RoomWidth; x++) {
			this.sprites[x] = [];
			for (let y = 0; y < S.RoomHeight; y++) {
				this.sprites[x][y] = [];
			}
		}
	}

	public clearTile(x: number, y: number) {
		this.container.removeChild(...this.sprites[x][y]);
		this.sprites[x][y].length = 0;
	}

	public clearAllTiles() {
		this.container.removeChildren();

		for (let x = 0; x < S.RoomWidth; x++) {
			for (let y = 0; y < S.RoomHeight; y++) {
				this.sprites[x][y].length = 0;
			}
		}
	}

	public generalTile(tileId: number, x: number, y: number, alpha = 1) {
		const sprite = new Sprite(Gfx.getGeneralTilesTexture(tileId));

		sprite.x = x * S.RoomTileWidth;
		sprite.y = y * S.RoomTileHeight;

		this.addSprite(sprite);
		sprite.alpha = alpha;

		return sprite;
	}
	public tile(baseTexture: BaseTexture, tileId: number, x: number, y: number, alpha = 1) {
		const tile = T.TILES[tileId];
		const texture = new Texture(
			baseTexture,
			new Rectangle(
				tile.x,
				tile.y,
				S.RoomTileWidth,
				S.RoomTileHeight,
			),
		);
		const sprite = new Sprite(texture);

		sprite.x = x * S.RoomTileWidth;
		sprite.y = y * S.RoomTileHeight;

		this.addSprite(sprite);
		sprite.alpha = alpha;

		return sprite;
	}

	public wrappingTile(
		baseTexture: BaseTexture,
		targetX: number,
		targetY: number,
		sourceWidth = S.RoomTileWidth,
		sourceHeight = S.RoomTileHeight,
		textureX?: number,
		textureY?: number,
	) {
		textureX = (textureX ?? targetX) * S.RoomTileWidth;
		textureY = (textureY ?? targetY) * S.RoomTileHeight;

		const texture = new Texture(
			baseTexture,
			new Rectangle(
				(textureX % baseTexture.width) | 0,
				(textureY % baseTexture.height) | 0,
				sourceWidth,
				sourceHeight,
			),
		);
		const sprite = new Sprite(texture);

		sprite.x = targetX * S.RoomTileWidth;
		sprite.y = targetY * S.RoomTileHeight;

		this.addSprite(sprite);
	}

	public rect(x: number, y: number, width: number, height: number, color: number) {
		const sprite = new Sprite(Texture.WHITE);
		sprite.x = x;
		sprite.y = y;
		sprite.width = width;
		sprite.height = height;
		sprite.tint = color;

		this.addSprite(sprite);
	}

	public blitCheckpoint(x: number, y: number, checkpoints: VOCheckpoints) {
		if (checkpoints.contains(x, y)) {
			this.generalTile(T.TI_CHECKPOINT, x, y)
		}
	}

	private addSprite(sprite: Sprite) {
		this.sprites[sprite.x / S.RoomTileWidth | 0][sprite.y / S.RoomTileHeight | 0].push(sprite);
		this.container.addChild(sprite);
	}


	public teardown() {
		this.container.cacheAsBitmap = false;
		this.container.removeChildren();
	}
}