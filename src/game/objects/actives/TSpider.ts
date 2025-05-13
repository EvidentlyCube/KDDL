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
		this.gfx = T.SPIDER[this.animationFrame][this.o];
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
		if (!this._isHidden) {

			this.room.layerActive.drawTileRectPrecise(Gfx.GENERAL_TILES, this.gfx,
				this.x * S.RoomTileWidth + (this.prevX - this.x) * TStateGame.offset * S.RoomTileWidth,
				this.y * S.RoomTileHeight + (this.prevY - this.y) * TStateGame.offset * S.RoomTileHeight,
				this._alpha);
		}
	}
}
