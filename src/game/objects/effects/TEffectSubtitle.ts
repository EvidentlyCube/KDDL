import { Container, IPointData, Point, Sprite, Texture } from "pixi.js";
import { Game } from "src/game/global/Game";
import { Text } from "../../../../src.framework/net/retrocade/standalone/Text";
import { UtilsNumber } from "../../../../src.framework/net/retrocade/utils/UtilsNumber";
import { UtilsString } from "../../../../src.framework/net/retrocade/utils/UtilsString";
import { S } from "../../../S";
import { Make } from "../../global/Make";
import { TStateGame } from "../../states/TStateGame";
import { TWidgetSpeech } from "../../widgets/TWidgetSpeech";
import { TGameObject } from "../TGameObject";
import { TEffect } from "./TEffect";

const UPDATE_FACTOR = 10;
const BORDER_THICKNESS = 2;

export class TEffectSubtitle extends TEffect {
	private _container: Container;
	private _border: Sprite;
	private _background: Sprite;

	private xOffset: number = 0;
	private yOffset: number = 0;

	private w: number = 0;
	private h: number = 0;

	private textField: Text;

	private timeWhenEnabled: number = 0;

	private displayLines: number;
	private maxWidth: number;
	private duration: number;

	private fgColor: number;
	public coords: TGameObject;

	private _wasPositionSetYet = false;

	public constructor(
		coord: TGameObject,
		text: string,
		fgColor: number,
		bgColor: number,
		duration: number = 2000,
		displayLines: number = 3,
		maxWidth: number = 0,
	) {
		super();

		this._container = new Container();
		this._container.addChild(
			this._border = new Sprite(Texture.WHITE),
			this._background = new Sprite(Texture.WHITE),
			this.textField = Make.text(19),
		);

		this._border.tint = 0x000000;
		this._background.tint = bgColor;
		this._background.x = 1;
		this._background.y = 1;
		this._container.alpha = 0.88;

		this.coords = coord;
		this.xOffset = S.RoomTileWidth;
		this.yOffset = S.RoomTileHeight;

		this.displayLines = displayLines;
		this.maxWidth = maxWidth;
		this.fgColor = fgColor;
		this.duration = duration + 50;

		this.textField.x = BORDER_THICKNESS + 4;
		this.textField.y = BORDER_THICKNESS + 1;
		this.textField.wordWrapWidth = S.RoomWidthPixels - BORDER_THICKNESS * 2;
		this.textField.wordWrap = true;

		this._container.addChild(this.textField);

		text = text.trim();

		if (text && text != "") {
			this.textField.text = text;
		}

		this.w = this.h = 0;

		this.setLocation();

		this.prepare();

		TStateGame.effectsAbove.add(this);
		Game.room.layerSprites.add(this._container);
	}

	public update() {
		this.setLocation();

		if (Date.now() > this.timeWhenEnabled + this.duration) {
			this._container.alpha -= 0.0625;
		}

		this._container.visible = !!this.textField.text;

		if (this._container.alpha <= 0) {
			this.end();
		}
	}

	public end() {
		TStateGame.effectsAbove.nullify(this);
		TWidgetSpeech.removeSubtitle(this);
		this._container.parent?.removeChild(this._container);
	}

	private prepare() {
		const borderSize: number = BORDER_THICKNESS * 2 + 2;
		if (this.maxWidth > borderSize && this.w + borderSize > this.maxWidth) {
			this.w = this.maxWidth - borderSize;
		}

		const size = this.getTextWidthHeight();

		this.w = Math.max(1, size.x + borderSize * 2);
		this.h = Math.max(1, size.y + borderSize);

		if (this._container.x + this.w >= S.RoomWidthPixels + S.LEVEL_OFFSET_X) {
			this._container.x = S.RoomWidthPixels + S.LEVEL_OFFSET_X - this.w;
		}

		if (this._container.y + this.h >= S.RoomHeightPixels + S.LEVEL_OFFSET_Y) {
			this._container.y = S.RoomHeightPixels + S.LEVEL_OFFSET_Y - this.h;
		}

		this.textField.color = this.fgColor;

		this._border.width = this.w;
		this._border.height = this.h;
		this._background.width = this.w - 2;
		this._background.height = this.h - 2;

		this.timeWhenEnabled = Date.now();
	}

	public addTextLine(line: string, duration: number) {
		this._container.alpha = 0.88;

		line = line.trim();

		if (this.displayLines == 1) {
			this.textField.text = "";
		}

		if (this.textField.text.length == 0) {
			this.textField.text = line;
		} else {
			if (this.textField.text.indexOf("\n") >= 0 && this.textField.text.indexOf("\r") === -1) {
				this.textField.text += "\n" + line;
				while (UtilsString.count(this.textField.text, "\n") >= this.displayLines) {
					this.textField.text = this.textField.text.substr(this.textField.text.indexOf("\n") + 1);
				}
			} else {
				this.textField.text += "\r" + line;
				while (UtilsString.count(this.textField.text, "\r") >= this.displayLines) {
					this.textField.text = this.textField.text.substr(this.textField.text.indexOf("\r") + 1);
				}
			}
		}

		this.prepare();
		this.setLocation();

		this.duration = duration + 50;
	}

	public setText(text: string, duration: number) {
		this.textField.text = text;

		this.duration = duration;
	}

	private getTextWidthHeight(): IPointData {
		let w: number = 0;
		let h: number = 0;

		if (this.textField.text.length) {
			w = this.textField.textWidth;
			h = this.textField.textHeight;
		}

		return new Point(w, h);
	}

	private setLocation() {
		const newX: number = this.xOffset + this.coords.x * S.RoomTileWidth + S.LEVEL_OFFSET_X;
		const newY: number = this.yOffset + this.coords.y * S.RoomTileHeight + S.LEVEL_OFFSET_Y;

		if (!this._wasPositionSetYet) {
			this._container.x = newX;
			this._container.y = newY;
			this._wasPositionSetYet = true;

		} else {
			if (newX < S.RoomWidthPixels + this.xOffset) {
				let dx = newX - this._container.x;
				if (Math.abs(dx) > 1) {
					dx /= UPDATE_FACTOR;

					if (Math.abs(dx) < 1) {
						dx = UtilsNumber.sign(dx);
					}
				}

				this._container.x += dx;
			}

			if (newY < S.RoomHeightPixels + this.yOffset) {
				let dy: number = newY - this._container.y;
				if (Math.abs(dy) > 1) {
					dy /= UPDATE_FACTOR;

					if (Math.abs(dy) < 1) {
						dy = UtilsNumber.sign(dy);
					}
				}

				this._container.y += dy;
			}
		}


		if (this._container.x < S.LEVEL_OFFSET_X) {
			this._container.x = S.LEVEL_OFFSET_X;
		}
		if (this._container.y < S.LEVEL_OFFSET_Y) {
			this._container.y = S.LEVEL_OFFSET_Y;
		}
		if (this._container.x + this.w > S.RoomWidthPixels + S.LEVEL_OFFSET_X) {
			this._container.x = S.RoomWidthPixels + S.LEVEL_OFFSET_X - this.w ;
		}
		if (this._container.y + this.h > S.RoomHeightPixels + S.LEVEL_OFFSET_Y) {
			this._container.y = S.RoomHeightPixels + S.LEVEL_OFFSET_Y - this.h ;
		}
	}
}
