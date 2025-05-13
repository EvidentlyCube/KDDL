import {TMonster} from "./TMonster";
import {S} from "../../../S";
import {C} from "../../../C";
import {T} from "../../../T";

export class TMonsterPiece extends TMonster {
	public isPiece(): boolean {
		return true;
	}

	public isAggressive(): boolean {
		return false;
	}

	public monster: TMonster;
	public tileNo: number;

	public constructor(x: number, y: number, o: number, parent: TMonster, tileNo: number) {
		super();
		this.x = this.prevX = x;
		this.y = this.prevY = y;
		this.o = this.prevO = o;

		this.monster = parent;
		this.tileNo = tileNo;

		this.setGfx();
	}

	public initialize(pieces: Element | null = null) {
		this.room.tilesActive[this.x + this.y * S.RoomWidth] = this;
		this.room.pathmapTileModified(this.x, this.y);
	}

	public quickRemove() {
		this.room.tilesActive[this.x + this.y * S.RoomWidth] = null;
		this.room.pathmapTileModified(this.x, this.y);
	}

	public setGfx() {
		switch (this.tileNo) {
			case(C.T_SNK_EW):
				this.gfx = T.TI_SNK_EW;
				break;
			case(C.T_SNK_NS):
				this.gfx = T.TI_SNK_NS;
				break;
			case(C.T_SNK_SW):
				this.gfx = T.TI_SNK_NE;
				break;
			case(C.T_SNK_SE):
				this.gfx = T.TI_SNK_NW;
				break;
			case(C.T_SNK_NW):
				this.gfx = T.TI_SNK_SE;
				break;
			case(C.T_SNK_NE):
				this.gfx = T.TI_SNK_SW;
				break;
			case(C.T_SNKT_W):
				this.gfx = T.TI_SNKT_W;
				break;
			case(C.T_SNKT_N):
				this.gfx = T.TI_SNKT_N;
				break;
			case(C.T_SNKT_E):
				this.gfx = T.TI_SNKT_E;
				break;
			case(C.T_SNKT_S):
				this.gfx = T.TI_SNKT_S;
				break;
		}
	}

	public onStabbed(sX: number, sY: number): boolean {
		return this.monster.onStabbed(this.x, this.y);
	}
}
