import {VOMinimapRoom} from "../managers/VOMinimapRoom";
import {Progress} from "../global/Progress";
import {attr, intAttr} from "../../XML";
import {Level} from "../global/Level";
import {BitmapDataWritable, C} from "../../C";
import {Game} from "../global/Game";
import {UtilsBitmapData} from "../../../src.framework/net/retrocade/utils/UtilsBitmapData";
import {S} from "../../S";
import {ASSERT} from "../../ASSERT";
import {Gfx} from "../global/Gfx";
import {UtilsBase64} from "../../../src.framework/net/retrocade/utils/UtilsBase64";
import {BinaryReader} from "csharp-binary-stream";
import { F } from "src/F";

const x = [14, 0];
const y = [448, 0];
const width = [130, 200];
const height = [138, 200];

const centerX = [
	x[0] + (width[0] - S.RoomWidth) / 2 | 0,
	x[1] + (width[1] - S.RoomWidth) / 2 | 0,
];
const centerY = [
	y[0] + (height[0] - S.RoomHeight) / 2 | 0,
	y[1] + (height[1] - S.RoomHeight) / 2 | 0,
];

export class TWidgetMinimap {
	public static readonly MODE_IN_GAME: number = 0;
	public static readonly MODE_RESTORE: number = 1;

	private static roomImages = new Map<number, VOMinimapRoom>();

	private static lastRoom: number;
	private static lastX: number;
	private static lastY: number;

	public static changedLevel(newLevelId: number) {
		TWidgetMinimap.roomImages = new Map();

		for (const roomId of Progress.getExploredRoomIdsByLevel(newLevelId)) {
			if (Progress.isRoomExplored(roomId)) {
				const roomData = new VOMinimapRoom(Level.getRoom(roomId));
				roomData.completed = Progress.isRoomConquered(roomId);
				TWidgetMinimap.roomImages.set(roomId, roomData);
			}
		}

		TWidgetMinimap.redrawAllRooms();
	}

	public static addRoom(roomID: number) {
		if (TWidgetMinimap.roomImages.has(roomID)) {
			return;
		}

		const roomData = new VOMinimapRoom(Level.getRoom(roomID));
		roomData.completed = Progress.isRoomConquered(roomID);
		TWidgetMinimap.roomImages.set(roomID, roomData);

		TWidgetMinimap.drawRoom(roomData, false);
	}

	public static plotWidget(roomID: number, mode: number, drawTo: BitmapDataWritable | null = null) {
		drawTo = drawTo || Game.room.layerUnder.bitmapData;

		TWidgetMinimap.clearUnder(drawTo, mode);

		const currentRoom: Element = Level.getRoom(roomID);

		const currentX: number = intAttr(currentRoom, 'RoomX');
		const currentY: number = intAttr(currentRoom, 'RoomY');

		for (const room of TWidgetMinimap.roomImages.values()) {
			TWidgetMinimap.plotRoomImage(room, currentX, currentY, mode, drawTo);
		}

		TWidgetMinimap.lastRoom = roomID;
		TWidgetMinimap.lastX = currentX;
		TWidgetMinimap.lastY = currentY;

		// Evil orange border of doom
		UtilsBitmapData.blitRectangle(drawTo, centerX[mode] - 2, centerY[mode] - 2, S.RoomWidth + 4, 2, 0xFFFF8800);
		UtilsBitmapData.blitRectangle(drawTo, centerX[mode] - 2, centerY[mode] + S.RoomHeight, S.RoomWidth + 4, 2, 0xFFFF8800);
		UtilsBitmapData.blitRectangle(drawTo, centerX[mode] - 2, centerY[mode], 2, S.RoomHeight, 0xFFFF8800);
		UtilsBitmapData.blitRectangle(drawTo, centerX[mode] + S.RoomWidth, centerY[mode], 2, S.RoomHeight, 0xFFFF8800);
	}

	public static updateRoomState(roomID: number, isConquerPending: boolean) {
		if (!TWidgetMinimap.roomImages.has(roomID)) {
			return;
		}

		const room = TWidgetMinimap.roomImages.get(roomID)!;
		ASSERT(room);

		room.completed = Progress.isRoomConquered(roomID);

		TWidgetMinimap.drawRoom(room, isConquerPending);
	}

	private static plotRoomImage(room: VOMinimapRoom, currentX: number, currentY: number, mode: number, drawTo: BitmapDataWritable) {
		let offX: number = intAttr(room.data, 'RoomX') - currentX;
		let offY: number = intAttr(room.data, 'RoomY') - currentY;

		offX = centerX[mode] + offX * S.RoomWidth;
		offY = centerY[mode] + offY * S.RoomHeight;

		let sourceX: number = 0;
		let sourceY: number = 0;
		let sourceWidth: number = S.RoomWidth;
		let sourceHeight: number = S.RoomHeight;

		if (offX < x[mode]) {
			sourceX = (x[mode] - offX);
			sourceWidth -= sourceX;
			offX = x[mode];

		} else if (offX + sourceWidth >= x[mode] + width[mode]) {
			sourceWidth -= sourceWidth + offX - x[mode] - width[mode];
		}

		if (offY < y[mode]) {
			sourceY = (y[mode] - offY);
			sourceHeight -= sourceY;
			offY = y[mode];

		} else if (offY + sourceHeight >= y[mode] + height[mode]) {
			sourceHeight -= sourceHeight + offY - y[mode] - height[mode];
		}

		if (sourceWidth > S.RoomWidth || sourceHeight > S.RoomHeight ||
			sourceX > width[mode] || sourceY > height[mode]) {
			return;
		}

		UtilsBitmapData.blitPart(room.bitmapData.canvas, drawTo, offX, offY, sourceX, sourceY, sourceWidth, sourceHeight);
	}

	private static clearUnder(drawTo: BitmapDataWritable, size: number) {
		if (size == TWidgetMinimap.MODE_IN_GAME) {
			UtilsBitmapData.blitPart(Gfx.IN_GAME_SCREEN, drawTo,
				x[size], y[size], x[size], y[size], width[size], height[size]);
		} else {
			UtilsBitmapData.blitRectangle(drawTo, x[size], y[size], width[size], height[size], 0);
		}
	}

	private static redrawAllRooms() {
		for (const i of TWidgetMinimap.roomImages.values()) {
			TWidgetMinimap.drawRoom(i, false);
		}
	}

	private static drawRoom(room: VOMinimapRoom, isExitPending: boolean = false) {
		const isRoomDarkened = !room.wasVisited;
		const isRoomRequired = attr(room.data, 'IsRequired') == "1";
		const isRoomCompleted = room.completed;

		let tile: number = 0;
		let i: number;
		let count: number = 0;

		const squaresBA = UtilsBase64.decodeByteArray(attr(room.data, 'Squares'));
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
						room.plot(i, isRoomDarkened ? 0x004040 : 0);
						break;
					case(C.T_STAIRS):
						room.plot(i, 0xD2D264);
						break;
					case(C.T_DOOR_Y):
						room.plot(i, 0xFFFF00);
						break;
					case(C.T_DOOR_YO):
						room.plot(i, 0xFFFFA4);
						break;
					case(C.T_DOOR_B):
						room.plot(i, 0x444444);
						break;
					case(C.T_DOOR_BO):
						room.plot(i, 0xC8C8C8);
						break;
					case(C.T_DOOR_G):
						room.plot(i, isRoomDarkened ? 0xB8B8B8 : 0x00FF00);
						break;
					case(C.T_DOOR_GO):
						room.plot(i, isRoomDarkened ? 0xB8B8B8 : 0x80FF80);
						break;
					case(C.T_DOOR_C):
						room.plot(i, isRoomDarkened ? 0xB8B8B8 : 0x00FFFF);
						break;
					case(C.T_DOOR_CO):
						room.plot(i, isRoomDarkened ? 0xB8B8B8 : 0xA4FFFF);
						break;
					case(C.T_TRAPDOOR):
						room.plot(i, 0xFF8080);
						break;
					case(C.T_DOOR_R):
						room.plot(i, 0xFF0000);
						break;
					case(C.T_DOOR_RO):
						room.plot(i, 0xFF4040);
						break;
					case(C.T_PIT):
						room.plot(i, 0x000080);
						break;
					default:
						if (isRoomDarkened) {
							room.plot(i, 0x664646);
						} else if (isRoomCompleted) {
							room.plot(i, 0xE5E5E5);
						} else if (isExitPending) {
							room.plot(i, 0x80FF80);
						} else if (isRoomRequired) {
							room.plot(i, 0xFF0000);
						} else {
							room.plot(i, 0xFF00FF);
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
						room.plot(i, 0x808080);
						break;
					case(C.T_TAR):
						room.plot(i, 0x0000C0);
						break;
				}
			}
		}
	}


	/****************************************************************************************************************/
	/**                                                                                             RESTORE SCREEN  */

	/****************************************************************************************************************/

	public static setRestoreScreenRoom(restoreToRoomId: number) {
		const roomState = Progress.getRoomEntranceState(restoreToRoomId);

		if (roomState == null) {
			return;
		}

		const conquered = roomState.conqueredRoomIds.concat();
		const explored = roomState.exploredRoomIds.concat();

		const levelId = Level.getLevelIdByRoomId(restoreToRoomId);

		TWidgetMinimap.roomImages.clear();

		for (const roomId of Level.getRoomIdsByLevel(levelId)) {
			if (Progress.wasRoomEverVisited(roomId)) {
				const roomData = new VOMinimapRoom(Level.getRoom(roomId));
				roomData.wasVisited = explored.indexOf(roomId) != -1 || roomState.roomId == roomId;
				roomData.completed = (
					conquered.indexOf(roomId) != -1
					|| !roomData.wasVisited
					|| !Level.roomHasMonsters(roomId)
				);

				TWidgetMinimap.roomImages.set(roomId, roomData);

				TWidgetMinimap.drawRoom(roomData, false);
			}
		}
	}

	public static getRoomOnClick(mouseX: number, mouseY: number, mode: number): Element | null {
		if (mouseX < x[mode] ||
			mouseY < y[mode] ||
			mouseX >= x[mode] + width[mode] ||
			mouseY >= y[mode] + height[mode]) {
			return null;
		}

		mouseX = Math.floor((mouseX - centerX[mode]) / S.RoomWidth);
		mouseY = Math.floor((mouseY - centerY[mode]) / S.RoomHeight);


		return Level.getRoomByPosition(TWidgetMinimap.lastX + mouseX, TWidgetMinimap.lastY + mouseY);
	}

	public static API_drawLevel(levelId: number) {
		const roomIds = Level.getRoomIdsByLevel(levelId);

		let minX = 0;
		let maxX = 0;
		let minY = 0;
		let maxY = 0;

		for (const roomId of roomIds) {
			const pos =  Level.getRoomOffsetInLevel(roomId);

			minX = Math.min(minX, pos.x);
			maxX = Math.max(maxX, pos.x + 1);
			minY = Math.min(minY, pos.y);
			maxY = Math.max(maxY, pos.y + 1);
		}

		const bd = F.newCanvasContext(S.RoomWidth * (maxX - minX), S.RoomHeight * (maxY - minY));

		for (const roomId of roomIds) {
			const pos = Level.getRoomOffsetInLevel(roomId);
			const room = new VOMinimapRoom(Level.getRoom(roomId));

			room.completed  = true;
			room.wasVisited = true;

			const roomX = (pos.x - minX) * S.RoomWidth;
			const roomY = (pos.y - minY) * S.RoomHeight;

			TWidgetMinimap.API_drawRoomForLevel(room, bd, roomX, roomY);
		}

		return bd;
	}

	private static API_drawRoomForLevel(room:VOMinimapRoom, bitmapData:CanvasRenderingContext2D, x:number, y:number):void {
		TWidgetMinimap.drawRoom(room, false);

		UtilsBitmapData.blit(room.bitmapData.canvas, bitmapData, x, y);

		room.bitmapData.canvas.width = 0;
		room.bitmapData.canvas.height = 0;
	}
}
