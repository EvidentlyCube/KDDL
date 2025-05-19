import {TMonster} from "./TMonster";
import {C} from "../../../C";
import {Game} from "../../global/Game";
import {T} from "../../../T";
import {F} from "../../../F";

export class TGoblin extends TMonster {
	public getType(): number {
		return C.M_GOBLIN;
	}

	public process(lastCommand: number) {
		if (Game.doesBrainSensePlayer || !Game.isInvisible || F.distanceInTiles(this.x, this.y, Game.player.x, Game.player.y) <= C.DEFAULT_SMELL_RANGE) {
			this.getAvoidSwordMovement(Game.player.x, Game.player.y);
		} else {
			return;
		}

		this.makeStandardMove();
		this.setOrientation(this.dxFirst, this.dyFirst);
	}

	public setGfx() {
		this.tileId = T.GOBLIN[this.animationFrame][this.o];
	}
}
