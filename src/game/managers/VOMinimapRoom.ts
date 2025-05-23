import { BinaryReader } from "csharp-binary-stream";
import { Container, Sprite, Texture } from "pixi.js";
import { UtilsBase64 } from "src.framework/net/retrocade/utils/UtilsBase64";
import { C } from "src/C";
import { attr } from "src/XML";
import { S } from "../../S";
import { Level } from "../global/Level";
import { MinimapRoomRenderer } from "./MinimapRoomRenderer";

export enum VOMinimapRoomState {
	Cleared = 0,
	PendingClear = 1,
	Dangerous = 2,
	Hidden = 3,
	Safe = 4,
}
export class VOMinimapRoom extends Sprite {
	private _roomPid: string;
	private _roomXml: Element;

	public wasVisited: boolean = true;
	public completed: boolean = false;

	public constructor(roomPid: string, roomXml: Element) {
		super();

		this._roomPid = roomPid
		this._roomXml = roomXml;

		const offset = Level.getRoomOffsetInLevel(attr(roomXml, 'RoomPID'));
		this.x = offset.x * S.RoomWidth;
		this.y = offset.y * S.RoomHeight;
	}

	private getRoomState(isExitPending: boolean) :VOMinimapRoomState {
		if (!this.wasVisited) {
			return VOMinimapRoomState.Hidden;

		} else if (this.completed) {
			return VOMinimapRoomState.Cleared;

		} else if (isExitPending) {
			return VOMinimapRoomState.PendingClear;

		} else if (attr(this._roomXml, 'IsRequired') === "1") {
			return VOMinimapRoomState.Dangerous;

		} else {
			return VOMinimapRoomState.Safe;
		}
	}
	public regenerateBitmapData(isExitPending: boolean = false) {
		const state = this.getRoomState(isExitPending);
		const cachedTexture = MinimapRoomRenderer.getCachedMinimapTexture(this._roomPid, state);
		if (cachedTexture) {
			this.texture = cachedTexture;
			return;
		}

		const pixels = new Container();

		const isRoomDarkened = state === VOMinimapRoomState.Hidden;

		let tile: number = 0;
		let i: number;
		let count: number = 0;

		const squaresBA = UtilsBase64.decodeByteArray(attr(this._roomXml, 'Squares'));
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
						this.plot(pixels, i, isRoomDarkened ? 0x004040 : 0);
						break;
					case(C.T_STAIRS):
						this.plot(pixels, i, 0xD2D264);
						break;
					case(C.T_DOOR_Y):
						this.plot(pixels, i, 0xFFFF00);
						break;
					case(C.T_DOOR_YO):
						this.plot(pixels, i, 0xFFFFA4);
						break;
					case(C.T_DOOR_B):
						this.plot(pixels, i, 0x444444);
						break;
					case(C.T_DOOR_BO):
						this.plot(pixels, i, 0xC8C8C8);
						break;
					case(C.T_DOOR_G):
						this.plot(pixels, i, isRoomDarkened ? 0xB8B8B8 : 0x00FF00);
						break;
					case(C.T_DOOR_GO):
						this.plot(pixels, i, isRoomDarkened ? 0xB8B8B8 : 0x80FF80);
						break;
					case(C.T_DOOR_C):
						this.plot(pixels, i, isRoomDarkened ? 0xB8B8B8 : 0x00FFFF);
						break;
					case(C.T_DOOR_CO):
						this.plot(pixels, i, isRoomDarkened ? 0xB8B8B8 : 0xA4FFFF);
						break;
					case(C.T_TRAPDOOR):
						this.plot(pixels, i, 0xFF8080);
						break;
					case(C.T_DOOR_R):
						this.plot(pixels, i, 0xFF0000);
						break;
					case(C.T_DOOR_RO):
						this.plot(pixels, i, 0xFF4040);
						break;
					case(C.T_PIT):
						this.plot(pixels, i, 0x000080);
						break;
					default:
						switch (state) {
							case VOMinimapRoomState.Hidden:
								this.plot(pixels, i, 0x664646);
								break;

							case VOMinimapRoomState.Cleared:
								this.plot(pixels, i, 0xE5E5E5);
								break;

							case VOMinimapRoomState.PendingClear:
								this.plot(pixels, i, 0x80FF80);
								break;

							case VOMinimapRoomState.Dangerous:
								this.plot(pixels, i, 0xFF0000);
								break;

							case VOMinimapRoomState.Safe:
							default:
								this.plot(pixels, i, 0xFF00FF);
								break;
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
						this.plot(pixels, i, 0x808080);
						break;
					case(C.T_TAR):
						this.plot(pixels, i, 0x0000C0);
						break;
				}
			}
		}

		this.texture = MinimapRoomRenderer.updateMinimapTexture(this._roomPid, state, pixels);
	}

	private plot(pixels: Container, index: number, color: number) {
		const pixel = new Sprite(Texture.WHITE);
		pixel.x = index % S.RoomWidth;
		pixel.y = index / S.RoomWidth;
		pixel.width = 1;
		pixel.height = 1;
		pixel.tint = color;

		pixels.addChild(pixel);
	}
}
