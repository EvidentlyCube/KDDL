import {TMonster} from "./TMonster";
import {C} from "../../../C";
import {Game} from "../../global/Game";
import {F} from "../../../F";
import {T} from "../../../T";

export class TRoach extends TMonster {
	public getType(): number {
		return C.M_ROACH;
	}

	public process(lastCommand: number) {
		if (Game.doesBrainSensePlayer && this.getBrainMovement(this.room.pathmapGround)) {

		} else if (!Game.isInvisible || F.distanceInTiles(this.x, this.y, Game.player.x, Game.player.y) <= C.DEFAULT_SMELL_RANGE || Game.doesBrainSensePlayer) {
			this.getBeelineMovement(Game.player.x, Game.player.y);
		} else {
			return;
		}

		this.makeStandardMove();
		this.setOrientation(this.dxFirst, this.dyFirst);
	}

	public setGfx() {
		this.tileId = T.ROACH[this.animationFrame][this.o];
	}
}
