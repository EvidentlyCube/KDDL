import * as PIXI from 'pixi.js';
import {TEffect} from "./TEffect";
import {Make} from "../../global/Make";
import {OutlineFilter} from "@pixi/filter-outline";
import {S} from "../../../S";
import {TStateGame} from "../../states/TStateGame";
import {Game} from "../../global/Game";
import {RecamelCore} from "../../../../src.framework/net/retrocade/camel/core/RecamelCore";

// @todo do something about the outline so that it's rendered a bit better
export class TEffectLevelStats extends TEffect {

	private textSprite: PIXI.Sprite;
	private fadeInStart: number;
	private fadeInDuration: number;
	private renderTexture: PIXI.RenderTexture;

	private _interval: any;

	public constructor(textToShow: string, fadeTime: number) {
		super();

		const text = Make.text(38);
		text.x = 4;
		text.y = 4;
		text.text = textToShow;
		text.color = 0xFFFF00;
		text.filters = [new OutlineFilter(2, 0, 0.5)];

		this.renderTexture = PIXI.RenderTexture.create(text.textWidth + 8, text.textHeight + 8);
		RecamelCore.renderer.render(text, this.renderTexture, true);

		this.textSprite = new PIXI.Sprite(this.renderTexture);
		this.textSprite.x = (S.RoomWidthPixels - this.textSprite.width) / 2 + S.LEVEL_OFFSET_X;
		this.textSprite.y = (S.RoomHeightPixels - this.textSprite.height) / 2 + S.LEVEL_OFFSET_Y;
		this.textSprite.alpha = 0;

		this.fadeInStart = Date.now();
		this.fadeInDuration = fadeTime;

		TStateGame.effectsAbove.add(this);
		Game.room.layerUI.add(this.textSprite);

		this._interval = setInterval(() => {
			if (TStateGame.effectsAbove.contains(this)) {
				return;
			}

			this.renderTexture.destroy(true);
			clearInterval(this._interval);

		}, 100);
	}

	public update() {
		const alpha = (Date.now() - this.fadeInStart) / this.fadeInDuration;
		this.textSprite.alpha = Math.min(1, alpha);
	}


}
