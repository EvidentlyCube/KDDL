import * as PIXI from 'pixi.js';
import {RecamelEffectScreen} from "../../../src.framework/net/retrocade/camel/effects/RecamelEffectScreen";
import {UtilsBitmapData} from "../../../src.framework/net/retrocade/utils/UtilsBitmapData";
import {F} from "../../F";
import {Room} from "../global/Room";
import {C} from "../../C";
import {S} from "../../S";
import RawInput from "../../../src.tn/RawInput";
import {Level} from "../global/Level";
import {DrodInput} from "../global/DrodInput";

export class TEffectRoomSlide extends RecamelEffectScreen {

	public static instance: TEffectRoomSlide;

	private _oldRoomCanvas: HTMLCanvasElement;
	private _newRoomCanvas: HTMLCanvasElement;

	private _targetCanvasContext: CanvasRenderingContext2D;
	private _targetBaseTexture: PIXI.BaseTexture;
	private _targetTexture: PIXI.Texture;

	private _bitmap: PIXI.Sprite;


	private _direction: number = Number.MAX_VALUE;

	public constructor() {
		super(0);

		this.callback = this.onFinish;

		TEffectRoomSlide.instance = this;

		this._oldRoomCanvas = F.newCanvas(S.RoomWidthPixels, S.RoomHeightPixels);
		this._newRoomCanvas = F.newCanvas(S.RoomWidthPixels, S.RoomHeightPixels);
		this._targetCanvasContext = F.newCanvasContext(S.RoomWidthPixels, S.RoomHeightPixels);
		this._targetBaseTexture = new PIXI.BaseTexture(this._targetCanvasContext.canvas);
		this._targetTexture = new PIXI.Texture(this._targetBaseTexture);
		this._bitmap = new PIXI.Sprite(this._targetTexture);

		this._bitmap.x = S.LEVEL_OFFSET_X;
		this._bitmap.y = S.LEVEL_OFFSET_Y;

		this.layer.add2(this._bitmap);
	}

	public update() {
		if (this._direction == Number.MAX_VALUE) {
			this.finish();
			return;
		}

		super.update();

		switch (this._direction) {
			case(C.N):
				UtilsBitmapData.blitPart(this._oldRoomCanvas, this._targetCanvasContext,
					0, -this.interval * S.RoomHeightPixels | 0,
					0, 0,
					S.RoomWidthPixels, S.RoomHeightPixels);

				UtilsBitmapData.blitPart(this._newRoomCanvas, this._targetCanvasContext,
					0, S.RoomHeightPixels - this.interval * S.RoomHeightPixels,
					0, 0,
					S.RoomWidthPixels, S.RoomHeightPixels);
				break;

			case(C.S):
				UtilsBitmapData.blitPart(this._oldRoomCanvas, this._targetCanvasContext,
					0, this.interval * S.RoomHeightPixels,
					0, 0,
					S.RoomWidthPixels, S.RoomHeightPixels);

				UtilsBitmapData.blitPart(this._newRoomCanvas, this._targetCanvasContext,
					0, this.interval * S.RoomHeightPixels - S.RoomHeightPixels,
					0, 0,
					S.RoomWidthPixels, S.RoomHeightPixels);
				break;

			case(C.W):
				UtilsBitmapData.blitPart(this._oldRoomCanvas, this._targetCanvasContext,
					-this.interval * S.RoomWidthPixels, 0,
					0, 0,
					S.RoomWidthPixels, S.RoomHeightPixels);

				UtilsBitmapData.blitPart(this._newRoomCanvas, this._targetCanvasContext,
					S.RoomWidthPixels - this.interval * S.RoomWidthPixels, 0,
					0, 0,
					S.RoomWidthPixels, S.RoomHeightPixels);
				break;

			case(C.E):
				UtilsBitmapData.blitPart(this._oldRoomCanvas, this._targetCanvasContext,
					this.interval * S.RoomWidthPixels, 0,
					0, 0,
					S.RoomWidthPixels, S.RoomHeightPixels);

				UtilsBitmapData.blitPart(this._newRoomCanvas, this._targetCanvasContext,
					this.interval * S.RoomWidthPixels - S.RoomWidthPixels, 0,
					0, 0,
					S.RoomWidthPixels, S.RoomHeightPixels);
				break;
		}

		this.layer.moveToFront();
		this._targetBaseTexture.update();
	}

	private onFinish() {
		this.layer.removeLayer();
		TEffectRoomSlide.instance = undefined!;

		RawInput.flushAll();
		DrodInput.flush();
	}

	public setOld(room: Room) {
		UtilsBitmapData.drawPart(room.layerUnder.bitmapData.canvas, this._oldRoomCanvas.getContext('2d')!,
			0, 0,
			S.LEVEL_OFFSET_X, S.LEVEL_OFFSET_Y,
			S.RoomWidthPixels, S.RoomHeightPixels);
		UtilsBitmapData.drawPart(room.layerActive.bitmapData.canvas, this._oldRoomCanvas.getContext('2d')!,
			0, 0,
			0, 0,
			S.RoomWidthPixels, S.RoomHeightPixels);
	}

	public setNew(room: Room) {
		UtilsBitmapData.drawPart(room.layerUnder.bitmapData.canvas, this._newRoomCanvas.getContext('2d')!,
			0, 0,
			S.LEVEL_OFFSET_X, S.LEVEL_OFFSET_Y,
			S.RoomWidthPixels, S.RoomHeightPixels);
		UtilsBitmapData.drawPart(room.layerActive.bitmapData.canvas, this._newRoomCanvas.getContext('2d')!,
			0, 0,
			0, 0,
			S.RoomWidthPixels, S.RoomHeightPixels);
	}

	public start(prevRoom: number, newRoom: number) {
		const oldRoomPos = Level.getRoomOffsetInLevel(prevRoom);
		const newRoomPos = Level.getRoomOffsetInLevel(newRoom);

		const offset = new PIXI.Point(newRoomPos.x - oldRoomPos.x, newRoomPos.y - oldRoomPos.y);

		this.resetDuration(500);

		if (offset.x == 1) {
			this._direction = C.W;
		} else if (offset.x == -1) {
			this._direction = C.E;
		} else if (offset.y == 1) {
			this._direction = C.N;
		} else if (offset.y == -1) {
			this._direction = C.S;
		}

		this.update();
	}
}
