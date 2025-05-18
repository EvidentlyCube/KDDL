import { VOMinimapRoom } from "../managers/VOMinimapRoom";
import { Progress } from "../global/Progress";
import { Level } from "../global/Level";
import { BitmapDataWritable, C } from "../../C";
import { Game } from "../global/Game";
import { UtilsBitmapData } from "../../../src.framework/net/retrocade/utils/UtilsBitmapData";
import { S } from "../../S";
import { ASSERT } from "../../ASSERT";
import { F } from "src/F";
import { Container, Graphics, Sprite, Texture } from "pixi.js";

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
	public static container = new Container();
	private static mask = new Sprite();
	private static minimapRooms = new Container();

	public static readonly MODE_IN_GAME: number = 0;
	public static readonly MODE_RESTORE: number = 1;

	private static roomImages = new Map<number, VOMinimapRoom>();

	private static lastX: number;
	private static lastY: number;

	public static init() {
		TWidgetMinimap.container.addChild(TWidgetMinimap.mask);
		TWidgetMinimap.container.addChild(TWidgetMinimap.minimapRooms);

		TWidgetMinimap.mask.texture = Texture.WHITE;
		TWidgetMinimap.container.mask = TWidgetMinimap.mask;
	}

	public static changedLevel(newLevelId: number) {
		for (const room of this.roomImages.values()) {
			room.teardown();
		}

		TWidgetMinimap.mask.width = width[0];
		TWidgetMinimap.mask.height = height[0];
		this.minimapRooms.removeChildren();

		TWidgetMinimap.roomImages = new Map();

		for (const roomId of Progress.getExploredRoomIdsByLevel(newLevelId)) {
			if (Progress.isRoomExplored(roomId)) {
				this.addRoom(roomId);
			}
		}
	}

	public static addRoom(roomID: number) {
		if (TWidgetMinimap.roomImages.has(roomID)) {
			return;
		}

		const minimapRoom = new VOMinimapRoom(Level.getRoom(roomID));
		minimapRoom.completed = Progress.isRoomConquered(roomID);
		TWidgetMinimap.roomImages.set(roomID, minimapRoom);
		this.minimapRooms.addChild(minimapRoom);

		minimapRoom.regenerateBitmapData(false);
	}

	public static plotWidget(roomId: number, mode: number) {
		const offset = Level.getRoomOffsetInLevel(roomId);

		TWidgetMinimap.container.x = x[mode]
		TWidgetMinimap.container.y = y[mode]
		TWidgetMinimap.minimapRooms.x = width[mode] / 2 | 0;
		TWidgetMinimap.minimapRooms.y = height[mode] / 2 | 0;
		TWidgetMinimap.minimapRooms.x -= offset.x * S.RoomWidth + S.RoomWidth / 2;
		TWidgetMinimap.minimapRooms.y -= offset.y * S.RoomHeight + S.RoomHeight / 2;
	}

	public static updateRoomState(roomID: number, isConquerPending: boolean) {
		if (!TWidgetMinimap.roomImages.has(roomID)) {
			return;
		}

		const room = TWidgetMinimap.roomImages.get(roomID)!;
		ASSERT(room);

		room.completed = Progress.isRoomConquered(roomID);

		room.regenerateBitmapData(isConquerPending);
	}

	public static setRestoreScreenRoom(restoreToRoomId: number) {
		const roomState = Progress.getRoomEntranceState(restoreToRoomId);

		if (roomState == null) {
			return;
		}

		for (const room of this.roomImages.values()) {
			room.teardown();
		}

		this.minimapRooms.removeChildren();

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

				roomData.regenerateBitmapData(false);
			}
		}
	}

	public static getRoomOnClick(mouseX: number, mouseY: number, mode: number): Element | null {
		// @FIXME - replace with
		if (
			mouseX < x[mode]
			|| mouseY < y[mode]
			|| mouseX >= x[mode] + width[mode]
			|| mouseY >= y[mode] + height[mode]
		) {
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
			const pos = Level.getRoomOffsetInLevel(roomId);

			minX = Math.min(minX, pos.x);
			maxX = Math.max(maxX, pos.x + 1);
			minY = Math.min(minY, pos.y);
			maxY = Math.max(maxY, pos.y + 1);
		}

		const bd = F.newCanvasContext(S.RoomWidth * (maxX - minX), S.RoomHeight * (maxY - minY));

		for (const roomId of roomIds) {
			const pos = Level.getRoomOffsetInLevel(roomId);
			const room = new VOMinimapRoom(Level.getRoom(roomId));

			room.completed = true;
			room.wasVisited = true;

			const roomX = (pos.x - minX) * S.RoomWidth;
			const roomY = (pos.y - minY) * S.RoomHeight;

			TWidgetMinimap.API_drawRoomForLevel(room, bd, roomX, roomY);
		}

		return bd;
	}

	private static API_drawRoomForLevel(room: VOMinimapRoom, bitmapData: CanvasRenderingContext2D, x: number, y: number): void {
		room.regenerateBitmapData(false);

		UtilsBitmapData.blit(room.bitmapData.canvas, bitmapData, x, y);

		room.bitmapData.canvas.width = 0;
		room.bitmapData.canvas.height = 0;
	}
}
