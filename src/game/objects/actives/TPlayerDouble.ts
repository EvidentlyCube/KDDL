import {TMonster} from "./TMonster";
import {VOSwordDraw} from "../../managers/VOSwordDraw";
import {Game} from "../../global/Game";
import {S} from "../../../S";
import {F} from "../../../F";

export class TPlayerDouble extends TMonster {
	public swordX: number = 0;
	public swordY: number = 0;
	public swordMovement: number = 0;

	public safeToPlayer: boolean = true;

	public swordSheathed: boolean = false;

	public swordVO: VOSwordDraw = {x: 0, y: 0, tileId: 0};

	public doesSquareContainObstacle(x: number, y: number): boolean {
		if (super.doesSquareContainObstacle(x, y)) {
			return true;
		}

		return (Game.player.x == x && Game.player.y == y && this.safeToPlayer);
	}

	public updateSwordChangedSheathing(isSheathed: boolean) {
		if (this.swordX < S.RoomWidth && this.swordY < S.RoomHeight) {
			if (isSheathed) {
				this.room.tilesSwords[this.swordX + this.swordY * S.RoomWidth]--;
			} else {
				this.room.tilesSwords[this.swordX + this.swordY * S.RoomWidth]++;
			}
		}

		this.swordX = this.x + F.getOX(this.o);
		this.swordY = this.y + F.getOY(this.o);
	}

	public isTileObstacle(tile: number): boolean {
		return (!F.isPotion(tile) && super.isTileObstacle(tile));
	}
}
