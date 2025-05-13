import {TMonster} from "./TMonster";
import {C} from "../../../C";
import {Game} from "../../global/Game";
import {F} from "../../../F";
import {CueEvents} from "../../global/CueEvents";
import {T} from "../../../T";

export class TTarMother extends TMonster {
	public getType(): number {
		return C.M_TARMOTHER;
	}

	public isAggressive(): boolean {
		return false;
	}

	public leftEye: boolean = false;

	public initialize(xml: Element | null = null) {
		this.leftEye = (this.o == C.NO_ORIENTATION || this.o == C.W);
	}

	public process(lastCommand: number) {
		const isScared: boolean = this.room.isSwordWithinRect(
			this.x - (this.leftEye ? 1 : 2),
			this.y - 1,
			this.x + (this.leftEye ? 2 : 1),
			this.y + 1,
		);

		if (Game.spawnCycleCount % C.TURNS_PER_CYCLE == C.TURNS_PER_CYCLE - 1) {
			this.o = (this.leftEye != isScared ? C.W : C.SW);
		} else {
			this.o = (this.leftEye != isScared ? C.NO_ORIENTATION : C.S);
		}

		if ((Game.spawnCycleCount % C.TURNS_PER_CYCLE == 0) &&
			(Game.doesBrainSensePlayer || !Game.isInvisible ||
				F.distanceInTiles(this.x, this.y, Game.player.x, Game.player.y) <= C.DEFAULT_SMELL_RANGE)) {
			CueEvents.add(C.CID_TAR_GREW, this);
		}

		this.setGfx();
	}

	public setGfx() {
		switch (this.o) {
			case(C.NO_ORIENTATION):
				this.gfx = T.TI_TMOTHER_WO;
				break;

			case(C.S):
				this.gfx = T.TI_TMOTHER_EO;
				break;

			case(C.W):
				this.gfx = T.TI_TMOTHER_WC;
				break;

			case(C.SW):
				this.gfx = T.TI_TMOTHER_EC;
				break;
		}

	}
}
