import {TEffect} from "./TEffect";
import {Make} from "../../global/Make";
import {TStateGame} from "../../states/TStateGame";
import {S} from "../../../S";
import {Text} from "../../../../src.framework/net/retrocade/standalone/Text";
import {OutlineFilter} from '@pixi/filter-outline';
import {Game} from "../../global/Game";

export class TEffectTextFlash extends TEffect {
	private text: Text;
	private yOffset: number;
	private showUntil: number;
	private timer: number;

	public constructor(textToShow: string, yOffset: number = 0, duration: number = 5000, size: number = 64) {
		super();

		this.text = Make.text();
		this.text.text = textToShow;
		this.text.color = 0xFFFF00;
		this.text.size = size;
		this.text.filters = [new OutlineFilter(2, 0, 0.5)];

		this.yOffset = yOffset;
		this.showUntil = Date.now() + duration;
		this.timer = 0;

		TStateGame.effectsAbove.add(this);
		Game.room.layerUI.add(this.text);
	}


	public end() {
		Game.room.layerUI.remove(this.text);
	}

	public update() {
		if (this.showUntil < Date.now()) {
			this.end();
			TStateGame.effectsUnder.nullify(this);
			return;
		}

		this.switchFrame();
	}

	private switchFrame() {
		this.text.scale.x = this.text.scale.y = 0.9 + Math.cos(Date.now() / 150) * 0.1;

		this.text.x = S.LEVEL_OFFSET_X + (S.RoomWidthPixels - this.text.textWidth * this.text.scale.x) / 2;
		this.text.y = this.yOffset + (this.text.textHeight - this.text.textHeight * this.text.scale.x) / 2;
	}
}
