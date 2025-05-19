import {TEffect} from "./TEffect";
import {TStateGame} from "../../states/TStateGame";
import {S} from "../../../S";
import { Sprite, Texture } from "pixi.js";
import { Game } from "src/game/global/Game";

export class TEffectsPlayerDeathFade extends TEffect {
	private timeFrom: number;
	private timeTo: number;
	private _sprite: Sprite;

	public constructor() {
		super();

		TStateGame.effectsAbove.add(this);

		this._sprite = new Sprite(Texture.WHITE);;
		this._sprite.x = S.LEVEL_OFFSET_X;
		this._sprite.y = S.LEVEL_OFFSET_Y;
		this._sprite.width = S.RoomWidthPixels;
		this._sprite.height = S.RoomHeightPixels;
		this._sprite.tint = 0;
		this._sprite.alpha = 0;

		this.timeFrom = Date.now();
		this.timeTo = this.timeFrom + 2500;

		Game.room.layerSprites.add(this._sprite);
	}

	public update() {
		this._sprite.alpha = 1 - (this.timeTo - Date.now()) / (this.timeTo - this.timeFrom);

		if (Date.now() > this.timeTo) {
			TStateGame.instance.restartCommand();
		}
	}

	public end() {
		TStateGame.effectsAbove.nullify(this);
		this._sprite.parent?.removeChild(this._sprite);
	}
}
