import {TPlayerDouble} from "./TPlayerDouble";
import {C} from "../../../C";
import {F} from "../../../F";
import {S} from "../../../S";
import {T} from "../../../T";
import {TStateGame} from "../../states/TStateGame";
import {ASSERT} from "../../../ASSERT";
import {Game} from "../../global/Game";
import {TPlayer} from "./TPlayer";

export class TMimic extends TPlayerDouble {
	public gfxSword: number = 0;

	public getType(): number {
		return C.M_MIMIC;
	}

	public getProcessSequence(): number {
		return 100;
	}

	public initialize(xml: Element | null = null) {
		this.swordX = this.x + F.getOX(this.o);
		this.swordY = this.y + F.getOY(this.o);

		if (this.swordX < S.RoomWidth && this.swordY < S.RoomHeight) {
			this.room.tilesSwords[this.swordX + this.swordY * S.RoomWidth]++;
		}
	}

	public setGfx() {
		this.tileId = T.MIMIC[this.o];
		this.swordVO.tileId = T.MIMIC_SWORD[this.o];
	}

	public update() {
		super.update();

		this.swordVO.x = this.swordX * S.RoomTileWidth + (this.prevX - this.x) * TStateGame.offset * S.RoomTileWidth;
		this.swordVO.y = this.swordY * S.RoomTileHeight + (this.prevY - this.y) * TStateGame.offset * S.RoomTileHeight;
		this.room.roomSpritesRenderer.registerSwordDraw(this.swordVO);
	}

	public doesSquareContainObstacle(x: number, y: number): boolean {
		ASSERT(this.x != x || this.y != y);

		if (!F.isValidColRow(x, y)) {
			return true;
		}

		const index: number = x + y * S.RoomWidth;
		if (this.isTileObstacle(this.room.tilesOpaque[index])) {
			return true;
		}

		if (this.isTileObstacle(this.room.tilesTransparent[index])) {
			return true;
		}

		if (this.isTileObstacle(this.room.tilesFloor[index])) {
			return true;
		}

		if (Game.player.x == x && Game.player.y == y) {
			return true;
		}

		return !!(this.room.tilesActive[index] || this.room.tilesSwords[index]);


	}

	public process(lastCommand: number) {
		this.dx = this.dy = 0;
		switch (lastCommand) {
			case(C.CMD_C):
				this.o = F.nextCO(this.o);
				break;
			case(C.CMD_CC):
				this.o = F.nextCCO(this.o);
				break;
			case(C.CMD_N):
				this.dy = -1;
				break;
			case(C.CMD_S):
				this.dy = 1;
				break;
			case(C.CMD_W):
				this.dx = -1;
				break;
			case(C.CMD_E):
				this.dx = 1;
				break;
			case(C.CMD_NW):
				this.dy = -1;
				this.dx = -1;
				break;
			case(C.CMD_NE):
				this.dy = -1;
				this.dx = 1;
				break;
			case(C.CMD_SW):
				this.dy = 1;
				this.dx = -1;
				break;
			case(C.CMD_SE):
				this.dy = 1;
				this.dx = 1;
				break;
		}

		this.room.tilesSwords[this.swordX + this.swordY * S.RoomWidth]--;

		// Player didn't move
		if (Game.player.x == Game.player.prevX && Game.player.y == Game.player.prevY) {
			this.dx = this.dy = 0;

			this.prevX = this.x;
			this.prevY = this.y;

			this.swordMovement = TPlayer.getSwordMovement(lastCommand, this.o);

			if (lastCommand != C.CMD_C && lastCommand != C.CMD_CC && this.swordMovement != this.o) {
				this.swordMovement = C.NO_ORIENTATION;
			}

		} else {
			this.getBestMove();
			this.swordMovement = F.getO(this.dx, this.dy);

			if (this.dx || this.dy) {
				ASSERT(lastCommand != C.CMD_C && lastCommand != C.CMD_CC && lastCommand != C.CMD_WAIT);

				const tileO: number = this.room.tilesOpaque[this.x + this.y * S.RoomWidth];
				const wasOnTrapdoor: boolean = F.isTrapdoor(tileO);

				this.move(this.x + this.dx, this.y + this.dy);

				ASSERT(this.dx || this.dy);
				if (wasOnTrapdoor) {
					this.room.destroyTrapdoor(this.x - this.dx, this.y - this.dy);
				}

				Game.queryCheckpoint(this.x, this.y);
			} else {
				this.prevX = this.x;
				this.prevY = this.y;
			}
		}

		this.swordX = this.x + F.getOX(this.o);
		this.swordY = this.y + F.getOY(this.o);
		this.room.tilesSwords[this.swordX + this.swordY * S.RoomWidth]++;

		this.setGfx();
		Game.processSwordHit(this.swordX, this.swordY, this);
	}
}
