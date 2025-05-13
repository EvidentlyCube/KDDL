import {TEffect} from "./TEffect";
import {TStateGame} from "../../states/TStateGame";
import {S} from "../../../S";

export class TEffectsPlayerDeathFade extends TEffect {
	private timeFrom: number;
	private timeTo: number;

	public constructor() {
		super();

		TStateGame.effectsAbove.add(this);

		this.timeFrom = Date.now();
		this.timeTo = this.timeFrom + 2500;
	}

	public update() {
		const alpha = 1 - (this.timeTo - Date.now()) / (this.timeTo - this.timeFrom);
		this.room.layerActive.blitRect(
			0, 0,
			S.RoomWidthPixels, S.RoomHeightPixels,
			(alpha * 255) << 24
		);

		if (Date.now() > this.timeTo) {
			TStateGame.instance.restartCommand();
		}
	}
}
