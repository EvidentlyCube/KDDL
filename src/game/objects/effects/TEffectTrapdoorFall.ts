import {TEffect} from "./TEffect";
import {S} from "../../../S";
import {TStateGame} from "../../states/TStateGame";
import {C} from "../../../C";
import { Rectangle, Sprite, Texture } from "pixi.js";
import { Game } from "src/game/global/Game";
import { DROD } from "src/game/global/DROD";

const DURATION = S.RoomTileHeight;

export class TEffectTrapdoorFall extends TEffect {
	private tileX: number;
	private tileY: number;

	private fall: number = 0;
	private _sprite: Sprite;

	public constructor(x: number, y: number) {
		super();

		this._sprite = new Sprite(new Texture(
			this.room.roomTileRenderer.tilesTexture,
			new Rectangle(176, 242, S.RoomTileWidth, S.RoomTileHeight)
		));
		this.tileX = x;
		this.tileY = y;

		this._sprite.x = x * S.RoomTileWidth + S.LEVEL_OFFSET_X;
		this._sprite.y = y * S.RoomTileHeight + S.LEVEL_OFFSET_Y;

		TStateGame.effectsUnder.add(this);
		Game.room.layerSprites.addAt(this._sprite, 0);
	}

	public update() {
		if (this.fall++ == DURATION) {
			this.end();
			return;
		}

		this._sprite.y += 1.5;
		this._sprite.alpha = 1 - (this.fall / DURATION);
		this.tileY = (this._sprite.y - S.LEVEL_OFFSET_Y) / S.RoomTileHeight | 0;

		if (this.room.tilesOpaque[this.tileX + this.tileY * S.RoomWidth] != C.T_PIT) {
			this.end();
			return;
		}

		this.tileY++;

		if (this.room.tilesOpaque[this.tileX + this.tileY * S.RoomWidth] !== C.T_PIT) {
			this.updateCut();
		}
	}

	public end() {
		TStateGame.effectsUnder.nullify(this);
		this._sprite.parent?.removeChild(this._sprite);
	}

	private updateCut() {
		const inTileY = (this._sprite.y - S.LEVEL_OFFSET_Y) % S.RoomTileHeight;
		const height = S.RoomTileHeight - inTileY;

		this._sprite.texture.frame.height = S.RoomTileHeight - inTileY;
		this._sprite.texture.updateUvs()

	}
}
