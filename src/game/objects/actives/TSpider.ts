import {TRoach} from "./TRoach";
import {C} from "../../../C";
import {T} from "../../../T";
import {F} from "../../../F";
import {Game} from "../../global/Game";
import {TStateGame} from "../../states/TStateGame";
import {Gfx} from "../../global/Gfx";
import {S} from "../../../S";

export class TSpider extends TRoach {
	public getType(): number {
		return C.M_SPIDER;
	}

	public setGfx() {
		this.tileId = T.SPIDER[this.animationFrame][this.o];
	}

	private _isHidden: boolean = true;
	private _distance: number = 0;

	private _alpha: number = 0;

	public process(lastCommand: number) {
		super.process(lastCommand);

		this._distance = F.distanceInTiles(this.x, this.y, Game.player.x, Game.player.y);
		this._isHidden = !(this.prevX != this.x || this.prevY != this.y || this._distance < 4);

		if (!this._isHidden) {
			if (this._distance < 2) {
				this._alpha = 0.742;
			} else if (this._distance > 5) {
				this._alpha = 0.371;
			} else {
				this._alpha = 0.644 - this._distance * 0.042;
			}
		}
	}

	public update() {
		super.update();
		this.room.roomSpritesRenderer.setObjectAlpha(this, this._isHidden ? 0 : this._alpha);
	}
}
