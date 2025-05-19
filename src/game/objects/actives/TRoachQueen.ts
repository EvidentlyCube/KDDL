import {TMonster} from "./TMonster";
import {C} from "../../../C";
import {Game} from "../../global/Game";
import {F} from "../../../F";
import {S} from "../../../S";
import {T} from "../../../T";
import {Pathmap} from "../../global/Pathmap";
import {PathmapTile} from "../../global/PathmapTile";

export class TRoachQueen extends TMonster {
	public getType(): number {
		return C.M_ROACH_QUEEN;
	}

	public isAggressive(): boolean {
		return false;
	}

	public process(lastCommand: number) {
		if (Game.doesBrainSensePlayer) {
			this.getBrainMovement(this.room.pathmapGround!);
		} else if (!Game.isInvisible || F.distanceInTiles(this.x, this.y, Game.player.x, Game.player.y) <= C.DEFAULT_SMELL_RANGE) {
			const targetX: number = Game.player.x;
			const targetY: number = Game.player.y;

			this.dx = this.dxFirst = targetX > this.x ? -1 : targetX < this.x ? 1 : 0;
			this.dy = this.dyFirst = targetY > this.y ? -1 : targetY < this.y ? 1 : 0;

			this.setOrientation(this.dx, this.dy);

			this.getBestMove();
		} else {
			return;
		}

		this.makeStandardMove();

		if (Game.spawnCycleCount % 30 == 0 &&
			(Game.doesBrainSensePlayer || !Game.isInvisible || F.distanceInTiles(this.x, this.y, Game.player.x, Game.player.y) <= C.DEFAULT_SMELL_RANGE)) {
			for (let j: number = -1; j <= 1; j++) {
				for (let i: number = -1; i <= 1; i++) {
					if (F.isValidColRow(this.x + i, this.y + j)) {
						const ex: number = this.x + i;
						const ey: number = this.y + j;
						if (this.room.tilesActive) {
							const tileIndex: number = ex + ey * S.RoomWidth;

							const oSquare: number = this.room.tilesOpaque     [tileIndex];
							const tSquare: number = this.room.tilesTransparent[tileIndex];
							const monster: TMonster | null = this.room.tilesActive [tileIndex];
							if (
								!(ex == this.x && ey == this.y) &&
								!(ex == this.prevX && ey == this.prevY) &&
								!monster && !this.doesSquareContainObstacle(ex, ey) &&
								(tSquare == C.T_EMPTY) &&
								!F.isArrow(this.room.tilesFloor[tileIndex]) &&
								(Game.player.x != ex || Game.player.y != ey) &&
								(F.isPlainFloor(oSquare) ||
									(F.isOpenDoor(oSquare) && oSquare != C.T_DOOR_YO))) {
								this.room.addNewMonster(C.M_ROACH_EGG, ex, ey, 0);
							}
						}
					}
				}
			}

		}
	}

	public setGfx() {
		this.gfx = T.RQUEEN[this.animationFrame][this.o];
	}

	public getBrainMovement(pathmap: Pathmap): boolean {
		let brained: boolean = false;
		switch (this.room.tilesTransparent[this.x + this.y * S.RoomWidth]) {
			case(C.T_POTION_I):
			case(C.T_POTION_M):
			case(C.T_SCROLL):
				break;

			default:
				if (F.isArrow(this.room.tilesFloor[this.x + this.y * S.RoomWidth])) {
					break;
				}
				brained = this.setBrainTileFirst(pathmap);
				break;
		}

		if (!brained) {
			this.dx = this.dxFirst = Math.sign(this.x - Game.player.x);
			this.dy = this.dyFirst = Math.sign(this.y - Game.player.y);

		} else {
			if (this.dx == 0) {
				this.dxFirst = this.dx = (this.x < S.RoomWidth / 2) ? 1 : -1;
			} else if (this.dy == 0) {
				this.dyFirst = this.dy = (this.y < S.RoomHeight / 2) ? 1 : -1;
			}
		}

		this.setOrientation(this.dx, this.dy);
		this.getBestMove();

		return false;
	}

	public setBrainTileFirst(pathmap: Pathmap): boolean {
		pathmap.calculate();

		let tile: PathmapTile | null = null;
		let tileCheck: PathmapTile;
		let wx: number, wy: number;
		let tdx: number, tdy: number;

		this.dx = 0;
		this.dy = 0;

		for (let i: number = 0; i < 9; i++) {
			wx = this.x + (tdx = TMonster.dxDirBrain[i]);
			wy = this.y + (tdy = TMonster.dyDirBrain[i]);

			if (wx < 0 || wy < 0 || wx >= S.RoomWidth || wy >= S.RoomHeight) {
				continue;
			}

			tileCheck = pathmap.tiles[wx + wy * S.RoomWidth];

			if (!tileCheck.isObstacle && (!tile || tileCheck.targetDistance < tile.targetDistance)) {
				this.dxFirst = this.dx = -tdx;
				this.dyFirst = this.dy = -tdy;

				tile = tileCheck;
			}
		}

		return !!(tile && tile.targetDistance < Number.MAX_VALUE && (this.dx || this.dy));


	}
}
