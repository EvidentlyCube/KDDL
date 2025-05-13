import {TRoach} from "./TRoach";
import {C} from "../../../C";
import {T} from "../../../T";


export class TTarBaby extends TRoach {
	public getType(): number {
		return C.M_TARBABY;
	}

	public setGfx() {
		this.gfx = T.TARBABY[this.animationFrame][this.o];
	}
}
