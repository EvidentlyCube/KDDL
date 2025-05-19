
import { Container, Rectangle, Sprite, Texture } from "pixi.js";
import { TGameObject } from "../objects/TGameObject";
import { Gfx } from "./Gfx";
import { T } from "src/T";
import { S } from "src/S";
import { VOSwordDraw } from "../managers/VOSwordDraw";

const textures: Texture[] = [];
export class RoomSpritesRenderer extends Container {
	private _spritesContainer: Container;
	private _swordsContainer: Container;

	private _objectToSprite = new Map<TGameObject, Sprite>();
	private _swordSprites: Sprite[] = [];
	private _swordDraws: VOSwordDraw[] = [];

	public constructor() {
		super();

		this.addChild(
			this._spritesContainer = new Container(),
			this._swordsContainer = new Container(),
		)

		const mask = new Sprite(Texture.WHITE);
		mask.width = S.RoomWidthPixels;
		mask.height = S.RoomHeightPixels;

		this.addChild(mask);
		this.mask = mask;
	}

	public clearSprites() {
		this._spritesContainer.removeChildren();
		this._swordsContainer.removeChildren();
		this._objectToSprite.clear();
		this._swordDraws.length = 0;
		this._swordSprites.length = 0;
	}

	public destroyObject(object: TGameObject) {
		const sprite = this._objectToSprite.get(object);

		if (sprite) {
			this._spritesContainer.removeChild(sprite);
		}
	}

	public registerSwordDraw(swordDraw: VOSwordDraw) {
		this._swordDraws.push(swordDraw);
	}

	public resetSwordDraws() {
		this._swordDraws.length = 0;
	}

	public renderObject(
		object: TGameObject,
		tileId: number,
		prevX: number,
		prevY: number,
		x: number,
		y: number
	) {
		let sprite = this._objectToSprite.get(object);

		if (!sprite) {
			sprite = new Sprite();

			this._objectToSprite.set(object, sprite);
			this._spritesContainer.addChild(sprite);
		}

		sprite.texture = this.getTexture(tileId);
		sprite.x = x * S.RoomTileWidth + (prevX - x) * TGameObject.offset * S.RoomTileWidth;
		sprite.y = y * S.RoomTileHeight + (prevY - y) * TGameObject.offset * S.RoomTileHeight;
	}

	public setObjectAlpha(object: TGameObject, alpha: number) {
		const sprite = this._objectToSprite.get(object);

		if (sprite) {
			sprite.alpha = alpha;
			sprite.visible = alpha > 0;
		}
	}

	public renderSwords() {
		for (let i = 0; i < this._swordDraws.length; i++) {
			const swordDraw = this._swordDraws[i];
			let sprite = this._swordSprites[i];

			if (!sprite) {
				sprite = new Sprite();
				this._swordsContainer.addChild(sprite);
				this._swordSprites[i] = sprite;
			}

			sprite.texture = this.getTexture(swordDraw.tileId);
			sprite.x = swordDraw.x;
			sprite.y = swordDraw.y;
		}

		if (this._swordDraws.length < this._swordSprites.length) {
			for (let i = this._swordDraws.length; i < this._swordSprites.length; i++) {
				this._swordsContainer.removeChild(this._swordSprites[i]);
			}
			this._swordSprites.length = this._swordDraws.length;
		}
	}

	private getTexture(tileId: number) {
		return textures[tileId]
			?? (textures[tileId] = new Texture(Gfx.GeneralTilesTexture.baseTexture, T.TILES[tileId]))
	}
}