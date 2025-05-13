import * as PIXI from 'pixi.js';
import {TEffect} from "./TEffect";
import {TStateGame} from "../../states/TStateGame";
import {VOCoord} from "../../managers/VOCoord";
import {F} from "../../../F";
import {UtilsBitmapData} from "../../../../src.framework/net/retrocade/utils/UtilsBitmapData";
import {S} from "../../../S";

export class TEffectBump extends TEffect {
	private static _currentBump: TEffectBump;

	public static onCommandProcessed() {
		if (TEffectBump._currentBump) {
			TEffectBump._currentBump.release();
			TStateGame.effectsUnder.nullify(TEffectBump._currentBump);
		}
	}

	private _x: number;
	private _y: number;
	private _hideOn: number;

	private _canvas: HTMLCanvasElement;
	private _texture: PIXI.Texture;

	public constructor(coord: VOCoord) {
		super();

		this._canvas = F.newCanvas(S.RoomTileWidth, S.RoomTileHeight);
		this._texture = new PIXI.Texture(new PIXI.BaseTexture(this._canvas));

		const x: number = coord.x;
		const y: number = coord.y;
		const o: number = coord.o;

		UtilsBitmapData.blitPart(this.room.layerUnder.bitmapData.canvas, this._canvas.getContext('2d')!,
			0, 0,
			S.LEVEL_OFFSET_X + x * S.RoomTileWidth, S.LEVEL_OFFSET_Y + y * S.RoomTileHeight,
			S.RoomTileWidth, S.RoomTileHeight);

		this._x = x * S.RoomTileWidth + F.getOX(o);
		this._y = y * S.RoomTileHeight + F.getOY(o);

		this._hideOn = Date.now() + 250;

		TStateGame.effectsUnder.add(this);

		TEffectBump._currentBump = this;
	}

	public update() {
		if (Date.now() > this._hideOn) {
			this.release();
			TStateGame.effectsUnder.nullify(this);
		} else {
			this.room.layerActive.blitDirectly(this._canvas, this._x, this._y);
		}
	}

	public release() {
		this._texture.destroy(true);
	}

}
