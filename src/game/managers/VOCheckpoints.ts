import {S} from "../../S";
import {DrodLayer} from "../global/DrodLayer";
import {Gfx} from "../global/Gfx";
import {T} from "../../T";

export class VOCheckpoints {
	public checkpoints: number[] = [];

	public addCheckpoint(xml: Element) {
		this.checkpoints.push(parseInt(xml.getAttribute('X')!) + parseInt(xml.getAttribute('Y')!) * S.RoomWidth);
	}

	public contains(x: number, y: number): boolean {
		return this.checkpoints.indexOf(x + y * S.RoomWidth) != -1;
	}

	public clear() {
		this.checkpoints.length = 0;
	}

	public drawIfHas(x: number, y: number, drawTo: DrodLayer) {
		if (this.checkpoints.indexOf(x + y * S.RoomWidth) != -1) {
			drawTo.blitTileRect(Gfx.GENERAL_TILES, T.TI_CHECKPOINT, x, y);
		}
	}
}
