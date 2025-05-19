import {TRoach} from "./TRoach";
import {C} from "../../../C";
import {T} from "../../../T";


export class TTarBaby extends TRoach {
	public getType(): number {
		return C.M_TAR_BABY;
	}

	public setGfx() {
		this.tileId = T.TARBABY[this.animationFrame][this.o];
	}
}
