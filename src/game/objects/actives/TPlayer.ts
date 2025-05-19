import {TGameObject} from "../TGameObject";
import {VOSwordDraw} from "../../managers/VOSwordDraw";
import {Game} from "../../global/Game";
import {S} from "../../../S";
import {T} from "../../../T";
import {TStateGame} from "../../states/TStateGame";
import {Room} from "../../global/Room";
import {C} from "../../../C";
import {CueEvents} from "../../global/CueEvents";
import {VOCoord} from "../../managers/VOCoord";
import {F} from "../../../F";
import {ASSERT} from "../../../ASSERT";
import {Progress} from "../../global/Progress";
import {Gfx} from "../../global/Gfx";

export class TPlayer extends TGameObject {
	public swordX: number = 0;
	public swordY: number = 0;
	public swordMovement: number = 0;

	public placingDoubleType: number = 0;
	public doubleCursorX: number = 0;
	public doubleCursorY: number = 0;

	public swordVO: VOSwordDraw = {x: 0, y: 0, tileId: 0};

	public hidePlayer: boolean = false;

	public setGfx() {
		if (
			Game.isInvisible
			&& !Game.room.isMonsterInRect(
				Math.max(0, this.x - 5),
				Math.max(0, this.y - 5),
				Math.min(S.RoomWidth - 1, this.x + 5),
				Math.min(S.RoomHeight, this.y + 5),
				false
			)
		) {
			this.tileId = T.DECOY[this.o];
			this.swordVO.tileId = T.DECOY_SWORD[this.o];
		} else {
			this.swordVO.tileId = T.SWORD[this.o];
			this.tileId = T.BEETHRO[this.o];
		}
	}

	public update() {
		if (this.hidePlayer) {
			return;
		}

		super.update();
		Game.room.roomSpritesRenderer.pullBackObject(this);

		this.swordVO.x = this.swordX * S.RoomTileWidth + (this.prevX - this.x) * TStateGame.offset * S.RoomTileWidth;
		this.swordVO.y = this.swordY * S.RoomTileHeight + (this.prevY - this.y) * TStateGame.offset * S.RoomTileHeight;
		this.room.roomSpritesRenderer.registerSwordDraw(this.swordVO);
	}

	public process(command: number) {
		let dx: number = 0;
		let dy: number = 0;

		switch (command) {
			case(C.CMD_C):
				CueEvents.add(C.CID_SWING_SWORD, new VOCoord(this.x, this.y, this.o));
				this.rotateClockwise();
				break;
			case(C.CMD_CC):
				this.rotateCounterClockwise();
				CueEvents.add(C.CID_SWING_SWORD, new VOCoord(this.x, this.y, this.o));
				break;
			case(C.CMD_NW):
				dx = -1;
				dy = -1;
				break;
			case(C.CMD_N):
				dy = -1;
				break;
			case(C.CMD_NE):
				dx = 1;
				dy = -1;
				break;
			case(C.CMD_W):
				dx = -1;
				break;
			case(C.CMD_E):
				dx = 1;
				break;
			case(C.CMD_SW):
				dx = -1;
				dy = 1;
				break;
			case(C.CMD_S):
				dy = 1;
				break;
			case(C.CMD_SE):
				dx = 1;
				dy = 1;
				break;
			case(C.CMD_WAIT):
				break;

			default:
				return;
		}

		const direction: number = F.getO(dx, dy);

		this.swordMovement = TPlayer.getSwordMovement(command, this.o);

		const arrayPos: number = this.x + this.y * S.RoomWidth;

		const oldTileO: number = this.room.tilesOpaque[arrayPos];
		const oldTileF: number = this.room.tilesFloor[arrayPos];
		const oldTileT: number = this.room.tilesTransparent[arrayPos];

		const makeMove = () => {
			const moved: boolean = dx != 0 || dy != 0;
			const readyToDropTrapdoor: boolean = F.isTrapdoor(oldTileO);
			const wasOnSameScroll: boolean = (oldTileT == C.T_SCROLL) && !moved && Game.turnNo > 0;

			if (command != C.CMD_C && command != C.CMD_CC) {
				this.setPosition(this.x + dx, this.y + dy);
			}

			if (readyToDropTrapdoor && moved) {
				this.room.destroyTrapdoor(this.x - dx, this.y - dy);
			}

			const arrayIndex: number = this.x + this.y * S.RoomWidth;

			const newTSquare: number = this.room.tilesTransparent[arrayIndex];
			if (newTSquare == C.T_SCROLL && !wasOnSameScroll) {
				const scroll = this.room.scrolls.get(arrayIndex);

				ASSERT(scroll);

				if (scroll) {
					CueEvents.add(C.CID_STEP_ON_SCROLL, scroll.textId);
				}
			}

			// Handle different T-Squares
			switch (newTSquare) {
				case C.T_POTION_M:
					Game.drankPotion(C.M_MIMIC);
					break;

				case C.T_POTION_I:
					Game.isInvisible = !Game.isInvisible;
					this.room.plot(this.x, this.y, C.T_EMPTY);
					this.setGfx();
					CueEvents.add(C.CID_DRANK_POTION);
					break;

				default:
					if (moved) {
						CueEvents.add(C.CID_STEP);
					}
			}


			Game.processSwordHit(this.swordX, this.swordY);

			const newOSquare: number = this.room.tilesOpaque[arrayIndex];
			switch (newOSquare) {
				case(C.T_STAIRS):
				case(C.T_STAIRS_UP):
					Game.handleLeaveLevel();
					break;

				case(C.T_WALL_MASTER):
					if (!Progress.isGameMastered) {
						//Player hit "master wall" and couldn't go through.
						//Don't allow this move to be made.
						CueEvents.add(C.CID_BUMPED_MASTER_WALL);
						return;
					}
					break;
			}

		};

		if (!dx && !dy) {
			makeMove();
			return;
		}

		// Check for arrows
		if (F.isArrowObstacle(oldTileF, direction)) {
			CueEvents.add(C.CID_HIT_OBSTACLE);

			dx = dy = 0;
			makeMove();
			return;
		}

		//Check for leaving the room
		if (!F.isValidColRow(this.x + dx, this.y + dy)) {
			if (Game.isRoomLocked) {
				CueEvents.add(C.CID_ROOM_EXIT_LOCKED);
				return;
			}

			if (Game.handleLeaveRoom(direction)) {
				return;
			}

			CueEvents.add(C.CID_HIT_OBSTACLE);
			dx = dy = 0;
			makeMove();
			return;
		}

		if (this.doesSquareContainPlayerObstacle(this.x + dx, this.y + dy, direction)) {
			const newArrayPos: number = this.x + dx + (this.y + dy) * S.RoomWidth;

			const newTileO: number = this.room.tilesOpaque[newArrayPos];
			const newTileF: number = this.room.tilesFloor[newArrayPos];

			if (newTileO == C.T_PIT) {
				CueEvents.add(C.CID_SCARED);
				dx = dy = 0;
				makeMove();
				return;
			}

			// F-Layer checking
			if (F.isArrowObstacle(newTileF, direction)) {
				CueEvents.add(C.CID_HIT_OBSTACLE, new VOCoord(this.x + dx, this.y + dy, direction));
				dx = dy = 0;
				makeMove();
				return;
			}

			// T-Layer checking is not present in 1.0

			// Monster checking is not present in 1.0

			// If here then handle as per default
			CueEvents.add(C.CID_HIT_OBSTACLE, new VOCoord(this.x + dx, this.y + dy, direction));
			dx = dy = 0;
		}

		makeMove();
	}

	public setPosition(newX: number, newY: number, ignoreSwordCount: boolean = false): boolean {
		const moved: boolean = (this.x != newX || this.y != newY);

		this.prevX = this.x;
		this.prevY = this.y;
		this.prevO = this.o;

		this.x = newX;
		this.y = newY;

		this.setSwordCoords(ignoreSwordCount);

		return moved;
	}

	public setSwordCoords(ignoreSwordCount: boolean = false) {
		if (Game.turnNo && !ignoreSwordCount && F.isValidColRow(this.swordX, this.swordY)) {
			this.room.tilesSwords[this.swordX + this.swordY * S.RoomWidth]--;
		}

		this.swordX = this.x + F.getOX(this.o);
		this.swordY = this.y + F.getOY(this.o);

		if (!ignoreSwordCount && F.isValidColRow(this.swordX, this.swordY)) {
			this.room.tilesSwords[this.swordX + this.swordY * S.RoomWidth]++;
		}

		this.setGfx();
	}

	private rotateClockwise() {
		this.prevX = this.x;
		this.prevY = this.y;
		this.prevO = this.o;
		this.o = F.nextCO(this.o);

		this.setGfx();

		this.setSwordCoords();
	}

	private rotateCounterClockwise() {
		this.prevX = this.x;
		this.prevY = this.y;
		this.prevO = this.o;
		this.o = F.nextCCO(this.o);

		this.setGfx();

		this.setSwordCoords();
	}

	private doesSquareContainPlayerObstacle(x: number, y: number, dir: number): boolean {
		const tilePos: number = x + y * S.RoomWidth;
		let tile: number = this.room.tilesTransparent[tilePos];
		if (!(tile == C.T_EMPTY || tile == C.T_SCROLL || F.isPotion(tile))) {
			return true;
		}

		if (F.isArrowObstacle(this.room.tilesFloor[tilePos], dir)) {
			return true;
		}

		tile = this.room.tilesOpaque[tilePos];
		if (!TPlayer.canPlayerMoveOnThisElement(tile)) {
			return true;
		}

		if (this.room.tilesActive[tilePos]) {
			return true;
		}

		const swordCount: number = this.room.tilesSwords[tilePos];
		return swordCount > 1 || (swordCount == 1 && dir != this.o);


	}

	private static canPlayerMoveOnThisElement(tile: number): boolean {
		return F.isFloor(tile) || F.isOpenDoor(tile) || F.isStairs(tile) ||
			(tile == C.T_WALL_MASTER && Progress.isGameMastered);
	}

	public static getSwordMovement(command: number, orientation: number): number {
		switch (command) {
			case(C.CMD_C):
				switch (orientation) {
					case(C.NW):
						return C.NE;
					case(C.N):
						return C.E;
					case(C.NE):
						return C.SE;
					case(C.W):
						return C.N;
					case(C.E):
						return C.S;
					case(C.SW):
						return C.NW;
					case(C.S):
						return C.W;
					case(C.SE):
						return C.SW;
				}
				break;

			case(C.CMD_CC):
				switch (orientation) {
					case(C.NW):
						return C.SW;
					case(C.N):
						return C.W;
					case(C.NE):
						return C.NW;
					case(C.W):
						return C.S;
					case(C.E):
						return C.N;
					case(C.SW):
						return C.SE;
					case(C.S):
						return C.E;
					case(C.SE):
						return C.SE;
				}
				break;

			case(C.CMD_NW):
				return C.NW;
			case(C.CMD_N):
				return C.N;
			case(C.CMD_NE):
				return C.NE;
			case(C.CMD_W):
				return C.W;
			case(C.CMD_E):
				return C.E;
			case(C.CMD_SW):
				return C.SW;
			case(C.CMD_S):
				return C.S;
			case(C.CMD_SE):
				return C.SE;
		}

		return C.NO_ORIENTATION;
	}
}