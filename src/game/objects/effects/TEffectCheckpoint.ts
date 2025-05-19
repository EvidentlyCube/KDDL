import { Rectangle, Sprite, Texture } from "pixi.js";
import { Game } from "src/game/global/Game";
import { S } from "src/S";
import { Gfx } from "../../global/Gfx";
import { VOCoord } from "../../managers/VOCoord";
import { TStateGame } from "../../states/TStateGame";
import { TEffect } from "./TEffect";

const DURATION = 120;

export class TEffectCheckpoint extends TEffect {
	private static _texture: Texture;

	public static initialize() {
		TEffectCheckpoint._texture = new Texture(Gfx.EffectsTexture.baseTexture, new Rectangle(1, 25, 22, 22));
	}
	private _sprite: Sprite;
	private _duration: number = 0;

	public constructor(position: VOCoord) {
		super();

		this._sprite = new Sprite(TEffectCheckpoint._texture);
		this._sprite.x = position.x * S.RoomTileWidth + S.LEVEL_OFFSET_X;
		this._sprite.y = position.y * S.RoomTileHeight + S.LEVEL_OFFSET_Y;

		TStateGame.effectsUnder.add(this);
		Game.room.layerUnder.add(this._sprite);
	}

	public update() {
		if (this._duration++ == DURATION) {
			TStateGame.effectsUnder.nullify(this);
			this.end();
			return;
		}

		this._sprite.alpha = (DURATION - this._duration) / DURATION;
	}

	public end() {
		this._sprite.parent?.removeChild(this._sprite);
	}
}
