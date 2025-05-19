import { UtilsNumber } from "src.framework/net/retrocade/utils/UtilsNumber";
import { MonsterMessageType, VOMonsterMessage } from "src/game/managers/VOMonsterMessage";
import { ASSERT } from "../../../ASSERT";
import { C } from "../../../C";
import { F } from "../../../F";
import { S } from "../../../S";
import { T } from "../../../T";
import { CueEvents } from "../../global/CueEvents";
import { Game } from "../../global/Game";
import { Level } from "../../global/Level";
import { PackedVars } from "../../global/PackedVars";
import { VOCharacterCommand } from "../../managers/VOCharacterCommand";
import { VOSpeechCommand } from "../../managers/VOSpeechCommand";
import { TStateGame } from "../../states/TStateGame";
import { TGameObject } from "../TGameObject";
import { TEvilEye } from "./TEvilEye";
import { TPlayer } from "./TPlayer";
import { TPlayerDouble } from "./TPlayerDouble";

export class TCharacter extends TPlayerDouble {

	private commands: VOCharacterCommand[] = [];

	private jumpLabel: number = 0;
	private currentCommand: number = 0;
	private turnDelay: number = 0;

	public swordSafeToPlayer: boolean = false;
	private endWhenKilled: boolean = false;
	private directMovement: boolean = false;

	public identity: number = 0;
	public logicalIdentity: number = 0;
	public visible: boolean = false;
	private playerTouchedMe: boolean = false;

	private ifBlock: boolean = false;

	public imperative: number = 0;
	public scriptID: number = 0;

	private movingRelative: boolean = false;
	private relX: number = 0;
	private relY: number = 0;

	public scriptDone: boolean = false;


	// ::::::::::::::::::::::::::::::::::::::::::::::
	// :: Game logic
	// ::::::::::::::::::::::::::::::::::::::::::::::

	public getType(): number {
		return C.M_CHARACTER;
	}

	public getIdentity(): number {
		return this.identity;
	}

	public isAggressive(): boolean {
		return false;
	}

	public isVisible(): boolean {
		return this.visible;
	}

	public update() {
		if (this.visible) {
			super.update();
		}

		if (!this.swordSheathed && this.isVisible()) {
			this.swordVO.x = this.swordX * S.RoomTileWidth + (this.prevX - this.x) * TStateGame.offset * S.RoomTileWidth;
			this.swordVO.y = this.swordY * S.RoomTileHeight + (this.prevY - this.y) * TStateGame.offset * S.RoomTileHeight;
			this.room.roomSpritesRenderer.registerSwordDraw(this.swordVO);
		}
	}

	public setGfx() {
		if (this.identity != C.M_BRAIN && this.o == C.NO_ORIENTATION) {
			this.o = C.S;
		}

		if (!this.swordSheathed) {
			this.updateSwordChangedSheathing(true);
			this.swordSheathed = true;
		}

		switch (this.identity) {
			case(C.M_BRAIN):
				this.prevO = this.o = C.NO_ORIENTATION;
				this.tileId = T.BRAIN[this.animationFrame];
				break;
			case(C.M_CITIZEN1):
			case(C.M_CITIZEN2):
			case(C.M_CITIZEN3):
			case(C.M_CITIZEN4):
				this.tileId = T.CITIZEN[this.o];
				break;
			case(C.M_EYE):
				this.tileId = T.EEYE[this.animationFrame][this.o];
				break;
			case(C.M_EYE_ACTIVE):
				this.tileId = T.EEYE[2][this.o];
				break;
			case(C.M_GOBLIN):
				this.tileId = T.GOBLIN[this.animationFrame][this.o];
				break;
			case(C.M_MIMIC):
				this.tileId = T.MIMIC[this.o];
				this.swordSheathed = false;
				this.updateSwordChangedSheathing(false);
				break;
			case(C.M_MUDCOORDINATOR):
				this.tileId = T.MUDCOORDINATOR[this.o];
				break;
			case(C.M_NEGOTIATOR):
				this.tileId = T.NEGOTIATOR[this.o];
				break;
			case(C.M_ROACH_QUEEN):
				this.tileId = T.RQUEEN[this.animationFrame][this.o];
				break;
			case(C.M_ROACH):
				this.tileId = T.ROACH[this.animationFrame][this.o];
				break;
			case(C.M_ROACH_EGG):
				this.tileId = T.REGG[this.animationFrame][this.o];
				break;
			case(C.M_SPIDER):
				this.tileId = T.SPIDER[this.animationFrame][this.o];
				break;
			case(C.M_TAR_BABY):
				this.tileId = T.TARBABY[this.animationFrame][this.o];
				break;
			case(C.M_TARTECHNICIAN):
				this.tileId = T.TARTECHNICIAN[this.o];
				break;
			case(C.M_WRAITHWING):
				this.tileId = T.WWING[this.animationFrame][this.o];
				break;
		}

		if (!this.swordSheathed) {
			this.swordVO.tileId = T.SWORD[this.o];
		}
	}

	public handleNeatherSpare(answer: boolean) {
		if (answer) {
			// Spare the neather, move him to an empty tile
			const {x, y} = this;
			for (const dir of [C.W, C.E, C.N, C.S, C.NE, C.NW, C.SE, C.SW]) {
				const dx = F.getOX(dir);
				const dy = F.getOY(dir);

				if (!this.doesSquareContainObstacle(x + dx, y + dy)) {
					this.move(x + dx, y + dy);
					this.setOrientation(dx, dy);
					break;
				}
			}
		} else {
			// Kill the neather
			CueEvents.add(C.CID_MONSTER_DIED_FROM_STAB, this);
			Game.room.killMonster(this, true);
		}

	}

	public onStabbed(sX: number, sY: number): boolean {
		if (this.isNeather) {
			const varId = Level.getVarIDByName('NeatherSafeToKill');

			if (Game.tempGameVars.getInt(varId, 0)) {
				CueEvents.add(C.CID_MONSTER_SPOKE, new VOMonsterMessage(
					this,
					// @FIXME i18n
					`"Don't kill me!" whines the 'Neather.  "I never meant you any harm, and if you could find it in your heart to let me live, I promise I will trouble you no further!"\n`
					+ "\n"
					+ "Spare the 'Neather?",
					MonsterMessageType.NeatherSpareQuestion
				));
			} else {
				CueEvents.add(C.CID_MONSTER_SPOKE, new VOMonsterMessage(
					this,
					// @FIXME i18n
					`It should not be possible to kill the 'Neather in this room, but you figured a way to do it.  Sorry about that.  The game must continue, nevertheless.`,
					MonsterMessageType.NeatherImpossibleKill
				));
			}

			return true;
		}
		if (this.imperative & C.IMP_INVULNERABLE) {
			return false;
		}

		CueEvents.add(C.CID_MONSTER_DIED_FROM_STAB, this);
		return true;
	}


	// ::::::::::::::::::::::::::::::::::::::::::::::
	// :: Character logic
	// ::::::::::::::::::::::::::::::::::::::::::::::

	public process(lastCommand: number) {
		this.isFailingToMove = false;

		// #DEFINE /*STOP_COMMAND*/ {if (!this.jumpLabel) {finish(this); return;} this.jumpLabel=0; processNextCommand = true; break;}
		// #DEFINE /*STOP_DONECOMMAND*/ {if (!this.jumpLabel) {finish(this); return;} this.jumpLabel=0; break;}

		let executeNoMoveCommands: boolean = Game.executingNoMoveCommands();

		// @todo refactor out
		const finish = (self: TCharacter) => {
			self.playerTouchedMe = false;
			if (!Game.executingNoMoveCommands() && !self.swordSheathed && self.isVisible()) {
				Game.processSwordHit(self.swordX, self.swordY, self);
			}
		}

		if (this.currentCommand >= this.commands.length) {
			finish(this);
			return;
		}

		const player = Game.player;


		this.ifBlock = false;
		this.jumpLabel = 0;

		let processNextCommand: boolean = false;
		let command: VOCharacterCommand;

		// Checking for infinite loops
		let turnCount: number = 0;
		let varSets: number = 0;

		do {
			if (this.turnDelay) {
				this.turnDelay -= 1;
				{
					finish(this);
					return;
				}
			}

			if (this.currentCommand >= this.commands.length) {
				finish(this);
				return;
			}

			command = this.commands[this.currentCommand];

			processNextCommand = false;

			switch (command.command) {
				case(C.CC_APPEAR):
					processNextCommand = true;

					if (this.visible) {
						break;
					}

					ASSERT(F.isValidColRow(this.x, this.y));
					if (this.room.tilesActive[this.x + this.y * S.RoomWidth] != null ||
						(player.x == this.x && player.y == this.y) ||
						this.room.tilesSwords[this.x + this.y * S.RoomWidth])
						/*STOP_COMMAND*/ {
						if (!this.jumpLabel) {
							finish(this);
							return;
						}
						this.jumpLabel = 0;
						processNextCommand = true;
						break;
					}

					this.setGfx();
					this.visible = true;
					this.room.tilesActive[this.x + this.y * S.RoomWidth] = this;

					if (this.imperative == C.IMP_REQUIRED_TO_CONQUER) {
						this.room.monsterCount++;
						CueEvents.add(C.CID_NPC_TYPE_CHANGE);
					}

					executeNoMoveCommands = true;

					if (!this.swordSheathed) {
						this.updateSwordChangedSheathing(false);
					}
					break;
				// Appear at (this.x,this.y)
				case(C.CC_APPEAR_AT):
					processNextCommand = true;

					if (this.visible) {
						break;
					}

					if (this.room.tilesActive[command.x + command.y * S.RoomWidth] != null ||
						(player.x == command.x && player.y == command.y) ||
						this.room.tilesSwords[command.x + command.y * S.RoomWidth])
						/*STOP_COMMAND*/ {
						if (!this.jumpLabel) {
							finish(this);
							return;
						}
						this.jumpLabel = 0;
						processNextCommand = true;
						break;
					}

					this.setGfx();
					this.visible = true;
					this.prevX = this.x = command.x;
					this.prevY = this.y = command.y;
					this.room.tilesActive[this.x + this.y * S.RoomWidth] = this;

					if (this.imperative == C.IMP_REQUIRED_TO_CONQUER) {
						this.room.monsterCount++;
						CueEvents.add(C.CID_NPC_TYPE_CHANGE);
					}

					executeNoMoveCommands = true;

					if (!this.swordSheathed) {
						this.updateSwordChangedSheathing(false);
					}
					break;

				case(C.CC_DISAPPEAR):
					processNextCommand = true;

					if (!this.visible) {
						break;
					}

					if (this.imperative == C.IMP_REQUIRED_TO_CONQUER) {
						this.room.monsterCount--;
						CueEvents.add(C.CID_NPC_TYPE_CHANGE);
					}

					this.disappear();
					executeNoMoveCommands = true;

					if (!this.swordSheathed) {
						this.updateSwordChangedSheathing(true);
					}
					break;

				// Move to (this.x,this.y); w = Forbid Turning; h = Single Step
				case(C.CC_MOVE_TO): {
					if (executeNoMoveCommands) {
						if (this.jumpLabel) {
							this.currentCommand -= 1;
						}
						{
							finish(this);
							return;
						}
					}

					if (!this.visible) {
						break;
					}

					let destX: number = command.x;
					let destY: number = command.y;

					// Moving towards specific character
					if (command.flags) {
						let destination: TGameObject | null = null;
						if (command.flags & C.FLAG_PLAYER) {
							destination = Game.player;
						} else if (command.flags & C.FLAG_MONSTER) {
							destination = this.room.monsters.getFirst() as TGameObject;
						} else if (command.flags & C.FLAG_NPC) {
							destination = this.room.getMonsterOfType(C.M_CHARACTER);
						} else if (command.flags & C.FLAG_PDOUBLE) {
							destination = this.room.getMonsterOfType(C.M_MIMIC);
						} else if (command.flags & C.FLAG_SELF) {
							break;
						} else if (command.flags & C.FLAG_PLAYER) {
							destination = Game.player;
						}

						if (!destination)
							/*STOP_COMMAND*/ {
							if (!this.jumpLabel) {
								finish(this);
								return;
							}
							this.jumpLabel = 0;
							processNextCommand = true;
							break;
						}

						destX = destination.x;
						destY = destination.y;
					}

					if (this.x == destX && this.y == destY) {
						processNextCommand = true;
						break;
					}

					if (this.directMovement) {
						throw new Error("Not yet implemented");
					} else {
						this.getBeelineMovementSmart(destX, destY, true, true);
					}

					if (!this.dx && !this.dy) {
						if (command.h) { // Is single move set?
							if (!command.w) // Allow turning?
							{
								this.setOrientation(this.dxFirst, this.dyFirst);
							}

							break;
						}
						/*STOP_COMMAND*/
						{
							if (!this.jumpLabel) {
								this.isFailingToMove = true;
								finish(this);
								return;
							}
							this.jumpLabel = 0;
							processNextCommand = true;
							break;
						}
					}

					//If moving toward a target entity, the NPC can't step on it
					//unless it's the player and the NPC can kill him,
					//so don't try to this.move if already adjacent.
					if (!(command.flags && F.distanceInTiles(this.x, this.y, destX, destY) == 1 &&
						(!(command.flags & C.FLAG_PLAYER) || this.safeToPlayer))) {
						this.moveCharacter(this.dx, this.dy, !command.w);
					}

					if (command.h) {
						break;
					}

					if (this.x != command.x || this.y != command.y)
						/*STOP_DONECOMMAND*/ {
						if (!this.jumpLabel) {
							finish(this);
							return;
						}
						this.jumpLabel = 0;
						break;
					}
				}
					break;

				// Move by (this.x,this.y); w = Forbid Turning; h = Single Step
				case(C.CC_MOVE_REL): {
					if (executeNoMoveCommands) {
						if (this.jumpLabel) {
							this.currentCommand -= 1;
						}
						{
							finish(this);
							return;
						}
					}

					if (!this.visible) {
						break;
					}

					// Initialize this funciton call
					if (!this.movingRelative) {
						if (!command.x && !command.y) {
							processNextCommand = true;
							break;
						}

						let destX = this.x + command.x;
						let destY = this.y + command.y;

						if (destX < 0) {
							destX = 0;
						} else if (destX >= S.RoomWidth) {
							destX = S.RoomWidth - 1;
						}

						if (destY < 0) {
							destY = 0;
						} else if (destY >= S.RoomHeight) {
							destY = S.RoomHeight - 1;
						}

						this.relX = destX;
						this.relY = destY;
						this.movingRelative = true;
					}

					if (this.directMovement) {
						throw new Error("Not yet implemented");
					} else {
						this.getBeelineMovementSmart(this.relX, this.relY, true, true);
					}

					if (!this.dx && !this.dy) {
						if (command.h) { // Is single this.move set?
							if (!command.w) // Allow turning?
							{
								this.setOrientation(this.dxFirst, this.dyFirst);
							}

							break;
						}
						/*STOP_COMMAND*/
						{
							if (!this.jumpLabel) {
								finish(this);
								return;
							}
							this.jumpLabel = 0;
							processNextCommand = true;
							break;
						}
					}

					this.moveCharacter(this.dx, this.dy, !command.w);

					if (command.h) {
						this.movingRelative = false;
						break;
					}

					if (this.x != this.relX || this.y != this.relY)
						/*STOP_DONECOMMAND*/ {
						if (!this.jumpLabel) {
							finish(this);
							return;
						}
						this.jumpLabel = 0;
						break;
					}

					this.movingRelative = false;
				}
					break;

				// Set orientation to W
				case(C.CC_FACE_DIRECTION):
					if (executeNoMoveCommands && this.visible) {
						if (this.jumpLabel) {
							--this.currentCommand;
						}
						{
							finish(this);
							return;
						}
					}

					this.prevO = this.o;
					switch (command.x) {
						case(C.CMD_C):
							this.o = F.nextCO(this.o);
							break;

						case(C.CMD_CC):
							this.o = F.nextCCO(this.o);
							break;

						default:
							ASSERT(F.isValidOrientation(command.x) && command.x != C.NO_ORIENTATION);
							this.o = command.x;
							break;
					}

					if (!this.swordSheathed && this.isVisible()) {
						this.room.tilesSwords[this.swordX + this.swordY * S.RoomWidth]--;
						this.swordX = this.x + F.getOX(this.o);
						this.swordY = this.y + F.getOY(this.o);
						this.room.tilesSwords[this.swordX + this.swordY * S.RoomWidth]++;
					}

					this.setGfx();

					if (!this.visible || this.prevO == this.o) {
						processNextCommand = true;
					}
					break;

				// Activate item (this.x,this.y)
				case(C.CC_ACTIVATE_ITEM_AT):
					if (this.room.tilesTransparent[command.x + command.y * S.RoomWidth] == C.T_ORB) {
						if (executeNoMoveCommands) {
							return;
						}
						this.room.activateOrb(command.x, command.y, C.OAT_SCRIPT_ORB);

					} else {
						processNextCommand = true;
					}
					break;

				// Wait this.x turns
				case(C.CC_WAIT):
					if (command.x) {
						if (executeNoMoveCommands)
							/*STOP_COMMAND*/ {
							if (!this.jumpLabel) {
								finish(this);
								return;
							}
							this.jumpLabel = 0;
							processNextCommand = true;
							break;
						}

						this.turnDelay = command.x - 1;
					}
					break;

				// Wait for this.x event
				case(C.CC_WAIT_FOR_CUE_EVENT):
					if (!CueEvents.hasOccurred(command.x)) {
						if (!this.jumpLabel) {
							this.room.charactersWaitingForCueEvents.push(this);
						}

						/*STOP_COMMAND*/
						{
							if (!this.jumpLabel) {
								finish(this);
								return;
							}
							this.jumpLabel = 0;
							processNextCommand = true;
							break;
						}
					}

					processNextCommand = true;
					break;

				// Wait until an entity in flags is in rect (this.x,this.y,w,h).
				case(C.CC_WAIT_FOR_RECT):
				case(C.CC_WAIT_FOR_NOT_RECT):
					let found: boolean = false;
					if (!found && (!command.flags || (command.flags & C.FLAG_PLAYER))) {
						if (player.x >= command.x && player.x <= command.x + command.w &&
							player.y >= command.y && player.y <= command.y + command.h) {
							found = true;
						}
					}
					if (!found && (command.flags & C.FLAG_MONSTER)) {
						if (this.room.isMonsterInRect(command.x, command.y,
							command.x + command.w, command.y + command.h, true)) {
							found = true;
						}
					}
					if (!found && (command.flags & C.FLAG_NPC)) {
						if (this.room.isMonsterInRectOfType(command.x, command.y,
							command.x + command.w, command.y + command.h, C.M_CHARACTER)) {
							found = true;
						}
					}
					if (!found && (command.flags & C.FLAG_MONSTER)) {
						if (this.room.isMonsterInRectOfType(command.x, command.y,
							command.x + command.w, command.y + command.h, C.M_MIMIC)) {
							found = true;
						}
					}
					if (!found && (command.flags & C.FLAG_SELF)) {
						if (this.x >= command.x && this.x <= command.x + command.w &&
							this.y >= command.y && this.y <= command.y + command.h) {
							found = true;
						}
					}
					if (!found && (command.flags & C.FLAG_BEETHRO)) {
						if (player.x >= command.x && player.x <= command.x + command.w &&
							player.y >= command.y && player.y <= command.y + command.h) {
							found = true;
						}
					}

					if ((command.command == C.CC_WAIT_FOR_RECT && !found) ||
						(command.command == C.CC_WAIT_FOR_NOT_RECT && found))
						/*STOP_COMMAND*/ {
						if (!this.jumpLabel) {
							finish(this);
							return;
						}
						this.jumpLabel = 0;
						processNextCommand = true;
						break;
					}

					processNextCommand = true;
					break;

				// Wait for door at (this.x,this.y) to be w = closed / opened
				case(C.CC_WAIT_FOR_DOOR_TO):
					const tile: number = this.room.tilesOpaque[command.x + command.y * S.RoomWidth];
					if (command.w == C.OA_CLOSE && !F.isDoor(tile))
						/*STOP_COMMAND*/ {
						if (!this.jumpLabel) {
							finish(this);
							return;
						}
						this.jumpLabel = 0;
						processNextCommand = true;
						break;
					}
					if (command.w == C.OA_OPEN && F.isDoor(tile))
						/*STOP_COMMAND*/ {
						if (!this.jumpLabel) {
							finish(this);
							return;
						}
						this.jumpLabel = 0;
						processNextCommand = true;
						break;
					}

					processNextCommand = true;
					break;

				// Wait until this.room reaches turn X
				case(C.CC_WAIT_FOR_TURN):
					if (Game.spawnCycleCount < command.x)
						/*STOP_COMMAND*/ {
						if (!this.jumpLabel) {
							finish(this);
							return;
						}
						this.jumpLabel = 0;
						processNextCommand = true;
						break;
					}

					processNextCommand = true;
					break;

				// Wait until this.room is cleared
				case(C.CC_WAIT_FOR_CLEAN_ROOM):
					if (!this.room.greenDoorsOpened)
						/*STOP_COMMAND*/ {
						if (!this.jumpLabel) {
							finish(this);
							return;
						}
						this.jumpLabel = 0;
						processNextCommand = true;
						break;
					}

					processNextCommand = true;
					break;

				// Wait until player faces orientation X
				case(C.CC_WAIT_FOR_PLAYER_TO_FACE):
					switch (command.x) {
						case (C.CMD_C):
							if (player.o != F.nextCO(player.prevO))
								/*STOP_COMMAND*/ {
								if (!this.jumpLabel) {
									finish(this);
									return;
								}
								this.jumpLabel = 0;
								processNextCommand = true;
								break;
							}
							break;
						case (C.CMD_CC):
							if (player.o != F.nextCCO(player.prevO))
								/*STOP_COMMAND*/ {
								if (!this.jumpLabel) {
									finish(this);
									return;
								}
								this.jumpLabel = 0;
								processNextCommand = true;
								break;
							}
							break;
						default:
							if (player.o != command.x)
								/*STOP_COMMAND*/ {
								if (!this.jumpLabel) {
									finish(this);
									return;
								}
								this.jumpLabel = 0;
								processNextCommand = true;
								break;
							}
							break;
					}
					processNextCommand = true;
					break;

				// Wait until player moves in direction X
				case(C.CC_WAIT_FOR_PLAYER_TO_MOVE):
					const playerMoved: boolean = (player.x != player.prevX || player.y != player.prevY);

					switch (command.x) {
						case (C.CMD_C):
							if (player.o != F.nextCO(player.prevO))
								/*STOP_COMMAND*/ {
								if (!this.jumpLabel) {
									finish(this);
									return;
								}
								this.jumpLabel = 0;
								processNextCommand = true;
								break;
							}
							break;
						case (C.CMD_CC):
							if (player.o != F.nextCCO(player.prevO))
								/*STOP_COMMAND*/ {
								if (!this.jumpLabel) {
									finish(this);
									return;
								}
								this.jumpLabel = 0;
								processNextCommand = true;
								break;
							}
							break;
						default:
							if (!playerMoved ||
								TPlayer.getSwordMovement(lastCommand, C.NO_ORIENTATION) != command.x)
								/*STOP_COMMAND*/ {
								if (!this.jumpLabel) {
									finish(this);
									return;
								}
								this.jumpLabel = 0;
								processNextCommand = true;
								break;
							}
							break;
					}
					processNextCommand = true;
					break;

				// Wait until player bumps
				case(C.CC_WAIT_FOR_PLAYER_TO_TOUCH_ME):
					if (!this.playerTouchedMe)
						/*STOP_COMMAND*/ {
						if (!this.jumpLabel) {
							finish(this);
							return;
						}
						this.jumpLabel = 0;
						processNextCommand = true;
						break;
					}
					processNextCommand = true;
					break;

				// Label holder
				case(C.CC_LABEL):
					// Used in the final room in KDDL6 post mastery area
					if (command.label === 'magic:kddl6-set-failed-var') {
						const { x, y } = Game.player;
						const isDangerSquare = (x % 2 === 0)
							? (y % 2 === 1)
							: (y % 2 === 0);

						if (isDangerSquare) {
							if (
								(x >= 4 && x <= 21 && y >= 14 && y <= 23)
								|| (x >= 1 && x <= 3 && y >= 18 && y <= 23)
								|| (x >= 22 && x <= 25 && y >= 20 && y <= 23)
							) {
								const varId = Level.getVarIDByName('KDDL6MasteryFailed');
								Game.tempGameVars.setInt(varId, 1);
							}
						}
					}
					processNextCommand = true;
					break;

				// Goto label X
				case(C.CC_GOTO): {
					let nextIndex: number = this.getIndexOfCommandWithLabel(command.x);
					if (nextIndex != -1) {
						this.currentCommand = nextIndex;
					} else {
						this.currentCommand++;
					}

					processNextCommand = true;
				}
					break;

				// Deliver speech SpeechID at (this.x,this.y)
				case(C.CC_SPEECH):
					if (!command.speech) {
						break;
					}

					const speech = new VOSpeechCommand(this, command, Game.turnNo, this.scriptID, this.currentCommand);
					speech.text = command.speech.message;

					CueEvents.add(C.CID_SPEECH, speech);

					processNextCommand = true;
					break;

				// Purge speech events in queue (this.x=display/erase)
				case(C.CC_FLUSH_SPEECH):
					//throw new Error("Not implemented");
					processNextCommand = true;
					break;

				// Sets this.imperative status to X
				case(C.CC_IMPERATIVE):
					const newImperative: number = command.x;
					let changeImperative: boolean = true;

					switch (newImperative) {
						case(C.IMP_SAFE):
							this.safeToPlayer = true;
							changeImperative = false;
							break;
						case(C.IMP_SWORD_SAFE_TO_PLAYER):
							this.swordSafeToPlayer = true;
							changeImperative = false;
							break;
						case(C.IMP_END_WHEN_KILLED):
							this.endWhenKilled = true;
							changeImperative = false;
							break;
						case(C.IMP_DEADLY):
							this.safeToPlayer = this.swordSafeToPlayer = false;
							changeImperative = false;
							break;
						case(C.IMP_DIE):
							if (executeNoMoveCommands && changeImperative) {
								return;
							}

							if (changeImperative) {
								this.currentCommand = this.commands.length;
							}

							if (this.visible) {
								if (!executeNoMoveCommands) {
									CueEvents.add(C.CID_MONSTER_DIED_FROM_STAB, this);
								}

								if (changeImperative) {
									this.killDirection = C.NO_ORIENTATION;
									this.room.killMonster(this, true);
								}
							}
							break;
						case(C.IMP_FLEXIBLE_BEELINING):
							this.directMovement = false;
							changeImperative = false;
							break;
						case(C.IMP_DIRECT_BEELINING):
							this.directMovement = true;
							changeImperative = false;
							break;
					}

					if (changeImperative) {
						const oldImperative: number = this.imperative;
						if (this.visible && newImperative != oldImperative) {
							if (newImperative == C.IMP_REQUIRED_TO_CONQUER) {
								this.room.monsterCount++;
								CueEvents.add(C.CID_NPC_TYPE_CHANGE);

							} else if (oldImperative == C.IMP_REQUIRED_TO_CONQUER) {
								if (this.isAlive) {
									this.room.monsterCount--;
								}
								CueEvents.add(C.CID_NPC_TYPE_CHANGE);
							}
						}

						this.imperative = newImperative;
					}

					if (this.isAlive) {
						processNextCommand = true;
					}
					break;

				// Turns into monster
				case(C.CC_TURN_INTO_MONSTER):
					this.turnIntoMonster();
					break;

				// End script
				case(C.CC_END_SCRIPT):
					if (!this.scriptDone) {
						this.scriptDone = true;
						Game.finishedScripts.push(this.scriptID);
					}
					this.currentCommand = this.commands.length;
					break;
				case(C.CC_END_SCRIPT_ON_EXIT):
					if (!this.scriptDone) {
						this.scriptDone = true;
						Game.finishedScripts.push(this.scriptID);
					}
					processNextCommand = true;
					break;
				case(C.CC_IF):
					this.currentCommand++;
					this.jumpLabel = this.currentCommand + 1;
					this.ifBlock = true;
					processNextCommand = true;
					continue;
				case(C.CC_IF_ELSE):
					this.ifBlock = true;
					processNextCommand = true;
					break;
				case(C.CC_IF_END):
					processNextCommand = true;
					break;

				// Takes player to level entrance X.  If Y is set, skip level entrance display.
				case(C.CC_LEVEL_ENTRANCE):
					if (!Game.turnNo) {
						return;
					}

					Game.gotoLevelEntrance(command.x, command.y != 0);
					break;

				// Sets var X (operation Y) W, e.g. X += 5
				case(C.CC_VAR_SET): {
					let leftName: string = command.x.toString();
					let leftType: number = Game.tempGameVars.typeOf(leftName);
					let isLeftInt: boolean = (leftType == C.UVT_int || leftType == C.UVT_unknown);

					let operand: number = command.w as number;

					if (command.label) {
						let operandName: string = Level.getVarIDByName(command.label);
						let operandType: number = Game.tempGameVars.typeOf(operandName);

						if (operandName != "" && (operandType == C.UVT_int || operandType == C.UVT_unknown)) {
							operand = Game.tempGameVars.getInt(operandName);
						}
					}

					let leftOperand: number = 0;
					const setNumber: boolean = (leftType != C.VAR_AppendText || leftType != C.VAR_AssignText);

					switch (command.y) {
						case(C.VAR_Assign):
							leftOperand = operand;
							break;

						case(C.VAR_Inc):
							if (isLeftInt) {
								leftOperand = Game.tempGameVars.getInt(leftName, 0);
							}
							leftOperand += operand;
							break;

						case(C.VAR_Dec):
							if (isLeftInt) {
								leftOperand = Game.tempGameVars.getInt(leftName, 0);
							}
							leftOperand -= operand;
							break;

						case(C.VAR_MultiplyBy):
							if (isLeftInt) {
								leftOperand = Game.tempGameVars.getInt(leftName, 0);
							}
							leftOperand *= operand;
							break;

						case(C.VAR_DivideBy):
							if (isLeftInt) {
								leftOperand = Game.tempGameVars.getInt(leftName, 0);
							}
							if (operand) {
								leftOperand /= operand;
							}
							break;

						case(C.VAR_Mod):
							if (isLeftInt) {
								leftOperand = Game.tempGameVars.getInt(leftName, 0);
							}
							leftOperand %= operand;
							break;

						case(C.VAR_AssignText):
							Game.tempGameVars.setString(leftName, command.label);
							break;

						case(C.VAR_AppendText):
							Game.tempGameVars.setString(leftName, Game.tempGameVars.getString(leftName, "") + command.label);
							break;
					}

					if (setNumber) {
						leftOperand = UtilsNumber.wrap(leftOperand | 0, C.MIN_INT, C.MAX_INT);
						Game.tempGameVars.setInt(leftName, leftOperand);
					}

					varSets++;
					turnCount = 0;

					processNextCommand = true;
				}
					break;

				// Wait until var X (comparison Y) W, e.g. X >= 5
				case(C.CC_WAIT_FOR_VAR): {
					let leftName = command.x.toString();
					let leftType = Game.tempGameVars.typeOf(leftName);
					let isLeftInt = (leftType == C.UVT_int || leftType == C.UVT_unknown);

					let operand = command.w as number;

					if (command.label) {
						let operandName = Level.getVarIDByName(command.label);
						let operandType = Game.tempGameVars.typeOf(operandName);

						if (operandName != "" && (operandType == C.UVT_int || operandType == C.UVT_unknown)) {
							operand = Game.tempGameVars.getInt(operandName);
						}
					}

					let leftOperand = 0;
					const isNumber: boolean = (isLeftInt && command.y != C.VAR_EqualsText);

					if (isNumber) {
						leftOperand = Game.tempGameVars.getInt(leftName, 0);
					}

					switch (command.y) {
						case (C.VAR_Equals):
							if (leftOperand != operand)
								/*STOP_COMMAND*/ {
								if (!this.jumpLabel) {
									finish(this);
									return;
								}
								this.jumpLabel = 0;
								processNextCommand = true;
								break;
							}
							break;
						case (C.VAR_Greater):
							if (leftOperand <= operand)
								/*STOP_COMMAND*/ {
								if (!this.jumpLabel) {
									finish(this);
									return;
								}
								this.jumpLabel = 0;
								processNextCommand = true;
								break;
							}
							break;
						case (C.VAR_Less):
							if (leftOperand >= operand)
								/*STOP_COMMAND*/ {
								if (!this.jumpLabel) {
									finish(this);
									return;
								}
								this.jumpLabel = 0;
								processNextCommand = true;
								break;
							}
							break;
						case (C.VAR_EqualsText):
							let str: string = '';
							if (leftType == C.UVT_char_string) {
								str = Game.tempGameVars.getString(leftName, "");
							}

							if (str != command.label)
								/*STOP_COMMAND*/ {
								if (!this.jumpLabel) {
									finish(this);
									return;
								}
								this.jumpLabel = 0;
								processNextCommand = true;
								break;
							}
							break;
					}

					processNextCommand = true;
				}
					break;

				// Sets this NPC to look like entity X.
				case(C.CC_SET_NPC_APPEARANCE):
					this.identity = this.logicalIdentity = command.x;
					this.setGfx();
					processNextCommand = true;
					break;


			}

			this.currentCommand++;

			if (this.ifBlock) {
				this.movingRelative = false;
			}

			if (this.jumpLabel) {
				let nextIndex = this.ifBlock ? this.jumpLabel : this.getIndexOfCommandWithLabel(this.jumpLabel);

				if (nextIndex != -1) {
					this.currentCommand = nextIndex;
				}

				this.jumpLabel = 0;
				this.ifBlock = false;
			} else if (this.ifBlock) {
				this.failedIfCondition();
			}

			if (++turnCount > this.commands.length || varSets > 1000) {
				this.currentCommand = this.commands.length;
				throw new Error("Infinite character loop");
			}

		} while (processNextCommand);

		finish(this);
	}

	/**
	 * If character is waiting for CueEvent and it hadn't happened in its
	 * Process sequence, it is added to be checked after all monsters this.move
	 * and this.room actions take place, after which a check is made
	 * of the CueEvent again
	 */
	public checkForCueEvents() {
		const command: VOCharacterCommand = this.commands[this.currentCommand];

		if (CueEvents.hasOccurred(command.x)) {
			this.currentCommand++;
		}
	}

	/**
	 * Changes the character into a monster
	 */
	private turnIntoMonster() {
		let identity: number = this.getIdentity();

		if (!F.isValidMonsterType(identity)) {
			if (identity != C.M_EYE_ACTIVE) {
				this.currentCommand = this.commands.length;
				return;
			}

			identity = C.M_EYE;
		}

		this.room.killMonster(this, true, true);

		if (!this.visible) {
			return;
		}

		const monster = this.room.addNewMonster(identity, this.x, this.y, this.o);
		if (monster instanceof TEvilEye && this.active) {
			(monster as TEvilEye).active = true;
			monster.setGfx();
		}

		CueEvents.add(C.CID_NPC_TYPE_CHANGE);
	}

	private moveCharacter(dx: number, dy: number, allowTurning: boolean) {
		this.move(this.x + dx, this.y + dy);
		this.swordMovement = F.getO(dx, dy);

		if (!this.swordSheathed && this.isVisible()) {
			this.room.tilesSwords[this.swordX + this.swordY * S.RoomWidth]--;
			this.swordX = this.x + F.getOX(this.o);
			this.swordY = this.y + F.getOY(this.o);
			this.room.tilesSwords[this.swordX + this.swordY * S.RoomWidth]++;
		}

		if (allowTurning) {
			this.setOrientation(dx, dy);
		}

		if (!this.safeToPlayer && Game.player.x == this.x && Game.player.y == this.y) {
			CueEvents.add(C.CID_MONSTER_KILLED_PLAYER, this);
		}
	}

	private disappear() {
		ASSERT(this.room);
		this.visible = false;
		ASSERT(this.room.tilesActive[this.x + this.y * S.RoomWidth] == this);
		this.room.tilesActive[this.x + this.y * S.RoomWidth] = null;
	}

	private getIndexOfCommandWithLabel(label: number): number {
		if (label) {
			for (let i: number = this.commands.length; i--;) {
				const command: VOCharacterCommand = this.commands[i];
				if (command.command == C.CC_LABEL && label == command.x) {
					return i;
				}
			}
		}

		return -1;
	}

	private failedIfCondition() {
		let nestingDepth: number = 0;
		let scanning: boolean = true;

		do {
			if (this.currentCommand >= this.commands.length) {
				return;
			}

			const command: VOCharacterCommand = this.commands[this.currentCommand];

			switch (command.command) {
				case(C.CC_IF):
					nestingDepth++;
					break;
				case(C.CC_IF_ELSE):
					if (nestingDepth == 0) {
						scanning = false;
					}
					break;
				case(C.CC_IF_END):
					if (nestingDepth-- == 0) {
						scanning = false;
					}
					break;
			}

			this.currentCommand++;
		} while (scanning);

		this.ifBlock = false;
	}


	// DESERIALIZATION

	public setMembersFromExtraVars(extra: PackedVars) {
		this.logicalIdentity = extra.getUint("id", 0);
		this.identity = this.logicalIdentity;

		this.visible = extra.getBool("visible", false);

		this.swordSheathed = true;

		this.setGfx();

		this.scriptID = extra.getUint("ScriptID", 0);

		const commandBuffer = extra.getByteArray("Commands", null);

		if (commandBuffer) {
			this.deserializeCommands(commandBuffer);
		}
	}

	private deserializeCommands(buffer: Uint8Array) {
		VOCharacterCommand.deserializeBuffer(buffer, this.commands);

		const firstCommand = this.commands[0];

		if (firstCommand.command === C.CC_LABEL && firstCommand.label === 'neather=1') {
			this.isNeather = true;
		}

	}
}
