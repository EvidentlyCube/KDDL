import * as PIXI from 'pixi.js';
import {TGameObject} from "../TGameObject";
import {TStateGame} from "../../states/TStateGame";
import {TWidgetSpeech} from "../../widgets/TWidgetSpeech";
import {TEffect} from "./TEffect";
import {BitmapDataWritable} from "../../../C";
import {S} from "../../../S";
import {Make} from "../../global/Make";
import {Text} from "../../../../src.framework/net/retrocade/standalone/Text";
import {F} from "../../../F";
import {UtilsBitmapData} from "../../../../src.framework/net/retrocade/utils/UtilsBitmapData";
import {UtilsString} from "../../../../src.framework/net/retrocade/utils/UtilsString";
import {UtilsNumber} from "../../../../src.framework/net/retrocade/utils/UtilsNumber";

const UPDATE_FACTOR = 10;
const BORDER_THICKNESS = 2;

export class TEffectSubtitle extends TEffect {
	private xOffset: number = 0;
	private yOffset: number = 0;

	private x: number = 0;
	private y: number = 0;
	private w: number = 0;
	private h: number = 0;

	private text: Text;

	private timeWhenEnabled: number = 0;

	private displayLines: number;
	private maxWidth: number;
	private duration: number;

	private fgColor: number;
	private bgColor: number;
	public alpha: number;
	public coords: TGameObject;

	private buffer: BitmapDataWritable;

	public constructor(coord: TGameObject, text: string, fgColor: number, bgColor: number,
	                   duration: number = 2000, displayLines: number = 3, maxWidth: number = 0,
	) {
		super();

		this.coords = coord;
		this.xOffset = S.RoomTileWidth;
		this.yOffset = S.RoomTileHeight;
		this.buffer = F.newCanvasContext(1, 1);

		this.displayLines = displayLines;
		this.maxWidth = maxWidth;
		this.bgColor = bgColor;
		this.fgColor = fgColor;
		this.duration = duration + 50;

		this.alpha = 0.88;

		this.text = Make.text(19);
		this.text.wordWrapWidth = S.RoomWidthPixels - BORDER_THICKNESS * 2;
		this.text.wordWrap = true;

		text = text.trim();

		if (text && text != "") {
			this.text.text = text;
		}

		this.x = this.y = Number.MAX_VALUE;
		this.w = this.h = 0;

		this.setLocation();

		this.prepare();

		TStateGame.effectsAbove.add(this);
	}

	public update() {
		this.setLocation();

		if (Date.now() > this.timeWhenEnabled + this.duration) {
			this.alpha -= 0.0625;
		}

		if (this.alpha <= 0) {
			TStateGame.effectsAbove.nullify(this);
			TWidgetSpeech.removeSubtitle(this);
		} else if (this.text.text) {
			this.room.layerActive.drawDirect(this.buffer.canvas, this.x | 0, this.y | 0, this.alpha);
		}
	}

	public stop() {
		TStateGame.effectsAbove.nullify(this);
		TWidgetSpeech.removeSubtitle(this);
	}

	private prepare() {
		const borderSize: number = BORDER_THICKNESS * 2 + 2;
		if (this.maxWidth > borderSize && this.w + borderSize > this.maxWidth) {
			this.w = this.maxWidth - borderSize;
		}

		const size = this.getTextWidthHeight();

		this.w = size.x + borderSize * 2;
		this.h = size.y + borderSize;

		if (this.w == 0) {
			this.w = 1;
		}

		if (this.h == 0) {
			this.h = 1;
		}

		if (this.x + this.w >= S.RoomWidthPixels) {
			this.x = S.RoomWidthPixels - this.w;
		}

		if (this.y + this.h >= S.RoomHeightPixels) {
			this.y = S.RoomHeightPixels - this.h;
		}

		this.buffer.canvas.width = this.w;
		this.buffer.canvas.height = this.h;
		this.buffer.clearRect(0, 0, this.w, this.h);

		this.text.color = this.fgColor;

		UtilsBitmapData.shapeRectangle(this.buffer, 0, 0, this.w, this.h, 0, 1);
		UtilsBitmapData.shapeRectangle(this.buffer, 1, 1, this.w - 2, this.h - 2, this.bgColor, 1);
		UtilsBitmapData.draw(this.text.textCanvas, this.buffer, BORDER_THICKNESS + 4, BORDER_THICKNESS + 1);

		this.timeWhenEnabled = Date.now();
	}

	public setOffset(x: number, y: number) {
		this.xOffset = x;
		this.yOffset = y;

		this.x = Number.MAX_VALUE;
		this.y = Number.MAX_VALUE;
	}

	public addTextLine(line: string, duration: number) {
		this.alpha = 0.88;

		line = line.trim();

		if (this.displayLines == 1) {
			this.text.text = "";
		}

		if (this.text.text.length == 0) {
			this.text.text = line;
		} else {
			if (this.text.text.indexOf("\n") >= 0 && this.text.text.indexOf("\r") === -1) {
				this.text.text += "\n" + line;
				while (UtilsString.count(this.text.text, "\n") >= this.displayLines) {
					this.text.text = this.text.text.substr(this.text.text.indexOf("\n") + 1);
				}
			} else {
				this.text.text += "\r" + line;
				while (UtilsString.count(this.text.text, "\r") >= this.displayLines) {
					this.text.text = this.text.text.substr(this.text.text.indexOf("\r") + 1);
				}
			}
		}

		this.prepare();
		this.setLocation();

		this.duration = duration + 50;
	}

	public setText(text: string, duration: number) {
		this.text.text = text;

		this.duration = duration;
	}

	private getTextWidthHeight(): PIXI.IPointData {
		let w: number = 0;
		let h: number = 0;

		if (this.text.text.length) {
			w = this.text.textWidth;
			h = this.text.textHeight;
		}

		return new PIXI.Point(w, h);
	}

	private setLocation() {
		const newX: number = this.xOffset + (this.coords ? this.coords.x * S.RoomTileWidth : 0);
		const newY: number = this.yOffset + (this.coords ? this.coords.y * S.RoomTileHeight : 0);

		if (this.x == Number.MAX_VALUE) {
			this.x = newX;
			this.y = newY;

		} else {
			if (newX < S.RoomWidthPixels + this.xOffset) {
				let dx: number = newX - this.x;
				if (Math.abs(dx) > 1) {
					dx /= UPDATE_FACTOR;

					if (Math.abs(dx) < 1) {
						dx = UtilsNumber.sign(dx);
					}
				}

				this.x += dx;
			}

			if (newY < S.RoomHeightPixels + this.yOffset) {
				let dy: number = newY - this.y;
				if (Math.abs(dy) > 1) {
					dy /= UPDATE_FACTOR;

					if (Math.abs(dy) < 1) {
						dy = UtilsNumber.sign(dy);
					}
				}

				this.y += dy;
			}
		}

		if (this.x < 0) {
			this.x = 0;
		}
		if (this.y < 0) {
			this.y = 0;
		}
		if (this.x + this.w > S.RoomWidthPixels) {
			this.x = S.RoomWidthPixels - this.w;
		}
		if (this.y + this.h > S.RoomHeightPixels) {
			this.y = S.RoomHeightPixels - this.h;
		}
	}
}
