import {TSerpent} from "./TSerpent";
import {C} from "../../../C";
import {F} from "../../../F";
import {CueEvents} from "../../global/CueEvents";

export class TRedSerpent extends TSerpent {
	public getType(): number {
		return C.M_SERPENT;
	}

	public process(lastCommand: number) {
		if (!this.getSerpentMovement()) {
			this.prevX = this.x;
			this.prevY = this.y;
			return;
		}

		this.lengthenHead(F.getOX(this.o), F.getOY(this.o));

		this.setGfx();

		if (this.shortenTail()) {
			CueEvents.add(C.CID_SNAKE_DIED_FROM_TRUNCATION, this);
			return;
		}
	}
}
