import { Matrix, RenderTexture, Sprite, Texture } from "pixi.js";
import { RecamelCore } from "src.framework/net/retrocade/camel/core/RecamelCore";
import { RecamelEffectScreen } from "../../../src.framework/net/retrocade/camel/effects/RecamelEffectScreen";
import RawInput from "../../../src.tn/RawInput";
import { C } from "../../C";
import { S } from "../../S";
import { DrodInput } from "../global/DrodInput";
import { Level } from "../global/Level";
import { Room } from "../global/Room";

export class TEffectRoomSlide extends RecamelEffectScreen {

	public static instance: TEffectRoomSlide;

	private static _oldRoomTexture: RenderTexture;
	private static _newRoomTexture: RenderTexture;


	private _oldRoom: Sprite;
	private _newRoom: Sprite;
	private _mask: Sprite;

	private _direction: number = Number.MAX_VALUE;

	public static initialize() {
		TEffectRoomSlide._oldRoomTexture = RenderTexture.create({
			width: S.RoomWidthPixels,
			height: S.RoomHeightPixels,
		});
		TEffectRoomSlide._newRoomTexture = RenderTexture.create({
			width: S.RoomWidthPixels,
			height: S.RoomHeightPixels,
		});
	}

	public constructor() {
		super(0);

		this.callback = this.onFinish;

		TEffectRoomSlide.instance = this;

		this._oldRoom = new Sprite(TEffectRoomSlide._oldRoomTexture);
		this._newRoom = new Sprite(TEffectRoomSlide._newRoomTexture);
		this._mask = new Sprite(Texture.WHITE);

		this.layer.add(this._oldRoom);
		this.layer.add(this._newRoom);
		this.layer.add(this._mask);

		this.layer.displayObject.mask = this._mask;
		this.layer.displayObject.x = S.LEVEL_OFFSET_X;
		this.layer.displayObject.y = S.LEVEL_OFFSET_Y;

		this._mask.width = S.RoomWidthPixels;
		this._mask.height = S.RoomHeightPixels;
	}

	public update() {
		if (this._direction == Number.MAX_VALUE) {
			this.finish();
			return;
		}

		super.update();

		switch (this._direction) {
			case (C.N):
				this._oldRoom.y = -this.interval * S.RoomHeightPixels | 0;
				this._newRoom.y = S.RoomHeightPixels - this.interval * S.RoomHeightPixels | 0;
				break;

			case (C.S):
				this._oldRoom.y = this.interval * S.RoomHeightPixels | 0;
				this._newRoom.y = this.interval * S.RoomHeightPixels - S.RoomHeightPixels | 0;
				break;

			case (C.W):
				this._oldRoom.x = -this.interval * S.RoomWidthPixels | 0;
				this._newRoom.x = S.RoomWidthPixels - this.interval * S.RoomWidthPixels | 0;
				break;

			case (C.E):
				this._oldRoom.x = this.interval * S.RoomWidthPixels | 0;
				this._newRoom.x = this.interval * S.RoomWidthPixels - S.RoomWidthPixels | 0;
				break;
		}

		this.layer.moveToFront();
	}

	private onFinish() {
		this.layer.removeLayer();
		TEffectRoomSlide.instance = undefined!;

		RawInput.flushAll();
		DrodInput.flush();
	}

	public setOld(room: Room) {
		RecamelCore.renderer.render(room.layerUnderTextured.displayObject, {
			renderTexture: TEffectRoomSlide._oldRoomTexture,
			transform: Matrix.IDENTITY.translate(-S.LEVEL_OFFSET_X, -S.LEVEL_OFFSET_Y),
			clear: true,
		});
		RecamelCore.renderer.render(room.layerActive.displayObject, {
			renderTexture: TEffectRoomSlide._oldRoomTexture,
			transform: Matrix.IDENTITY.translate(-S.LEVEL_OFFSET_X, -S.LEVEL_OFFSET_Y),
			clear: false,
		});
	}

	public setNew(room: Room) {
		RecamelCore.renderer.render(room.layerUnderTextured.displayObject, {
			renderTexture: TEffectRoomSlide._newRoomTexture,
			transform: Matrix.IDENTITY.translate(-S.LEVEL_OFFSET_X, -S.LEVEL_OFFSET_Y),
			clear: true,
		});
		RecamelCore.renderer.render(room.layerActive.displayObject, {
			renderTexture: TEffectRoomSlide._newRoomTexture,
			transform: Matrix.IDENTITY.translate(-S.LEVEL_OFFSET_X, -S.LEVEL_OFFSET_Y),
			clear: false,
		});
	}

	public start(prevRoom: number, newRoom: number) {
		const oldRoomPos = Level.getRoomOffsetInLevel(prevRoom);
		const newRoomPos = Level.getRoomOffsetInLevel(newRoom);

		const offsetX = newRoomPos.x - oldRoomPos.x;
		const offsetY = newRoomPos.y - oldRoomPos.y;

		this.resetDuration(500);

		if (offsetX == 1) {
			this._direction = C.W;
		} else if (offsetX == -1) {
			this._direction = C.E;
		} else if (offsetY == 1) {
			this._direction = C.N;
		} else if (offsetY == -1) {
			this._direction = C.S;
		}

		this.update();
	}
}
