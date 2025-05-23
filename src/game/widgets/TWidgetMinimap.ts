import { Container, Graphics, Matrix, RenderTexture, Sprite, Texture } from "pixi.js";
import { F } from "src/F";
import { intAttr } from "src/XML";
import { ASSERT } from "../../ASSERT";
import { exposeValue, S } from "../../S";
import { Level } from "../global/Level";
import { Progress } from "../global/Progress";
import { VOMinimapRoom } from "../managers/VOMinimapRoom";
import { RecamelCore } from "src.framework/net/retrocade/camel/core/RecamelCore";

export class TWidgetMinimap extends Container {
	private readonly _roomPidToImage = new Map<string, VOMinimapRoom>();
	private readonly _maskSprite = new Sprite();
	private readonly _minimapRooms = new Container();
	private readonly _selectedRoomBorder = new Graphics();

	private lastX = Number.MAX_SAFE_INTEGER;
	private lastY = Number.MAX_SAFE_INTEGER;

	private _visibleWidth: number;
	private _visibleHeight: number;

	public constructor(visibleWidth: number, visibleHeight: number) {
		super();

		this._visibleWidth = visibleWidth;
		this._visibleHeight = visibleHeight;

		this.addChild(this._maskSprite);
		this.addChild(this._minimapRooms);
		this.addChild(this._selectedRoomBorder);

		this._maskSprite.texture = Texture.WHITE;
		this._maskSprite.width = this._visibleWidth;
		this._maskSprite.height = this._visibleHeight;

		this.mask = this._maskSprite;

		this._selectedRoomBorder.beginFill(0xFF8800, 1);
		this._selectedRoomBorder.drawRect(-2, -2, S.RoomWidth + 4, 2);
		this._selectedRoomBorder.drawRect(-2, -2, 2, S.RoomHeight + 4);
		this._selectedRoomBorder.drawRect(-2, S.RoomHeight, S.RoomWidth + 4, 2);
		this._selectedRoomBorder.drawRect(S.RoomWidth, -2, 2, S.RoomHeight + 4);

		exposeValue('TWidgetMinimap', TWidgetMinimap);
	}

	public changedLevel(newLevelId: number) {
		this._minimapRooms.removeChildren();

		for (const roomPid of Progress.getExploredRoomPidsByLevel(newLevelId)) {
			if (Progress.isRoomExplored(roomPid)) {
				this.addRoom(roomPid);
			}
		}
	}

	public addRoom(roomPid: string) {
		const cachedRoom = this._roomPidToImage.get(roomPid);
		if (cachedRoom) {
			this._minimapRooms.addChild(cachedRoom);
			return;
		}

		const minimapRoom = new VOMinimapRoom(roomPid, Level.getRoom(roomPid));
		minimapRoom.completed = Progress.isRoomConquered(roomPid);
		this._roomPidToImage.set(roomPid, minimapRoom);
		this._minimapRooms.addChild(minimapRoom);

		minimapRoom.regenerateBitmapData(false);
	}

	public update(roomPid: string) {
		const offset = Level.getRoomOffsetInLevel(roomPid);
		const room = Level.getRoomStrict(roomPid);

		if (!room) {
			return;
		}

		this.lastX = intAttr(room, 'RoomX', 0);
		this.lastY = intAttr(room, 'RoomY', 0);

		this._minimapRooms.x = this._visibleWidth / 2 | 0;
		this._minimapRooms.y = this._visibleHeight / 2 | 0;
		this._minimapRooms.x -= offset.x * S.RoomWidth + S.RoomWidth / 2;
		this._minimapRooms.y -= offset.y * S.RoomHeight + S.RoomHeight / 2;

		this._selectedRoomBorder.x = this._visibleWidth / 2 - S.RoomWidth / 2 | 0;
		this._selectedRoomBorder.y = this._visibleHeight / 2 - S.RoomHeight / 2 | 0;
	}

	public updateRoomState(roomPid: string, isConquerPending: boolean) {
		if (!this._roomPidToImage.has(roomPid)) {
			return;
		}

		const room = this._roomPidToImage.get(roomPid)!;
		ASSERT(room);

		room.completed = Progress.isRoomConquered(roomPid);

		room.regenerateBitmapData(isConquerPending);
	}

	public setRestoreScreenRoom(restoreToRoomPid: string) {
		const roomState = Progress.getRoomEntranceState(restoreToRoomPid);

		if (roomState == null) {
			return;
		}

		this._minimapRooms.removeChildren();

		const conquered = roomState.conqueredRoomPids;
		const explored = roomState.exploredRoomPids;

		const levelId = Level.getLevelIdByRoomPid(restoreToRoomPid);

		this._roomPidToImage.clear();

		for (const roomPid of Level.getRoomPidsByLevel(levelId)) {
			if (Progress.wasRoomEverVisited(roomPid)) {
				const minimapRoom = new VOMinimapRoom(roomPid, Level.getRoom(roomPid));
				minimapRoom.wasVisited = explored.has(roomPid) || roomState.roomPid == roomPid;
				minimapRoom.completed = (
					conquered.has(roomPid)
					|| !minimapRoom.wasVisited
					|| !Level.roomHasMonsters(roomPid)
				);

				this._minimapRooms.addChild(minimapRoom);
				this._roomPidToImage.set(roomPid, minimapRoom);

				minimapRoom.regenerateBitmapData(false);
			}
		}
	}

	public getRoomOnClick(mouseX: number, mouseY: number): Element | undefined {
		if (
			mouseX < 0
			|| mouseY < 0
			|| mouseX >= this._visibleWidth
			|| mouseY >= this._visibleHeight
		) {
			return undefined;
		}

		mouseX = Math.floor((mouseX + S.RoomWidth / 2 - this._visibleWidth / 2) / S.RoomWidth);
		mouseY = Math.floor((mouseY + S.RoomHeight / 2 - this._visibleHeight / 2) / S.RoomHeight);

		return Level.getRoomByPosition(this.lastX + mouseX, this.lastY + mouseY);
	}

	public API_drawLevel(levelId: number) {
		const roomPids = Level.getRoomPidsByLevel(levelId);

		let minX = 0;
		let maxX = 0;
		let minY = 0;
		let maxY = 0;

		for (const roomPid of roomPids) {
			const pos = Level.getRoomOffsetInLevel(roomPid);

			minX = Math.min(minX, pos.x);
			maxX = Math.max(maxX, pos.x + 1);
			minY = Math.min(minY, pos.y);
			maxY = Math.max(maxY, pos.y + 1);
		}

		const renderTexture = RenderTexture.create({
			width: S.RoomWidth * (maxX - minX),
			height: S.RoomHeight * (maxY - minY),
		});

		for (const roomPid of roomPids) {
			const pos = Level.getRoomOffsetInLevel(roomPid);
			const room = new VOMinimapRoom(roomPid, Level.getRoom(roomPid));

			room.completed = true;
			room.wasVisited = true;

			const roomX = (pos.x - minX) * S.RoomWidth;
			const roomY = (pos.y - minY) * S.RoomHeight;

			this.API_drawRoomForLevel(room, renderTexture, roomX, roomY);
		}

		const canvas = RecamelCore.extract.canvas(renderTexture)
		renderTexture.destroy(true);

		return canvas;
	}

	private API_drawRoomForLevel(room: VOMinimapRoom, renderTarget: RenderTexture, x: number, y: number): void {
		room.regenerateBitmapData(false);

		RecamelCore.renderer.render(room, {
			clear: false,
			renderTexture: renderTarget,
			transform: Matrix.IDENTITY.translate(x, y)
		});
	}
}
