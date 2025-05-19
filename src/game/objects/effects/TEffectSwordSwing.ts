import { Rectangle, Sprite, Texture } from "pixi.js";
import { Game } from "src/game/global/Game";
import { C } from "../../../C";
import { S } from "../../../S";
import { Gfx } from "../../global/Gfx";
import { TStateGame } from "../../states/TStateGame";
import { TEffect } from "./TEffect";

const EFFECT_DURATION = 20;

export class TEffectSwordSwing extends TEffect {
	private static _textures: Texture[];
	public static initialize() {
		TEffectSwordSwing._textures = [
			new Texture(Gfx.EffectsTexture.baseTexture, new Rectangle(1, 1, 22, 22)),
			new Texture(Gfx.EffectsTexture.baseTexture, new Rectangle(25, 1, 22, 22)),
			new Texture(Gfx.EffectsTexture.baseTexture, new Rectangle(49, 1, 22, 22)),
			new Texture(Gfx.EffectsTexture.baseTexture, new Rectangle(73, 1, 22, 22)),
			Texture.EMPTY,
			new Texture(Gfx.EffectsTexture.baseTexture, new Rectangle(97, 1, 22, 22)),
			new Texture(Gfx.EffectsTexture.baseTexture, new Rectangle(121, 1, 22, 22)),
			new Texture(Gfx.EffectsTexture.baseTexture, new Rectangle(145, 1, 22, 22)),
			new Texture(Gfx.EffectsTexture.baseTexture, new Rectangle(179, 1, 22, 22)),
		];
	}

	private _sprite: Sprite;

	public constructor(x: number, y: number, o: number) {
		super();

		this._sprite = new Sprite(TEffectSwordSwing._textures[o])
		this._sprite.x = x * S.RoomTileWidth + S.LEVEL_OFFSET_X;
		this._sprite.y = y * S.RoomTileHeight + S.LEVEL_OFFSET_Y;

		switch (o) {
			case(C.NW):
				this._sprite.x -= S.RoomTileWidth / 2;
				this._sprite.y -= S.RoomTileHeight;
				break;
			case(C.N):
				this._sprite.x += S.RoomTileWidth / 2;
				this._sprite.y -= S.RoomTileHeight;
				break;
			case(C.NE):
				this._sprite.x += S.RoomTileWidth;
				this._sprite.y -= S.RoomTileHeight / 2;
				break;
			case(C.E):
				this._sprite.x += S.RoomTileWidth;
				this._sprite.y += S.RoomTileHeight / 2;
				break;
			case(C.SE):
				this._sprite.x += S.RoomTileWidth / 2;
				this._sprite.y += S.RoomTileHeight;
				break;
			case(C.S):
				this._sprite.x -= S.RoomTileWidth / 2;
				this._sprite.y += S.RoomTileHeight;
				break;
			case(C.SW):
				this._sprite.x -= S.RoomTileWidth;
				this._sprite.y += S.RoomTileHeight / 2;
				break;
			case(C.W):
				this._sprite.x -= S.RoomTileWidth;
				this._sprite.y -= S.RoomTileHeight / 2;
				break;
		}

		TStateGame.effectsAbove.add(this);
		Game.room.layerSprites.addAt(this._sprite, 0);
	}

	public update() {
		this._sprite.alpha -= 1 / EFFECT_DURATION;

		if (this._sprite.alpha <= 0) {
			this.end();
		}
	}

	public end() {
		TStateGame.effectsAbove.nullify(this);
		this._sprite.parent?.removeChild(this._sprite);
	}
}
