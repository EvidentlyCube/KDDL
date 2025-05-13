import {TEffect} from "./TEffect";
import {TStateGame} from "../../states/TStateGame";
import {Game} from "../../global/Game";
import {UtilsRandom} from "../../../../src.framework/net/retrocade/utils/UtilsRandom";
import {F} from "../../../F";
import {TWidgetFace} from "../../widgets/TWidgetFace";

const FRAME_RATE_MSEC: number = 100;

export class TEffectPlayerDeath extends TEffect {

	private lastFrameTime: number = 0;

	public constructor() {
		super();

		TWidgetFace.setMood(TWidgetFace.MOOD_DYING);

		TStateGame.effectsUnder.add(this);
	}

	public update() {
		if (this.lastFrameTime + FRAME_RATE_MSEC < Date.now()) {
			this.lastFrameTime = Date.now();

			this.rotatePlayer();
		}
	}

	private rotatePlayer() {
		Game.player.o = (UtilsRandom.fraction() < 0.5 ? F.nextCO(Game.player.o) : F.nextCCO(Game.player.o));
		Game.player.setSwordCoords();
		Game.player.setGfx();
	}
}
