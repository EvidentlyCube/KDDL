import { IPointData, Rectangle, Sprite, Texture } from "pixi.js";
import { S } from "src/S";
import { Game } from "src/game/global/Game";
import { Gfx } from "../../global/Gfx";
import { VOOrb } from "../../managers/VOOrb";
import { TStateGame } from "../../states/TStateGame";
import { TEffect } from "./TEffect";
import { TEffectOrbBolts } from "./TEffectOrbBolts";

const DURATION: number = 7;

export class TEffectOrbHit extends TEffect {
	private static _texture: Texture;
	public static initialize() {
		TEffectOrbHit._texture = new Texture(Gfx.EffectsTexture.baseTexture, new Rectangle(22,22,22,22));
	}

	private _sprite: Sprite;

	private duration: number = 0;

	public constructor(_orbData: IPointData, _drawOrb: boolean) {
		super();

		this._sprite = new Sprite(TEffectOrbHit._texture);
		this._sprite.x = _orbData.x * S.RoomTileWidth + S.LEVEL_OFFSET_X;
		this._sprite.y = _orbData.y * S.RoomTileHeight + S.LEVEL_OFFSET_Y;

		if (_orbData instanceof VOOrb && _orbData.agents.length) {
			new TEffectOrbBolts(_orbData);
		}

		if (_drawOrb) {
			TStateGame.effectsUnder.add(this);
			Game.room.layerUnder.add(this._sprite);
		}
	}

	public update() {
		if (this.duration++ == DURATION) {
			this.end();
		}
	}

	public end() {
		super.end();

		TStateGame.effectsUnder.nullify(this);
		this._sprite.parent?.removeChild(this._sprite);
	}
}
