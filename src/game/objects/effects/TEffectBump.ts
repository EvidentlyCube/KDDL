import {TEffect} from "./TEffect";
import {TStateGame} from "../../states/TStateGame";
import {VOCoord} from "../../managers/VOCoord";
import {F} from "../../../F";
import {UtilsBitmapData} from "../../../../src.framework/net/retrocade/utils/UtilsBitmapData";
import {S} from "../../../S";
import { BaseTexture, Matrix, RenderTexture, Sprite, Texture } from "pixi.js";
import { RecamelCore } from "src.framework/net/retrocade/camel/core/RecamelCore";
import { Game } from "src/game/global/Game";

export class TEffectBump extends TEffect {
	private static _bumpTexture?: RenderTexture;
	private static _bumpSprite?: Sprite;
	private static _currentBump: TEffectBump;

	public static onCommandProcessed() {
		if (TEffectBump._currentBump) {
			TEffectBump._currentBump.release();
			TStateGame.effectsUnder.nullify(TEffectBump._currentBump);
		}
	}

	private _hideOn: number;

	private _bumpTexture: RenderTexture;
	private _bumpSprite: Sprite;

	public constructor(coord: VOCoord) {
		super();

		this._bumpTexture = TEffectBump._bumpTexture ?? RenderTexture.create({
			width: S.RoomTileWidth,
			height: S.RoomTileHeight,
		});
		this._bumpSprite = TEffectBump._bumpSprite ?? new Sprite(this._bumpTexture);

		TEffectBump._bumpTexture = this._bumpTexture;
		TEffectBump._bumpSprite = this._bumpSprite;

		RecamelCore.renderer.render(this.room.layerUnder.displayObject, {
			clear: true,
			renderTexture: this._bumpTexture,
			transform: Matrix.IDENTITY.translate(
				-(S.LEVEL_OFFSET_X + coord.x * S.RoomTileWidth),
				-(S.LEVEL_OFFSET_Y + coord.y * S.RoomTileHeight),
			)
		})

		this._bumpSprite.x = S.LEVEL_OFFSET_X + coord.x * S.RoomTileWidth + F.getOX(coord.o);
		this._bumpSprite.y = S.LEVEL_OFFSET_Y + coord.y * S.RoomTileHeight + F.getOY(coord.o);

		this._hideOn = Date.now() + 250;

		TStateGame.effectsUnder.add(this);
		this.room.layerUnder.add(this._bumpSprite);

		TEffectBump._currentBump = this;
	}

	public update() {
		if (Date.now() > this._hideOn) {
			this.release();
			TStateGame.effectsUnder.nullify(this);
		}
	}

	public release() {
		this.room.layerUnder.remove(this._bumpSprite);
	}

}
