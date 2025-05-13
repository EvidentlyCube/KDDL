import {TMonster} from "./TMonster";
import {C} from "../../../C";
import {ASSERT} from "../../../ASSERT";
import {T} from "../../../T";
import {CueEvents} from "../../global/CueEvents";

export class TRoachEgg extends TMonster {
	public getType(): number {
		return C.M_ROACH_EGG;
	}

	public isAggressive(): boolean {
		return false;
	}

	public initialize(xml: Element | null = null) {
		this.o = C.SW;
	}

	public setGfx() {
		ASSERT(this.o == C.SW || this.o == C.W || this.o == C.NW || this.o == C.N);
		this.gfx = T.REGG[this.animationFrame][this.o];
	}

	public process(lastCommand: number) {
		switch (this.o) {
			case(C.SW):
				this.o = C.W;
				break;

			case(C.W):
				this.o = C.NW;
				break;

			case(C.NW):
				this.o = C.N;
				break;

			case(C.N):
				CueEvents.add(C.CID_EGG_HATCHED, this);
				this.room.killMonster(this);

				const roach = this.room.addNewMonster(C.M_ROACH, this.x, this.y, 0);
				roach.skipTurn = true;
				return;
		}

		this.setGfx();
	}
}

