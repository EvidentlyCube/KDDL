import {TMonster} from "./TMonster";
import {UtilsXPath} from "../../../../src.framework/net/retrocade/utils/UtilsXPath";
import {TMonsterPiece} from "./TMonsterPiece";
import {Game} from "../../global/Game";
import {F} from "../../../F";
import {C} from "../../../C";
import {ASSERT} from "../../../ASSERT";
import {S} from "../../../S";
import {CueEvents} from "../../global/CueEvents";
import {Pathmap} from "../../global/Pathmap";
import {PathmapTile} from "../../global/PathmapTile";
import {T} from "../../../T";

export class TSerpent extends TMonster {
	public static dxDirBrain = [0, -1, 1, 0];
	public static dyDirBrain = [-1, 0, 0, 1];

	public static dxDirNoMove = [0, 1, 0, -1];
	public static dyDirNoMove = [-1, 0, 1, 0];

	public tailX: number = 0;
	public tailY: number = 0;
	public tailO: number = 0;

	public oldTailX: number = Number.MAX_VALUE;
	public oldTailY: number = Number.MAX_VALUE;

	public initialize(xml: Element | null = null) {
		if (!xml) {
			throw new Error("Serpent must be initialized with XML");
		}

		this.importPieces(UtilsXPath.getAllElements('Pieces', xml?.ownerDocument!, xml));

		this.getTail();
	}

	protected importPieces(elements: Element[]) {
		this.pieces = [];

		for (const pieceXML of elements) {
			const piece: TMonsterPiece = new TMonsterPiece(
				parseInt(pieceXML.getAttribute('X') || '0'),
				parseInt(pieceXML.getAttribute('Y') || '0'),
				0,
				this,
				parseInt(pieceXML.getAttribute('Type') || '0'),
			);
			piece.room = this.room;

			piece.initialize();
			piece.setGfx();

			this.pieces.push(piece);
		}
	}

	public process(lastCommand: number) {

	}

	public update() {
		super.update();

		for (const piece of this.pieces!) {
			piece.update();
		}
	}

	public getSerpentMovement(): boolean {
		if (Game.doesBrainSensePlayer && this.getBrainMovement(this.room.pathmapGround)) {
			return true;

		} else if (!Game.isInvisible || F.distanceInTiles(this.x, this.y, Game.player.x, Game.player.y) <= C.DEFAULT_SMELL_RANGE || Game.doesBrainSensePlayer) {
			this.getNormalMovement(Game.player.x, Game.player.y);
			return true;

		} else {
			return false;
		}
	}

	public lengthenHead(ox: number, oy: number): boolean {
		if (this.dx || this.dy) {
			ASSERT((this.dx == 0) != (this.dy == 0));

			let tile: number = C.T_EMPTY;
			if (this.dx != 0) {
				switch (F.getO(this.dx, oy)) {
					case(C.E):
					case(C.W):
						tile = C.T_SNK_EW;
						break;
					case(C.NE):
						tile = C.T_SNK_NW;
						break;
					case(C.SE):
						tile = C.T_SNK_SW;
						break;
					case(C.NW):
						tile = C.T_SNK_NE;
						break;
					case(C.SW):
						tile = C.T_SNK_SE;
						break;
					default:
						ASSERT(false);
				}
			} else {
				switch (F.getO(ox, this.dy)) {
					case(C.N):
					case(C.S):
						tile = C.T_SNK_NS;
						break;
					case(C.NE):
						tile = C.T_SNK_SE;
						break;
					case(C.SE):
						tile = C.T_SNK_NE;
						break;
					case(C.NW):
						tile = C.T_SNK_SW;
						break;
					case(C.SW):
						tile = C.T_SNK_NW;
						break;
					default:
						ASSERT(false);
				}
			}

			this.makeStandardMove();

			const piece: TMonsterPiece = new TMonsterPiece(this.prevX, this.prevY, 0, this, tile);

			piece.room = this.room;
			piece.setGfx();
			piece.initialize();

			this.prevX = this.x;
			this.prevY = this.y;

			this.o = F.getO(this.dx, this.dy);

			this.pieces!.push(piece);
			return true;
		}

		this.prevX = this.x;
		this.prevY = this.y;
		return false;
	}

	public shortenTail(): boolean {
		let dx: number = F.getOX(this.tailO);
		let dy: number = F.getOY(this.tailO);

		ASSERT((dx == 0) != (dy == 0));

		if (this.tailX == this.x && this.tailY == this.y) {
			return false;
		}

		this.findAndRemoveTailPiece();
		this.oldTailX = this.tailX;
		this.oldTailY = this.tailY;
		this.tailX += dx;
		this.tailY += dy;
		if (this.tailX == this.x && this.tailY == this.y) {
			this.kill();
			return true;
		}

		const piece: TMonsterPiece = this.room.tilesActive[this.tailX + this.tailY * S.RoomWidth] as TMonsterPiece;
		ASSERT(piece);
		if (!piece) {
			this.kill();
			return true;
		}

		let tile: number = piece.tileNo;
		let t: number;
		switch (tile) {
			case(C.T_SNK_NS):
			case(C.T_SNK_EW):
				break;
			case(C.T_SNK_NW):
			case(C.T_SNK_SE):
				t = dx;
				dx = -dy;
				dy = -t;
				break;
			case(C.T_SNK_NE):
			case(C.T_SNK_SW):
				t = dx;
				dx = dy;
				dy = t;
				break;
			default:
				ASSERT(false);
		}

		switch (F.getO(dx, dy)) {
			case(C.N):
				tile = C.T_SNKT_S;
				this.tailO = C.N;
				break;
			case(C.S):
				tile = C.T_SNKT_N;
				this.tailO = C.S;
				break;
			case(C.E):
				tile = C.T_SNKT_W;
				this.tailO = C.E;
				break;
			case(C.W):
				tile = C.T_SNKT_E;
				this.tailO = C.W;
				break;
			default:
				ASSERT(false);
		}
		piece.tileNo = tile;
		piece.setGfx();

		return false;
	}

	protected kill() {
		CueEvents.add(C.CID_SNAKE_DIED_FROM_TRUNCATION, this);
		this.room.killMonster(this);
	}

	public isTileObstacle(tile: number): boolean {
		return !(
			F.isFloor(tile) ||
			F.isOpenDoor(tile) ||
			F.isPlatform(tile) ||
			tile == C.T_EMPTY ||
			tile == C.T_NODIAGONAL ||
			tile == C.T_FUSE ||
			tile == C.T_TOKEN);
	}

	public getBrainMovement(pathmap: Pathmap|undefined): boolean {
		if (!pathmap) {
			ASSERT(false, "Pathmap should be set");
			return false;
		}
		pathmap.calculate();

		let tile: PathmapTile | null = null;
		let tileCheck: PathmapTile;
		let wx: number, wy: number;
		let tdx: number, tdy: number;

		this.dx = 0;
		this.dy = 0;

		for (let i: number = 0; i < 4; i++) {
			wx = this.x + (tdx = TSerpent.dxDirBrain[i]);
			wy = this.y + (tdy = TSerpent.dyDirBrain[i]);

			if (wx < 0 || wy < 0 || wx >= S.RoomWidth || wy >= S.RoomHeight) {
				continue;
			}

			tileCheck = pathmap.tiles[wx + wy * S.RoomWidth];

			if (!this.doesSquareContainObstacle(wx, wy) && !this.doesArrowPreventMovement(tdx, tdy) && (!tile || tileCheck.targetDistance < tile.targetDistance)) {
				this.dxFirst = this.dx = tdx;
				this.dyFirst = this.dy = tdy;

				tile = tileCheck;
			}
		}

		return !!(tile && tile.targetDistance < Number.MAX_VALUE && (this.dx || this.dy));


	}

	public doesSquareContainObstacle(x: number, y: number): boolean {
		ASSERT(x != this.x || y != this.y);

		const index: number = x + y * S.RoomWidth;

		let tile: number = this.room.tilesTransparent[index];
		if (this.isTileObstacle(tile) || this.isTileObstacle(this.room.tilesFloor[index])) {
			return true;
		}

		tile = this.room.tilesOpaque[index];

		if (this.isTileObstacle(tile)) {
			return true;
		}

		const monster: TMonster | null = this.room.tilesActive[index];
		return !!monster;


	}

	public getTail() {
		for (const piece of this.pieces!) {
			switch (piece.tileNo) {
				case(C.T_SNKT_S):
					this.tailO = C.N;
					break;
				case(C.T_SNKT_N):
					this.tailO = C.S;
					break;
				case(C.T_SNKT_E):
					this.tailO = C.W;
					break;
				case(C.T_SNKT_W):
					this.tailO = C.E;
					break;
				default:
					continue;
			}

			this.tailX = piece.x;
			this.tailY = piece.y;

			if (this.oldTailX == Number.MAX_VALUE) {
				this.oldTailX = this.tailX;
				this.oldTailY = this.tailY;
			}

			return;
		}
	}

	protected getNormalMovement(tx: number, ty: number) {
		const ox: number = F.getOX(this.o);
		const oy: number = F.getOY(this.o);

		if (!Game.isInvisible || F.distanceInTiles(this.x, this.y, tx, ty) < C.DEFAULT_SMELL_RANGE) {
			if (!ox) {
				if (tx == this.x) {
					this.dy = oy;
					this.dx = 0;
					if (this.canMoveTo(this.x, this.y + this.dy)) {
						return;
					}
				}
			} else {
				if (ty == this.y) {
					this.dx = ox;
					this.dy = 0;
					if (this.canMoveTo(this.x + this.dx, this.y)) {
						return;
					}
				}
			}

			const horizontal: boolean = ((Game.spawnCycleCount % 10) + 1 <= 5);
			if (horizontal) {
				this.dx = (tx < this.x ? -1 : tx > this.x ? 1 : 0);
				if (this.dx == 0) {
					this.dy = (ty < this.y ? -1 : ty > this.y ? 1 : 0);
				} else {
					this.dy = 0;
				}
			} else {
				this.dy = (ty < this.y ? -1 : ty > this.y ? 1 : 0);
				if (this.dy == 0) {
					this.dx = (tx < this.x ? -1 : tx > this.x ? 1 : 0);
				} else {
					this.dx = 0;
				}
			}

			if (this.canMoveTo(this.x + this.dx, this.y + this.dy)) {
				return;
			}
		} // END Can See Player?

		let found: boolean = false;
		for (let i = 0; i < 4; i++) {
			this.dx = TSerpent.dxDirNoMove[i];
			this.dy = TSerpent.dyDirNoMove[i];
			if (this.dx == -ox && this.dy == -oy) {
				continue;
			}
			if (this.canMoveTo(this.x + this.dx, this.y + this.dy)) {
				found = true;
				break;
			}
		}

		if (!found) {
			this.dx = this.dy = 0;
		}
	}

	protected canMoveTo(x: number, y: number): boolean {
		const canMove: boolean = !(
			x < 0 || y < 0 ||
			x >= S.RoomWidth || y >= S.RoomHeight ||
			this.doesSquareContainObstacle(x, y));

		if (canMove) {
			return !this.doesArrowPreventMovement(x - this.x, y - this.y);
		}

		return false;
	}

	private findAndRemoveTailPiece() {
		if (!this.pieces) {
			return;
		}

		let i: number = 0;
		const k: number = this.pieces.length;
		let piece: TMonsterPiece;
		for (; i < k; i++) {
			piece = this.pieces[i];
			if (piece.x == this.tailX && piece.y == this.tailY) {
				piece.quickRemove();
				this.pieces.splice(i, 1);
				return;
			}
		}

		ASSERT("Shouldn't have happened");
	}

	public setGfx() {
		const openMouth: boolean = (Game.player.x == this.x + F.getOX(this.o) && Game.player.y == this.y + F.getOY(this.o));

		this.gfx = T.SERPENT[openMouth ? 1 : 0][this.o];
	}

	public onStabbed(sX: number, sY: number): boolean {
		return false;
	}
}
