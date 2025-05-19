import {F} from "../../../F";
import {Gfx} from "../../global/Gfx";
import {TEffect} from "./TEffect";
import {S} from "../../../S";
import {C, CanvasImageSourceFragment} from "../../../C";
import {TStateGame} from "../../states/TStateGame";
import { Rectangle, Sprite, Texture } from "pixi.js";
import { Game } from "src/game/global/Game";

const EFFECT_DURATION = 20;

export class TEffectSwordSwing extends TEffect {
	private static _textures: Texture[];
	public static initialize() {
		TEffectSwordSwing._textures = [
			new Texture(Gfx.EffectsTexture.baseTexture, new Rectangle(0, 0, 22, 22)),
			new Texture(Gfx.EffectsTexture.baseTexture, new Rectangle(22, 0, 22, 22)),
			new Texture(Gfx.EffectsTexture.baseTexture, new Rectangle(44, 0, 22, 22)),
			new Texture(Gfx.EffectsTexture.baseTexture, new Rectangle(66, 0, 22, 22)),
			Texture.EMPTY,
			new Texture(Gfx.EffectsTexture.baseTexture, new Rectangle(88, 0, 22, 22)),
			new Texture(Gfx.EffectsTexture.baseTexture, new Rectangle(110, 0, 22, 22)),
			new Texture(Gfx.EffectsTexture.baseTexture, new Rectangle(132, 0, 22, 22)),
			new Texture(Gfx.EffectsTexture.baseTexture, new Rectangle(154, 0, 22, 22)),
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
