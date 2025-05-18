import {S} from "../../S";
import {F} from "../../F";
import {UtilsBitmapData} from "../../../src.framework/net/retrocade/utils/UtilsBitmapData";
import { attr, intAttr } from "src/XML";
import { UtilsBase64 } from "src.framework/net/retrocade/utils/UtilsBase64";
import { BinaryReader } from "csharp-binary-stream";
import { C } from "src/C";
import { BaseTexture, Sprite, Texture } from "pixi.js";
import { Level } from "../global/Level";

export class VOMinimapRoom extends Sprite {
	public roomXml: Element;
	public bitmapData: CanvasRenderingContext2D;

	public wasVisited: boolean = true;
	public completed: boolean = false;

	public constructor(roomXml: Element) {
		super();

		this.roomXml = roomXml;

		this.bitmapData = F.newCanvasContext(S.RoomWidth, S.RoomHeight);
		this.texture = new Texture(new BaseTexture(this.bitmapData.canvas))

		const offset = Level.getRoomOffsetInLevel(intAttr(roomXml, 'RoomID', -1));
		this.x = offset.x * S.RoomWidth;
		this.y = offset.y * S.RoomHeight;
	}

	public teardown() {
		this.texture.destroy(true);
		F.destroyCanvas(this.bitmapData);
	}

	public regenerateBitmapData(isExitPending: boolean = false) {
		const isRoomDarkened = !this.wasVisited;
		const isRoomRequired = attr(this.roomXml, 'IsRequired') == "1";
		const isRoomCompleted = this.completed;

		let tile: number = 0;
		let i: number;
		let count: number = 0;

		const squaresBA = UtilsBase64.decodeByteArray(attr(this.roomXml, 'Squares'));
		const reader = new BinaryReader(squaresBA);

		const version = reader.readByte();
		if (version != 6) {
			throw new Error(`Invalid data format version, should be 6 was: ${version}`);
		}

		// CHECKING OPAQUE LAYER
		for (let y = 0; y < S.RoomHeightOriginal; y++) {
			for (let x = 0; x < S.RoomWidthOriginal; x++) {
				if (!count) {
					count = reader.readByte();
					tile = reader.readByte();
				}

				count--;

				if (x >= S.RoomWidth || y >= S.RoomHeight) {
					continue;
				}

				const i = x + y * S.RoomWidth;

				switch (tile) {
					case(C.T_WALL):
					case(C.T_WALL2):
					case(C.T_WALL_BROKEN):
					case(C.T_WALL_HIDDEN):
						this.plot(i, isRoomDarkened ? 0x004040 : 0);
						break;
					case(C.T_STAIRS):
						this.plot(i, 0xD2D264);
						break;
					case(C.T_DOOR_Y):
						this.plot(i, 0xFFFF00);
						break;
					case(C.T_DOOR_YO):
						this.plot(i, 0xFFFFA4);
						break;
					case(C.T_DOOR_B):
						this.plot(i, 0x444444);
						break;
					case(C.T_DOOR_BO):
						this.plot(i, 0xC8C8C8);
						break;
					case(C.T_DOOR_G):
						this.plot(i, isRoomDarkened ? 0xB8B8B8 : 0x00FF00);
						break;
					case(C.T_DOOR_GO):
						this.plot(i, isRoomDarkened ? 0xB8B8B8 : 0x80FF80);
						break;
					case(C.T_DOOR_C):
						this.plot(i, isRoomDarkened ? 0xB8B8B8 : 0x00FFFF);
						break;
					case(C.T_DOOR_CO):
						this.plot(i, isRoomDarkened ? 0xB8B8B8 : 0xA4FFFF);
						break;
					case(C.T_TRAPDOOR):
						this.plot(i, 0xFF8080);
						break;
					case(C.T_DOOR_R):
						this.plot(i, 0xFF0000);
						break;
					case(C.T_DOOR_RO):
						this.plot(i, 0xFF4040);
						break;
					case(C.T_PIT):
						this.plot(i, 0x000080);
						break;
					default:
						if (isRoomDarkened) {
							this.plot(i, 0x664646);
						} else if (isRoomCompleted) {
							this.plot(i, 0xE5E5E5);
						} else if (isExitPending) {
							this.plot(i, 0x80FF80);
						} else if (isRoomRequired) {
							this.plot(i, 0xFF0000);
						} else {
							this.plot(i, 0xFF00FF);
						}
				}
			}
		}

		// SKIPPING FLOOR LAYER
		for (i = 0; i < S.RoomTotalTilesOriginal; i++) {
			if (!count) {
				count = reader.readByte();
				tile = reader.readByte();
			}

			count--;
		}

		// Transparent Layer with Parameter (ignored)

		for (let y = 0; y < S.RoomHeightOriginal; y++) {
			for (let x = 0; x < S.RoomWidthOriginal; x++) {
				if (!count) {
					count = reader.readByte();
					tile = reader.readByte();
					reader.readByte();
				}

				count--;

				if (x >= S.RoomWidth || y >= S.RoomHeight) {
					continue;
				}

				const i = x + y * S.RoomWidth;

				switch (tile) {
					case(C.T_OBSTACLE):
						this.plot(i, 0x808080);
						break;
					case(C.T_TAR):
						this.plot(i, 0x0000C0);
						break;
				}
			}
		}
	}

	private plot(index: number, color: number) {
		UtilsBitmapData.blitRectangle(
			this.bitmapData,
			index % S.RoomWidth,
			index / S.RoomWidth | 0,
			1, 1,
			color | 0xFF000000,
		);
	}
}
