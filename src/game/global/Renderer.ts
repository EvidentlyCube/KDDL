import * as PIXI from 'pixi.js';
import {VOCheckpoints} from "../managers/VOCheckpoints";
import {DrodLayer} from "./DrodLayer";
import {C, CanvasImageSource, StyleName} from "../../C";
import {PlatformOptions} from "../../platform/PlatformOptions";
import {S} from "../../S";
import {T} from "../../T";
import {ASSERT} from "../../ASSERT";
import {Gfx} from "./Gfx";
import {Progress} from "./Progress";
import {F} from "../../F";

export class Renderer {
	public tilesOpaque: number[] = null!;
	public tilesTransparent: number[] = null!;
	public tilesTransparentParam: number[] = null!;
	public tilesFloor: number[] = null!;

	public checkpoints: VOCheckpoints = null!;

	public opaqueData: number[] = [];
	public transparentData: number[] = [];

	private drawTo: DrodLayer = null!;

	public bdTiles: CanvasImageSource = null!;
	public bdFloor: CanvasImageSource = null!;
	public bdFloorAlt: CanvasImageSource = null!;
	public bdFloorDirt: CanvasImageSource = null!;
	public bdFloorGrass: CanvasImageSource = null!;
	public bdFloorMosaic: CanvasImageSource = null!;
	public bdFloorRoad: CanvasImageSource = null!;
	public bdPit: CanvasImageSource = null!;
	public bdPitside: CanvasImageSource = null!;
	public bdPitsideSmall: CanvasImageSource = null!;
	public bdWall: CanvasImageSource = null!;

	public styleName: string = "";

	public prepareRoom(styleName: StyleName, layO: number[], layT: number[], layTParams: number[], layF: number[],
	                   layCheckpoints: VOCheckpoints, output: DrodLayer,
	) {
		this.styleName = styleName;

		this.bdTiles = Gfx.STYLES.get(styleName)!.get(T.TILES_STYLE)!;
		this.bdFloor = Gfx.STYLES.get(styleName)!.get(T.TILES_FLOOR)!;
		this.bdFloorAlt = Gfx.STYLES.get(styleName)!.get(T.TILES_FLOOR_ALT)!;
		this.bdFloorDirt = Gfx.STYLES.get(styleName)!.get(T.TILES_FLOOR_DIRT)!;
		this.bdFloorGrass = Gfx.STYLES.get(styleName)!.get(T.TILES_FLOOR_GRASS)!;
		this.bdFloorMosaic = Gfx.STYLES.get(styleName)!.get(T.TILES_FLOOR_MOSAIC)!;
		this.bdFloorRoad = Gfx.STYLES.get(styleName)!.get(T.TILES_FLOOR_ROAD)!;
		this.bdPit = Gfx.STYLES.get(styleName)!.get(T.TILES_PIT)!;
		this.bdPitside = Gfx.STYLES.get(styleName)!.get(T.TILES_PIT_SIDE)!;
		this.bdPitsideSmall = Gfx.STYLES.get(styleName)!.get(T.TILES_PIT_SIDE_SMALL)!;
		this.bdWall = Gfx.STYLES.get(styleName)!.get(T.TILES_WALL)!;

		this.drawTo = output;
		this.tilesOpaque = layO;
		this.tilesTransparent = layT;
		this.tilesTransparentParam = layTParams;
		this.tilesFloor = layF;
		this.checkpoints = layCheckpoints;

		this.prepareAllRoomTiles();
	}


	public clear() {
		this.checkpoints.clear();
	}


	/****************************************************************************************************************/
	/**                                                                                               PREPARATIONS  */

	/****************************************************************************************************************/

	private prepareAllRoomTiles() {
		for (let y: number = 0; y < S.RoomHeight; y++) {
			for (let x: number = 0; x < S.RoomWidth; x++) {
				const arrayIndex: number = x + y * S.RoomWidth;
				this.opaqueData     [arrayIndex] = 0;
				this.transparentData[arrayIndex] = 0;

				this.prepareOpaque(x, y);
				this.prepareTransparent(x, y);
				//prepareFloor      (x, y);
			}
		}
	}

	private prepareOpaque(x: number, y: number) {
		switch (this.tilesOpaque[x + y * S.RoomWidth]) {
			case(C.T_WALL):
			case(C.T_WALL2):
			case(C.T_WALL_BROKEN):
			case(C.T_WALL_HIDDEN):
				this.opaqueData[x + y * S.RoomWidth] &= ~C.REND_WALL_TEXTURE;
				this.setWallFillingData(x, y);
				break;

			case(C.T_TRAPDOOR):
			case(C.T_PIT):
				this.setPitData(x, y);
				break;

			case(C.T_STAIRS):
				this.setStairsData(x, y);
				break;

			case(C.T_STAIRS_UP):
				this.setStairsUpData(x, y);
				break;

			default:
				this.opaqueData[x + y * S.RoomWidth] = 0;
				break;
		}
	}

	private prepareTransparent(x: number, y: number) {
		switch (this.tilesTransparent[x + y * S.RoomWidth]) {
			case(C.T_OBSTACLE):
				this.setObstacleData(x, y);
				break;

			default:
				this.transparentData[x + y * S.RoomWidth] = 0;
				break;
		}
	}

	/*private  prepareFloor(x:number, y:number){

	}*/


	/****************************************************************************************************************/
	/**                                                                                             ACTUAL DRAWING  */

	/****************************************************************************************************************/

	public drawAll() {
		for (let y: number = 0; y < S.RoomHeight; y++) {
			for (let x: number = 0; x < S.RoomWidth; x++) {
				const index: number = x + y * S.RoomWidth;

				this._drawTile(this.tilesOpaque     [index], x, y);
				this.checkpoints.drawIfHas(x, y, this.drawTo);
				this._drawTile(this.tilesFloor      [index], x, y);
				this._drawTile(this.tilesTransparent[index], x, y);
				this.drawShadow(x, y);
				if (this.tilesTransparent[x + y * S.RoomWidth] == C.T_TAR) {
					this.drawTarstuff(x, y, C.T_TAR);
				}
			}
		}
	}

	public redrawTile(x: number, y: number) {
		const index: number = x + y * S.RoomWidth;

		this.drawTo.clearBlock(x, y);
		this._drawTile(this.tilesOpaque     [index], x, y);
		this.checkpoints.drawIfHas(x, y, this.drawTo);
		this._drawTile(this.tilesFloor      [index], x, y);
		this._drawTile(this.tilesTransparent[index], x, y);
		this.drawShadow(x, y);
		if (this.tilesTransparent[x + y * S.RoomWidth] == C.T_TAR) {
			this.drawTarstuff(x, y, C.T_TAR);
		}

	}

	public drawTile(x: number, y: number) {
		const index: number = x + y * S.RoomWidth;

		this._drawTile(this.tilesOpaque     [index], x, y);
		this.checkpoints.drawIfHas(x, y, this.drawTo);
		this._drawTile(this.tilesFloor      [index], x, y);
		this._drawTile(this.tilesTransparent[index], x, y);
		this.drawShadow(x, y);
		if (this.tilesTransparent[x + y * S.RoomWidth] == C.T_TAR) {
			this.drawTarstuff(x, y, C.T_TAR);
		}
	}

	public recheckAroundTile(x: number, y: number, plots: Set<number> | null = null) {
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
			case(C.T_FLOOR):
				this.drawFloor(x, y, tile, this.bdFloor);
				break;

			case(C.T_FLOOR_ALT):
				this.drawFloor(x, y, tile, this.bdFloorAlt);
				break;

			case(C.T_FLOOR_DIRT):
				this.drawFloor(x, y, tile, this.bdFloorDirt);
				break;

			case(C.T_FLOOR_GRASS):
				this.drawFloor(x, y, tile, this.bdFloorGrass);
				break;

			case(C.T_FLOOR_MOSAIC):
				this.drawFloor(x, y, tile, this.bdFloorMosaic);
				break;

			case(C.T_FLOOR_ROAD):
				this.drawFloor(x, y, tile, this.bdFloorRoad);
				break;


			case(C.T_WALL2):
				this.drawWallGraphic(x, y, 0);
				break;

			case(C.T_WALL):
				this.drawTo.blitComplex(this.bdWall,
					x * S.RoomTileWidth + this.drawTo.offsetX,
					y * S.RoomTileHeight + this.drawTo.offsetY,
					x * S.RoomTileWidth % this.bdWall.width,
					y * S.RoomTileHeight % this.bdWall.height,
					S.RoomTileWidth,
					S.RoomTileHeight);
				break;

			case(C.T_WALL_BROKEN):
				this.drawWallGraphic(x, y, 2);
				break;

			case(C.T_WALL_HIDDEN):
				this.drawWallGraphic(x, y, 1);
				break;

			case(C.T_TRAPDOOR):
				this.drawTo.blitTileRect(this.bdTiles, T.TI_TRAPDOOR, x, y);
				break;

			case(C.T_DOOR_Y):
				temp = T.DOOR_Y[this.getOrthogonalByte(x, y, C.T_DOOR_Y, this.tilesOpaque)];
				this.drawTo.blitTileRect(Gfx.GENERAL_TILES, temp, x, y);
				break;

			case(C.T_DOOR_YO):
				temp = T.DOOR_YO[this.getOrthogonalByte(x, y, C.T_DOOR_YO, this.tilesOpaque)];
				this.drawTo.blitTileRect(Gfx.GENERAL_TILES, temp, x, y);
				break;

			case(C.T_DOOR_R):
				temp = T.DOOR_R[this.getOrthogonalByte(x, y, C.T_DOOR_R, this.tilesOpaque)];
				this.drawTo.blitTileRect(Gfx.GENERAL_TILES, temp, x, y);
				break;

			case(C.T_DOOR_RO):
				temp = T.DOOR_RO[this.getOrthogonalByte(x, y, C.T_DOOR_RO, this.tilesOpaque)];
				this.drawTo.blitTileRect(Gfx.GENERAL_TILES, temp, x, y);
				break;

			case(C.T_DOOR_G):
				temp = T.DOOR_G[this.getOrthogonalByte(x, y, C.T_DOOR_G, this.tilesOpaque)];
				this.drawTo.blitTileRect(Gfx.GENERAL_TILES, temp, x, y);
				break;

			case(C.T_DOOR_GO):
				temp = T.DOOR_GO[this.getOrthogonalByte(x, y, C.T_DOOR_GO, this.tilesOpaque)];
				this.drawTo.blitTileRect(Gfx.GENERAL_TILES, temp, x, y);
				break;

			case(C.T_DOOR_C):
				temp = T.DOOR_C[this.getOrthogonalByte(x, y, C.T_DOOR_C, this.tilesOpaque)];
				this.drawTo.blitTileRect(Gfx.GENERAL_TILES, temp, x, y);
				break;

			case(C.T_DOOR_CO):
				temp = T.DOOR_CO[this.getOrthogonalByte(x, y, C.T_DOOR_CO, this.tilesOpaque)];
				this.drawTo.blitTileRect(Gfx.GENERAL_TILES, temp, x, y);
				break;

			case(C.T_DOOR_B):
				temp = T.DOOR_B[this.getOrthogonalByte(x, y, C.T_DOOR_B, this.tilesOpaque)];
				this.drawTo.blitTileRect(Gfx.GENERAL_TILES, temp, x, y);
				break;

			case(C.T_DOOR_BO):
				temp = T.DOOR_BO[this.getOrthogonalByte(x, y, C.T_DOOR_BO, this.tilesOpaque)];
				this.drawTo.blitTileRect(Gfx.GENERAL_TILES, temp, x, y);
				break;

			case(C.T_PIT):
				this.drawPit(x, y);
				break;

			case(C.T_ARROW_N):
				this.drawTo.blitTileRect(this.bdTiles, T.TI_ARROW_N, x, y);
				break;

			case(C.T_ARROW_NE):
				this.drawTo.blitTileRect(this.bdTiles, T.TI_ARROW_NE, x, y);
				break;

			case(C.T_ARROW_E):
				this.drawTo.blitTileRect(this.bdTiles, T.TI_ARROW_E, x, y);
				break;

			case(C.T_ARROW_SE):
				this.drawTo.blitTileRect(this.bdTiles, T.TI_ARROW_SE, x, y);
				break;

			case(C.T_ARROW_S):
				this.drawTo.blitTileRect(this.bdTiles, T.TI_ARROW_S, x, y);
				break;

			case(C.T_ARROW_SW):
				this.drawTo.blitTileRect(this.bdTiles, T.TI_ARROW_SW, x, y);
				break;

			case(C.T_ARROW_W):
				this.drawTo.blitTileRect(this.bdTiles, T.TI_ARROW_W, x, y);
				break;

			case(C.T_ARROW_NW):
				this.drawTo.blitTileRect(this.bdTiles, T.TI_ARROW_NW, x, y);
				break;

			case(C.T_ORB):
				this.drawTo.blitTileRect(Gfx.GENERAL_TILES, T.TI_ORB, x, y);
				break;

			case(C.T_SCROLL):
				this.drawTo.blitTileRect(Gfx.GENERAL_TILES, T.TI_SCROLL, x, y);
				break;

			case(C.T_POTION_M):
				this.drawTo.blitTileRect(Gfx.GENERAL_TILES, T.TI_POTION_M, x, y);
				break;

			case(C.T_STAIRS):
			case(C.T_STAIRS_UP):
				this.drawTo.blitTileRect(this.bdTiles, this.opaqueData[x + y * S.RoomWidth], x, y);
				break;

			case(C.T_POTION_I):
				this.drawTo.blitTileRect(Gfx.GENERAL_TILES, T.TI_POTION_I, x, y);
				break;

			case(C.T_OBSTACLE):
				this.drawTo.blitTileRect(this.bdTiles, this.transparentData[x + y * S.RoomWidth], x, y);
				break;

			case(C.T_WALL_MASTER):
				if (Progress.isGameMastered) {
					this._drawTile(this.getNeighbourFloor(x, y), x, y);
					this.drawTo.drawTileRect(Gfx.GENERAL_TILES, T.TI_MASTER_WALL, x, y, 0.5);
				} else {
					this.drawTo.drawTileRect(Gfx.GENERAL_TILES, T.TI_MASTER_WALL, x, y, 1);
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

	private drawFloor(x: number, y: number, floorType: number, bitmap: CanvasImageSource) {
		this.drawTo.blitComplex(bitmap,
			x * S.RoomTileWidth + this.drawTo.offsetX,
			y * S.RoomTileHeight + this.drawTo.offsetY,
			x * S.RoomTileWidth % bitmap.width,
			y * S.RoomTileHeight % bitmap.height,
			S.RoomTileWidth,
			S.RoomTileHeight);

		let tile: number;

		if (x > 0) {
			tile = this.tilesOpaque[x - 1 + y * S.RoomWidth];
			if (F.isPlainFloor(tile) && tile != floorType) {
				this.drawTo.blitRect(x * S.RoomTileWidth, y * S.RoomTileWidth, 1, S.RoomTileHeight, 0xFF606060);
			}
		}

		if (y > 0) {
			tile = this.tilesOpaque[x + (y - 1) * S.RoomWidth];
			if (F.isPlainFloor(tile) && tile != floorType) {
				this.drawTo.blitRect(x * S.RoomTileWidth, y * S.RoomTileWidth, S.RoomTileWidth, 1, 0xFF606060);
			}
		}

		if (x > 0 && y > 0) {
			tile = this.tilesOpaque[x - 1 + (y - 1) * S.RoomWidth];
			if (F.isPlainFloor(tile) && tile != floorType) {
				this.drawTo.blitRect(x * S.RoomTileWidth, y * S.RoomTileWidth, 1, 1, 0xFF606060);
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
			this.drawTo.blitTileRect(this.bdTiles, T.TI_WALL_NSEW1234 + type, x, y);
			return;
		}

		// Single block
		if ((bytes & 0xAA) == 0x00) {
			this.drawTo.blitTileRect(this.bdTiles, T.TI_WALL + type, x, y);
			return;
		}

		// Single Dead ends
		if ((bytes & 0xAA) == 0x20) {
			this.drawTo.blitTileRect(this.bdTiles, T.TI_WALL_S + type, x, y);
			return;
		}
		if ((bytes & 0xAA) == 0x08) {
			this.drawTo.blitTileRect(this.bdTiles, T.TI_WALL_W + type, x, y);
			if (this.opaqueData[x + y * S.RoomWidth] & C.REND_WALL_TEXTURE) {
				this.drawWallTexture(x, y);
			}
			return;
		}
		if ((bytes & 0xAA) == 0x02) {
			this.drawTo.blitTileRect(this.bdTiles, T.TI_WALL_N + type, x, y);
			if (this.opaqueData[x + y * S.RoomWidth] & C.REND_WALL_TEXTURE) {
				this.drawWallTexture(x, y);
			}
			return;
		}
		if ((bytes & 0xAA) == 0x80) {
			this.drawTo.blitTileRect(this.bdTiles, T.TI_WALL_E + type, x, y);
			if (this.opaqueData[x + y * S.RoomWidth] & C.REND_WALL_TEXTURE) {
				this.drawWallTexture(x, y);
			}
			return;
		}

		// Single turns
		if ((bytes & 0xEA) == 0xA0) {
			this.drawTo.blitTileRect(this.bdTiles, T.TI_WALL_SE + type, x, y);
			if (F.isValidColRow(x + 1, y) && this.opaqueData[x + 1 + y * S.RoomWidth] & C.REND_WALL_TEXTURE) {
				this.drawTo.blitRectDirect(
					(x + 1) * S.RoomTileWidth + S.LEVEL_OFFSET_X - 1,
					y * S.RoomTileHeight + S.LEVEL_OFFSET_Y + S.RoomTileHeightHalf,
					1,
					S.RoomTileHeightHalf,
					0xFF000000);
			}
			return;

		}
		if ((bytes & 0xBA) == 0x28) {
			this.drawTo.blitTileRect(this.bdTiles, T.TI_WALL_SW + type, x, y);
			if (F.isValidColRow(x - 1, y) && this.opaqueData[x - 1 + y * S.RoomWidth] & C.REND_WALL_TEXTURE) {
				this.drawTo.blitRectDirect(
					x * S.RoomTileWidth + S.LEVEL_OFFSET_X,
					y * S.RoomTileHeight + S.LEVEL_OFFSET_Y + S.RoomTileHeightHalf,
					1,
					S.RoomTileHeightHalf,
					0xFF000000);
			}
			return;
		}

		if ((bytes & 0xAE) == 0x0A) {
			this.drawTo.blitTileRect(this.bdTiles, T.TI_WALL_NW + type, x, y);
			if (this.opaqueData[x + y * S.RoomWidth] & C.REND_WALL_TEXTURE) {
				this.drawWallTexture(x, y);
			}
			return;
		}
		if ((bytes & 0xAB) == 0x82) {
			this.drawTo.blitTileRect(this.bdTiles, T.TI_WALL_NE + type, x, y);
			if (this.opaqueData[x + y * S.RoomWidth] & C.REND_WALL_TEXTURE) {
				this.drawWallTexture(x, y);
			}
			return;
		}

		// Single corridors
		if ((bytes & 0xAA) == 0x88) {
			this.drawTo.blitTileRect(this.bdTiles, T.TI_WALL_EW + type, x, y);
			if (this.opaqueData[x + y * S.RoomWidth] & C.REND_WALL_TEXTURE) {
				this.drawWallTexture(x, y);
			}
			return;
		}
		if ((bytes & 0xAA) == 0x22) {
			this.drawTo.blitTileRect(this.bdTiles, T.TI_WALL_NS + type, x, y);
			return;
		}

		// Single triple conjunction
		if ((bytes & 0xEB) == 0xA2) {
			this.drawTo.blitTileRect(this.bdTiles, T.TI_WALL_NSE + type, x, y);
			return;
		}
		if ((bytes & 0xFA) == 0xA8) {
			this.drawTo.blitTileRect(this.bdTiles, T.TI_WALL_SEW + type, x, y);
			if (F.isValidColRow(x + 1, y) && this.opaqueData[x + 1 + y * S.RoomWidth] & C.REND_WALL_TEXTURE) {
				this.drawTo.blitRectDirect(
					(x + 1) * S.RoomTileWidth + S.LEVEL_OFFSET_X - 1,
					y * S.RoomTileHeight + S.LEVEL_OFFSET_Y + S.RoomTileHeightHalf,
					1,
					S.RoomTileHeightHalf,
					0xFF000000);
			}
			if (F.isValidColRow(x - 1, y) && this.opaqueData[x - 1 + y * S.RoomWidth] & C.REND_WALL_TEXTURE) {
				this.drawTo.blitRectDirect(
					x * S.RoomTileWidth + S.LEVEL_OFFSET_X,
					y * S.RoomTileHeight + S.LEVEL_OFFSET_Y + S.RoomTileHeightHalf,
					1,
					S.RoomTileHeightHalf,
					0xFF000000);
			}
			return;
		}
		if ((bytes & 0xBE) == 0x2A) {
			this.drawTo.blitTileRect(this.bdTiles, T.TI_WALL_NSW + type, x, y);
			return;
		}
		if ((bytes & 0xAF) == 0x8A) {
			this.drawTo.blitTileRect(this.bdTiles, T.TI_WALL_NEW + type, x, y);
			if (this.opaqueData[x + y * S.RoomWidth] & C.REND_WALL_TEXTURE) {
				this.drawWallTexture(x, y);
			}
			return;
		}

		// Four way crossroad
		if (bytes == 0xAA) {
			this.drawTo.blitTileRect(this.bdTiles, T.TI_WALL_NSEW + type, x, y);
			if (F.isValidColRow(x + 1, y) && this.opaqueData[x + 1 + y * S.RoomWidth] & C.REND_WALL_TEXTURE) {
				this.drawTo.blitRectDirect(
					(x + 1) * S.RoomTileWidth + S.LEVEL_OFFSET_X - 1,
					y * S.RoomTileHeight + S.LEVEL_OFFSET_Y + S.RoomTileHeightHalf,
					1,
					S.RoomTileHeightHalf,
					0xFF000000);
			}
			if (F.isValidColRow(x - 1, y) && this.opaqueData[x - 1 + y * S.RoomWidth] & C.REND_WALL_TEXTURE) {
				this.drawTo.blitRectDirect(
					x * S.RoomTileWidth + S.LEVEL_OFFSET_X,
					y * S.RoomTileHeight + S.LEVEL_OFFSET_Y + S.RoomTileHeightHalf,
					1,
					S.RoomTileHeightHalf,
					0xFF000000);
			}
			return;
		}

		// Corners
		if ((bytes & 0xEA) == 0xE0) {
			this.drawTo.blitTileRect(this.bdTiles, T.TI_WALL_SE4 + type, x, y);
			return;
		}
		if ((bytes & 0xBA) == 0x38) {
			this.drawTo.blitTileRect(this.bdTiles, T.TI_WALL_SW3 + type, x, y);
			return;
		}
		if ((bytes & 0xAE) == 0x0E) {
			this.drawTo.blitTileRect(this.bdTiles, T.TI_WALL_NW1 + type, x, y);
			if (this.opaqueData[x + y * S.RoomWidth] & C.REND_WALL_TEXTURE) {
				this.drawWallTexture(x, y);
			}
			return;
		}
		if ((bytes & 0xAB) == 0x83) {
			this.drawTo.blitTileRect(this.bdTiles, T.TI_WALL_NE2 + type, x, y);
			if (this.opaqueData[x + y * S.RoomWidth] & C.REND_WALL_TEXTURE) {
				this.drawWallTexture(x, y);
			}
			return;
		}

		// Sides
		if ((bytes & 0xEB) == 0xE3) {
			this.drawTo.blitTileRect(this.bdTiles, T.TI_WALL_NSE24 + type, x, y);
			return;
		}
		if ((bytes & 0xFA) == 0xF8) {
			this.drawTo.blitTileRect(this.bdTiles, T.TI_WALL_SEW34 + type, x, y);
			return;
		}
		if ((bytes & 0xBE) == 0x3E) {
			this.drawTo.blitTileRect(this.bdTiles, T.TI_WALL_NSW13 + type, x, y);
			return;
		}
		if ((bytes & 0xAF) == 0x8F) {
			this.drawTo.blitTileRect(this.bdTiles, T.TI_WALL_NEW12 + type, x, y);
			if (this.opaqueData[x + y * S.RoomWidth] & C.REND_WALL_TEXTURE) {
				this.drawWallTexture(x, y);
			}
			return;
		}

		// (Lots of) Inner corners
		if (bytes == 0xFB) {
			this.drawTo.blitTileRect(this.bdTiles, T.TI_WALL_NSEW234 + type, x, y);
			return;
		}
		if (bytes == 0xFE) {
			this.drawTo.blitTileRect(this.bdTiles, T.TI_WALL_NSEW134 + type, x, y);
			return;
		}
		if (bytes == 0xBF) {
			this.drawTo.blitTileRect(this.bdTiles, T.TI_WALL_NSEW123 + type, x, y);
			return;
		}
		if (bytes == 0xEF) {
			this.drawTo.blitTileRect(this.bdTiles, T.TI_WALL_NSEW124 + type, x, y);
			return;
		}
		if (bytes == 0xFA) {
			this.drawTo.blitTileRect(this.bdTiles, T.TI_WALL_NSEW34 + type, x, y);
			return;
		}
		if (bytes == 0xBB) {
			this.drawTo.blitTileRect(this.bdTiles, T.TI_WALL_NSEW23 + type, x, y);
			return;
		}
		if (bytes == 0xEB) {
			this.drawTo.blitTileRect(this.bdTiles, T.TI_WALL_NSEW24 + type, x, y);
			return;
		}
		if (bytes == 0xBE) {
			this.drawTo.blitTileRect(this.bdTiles, T.TI_WALL_NSEW13 + type, x, y);
			return;
		}
		if (bytes == 0xEE) {
			this.drawTo.blitTileRect(this.bdTiles, T.TI_WALL_NSEW14 + type, x, y);
			return;
		}
		if (bytes == 0xAF) {
			this.drawTo.blitTileRect(this.bdTiles, T.TI_WALL_NSEW12 + type, x, y);
			return;
		}
		if (bytes == 0xBA) {
			this.drawTo.blitTileRect(this.bdTiles, T.TI_WALL_NSEW3 + type, x, y);
			return;
		}
		if (bytes == 0xEA) {
			this.drawTo.blitTileRect(this.bdTiles, T.TI_WALL_NSEW4 + type, x, y);
			return;
		}
		if (bytes == 0xAB) {
			this.drawTo.blitTileRect(this.bdTiles, T.TI_WALL_NSEW2 + type, x, y);
			return;
		}
		if (bytes == 0xAE) {
			this.drawTo.blitTileRect(this.bdTiles, T.TI_WALL_NSEW1 + type, x, y);
			return;
		}

		// Sides
		if ((bytes & 0xFA) == 0xE8) {
			this.drawTo.blitTileRect(this.bdTiles, T.TI_WALL_SEW4 + type, x, y);
			if (F.isValidColRow(x - 1, y) && this.opaqueData[x - 1 + y * S.RoomWidth] & C.REND_WALL_TEXTURE) {
				this.drawTo.blitRectDirect(
					x * S.RoomTileWidth + S.LEVEL_OFFSET_X,
					y * S.RoomTileHeight + S.LEVEL_OFFSET_Y + S.RoomTileHeightHalf,
					1,
					S.RoomTileHeightHalf,
					0xFF000000);
			}
			return;
		}
		if ((bytes & 0xFA) == 0xB8) {
			this.drawTo.blitTileRect(this.bdTiles, T.TI_WALL_SEW3 + type, x, y);
			if (F.isValidColRow(x + 1, y) && this.opaqueData[x + 1 + y * S.RoomWidth] & C.REND_WALL_TEXTURE) {
				this.drawTo.blitRectDirect(
					(x + 1) * S.RoomTileWidth + S.LEVEL_OFFSET_X - 1,
					y * S.RoomTileHeight + S.LEVEL_OFFSET_Y + S.RoomTileHeightHalf,
					1,
					S.RoomTileHeightHalf,
					0xFF000000);
			}
			return;
		}
		if ((bytes & 0xBE) == 0x3A) {
			this.drawTo.blitTileRect(this.bdTiles, T.TI_WALL_NSW3 + type, x, y);
			return;
		}
		if ((bytes & 0xBE) == 0x2E) {
			this.drawTo.blitTileRect(this.bdTiles, T.TI_WALL_NSW1 + type, x, y);
			if (F.isValidColRow(x - 1, y) && this.opaqueData[x - 1 + y * S.RoomWidth] & C.REND_WALL_TEXTURE) {
				this.drawTo.blitRectDirect(
					x * S.RoomTileWidth + S.LEVEL_OFFSET_X,
					y * S.RoomTileHeight + S.LEVEL_OFFSET_Y + S.RoomTileHeightHalf,
					1,
					S.RoomTileHeightHalf,
					0xFF000000);
			}
			return;
		}
		if ((bytes & 0xAF) == 0x8B) {
			this.drawTo.blitTileRect(this.bdTiles, T.TI_WALL_NEW2 + type, x, y);
			if (this.opaqueData[x + y * S.RoomWidth] & C.REND_WALL_TEXTURE) {
				this.drawWallTexture(x, y);
			}
			return;
		}

		if ((bytes & 0xAF) == 0x8E) {
			this.drawTo.blitTileRect(this.bdTiles, T.TI_WALL_NEW1 + type, x, y);
			if (this.opaqueData[x + y * S.RoomWidth] & C.REND_WALL_TEXTURE) {
				this.drawWallTexture(x, y);
			}
			return;
		}
		if ((bytes & 0xEB) == 0xE2) {
			this.drawTo.blitTileRect(this.bdTiles, T.TI_WALL_NSE4 + type, x, y);
			return;
		}
		if ((bytes & 0xEB) == 0xA3) {
			this.drawTo.blitTileRect(this.bdTiles, T.TI_WALL_NSE2 + type, x, y);
			if (F.isValidColRow(x + 1, y) && this.opaqueData[x + 1 + y * S.RoomWidth] & C.REND_WALL_TEXTURE) {
				this.drawTo.blitRectDirect(
					(x + 1) * S.RoomTileWidth + S.LEVEL_OFFSET_X - 1,
					y * S.RoomTileHeight + S.LEVEL_OFFSET_Y + S.RoomTileHeightHalf,
					1,
					S.RoomTileHeightHalf,
					0xFF000000);
			}
			return;
		}
	}

	private drawWallTexture(x: number, y: number) {
		this.drawTo.drawComplexDirect(this.bdWall,
			x * S.RoomTileWidth + S.LEVEL_OFFSET_X,
			y * S.RoomTileHeight + S.LEVEL_OFFSET_Y + S.RoomTileHeightHalf,
			1,
			x * S.RoomTileWidth % this.bdWall.width,
			(y * S.RoomTileHeight + S.RoomTileHeightHalf) % this.bdWall.height,
			S.RoomTileWidth,
			S.RoomTileHeightHalf);
		this.drawTo.blitRectDirect(
			x * S.RoomTileWidth + S.LEVEL_OFFSET_X,
			y * S.RoomTileHeight + S.LEVEL_OFFSET_Y + S.RoomTileHeightHalf,
			S.RoomTileWidth,
			1,
			0xFF000000);
	}

	private drawPit(x: number, y: number) {
		const data: number = this.opaqueData[x + y * S.RoomWidth];
		const dataX: number = (data & C.REND_PIT_COORDS_MASK) % C.REND_PIT_COORD_MULTIP;
		const dataY: number = (data & C.REND_PIT_COORDS_MASK) / C.REND_PIT_COORD_MULTIP | 0;

		this.drawTo.drawComplexDirect(this.bdPit,
			x * S.RoomTileWidth + S.LEVEL_OFFSET_X,
			y * S.RoomTileHeight + S.LEVEL_OFFSET_Y,
			1,
			x * S.RoomTileWidth % this.bdPit.width,
			y * S.RoomTileHeight % this.bdPit.height,
			S.RoomTileWidth,
			S.RoomTileHeight);

		if (data & C.REND_PIT_IS_SIDE_SMALL) {
			this.drawTo.drawComplexDirect(this.bdPitsideSmall,
				x * S.RoomTileWidth + S.LEVEL_OFFSET_X,
				y * S.RoomTileHeight + S.LEVEL_OFFSET_Y,
				1,
				(dataX * S.RoomTileWidth) % this.bdPitsideSmall.width,
				dataY * S.RoomTileHeight,
				S.RoomTileWidth,
				S.RoomTileHeight);
		} else if (data & C.REND_PIT_IS_SIDE) {
			this.drawTo.drawComplexDirect(this.bdPitside,
				x * S.RoomTileWidth + S.LEVEL_OFFSET_X,
				y * S.RoomTileHeight + S.LEVEL_OFFSET_Y,
				1,
				(dataX * S.RoomTileWidth) % this.bdPitside.width,
				dataY * S.RoomTileHeight,
				S.RoomTileWidth,
				S.RoomTileHeight);
		}

		if (x > 0 && F.isFloor(this.tilesOpaque[x - 1 + y * S.RoomWidth])) {
			this.drawTo.blitRect(x * S.RoomTileWidth, y * S.RoomTileWidth, 1, S.RoomTileHeight, 0xFF000000);
		}

		if (y > 0 && F.isFloor(this.tilesOpaque[x + (y - 1) * S.RoomWidth])) {
			this.drawTo.blitRect(x * S.RoomTileWidth, y * S.RoomTileWidth, S.RoomTileWidth, 1, 0xFF000000);
		}

		if (x < S.RoomWidth - 1 && F.isFloor(this.tilesOpaque[x + 1 + y * S.RoomWidth])) {
			this.drawTo.blitRect((x + 1) * S.RoomTileWidth - 1, y * S.RoomTileWidth, 1, S.RoomTileHeight, 0xFF000000);
		}

		if (y < S.RoomHeight - 1 && F.isFloor(this.tilesOpaque[x + (y + 1) * S.RoomWidth])) {
			this.drawTo.blitRect(x * S.RoomTileWidth, (y + 1) * S.RoomTileWidth - 1, S.RoomTileWidth, 1, 0xFF000000);
		}

		if (x > 0 && y > 0 && F.isFloor(this.tilesOpaque[x - 1 + (y - 1) * S.RoomWidth])) {
			this.drawTo.blitRect(x * S.RoomTileWidth, y * S.RoomTileWidth, 1, 1, 0xFF000000);
		}

		if (x < S.RoomWidth - 1 && y > 0 && F.isFloor(this.tilesOpaque[x + 1 + (y - 1) * S.RoomWidth])) {
			this.drawTo.blitRect((x + 1) * S.RoomTileWidth - 1, y * S.RoomTileWidth, 1, 1, 0xFF000000);
		}

		if (x > 0 && y < S.RoomHeight - 1 && F.isFloor(this.tilesOpaque[x - 1 + (y + 1) * S.RoomWidth])) {
			this.drawTo.blitRect(x * S.RoomTileWidth, (y + 1) * S.RoomTileWidth - 1, 1, 1, 0xFF000000);
		}

		if (x < S.RoomWidth - 1 && y < S.RoomHeight - 1 && F.isFloor(this.tilesOpaque[x + 1 + (y + 1) * S.RoomWidth])) {
			this.drawTo.blitRect((x + 1) * S.RoomTileWidth - 1, (y + 1) * S.RoomTileWidth - 1, 1, 1, 0xFF000000);
		}


	}

	private drawTarstuff(x: number, y: number, tarType: number) {
		const bytes: number = this.getSurroundingByte(x, y, tarType, this.tilesTransparent);

		// INNER CORNERS
		if (bytes == 0xBF) {
			this.drawTo.drawTileRect(Gfx.GENERAL_TILES, T.TI_TAR_ISE, x, y, 0.75);
			return;
		}
		if (bytes == 0xEF) {
			this.drawTo.drawTileRect(Gfx.GENERAL_TILES, T.TI_TAR_ISW, x, y, 0.75);
			return;
		}
		if (bytes == 0xFB) {
			this.drawTo.drawTileRect(Gfx.GENERAL_TILES, T.TI_TAR_INW, x, y, 0.75);
			return;
		}
		if (bytes == 0xFE) {
			this.drawTo.drawTileRect(Gfx.GENERAL_TILES, T.TI_TAR_INE, x, y, 0.75);
			return;
		}

		// DOUBLE CORNERS
		if (bytes == 0xBB) {
			this.drawTo.drawTileRect(Gfx.GENERAL_TILES, T.TI_TAR_INWSE, x, y, 0.75);
			return;
		}
		if (bytes == 0xEE) {
			this.drawTo.drawTileRect(Gfx.GENERAL_TILES, T.TI_TAR_INESW, x, y, 0.75);
			return;
		}

		// INSIDE
		if (bytes == 0xFF) {
			this.drawTo.drawTileRect(Gfx.GENERAL_TILES, T.TI_TAR_NSEW, x, y, 0.75);
			return;
		}

		// FLAT SIDES
		if ((bytes & 0x3E) == 0x3E) {
			this.drawTo.drawTileRect(Gfx.GENERAL_TILES, T.TI_TAR_NSW, x, y, 0.75);
			return;
		}
		if ((bytes & 0x8F) == 0x8F) {
			this.drawTo.drawTileRect(Gfx.GENERAL_TILES, T.TI_TAR_NEW, x, y, 0.75);
			return;
		}
		if ((bytes & 0xE3) == 0xE3) {
			this.drawTo.drawTileRect(Gfx.GENERAL_TILES, T.TI_TAR_NSE, x, y, 0.75);
			return;
		}
		if ((bytes & 0xF8) == 0xF8) {
			this.drawTo.drawTileRect(Gfx.GENERAL_TILES, T.TI_TAR_SEW, x, y, 0.75);
			return;
		}

		// CORNERS
		if ((bytes & 0x0E) == 0x0E) {
			this.drawTo.drawTileRect(Gfx.GENERAL_TILES, T.TI_TAR_NW, x, y, 0.75);
			return;
		}
		if ((bytes & 0x83) == 0x83) {
			this.drawTo.drawTileRect(Gfx.GENERAL_TILES, T.TI_TAR_NE, x, y, 0.75);
			return;
		}
		if ((bytes & 0xE0) == 0xE0) {
			this.drawTo.drawTileRect(Gfx.GENERAL_TILES, T.TI_TAR_SE, x, y, 0.75);
			return;
		}
		if ((bytes & 0x38) == 0x38) {
			this.drawTo.drawTileRect(Gfx.GENERAL_TILES, T.TI_TAR_SW, x, y, 0.75);
			return;
		}

		this.drawTo.drawTileRect(Gfx.GENERAL_TILES, T.TI_TAR_NSEW, x, y, 0.75);
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
					this.drawTo.drawTileRect(Gfx.GENERAL_TILES, T.TI_SHADOW_NW1, x, y, 0.25);
				} else {
					this.drawTo.drawTileRect(Gfx.GENERAL_TILES, T.TI_SHADOW_NW, x, y, 0.25);
				}
			} else if (tile1) {
				this.drawTo.drawTileRect(Gfx.GENERAL_TILES, T.TI_SHADOW_N1, x, y, 0.25);
			} else {
				this.drawTo.drawTileRect(Gfx.GENERAL_TILES, T.TI_SHADOW_N, x, y, 0.25);
			}
		} else if (tileW) {
			if (tile1) {
				this.drawTo.drawTileRect(Gfx.GENERAL_TILES, T.TI_SHADOW_W1, x, y, 0.25);
			} else {
				this.drawTo.drawTileRect(Gfx.GENERAL_TILES, T.TI_SHADOW_W, x, y, 0.25);
			}
		} else if (tile1) {
			this.drawTo.drawTileRect(Gfx.GENERAL_TILES, T.TI_SHADOW_1, x, y, 0.25);
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

	/** Checks 4 surrounding neighbours, used for determining Door type **/
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

	/** Checks 8 surrounding neighbours, used for determining Tar graphic, the order is:
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
		}// Not wide enough to display the wide pit
		else if (width < this.bdPitside.width / S.RoomTileWidth &&
			posY < this.bdPitsideSmall.height / S.RoomTileHeight) {
			data = C.REND_PIT_IS_SIDE_SMALL | (posX + posY * C.REND_PIT_COORD_MULTIP);
		}// Wide enough to display the wide pit
		else if (posY < this.bdPitside.height / S.RoomTileHeight) {
			// Wide, but the remainder is not wide enough to fit the whole "wide" so use small-pit
			if (width - posX <= width % (this.bdPitside.width / S.RoomTileWidth)) {
				posX = (posX - width + (width % (this.bdPitside.width / S.RoomTileWidth)));
				data = C.REND_PIT_IS_SIDE_SMALL | (posX + posY * C.REND_PIT_COORD_MULTIP);
			} else {
				data = C.REND_PIT_IS_SIDE | (posX + posY * C.REND_PIT_COORD_MULTIP);
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

	private calculateStairPosition(x: number, y: number): PIXI.Point {
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

		return new PIXI.Point(tx, ty);
	}

	private calculateStairUpPosition(x: number, y: number): PIXI.Point {
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

		return new PIXI.Point(tx, ty);
	}
}
