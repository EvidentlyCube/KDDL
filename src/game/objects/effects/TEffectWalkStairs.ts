import {TEffect} from "./TEffect";
import {TStateGame} from "../../states/TStateGame";
import {Game} from "../../global/Game";
import {S} from "../../../S";
import {C} from "../../../C";
import {F} from "../../../F";
import {TWidgetFace} from "../../widgets/TWidgetFace";

export class TEffectWalkStairs extends TEffect {
	private lastFrameMoved: number;
	private moveUp: boolean;
	private stairsType: number;

	public constructor() {
		super();

		TStateGame.effectsUnder.add(this);

		this.lastFrameMoved = Date.now();

		this.stairsType = this.room.tilesOpaque[Game.player.x + Game.player.y * S.RoomWidth];

		this.moveUp = (this.stairsType == C.T_STAIRS_UP);

		TWidgetFace.setMood('player', TWidgetFace.MOOD_HAPPY);
	}

	public update() {
		if (this.lastFrameMoved + 360 < Date.now()) {
			this.move();
			this.lastFrameMoved = Date.now();
		}
	}

	private move() {
		const x: number = Game.player.x;
		const y: number = Game.player.y + (this.moveUp ? -1 : 1);

		if (!F.isValidColRow(x, y) || this.room.tilesOpaque[x + y * S.RoomWidth] != this.stairsType) {
			Game.player.setPosition(Number.MAX_VALUE - 1, Number.MAX_VALUE - 1);
		} else {
			Game.player.setPosition(x, y);
		}
	}
}
