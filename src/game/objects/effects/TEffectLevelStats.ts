import {TEffect} from "./TEffect";
import {Make} from "../../global/Make";
import {OutlineFilter} from "@pixi/filter-outline";
import {S} from "../../../S";
import {TStateGame} from "../../states/TStateGame";
import {Game} from "../../global/Game";
import { Text } from "src.framework/net/retrocade/standalone/Text";

// @todo do something about the outline so that it's rendered a bit better
export class TEffectLevelStats extends TEffect {

	private fadeInStart: number;
	private fadeInDuration: number;
	private _textField: Text;

	public constructor(textToShow: string, fadeTime: number) {
		super();

		this._textField = Make.text(38);
		this._textField.x = 4;
		this._textField.y = 4;
		this._textField.text = textToShow;
		this._textField.color = 0xFFFF00;
		this._textField.filters = [new OutlineFilter(2, 0, 0.5)];

		this._textField.x = (S.RoomWidthPixels - this._textField.textWidth) / 2 + S.LEVEL_OFFSET_X;
		this._textField.y = (S.RoomHeightPixels - this._textField.textHeight) / 2 + S.LEVEL_OFFSET_Y;
		this._textField.alpha = 0;

		this.fadeInStart = Date.now();
		this.fadeInDuration = fadeTime;

		TStateGame.effectsAbove.add(this);
		Game.room.layerUI.add(this._textField);
	}

	public update() {
		const alpha = (Date.now() - this.fadeInStart) / this.fadeInDuration;
		this._textField.alpha = Math.min(1, alpha);
	}


}
