import {TMonster} from "./TMonster";
import {C} from "../../../C";
import {Game} from "../../global/Game";
import {F} from "../../../F";
import {T} from "../../../T";

export class TWraithwing extends TMonster {
	public getType(): number {
		return C.M_WRAITHWING;
	}

	public isFlying(): boolean {
		return true;
	}

	public process(lastCommand: number) {
		if (Game.doesBrainSensePlayer && this.getBrainMovement(this.room.pathmapAir)) {

		} else if (!Game.isInvisible || F.distanceInTiles(this.x, this.y, Game.player.x, Game.player.y) <= C.DEFAULT_SMELL_RANGE || Game.doesBrainSensePlayer) {
			this.getBeelineMovement(Game.player.x, Game.player.y);
		} else {
			return;
		}

		const distance: number = F.distanceInTiles(Game.player.x, Game.player.y, this.x, this.y);
		let runaway: boolean = true;

		if (distance <= 5) {
			for (const monster of this.room.monsters.getAllOriginal()) {
				if (!monster || monster.getType() !== C.M_WRAITHWING || monster == this) {
					continue;
				}

				const distance2 = F.distanceInTiles(monster.x, monster.y, Game.player.x, Game.player.y);

				if ((distance2 > distance ? distance2 - distance : distance - distance2) <= 2 &&
					F.distanceInTiles(monster.x, monster.y, this.x, this.y) >= 3) {
					runaway = false;
					break;
				}
			}

			if (runaway) {
				if (distance == 5) {
					this.dx = this.dy = 0;
				} else {
					this.dxFirst = this.dx = -this.dxFirst;
					this.dyFirst = this.dy = -this.dyFirst;
					this.getBestMove();
				}
			}
		} // End: (distance < 5)

		this.makeStandardMove();
		this.setOrientation(this.dxFirst, this.dyFirst);
	}

	public setGfx() {
		this.gfx = T.WWING[this.animationFrame][this.o];
	}
}
