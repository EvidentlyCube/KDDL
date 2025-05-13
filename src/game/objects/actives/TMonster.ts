import { TActiveObject } from "../TActiveObject";
import { TMonsterPiece } from "./TMonsterPiece";
import { F } from "../../../F";
import { C } from "../../../C";
import { Game } from "../../global/Game";
import { CueEvents } from "../../global/CueEvents";
import { S } from "../../../S";
import { ASSERT } from "../../../ASSERT";
import { Pathmap } from "../../global/Pathmap";
import { PathmapTile } from "../../global/PathmapTile";
import { PackedVars } from "../../global/PackedVars";
import { UtilsRandom } from "../../../../src.framework/net/retrocade/utils/UtilsRandom";

const FLYING_NON_OBSTACLES = new Set([
	C.T_PIT,
	C.T_PIT_IMAGE,
	C.T_WATER,
])
const GROUND_NON_OBSTACLES = new Set([
	C.T_EMPTY,
	C.T_FLOOR,
	C.T_FLOOR_MOSAIC,
	C.T_FLOOR_ROAD,
	C.T_FLOOR_GRASS,
	C.T_FLOOR_DIRT,
	C.T_FLOOR_ALT,
	C.T_FLOOR_IMAGE,
	C.T_TRAPDOOR,
	C.T_TRAPDOOR_WATER,
	C.T_BRIDGE,
	C.T_BRIDGE_H,
	C.T_BRIDGE_V,
	C.T_HOT,
	C.T_GOO,
	C.T_PRESSPLATE,
	C.T_DOOR_YO,
	C.T_DOOR_GO,
	C.T_DOOR_CO,
	C.T_DOOR_RO,
	C.T_DOOR_BO,
	C.T_ARROW_N,
	C.T_ARROW_NE,
	C.T_ARROW_E,
	C.T_ARROW_SE,
	C.T_ARROW_S,
	C.T_ARROW_SW,
	C.T_ARROW_W,
	C.T_ARROW_NW,
	C.T_PLATFORM_P,
	C.T_PLATFORM_W,
	C.T_NODIAGONAL,
	C.T_FUSE,
	C.T_SCROLL,
	C.T_TOKEN
]);

export class TMonster extends TActiveObject {
	public static dxDirBrain = [0, -1, 1, 0, 0, -1, 1, -1, 1] as ReadonlyArray<number>;
	public static dyDirBrain = [-1, 0, 0, 1, 0, -1, -1, 1, 1] as ReadonlyArray<number>;

	public static dxDirStandard = [-1, 0, 1, -1, 0, 1, -1, 0, 1] as ReadonlyArray<number>;
	public static dyDirStandard = [-1, -1, -1, 0, 0, 0, 1, 1, 1] as ReadonlyArray<number>;

	public dx: number;
	public dy: number;

	public dxFirst: number;
	public dyFirst: number;

	public isAlive: boolean = true;
	public skipTurn: boolean;

	public isNeather = false;
	public isFailingToMove = false;

	public pieces: TMonsterPiece[] | undefined;

	public killDirection: number;

	// Frame of the animation
	public animationFrame: number = 0;

	public isFlying(): boolean {
		return false;
	}

	public isPiece(): boolean {
		return false;
	}

	public getType(): number {
		return 0;
	}

	public getIdentity(): number {
		return this.getType();
	}

	public isAggressive(): boolean {
		return true;
	}

	public isVisible(): boolean {
		return true;
	}

	public getMovementType(): number {
		return C.MOVEMENT_GROUND;
	}

	public getProcessSequence(): number {
		return 1000;
	}

	public initialize(pieces: Element | null = null) {
	}

	public constructor() {
		super();

		this.dx = 0;
		this.dy = 0;
		this.dxFirst = 0;
		this.dyFirst = 0;
		this.killDirection = 0;
		this.pieces = [];
		this.animationFrame = UtilsRandom.fraction() < 0.5 ? 1 : 0;
		this.skipTurn = false;
	}

	/**
	 * Processes the monster movements
	 */
	public process(lastCommand: number) {
	}

	public setGfx() {
	}

	public setOrientation(dx: number, dy: number) {
		this.prevO = this.o;
		const newO: number = F.getO(dx, dy);

		if (newO != C.NO_ORIENTATION) {
			this.o = newO;
		}

		this.setGfx();
	}

	public makeStandardMove() {
		if ((!this.dx && !this.dy) || !F.isValidColRow(this.x + this.dx, this.y + this.dy)) {
			return;
		}

		this.move(this.x + this.dx, this.y + this.dy);

		if (this.x == Game.player.x && this.y == Game.player.y) {
			CueEvents.add(C.CID_MONSTER_KILLED_PLAYER, this);
		}
	}

	public move(newX: number, newY: number) {
		this.prevX = this.x;
		this.prevY = this.y;

		this.x = newX;
		this.y = newY;

		this.room.tilesActive[this.prevX + this.prevY * S.RoomWidth] = null;
		this.room.tilesActive[newX + newY * S.RoomWidth] = this;
	}

	public getBeelineMovement(targetX: number, targetY: number) {
		this.dx = this.dxFirst = targetX > this.x ? 1 : targetX < this.x ? -1 : 0;
		this.dy = this.dyFirst = targetY > this.y ? 1 : targetY < this.y ? -1 : 0;

		this.getBestMove();
	}

	public getBeelineMovementSmart(targetX: number, targetY: number, smartAxial: boolean, smartFlanking: boolean = false) {
		this.dx = this.dxFirst = targetX > this.x ? 1 : targetX < this.x ? -1 : 0;
		this.dy = this.dyFirst = targetY > this.y ? 1 : targetY < this.y ? -1 : 0;

		if (this.x + this.dx >= S.RoomWidth || this.x + this.dx < 0) {
			this.dx = 0;
		}
		if (this.y + this.dy >= S.RoomHeight || this.y + this.dy < 0) {
			this.dy = 0;
		}

		if (!this.dx && !this.dy) {
			return;
		}

		const diagonal = this.dx && this.dy;
		let triedHorizontal = false;

		if (diagonal) {
			if (this.isOpenMove(this.dx, this.dy)) {
				return;
			}

			// Can't move diagonally. Check if Horizontal or Vertical movement
			// will bring the monster closer to the targer
			// Try it first and use if works
			if (F.distanceInTiles(this.x + this.dx, this.y, targetX, targetY) <
				F.distanceInTiles(this.x, this.y + this.dy, targetX, targetY)) {
				// Horizontal is closer than vertical, try it:
				if (this.isOpenMove(this.dx, 0)) {
					this.dy = 0;
					return;
				}

				// Did not work, so let's not repeat it later
				triedHorizontal = true;
			}
		}

		if (this.dy && this.isOpenMove(0, this.dy)) {
			this.dx = 0;
			return;
		}

		if (this.dx && !triedHorizontal && this.isOpenMove(this.dx, 0)) {
			this.dy = 0;
			return;
		}

		if (!diagonal && smartAxial) {
			//If moving in the desired axial direction doesn't work, then try
			//the analog of the "best possible movement" for diagonal beelining, i.e.
			//Try taking a diagonal step toward the target instead of a straight step
			//(analogous to trying a straight step when a diagonal is desired).

			//If the target is one tile away and the monster can't move to the
			//target square, then this may cause oscillation.  However, it may also
			//allow the monster to reach the player from another side (e.g.
			//when a force arrow doesn't allow access from one side, but does from another),
			//so allow this movement to be considered if requested.

			if (F.distanceInTiles(this.x, this.y, targetX, targetY) > 1 || smartFlanking) {
				if (this.dx) {
					ASSERT(!this.dy);

					this.dy = -1;
					if (this.isOpenMove(this.dx, this.dy)) {
						return;
					}

					this.dy = 1;
					if (this.isOpenMove(this.dx, this.dy)) {
						return;
					}
				} else if (this.dy) {
					ASSERT(!this.dx);

					this.dx = -1;
					if (this.isOpenMove(this.dx, this.dy)) {
						return;
					}

					this.dx = 1;
					if (this.isOpenMove(this.dx, this.dy)) {
						return;
					}
				}
			}
		}

		this.dx = this.dy = 0;
	}

	public getBrainMovement(pathmap: Pathmap | undefined): boolean {
		if (!pathmap) {
			ASSERT(false, "Pathmap should be set");
			return false;
		}

		pathmap.calculate();

		let tile: PathmapTile | null = null;
		let tileCheck: PathmapTile;
		let wx: number, wy: number;
		let tdx: number, tdy: number;
		const px: number = Game.player.x;
		const py: number = Game.player.y;

		this.dx = 0;
		this.dy = 0;

		for (let i: number = 0; i < 9; i++) {
			wx = this.x + (tdx = TMonster.dxDirBrain[i]);
			wy = this.y + (tdy = TMonster.dyDirBrain[i]);

			if (wx < 0 || wy < 0 || wx >= S.RoomWidth || wy >= S.RoomHeight) {
				continue;
			}

			tileCheck = pathmap.tiles[wx + wy * S.RoomWidth];

			if (wx == px && wy == py && this.isOpenMove(tdx, tdy)) {
				tile = tileCheck;

				this.dxFirst = this.dx = tdx;
				this.dyFirst = this.dy = tdy;
				break;
			}

			if (!tileCheck.isObstacle && (!tile || tileCheck.targetDistance < tile.targetDistance) && (!(tdx || tdy) || this.isOpenMove(tdx, tdy))) {
				this.dxFirst = this.dx = tdx;
				this.dyFirst = this.dy = tdy;

				tile = tileCheck;
			}
		}

		if (tile && tile.targetDistance < Number.MAX_VALUE && (this.dx || this.dy)) {
			return true;
		}

		return false;
	}

	public getAvoidSwordMovement(targetX: number, targetY: number) {
		const targetSwordX: number = Game.player.swordX;
		const targetSwordY: number = Game.player.swordY;

		if (this.room.pathmapGround) {
			this.room.pathmapGround.calculate();
		}

		let currentTileScore: number = 0;
		let monsterDx: number;
		let monsterDy: number;
		let checkX: number;
		let checkY: number;
		let dist: number;
		let bestScore: number = 1;
		for (let i: number = 0; i < 9; i++) {
			checkX = this.x + (monsterDx = TMonster.dxDirStandard[i]);
			checkY = this.y + (monsterDy = TMonster.dyDirStandard[i]);

			if ((checkX == this.x && checkY == this.y) || this.isOpenMove(monsterDx, monsterDy)) {
				if (checkX == targetX && checkY == targetY) {
					currentTileScore = 90000;
				} else if ((checkX < targetSwordX ? targetSwordX - checkX : checkX - targetSwordX) <= 1 &&
					(checkY < targetSwordY ? targetSwordY - checkY : checkY - targetSwordY) <= 1) {
					currentTileScore = 5000;
				} else {
					dist = this.distanceToTarget(targetX, targetY, checkX, checkY);
					currentTileScore = (dist > 900 ? 0 : 90000 - 100 * dist);
				}
			}

			if (currentTileScore > bestScore) {
				bestScore = currentTileScore;
				this.dx = monsterDx;
				this.dy = monsterDy;
			}
		}

		if (this.dx || this.dy) {
			this.dxFirst = this.dx;
			this.dyFirst = this.dy;
		}
	}

	public distanceToTarget(targetX: number, targetY: number, checkX: number, checkY: number, useBrain: boolean = true): number {
		if (useBrain && Game.doesBrainSensePlayer) {
			const square: PathmapTile = this.room.pathmapGround!.tiles[this.x + this.y * S.RoomWidth];
			if (!square.isObstacle && square.targetDistance > 2 && square.targetDistance != Number.MAX_VALUE) {
				const square2: PathmapTile = this.room.pathmapGround!.tiles[checkX + checkY * S.RoomWidth];

				return square2.targetDistance + ((this.x - checkX) && (this.y - checkY) ? 0.5 : 0);
			}
		}

		return F.distanceInPixels(checkX, checkY, targetX, targetY);

		/*
		var xd:number = x - tx;
		var yd:number = y - ty;
		return Math.sqrt(xd * xd + yd * yd);
		*/
	}

	public getBestMove() {
		if (this.x + this.dx < 0 || this.x + this.dx >= S.RoomWidth) {
			this.dx = 0;
		}
		if (this.y + this.dy < 0 || this.y + this.dy >= S.RoomHeight) {
			this.dy = 0;
		}

		if (!this.dx && !this.dy) {
			return;
		}

		if (this.dx && this.dy && this.isOpenMove(this.dx, this.dy)) {
			return;
		}

		if (this.dy && this.isOpenMove(0, this.dy)) {
			this.dx = 0;
			return;
		}

		if (this.dx && this.isOpenMove(this.dx, 0)) {
			this.dy = 0;
			return;
		}

		this.dx = this.dy = 0;
	}

	public isOpenMove(dx: number, dy: number): boolean {
		return !(this.doesSquareContainObstacle(this.x + dx, this.y + dy) ||
			this.doesArrowPreventMovement(dx, dy));
	}

	public doesSquareContainObstacle(x: number, y: number): boolean {
		const arrayIndex: number = x + y * S.RoomWidth;

		return this.room.tilesActive[arrayIndex] !== null
			|| this.room.tilesSwords[arrayIndex] > 0
			|| this.isTileObstacle(this.room.tilesTransparent[arrayIndex])
			|| this.isTileObstacle(this.room.tilesFloor[arrayIndex])
			|| this.isTileObstacle(this.room.tilesOpaque[arrayIndex]);
	}

	public doesArrowPreventMovement(dx: number, dy: number): boolean {
		const dir: number = F.getO(dx, dy);
		let tile: number = this.room.tilesFloor[this.x + this.y * S.RoomWidth];

		if (F.isArrow(tile) && F.isArrowObstacle(tile, dir)) {
			return true;
		}

		tile = this.room.tilesFloor[this.x + dx + (this.y + dy) * S.RoomWidth];

		return F.isArrow(tile) && F.isArrowObstacle(tile, dir);
	}

	public isTileObstacle(tile: number): boolean {
		switch (this.getMovementType()) {
			case (C.MOVEMENT_WALL):
				return !(tile == C.T_EMPTY || F.isWall(tile) || F.isCrumblyWall(tile) || F.isDoor(tile) ||
					tile == C.T_NODIAGONAL || tile == C.T_SCROLL || tile == C.T_FUSE || tile == C.T_TOKEN || F.isArrow(tile));

			case (C.MOVEMENT_WATER):
				return !(tile == C.T_EMPTY || F.isWater(tile) || F.isArrow(tile) || tile == C.T_NODIAGONAL ||
					tile == C.T_FUSE || tile == C.T_TOKEN);

			default:
				return !GROUND_NON_OBSTACLES.has(tile)
					&& (!this.isFlying() || !FLYING_NON_OBSTACLES.has(tile));
		}
	}

	public onStabbed(sX: number, sY: number): boolean {
		CueEvents.add(C.CID_MONSTER_DIED_FROM_STAB, this);
		return true;
	}

	public killPieces() {
		if (this.pieces) {
			for (const piece of this.pieces) {
				piece.quickRemove();
			}
		}
	}

	public setMembersFromExtraVars(extra: PackedVars) {
	}
}
