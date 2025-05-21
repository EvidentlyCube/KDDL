import { VOMinimapRoom } from "../managers/VOMinimapRoom";
import { Progress } from "../global/Progress";
import { Level } from "../global/Level";
import { UtilsBitmapData } from "../../../src.framework/net/retrocade/utils/UtilsBitmapData";
import { S } from "../../S";
import { ASSERT } from "../../ASSERT";
import { F } from "src/F";
import { Container, Graphics, Sprite, Texture } from "pixi.js";
import { intAttr } from "src/XML";

const x = [14, 12];
const y = [448, S.SIZE_GAME_HEIGHT - 208];
const width = [130, 196];
const height = [138, 196];

export class TWidgetMinimap {
	public static container = new Container();
	private static mask = new Sprite();
	private static minimapRooms = new Container();
	private static selectedRoom = new Graphics();

	public static readonly MODE_IN_GAME: number = 0;
	public static readonly MODE_RESTORE: number = 1;

	private static roomPidToImage = new Map<string, VOMinimapRoom>();

	private static lastX: number;
	private static lastY: number;

	public static init() {
		TWidgetMinimap.container.addChild(TWidgetMinimap.mask);
		TWidgetMinimap.container.addChild(TWidgetMinimap.minimapRooms);
		TWidgetMinimap.container.addChild(TWidgetMinimap.selectedRoom);

		TWidgetMinimap.mask.texture = Texture.WHITE;
		TWidgetMinimap.container.mask = TWidgetMinimap.mask;

		TWidgetMinimap.selectedRoom.beginFill(0xFF8800, 1);
		TWidgetMinimap.selectedRoom.drawRect(-2, -2, S.RoomWidth + 4, 2);
		TWidgetMinimap.selectedRoom.drawRect(-2, -2, 2, S.RoomHeight + 4);
		TWidgetMinimap.selectedRoom.drawRect(-2, S.RoomHeight, S.RoomWidth + 4, 2);
		TWidgetMinimap.selectedRoom.drawRect(S.RoomWidth, -2, 2, S.RoomHeight + 4);
	}

	public static changedLevel(newLevelId: number) {
		for (const room of this.roomPidToImage.values()) {
			room.teardown();
		}

		TWidgetMinimap.mask.width = width[0];
		TWidgetMinimap.mask.height = height[0];
		this.minimapRooms.removeChildren();

		TWidgetMinimap.roomPidToImage = new Map();

		for (const roomPid of Progress.getExploredRoomPidsByLevel(newLevelId)) {
			if (Progress.isRoomExplored(roomPid)) {
				this.addRoom(roomPid);
			}
		}
	}

	public static addRoom(roomPid: string) {
		if (TWidgetMinimap.roomPidToImage.has(roomPid)) {
			return;
		}

		const minimapRoom = new VOMinimapRoom(Level.getRoom(roomPid));
		minimapRoom.completed = Progress.isRoomConquered(roomPid);
		TWidgetMinimap.roomPidToImage.set(roomPid, minimapRoom);
		this.minimapRooms.addChild(minimapRoom);

		minimapRoom.regenerateBitmapData(false);
	}

	public static update(roomPid: string, mode: number) {
		const offset = Level.getRoomOffsetInLevel(roomPid);
		const room = Level.getRoom(roomPid);

		TWidgetMinimap.lastX = intAttr(room, 'RoomX', 0);
		TWidgetMinimap.lastY = intAttr(room, 'RoomY', 0);

		TWidgetMinimap.container.x = x[mode]
		TWidgetMinimap.container.y = y[mode]
		TWidgetMinimap.minimapRooms.x = width[mode] / 2 | 0;
		TWidgetMinimap.minimapRooms.y = height[mode] / 2 | 0;
		TWidgetMinimap.minimapRooms.x -= offset.x * S.RoomWidth + S.RoomWidth / 2;
		TWidgetMinimap.minimapRooms.y -= offset.y * S.RoomHeight + S.RoomHeight / 2;
		TWidgetMinimap.mask.width = width[mode];
		TWidgetMinimap.mask.height = height[mode];

		TWidgetMinimap.selectedRoom.x = width[mode] / 2 - S.RoomWidth / 2 | 0;
		TWidgetMinimap.selectedRoom.y = height[mode] / 2 - S.RoomHeight / 2 | 0;
	}

	public static updateRoomState(roomPid: string, isConquerPending: boolean) {
		if (!TWidgetMinimap.roomPidToImage.has(roomPid)) {
			return;
		}

		const room = TWidgetMinimap.roomPidToImage.get(roomPid)!;
		ASSERT(room);

		room.completed = Progress.isRoomConquered(roomPid);

		room.regenerateBitmapData(isConquerPending);
	}

	public static setRestoreScreenRoom(restoreToRoomPid: string) {
		const roomState = Progress.getRoomEntranceState(restoreToRoomPid);

		if (roomState == null) {
			return;
		}

		for (const room of this.roomPidToImage.values()) {
			room.teardown();
		}

		this.minimapRooms.removeChildren();

		const conquered = roomState.conqueredRoomPids;
		const explored = roomState.exploredRoomPids;

		const levelId = Level.getLevelIdByRoomPid(restoreToRoomPid);

		TWidgetMinimap.roomPidToImage.clear();

		for (const roomPid of Level.getRoomPidsByLevel(levelId)) {
			if (Progress.wasRoomEverVisited(roomPid)) {
				const minimapRoom = new VOMinimapRoom(Level.getRoom(roomPid));
				minimapRoom.wasVisited = explored.has(roomPid) || roomState.roomPid == roomPid;
				minimapRoom.completed = (
					conquered.has(roomPid)
					|| !minimapRoom.wasVisited
					|| !Level.roomHasMonsters(roomPid)
				);

				this.minimapRooms.addChild(minimapRoom);
				TWidgetMinimap.roomPidToImage.set(roomPid, minimapRoom);

				minimapRoom.regenerateBitmapData(false);
			}
		}
	}

	public static getRoomOnClick(mouseX: number, mouseY: number, mode: number): Element | undefined {
		if (
			mouseX < 0
			|| mouseY < 0
			|| mouseX >= width[mode]
			|| mouseY >= height[mode]
		) {
			return undefined;
		}

		mouseX = Math.floor((mouseX + S.RoomWidth / 2 - width[mode] / 2) / S.RoomWidth);
		mouseY = Math.floor((mouseY + S.RoomHeight / 2 - height[mode] / 2) / S.RoomHeight);

		return Level.getRoomByPosition(TWidgetMinimap.lastX + mouseX, TWidgetMinimap.lastY + mouseY);
	}

	public static API_drawLevel(levelId: number) {
		const roomIds = Level.getRoomPidsByLevel(levelId);

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
