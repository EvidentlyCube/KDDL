import {TPlayer} from "../objects/actives/TPlayer";
import {VOCoord} from "../managers/VOCoord";
import {PackedVars} from "./PackedVars";
import {Room} from "./Room";
import {C} from "../../C";
import {TBrain} from "../objects/actives/TBrain";
import {TMonster} from "../objects/actives/TMonster";
import {F} from "../../F";
import {TPlayerDouble} from "../objects/actives/TPlayerDouble";
import {CueEvents} from "./CueEvents";
import {HoldInfo, S} from "../../S";
import {TTarMother} from "../objects/actives/TTarMother";
import {TCharacter} from "../objects/actives/TCharacter";
import {ASSERT} from "../../ASSERT";
import {Commands} from "./Commands";
import {Progress} from "./Progress";
import {TMimic} from "../objects/actives/TMimic";
import {Level} from "./Level";
import {attr, intAttr} from "../../XML";
import {PlatformOptions} from "../../platform/PlatformOptions";
import {_} from "../../../src.framework/_";
import {UtilsString} from "../../../src.framework/net/retrocade/utils/UtilsString";
import {VOSpeechCommand} from "../managers/VOSpeechCommand";
import {TGameObject} from "../objects/TGameObject";
import {TMonsterPiece} from "../objects/actives/TMonsterPiece";
import {TStateGame} from "../states/TStateGame";
import {Achievements} from "../achievements/Achievements";
import {TWidgetLevelName} from "../widgets/TWidgetLevelName";
import {TEffectRoomSlide} from "../objects/TEffectRoomSlide";
import { MonsterMessageType, VOMonsterMessage } from "../managers/VOMonsterMessage";
import { PermanentStore } from "./store/PermanentStore";

const NERVOUS_TILES_X = [
	[0, 1, 1], // NW
	[-1, 0, 1], // N
	[-1, -1, 0], // NE
	[1, 1, 1], // W
	null,
	[-1, -1, -1], // E
	[0, 1, 1], // SW
	[-1, 0, 1], // S
	[-1, -1, 0],  // SE
];

/**
 * Helper: tiles to check for enemies location depending on Game.player's orientation
 */
const NERVOUS_TILES_Y = [
	[1, 1, 0], // NW
	[1, 1, 1], // N
	[0, 1, 1], // NE
	[-1, 0, 1], // W
	null,
	[-1, 0, 1], // E
	[-1, -1, 0], // SW
	[-1, -1, -1], // S
	[0, -1, -1],  // SE
];

export class Game {
	/******************************************************************************************************/
	/**                                                                                        VARIABLES  */
	/******************************************************************************************************/

	public static player = new TPlayer();

	public static isInvisible = false;
	public static doesBrainSensePlayer = false;

	public static simultaneousSwordHits: VOCoord[] = [];

	public static turnNo = 0;
	public static spawnCycleCount = 0;
	public static playerTurn = 0;

	public static startRoomO = 0;
	public static startRoomX = 0;
	public static startRoomY = 0;

	public static isGameActive = false;
	public static isPlayerDying = false;
	public static executeNoMoveCommands = false;
	public static isRoomLocked = false;

	public static lastCheckpointX = Number.MAX_VALUE;
	public static lastCheckpointY = Number.MAX_VALUE;
	public static checkpointTurns: number[] = [];

	public static tempGameVars: PackedVars;
	public static finishedScripts: number[] = [];

	/** True if this is the first visit to this room*/
	public static isNewRoom = false;

	public static playerLeftRoom = false;

	public static room: Room;

	public static get levelId() {
		return Game.room.levelId;
	}

	// ::::::::::::::::::::::::::::::::::::::::::::::
	// :: Level Stats
	// ::::::::::::::::::::::::::::::::::::::::::::::

	public static statKills: number = 0;
	public static statDeaths: number = 0;
	public static statMoves: number = 0;
	public static statTime: number = 0;

	public static statStartTime: number = 0;
	public static pendingQuestions: VOMonsterMessage[] = [];

	//{ Process
	/******************************************************************************************************/
	/**                                                                                          PROCESS  */

	/******************************************************************************************************/

	/**
	 * This is a subsidiary of processMonsters() and should only be called by it.
	 *
	 * Returns if brain sense Game.player in this turn, which happens only if the Game.player is visible
	 * or within the smelling range.
	 * @return True if Game.player is sensed by any brain.
	 */
	public static doesBrainSenseSwordsman(): boolean {
		if (Game.room.brainCount) {
			for (const i of Game.room.monsters.getAllOriginal()) {
				if (i && i.getType() == C.M_BRAIN && (i as TBrain).canSensePlayer()) {
					return true;
				}
			}
		}

		return false;
	}

	/**
	 * Processes a single sword hit - breaks walls, kills enemies, adds Simultaneous Sword Hit on tar.
	 *
	 * @param	sX X position of the sword
	 * @param	sY Y position of the sword
	 * @param	double Instance of the TPlayerDouble who does the sword hit. If null, it is Game.player hitting.
	 * Player killing test is only done if double is set.
	 */
	public static processSwordHit(sX: number, sY: number, double: TMonster | null = null) {
		if (!F.isValidColRow(sX, sY)) {
			return;
		}

		const playerDouble = (double instanceof TPlayerDouble ? double as TPlayerDouble : null);

		const swordMovement: number = (playerDouble ? playerDouble.swordMovement : Game.player.swordMovement);

		const monster = Game.room.tilesActive[sX + sY * S.RoomWidth];
		if (monster) {
			if (monster.onStabbed(sX, sY)) {
				if (CueEvents.hasOccurredWith(C.CID_MONSTER_DIED_FROM_STAB, monster)) {
					Game.room.killMonster(monster);
					monster.killDirection = Game.player.swordMovement;
					if (!double) {
						CueEvents.add(C.CID_SWORDSMAN_STABBED_MONSTER);
					}
				}

				if (F.isTar(Game.room.tilesTransparent[sX + sY * S.RoomWidth]) &&
					monster instanceof TTarMother) {
					Game.simultaneousSwordHits.push(new VOCoord(sX, sY, swordMovement));
				}
			}
		}

		let tileNo: number = Game.room.tilesTransparent[sX + sY * S.RoomWidth];
		switch (tileNo) {
			case(C.T_ORB):
				Game.room.activateOrb(sX, sY, double ? C.OAT_MONSTER : C.OAT_PLAYER);
				break;

			case(C.T_TAR):
				if (Game.room.stabTar(sX, sY, false)) {
					Game.simultaneousSwordHits.push(new VOCoord(sX, sY, swordMovement));
				}
				break;
		}

		tileNo = Game.room.tilesOpaque[sX + sY * S.RoomWidth];
		switch (tileNo) {
			case(C.T_WALL_BROKEN):
			case(C.T_WALL_HIDDEN):
				Game.room.destroyCrumblyWall(sX, sY, swordMovement);
				break;
		}

		if (double) {
			if (Game.player.x == sX && Game.player.y == sY && Game.turnNo) {

				if (double.getType() === C.M_CHARACTER) {
					if ((double as TCharacter).swordSafeToPlayer) {
						return;
					}
				}
				CueEvents.add(C.CID_MONSTER_KILLED_PLAYER, double);
			}
		}
	}

	/**
	 * Subsidiary of processCommand(), it is executed by processCommand and the rest of that static is skipped.
	 * It should not be called in any other way.
	 *
	 * Responses to Game.player controls by moving the target control, and allows placing the double.
	 *
	 * @param	command Command issued by Game.player
	 * @param	x X position to place (only when called by demo replay or mouse interaction)
	 * @param	y Y position to place (only when called by demo replay or mouse interaction)
	 */
	private static processDoublePlacement(command: number, x: number = Number.MAX_VALUE, y: number = Number.MAX_VALUE) {
		ASSERT(Game.player.placingDoubleType);

		let dx: number = 0, dy: number = 0;
		switch (command) {
			case(C.CMD_N):
				dy = -1;
				break;
			case(C.CMD_S):
				dy = 1;
				break;
			case(C.CMD_W):
				dx = -1;
				break;
			case(C.CMD_E):
				dx = 1;
				break;
			case(C.CMD_NW):
				dy = -1;
				dx = -1;
				break;
			case(C.CMD_NE):
				dy = -1;
				dx = 1;
				break;
			case(C.CMD_SW):
				dy = 1;
				dx = -1;
				break;
			case(C.CMD_SE):
				dy = 1;
				dx = 1;
				break;
			case(C.CMD_CC):
			case(C.CMD_C):
			case(C.CMD_WAIT):
			case(C.CMD_DOUBLE):
				break;
			default:
				return;
		}

		if (command == C.CMD_WAIT || command == C.CMD_DOUBLE) {
			if (command == C.CMD_DOUBLE) {
				ASSERT(F.isValidColRow(x, y));
				Game.player.doubleCursorX = x;
				Game.player.doubleCursorY = y;
			}

			if (!Game.room.doesSquareContainDoublePlacementObstacle(Game.player.doubleCursorX, Game.player.doubleCursorY)) {
				const double: TPlayerDouble = Game.room.addNewMonster(Game.player.placingDoubleType,
					Game.player.doubleCursorX, Game.player.doubleCursorY, Game.player.o) as TPlayerDouble;

				ASSERT(double);
				Game.player.placingDoubleType = 0;
				if (double) {
					if (!Commands.isFrozen()) {
						Commands.addWithData(C.CMD_DOUBLE, Game.player.doubleCursorX, Game.player.doubleCursorY);
					}

					CueEvents.add(C.CID_DOUBLE_PLACED);

					Game.turnNo++;
					double.process(C.CMD_WAIT);
					Game.processSimultaneousSwordHits();

					Game.queryCheckpoint(double.x, double.y);

					Game.room.processTurn(false);

					Game.updatePrevCoords();
				}
			}

		} else { // Not placing
			if (F.isValidColRow(Game.player.doubleCursorX + dx, Game.player.doubleCursorY + dy)) {
				Game.player.doubleCursorX += dx;
				Game.player.doubleCursorY += dy;
			}
		}
	}

	/**
	 * The actual command processing/
	 *
	 * @param	command Command issued
	 * @param	wx Special X variable, used by replays & mouse interaction
	 * @param	wy Special Y variable, used by replays & mouse interaction
	 */
	public static processCommand(command: number, wx: number = Number.MAX_VALUE, wy: number = Number.MAX_VALUE) {
		ASSERT(Game.isGameActive);

		CueEvents.clear();

		if (!Commands.isFrozen() && !Game.player.placingDoubleType) {
			Commands.add(command);
		}

		if (!Game.player.placingDoubleType) {
			Game.turnNo++;
			if (!Commands.isFrozen()) {
				Game.statMoves++;
			}
		}

		const originalMonsterCount: number = Game.room.monsterCount;

		{
			// Normal turn or placing double?
			if (Game.player.placingDoubleType) {
				Game.processDoublePlacement(command, wx, wy);
			} else {
				Game.playerTurn++;
				Game.player.process(command);

				// Ignore move if bumped master wall or Game.room locked
				if (CueEvents.hasOccurred(C.CID_BUMPED_MASTER_WALL) || CueEvents.hasOccurred(C.CID_ROOM_EXIT_LOCKED)) {
					//Room exit should never be locked during move playback.
					ASSERT(!CueEvents.hasOccurred(C.CID_ROOM_EXIT_LOCKED) || !Commands.isFrozen());

					--Game.playerTurn;
					--Game.turnNo;
					--Game.statMoves;

					if (!Commands.isFrozen()) {
						Commands.removeLast();
					}

					return;
				}

				Game.playerLeftRoom = CueEvents.hasAnyOccurred(C.CIDA_PLAYER_LEFT_ROOM);

				if (CueEvents.hasOccurred(C.CID_BUMPED_MASTER_WALL)) {
					// Make as if this move had never happened

					ASSERT(Game.playerTurn);
					Game.playerTurn--;

					ASSERT(Game.turnNo);
					Game.turnNo--;

					ASSERT(Game.statMoves);
					Game.statMoves--;

					if (!Commands.isFrozen()) {
						Commands.removeLast();
					}

					return;
				}

				{
					if (Game.playerLeftRoom) {
						Game.simultaneousSwordHits.length = 0;
					} else {
						Game.processMonsters(command);
						Game.processSimultaneousSwordHits();
						Game.room.processTurn(true);
						Game.setPlayerMood();
					}
				}
			} // End Else Placing Double Process

			//Check for new questions that were asked.  Put them in a list of questions
			//for which answers will be expected on subsequent calls.
			Game.addQuestionsToList();

			if (CueEvents.hasAnyOccurred(C.CIDA_PLAYER_DIED)) {
				Game.isPlayerDying = true;
			}

			// Check Conquered
			if (!Game.playerLeftRoom && !Game.room.monsterCount && originalMonsterCount && !Game.isCurrentRoomConquered()) {
				CueEvents.add(C.CID_ROOM_CONQUER_PENDING);
			}
		}

		// Kill Game.player
		if (CueEvents.hasAnyOccurred(C.CIDA_PLAYER_DIED)) {
			Game.isGameActive = false;
			Game.statDeaths++;
		}

		// Query Checkpoint
		if (F.isMovementCommand(command) && (Game.player.x != Game.player.prevX || Game.player.y != Game.player.prevY)) {
			Game.queryCheckpoint(Game.player.x, Game.player.y);
		}

		// Activate checkpoint
		if (CueEvents.hasOccurred(C.CID_CHECKPOINT_ACTIVATED)) {
			const checkpointPosition: VOCoord = CueEvents.getFirstPrivateData(C.CID_CHECKPOINT_ACTIVATED);

			Game.lastCheckpointX = checkpointPosition.x;
			Game.lastCheckpointY = checkpointPosition.y;

			Game.checkpointTurns.push(Game.turnNo);
		} else if (F.isValidColRow(Game.lastCheckpointX, Game.lastCheckpointY) &&
			(Game.lastCheckpointX != Game.player.x || Game.lastCheckpointY != Game.player.y)) {

			const monster = Game.room.tilesActive[Game.lastCheckpointX + Game.lastCheckpointY * S.RoomWidth];
			if (!monster || !(monster instanceof TMimic)) {
				Game.lastCheckpointX = Game.lastCheckpointY = Number.MAX_VALUE;
			}
		}

		if (CueEvents.hasOccurred(C.CID_ROOM_CONQUER_PENDING) && !Game.room.greenDoorsOpened) {
			CueEvents.add(C.CID_ROOM_CONQUER_PENDING, Game.toggleGreenDoors());
		}

		Game.room.charactersCheckForCueEvents();

		if (Game.room.monsters.nulled) {
			Game.room.monsters.garbageCollectAdvanced();
		}
	}

	/**
	 * Processes the monster's list. Monsters are updated and postprocessed and garbage collection is run.
	 * This is a subsidiary of processCommand() and should only be called by it.
	 * @param	lastCommand Command issued to processCommand()
	 */
	private static processMonsters(lastCommand: number) {
		Game.spawnCycleCount++;

		Game.doesBrainSensePlayer = Game.doesBrainSenseSwordsman();

		Game.room.setPathmapTarget(Game.player.x, Game.player.y);
		for (const monster of Game.room.monsters.getAllOriginal()) {
			if (monster) {
				monster.skipTurn = false;
			}
		}

		for (const monster of Game.room.monsters.getAllOriginal()) {
			if (!monster || !monster.isAlive || monster.skipTurn) {
				continue;
			}

			monster.prevX = monster.x;
			monster.prevY = monster.y;

			monster.process(lastCommand);
		}

		Game.room.monsters.garbageCollectAdvanced();

		Game.room.currentTurn++;
	}

	//}

	//{ Action
	/******************************************************************************************************/
	/**                                                                                           ACTION  */

	/******************************************************************************************************/

	/**
	 * Called when Game.player steps on a potion which creates a double (mimic potion) this static is called.
	 * Clears the potion and prepared doublePlacement
	 * @param	doubleType Type of the double to place
	 */
	public static drankPotion(doubleType: number) {
		Game.player.placingDoubleType = doubleType;
		Game.player.doubleCursorX = Game.player.x;
		Game.player.doubleCursorY = Game.player.y;
		Game.room.plot(Game.player.x, Game.player.y, C.T_EMPTY);
		CueEvents.add(C.CID_DRANK_POTION);
	}

	public static gotoLevelEntrance(entrance: number, skipDisplay: boolean) {
		Game.handleLeaveLevel(entrance, skipDisplay);
	}

	public static playCommandsToTurn(endTurnNo: number): boolean {
		ASSERT(endTurnNo <= Commands.count());

		if (!endTurnNo) {
			return true;
		}

		Commands.freeze();

		let count: number = endTurnNo;

		let command: number = Commands.getFirst();
		while (count--) {
			// Protection for when the room was changed and broke save
			if (!Game.isGameActive || CueEvents.hasOccurred(C.CID_EXIT_ROOM)) {
				Commands.unfreeze();
				Commands.truncate(Game.turnNo);
				break;
			}

			const answeringQuestion = this.pendingQuestions.shift();

			if (answeringQuestion) {
				switch (answeringQuestion.type) {
					case MonsterMessageType.NeatherImpossibleKill:
						// Ignore
						break;
					case MonsterMessageType.NeatherSpareQuestion:
						ASSERT(F.isAnsweringQuestionCommand(command), `Expect command '${command}' to be answering question`);
						if (answeringQuestion.sender instanceof TCharacter) {
							answeringQuestion.sender.handleNeatherSpare(command === C.CMD_YES);
						}

						command = Commands.getNext();
						break;
				}
			}

			if (command == C.CMD_DOUBLE) {
				Game.processCommand(command, Commands.getComplexX(), Commands.getComplexY());
			} else {
				Game.processCommand(command);
			}

			TStateGame.lastCommand = command;
			Achievements.turnPassed();

			command = Commands.getNext();
		}

		Game.player.prevX = Game.player.x;
		Game.player.prevY = Game.player.y;

		Commands.unfreeze();

		return Game.turnNo == endTurnNo;
	}

	public static processSimultaneousSwordHits() {
		for (const i of Game.simultaneousSwordHits) {
			Game.room.stabTar(i.x, i.y, true, i.o);
		}

		Game.simultaneousSwordHits.length = 0;
	}

	public static queryCheckpoint(x: number, y: number) {
		if (CueEvents.hasOccurred(C.CID_CHECKPOINT_ACTIVATED)) {
			return;
		}

		if (Game.isGameActive) {
			if (Game.room.checkpoints.contains(x, y)) {
				if (x != Game.lastCheckpointX || y != Game.lastCheckpointY) {
					CueEvents.add(C.CID_CHECKPOINT_ACTIVATED, new VOCoord(x, y));
				}

				return;
			}
		}
	}

	public static setTurn(turnNo: number) {
		if (turnNo >= Commands.count()) {
			turnNo = Commands.count();
		}

		if (Game.isNewRoom) {
			Progress.setRoomExplored(Game.room.roomId, false);
		}

		Commands.freeze();

		Game.room.reload();
		CueEvents.clear();
		Game.setPlayerToRoomStart();
		Game.setMembersAfterRoomLoad(false);

		Achievements.initRoomStarted();

		Commands.unfreeze();

		if (turnNo) {
			return Game.playCommandsToTurn(turnNo);
		} else {
			return false;
		}
	}

	public static undoCommand() {
		if (Commands.count() == 0) {
			return;
		}

		Game.undoCommands(1);
	}

	public static undoCommands(undoCount: number) {
		ASSERT(undoCount > 0 && undoCount <= Commands.count());

		const playCount: number = Commands.count() - undoCount;

		Game.setTurn(playCount);
		Commands.truncate(playCount);
	}

	/**
	 * Updates the statTime, ie. the time spent in given level
	 */
	public static updateTime() {
		const time: number = Date.now();

		while (time > Game.statStartTime + 1000) {
			Game.statTime += 1;
			Game.statStartTime += 1000;
		}
	}


	//}

	//{ Changers
	/******************************************************************************************************/
	/**                                                                                         CHANGERS  */

	/******************************************************************************************************/

	public static levelStatsSave() {
		if (PlatformOptions.isGame) {
			Progress.levelStats.setUint(Game.room.levelId + "k", Game.statKills);
			Progress.levelStats.setUint(Game.room.levelId + "d", Game.statDeaths);
			Progress.levelStats.setUint(Game.room.levelId + "m", Game.statMoves);
			Progress.levelStats.setUint(Game.room.levelId + "t", Game.statTime);
		}
	}

	public static levelStatsLoad() {
		if (PlatformOptions.isGame) {
			Game.statKills = Progress.levelStats.getUint(Game.room.levelId + "k");
			Game.statDeaths = Progress.levelStats.getUint(Game.room.levelId + "d");
			Game.statMoves = Progress.levelStats.getUint(Game.room.levelId + "m");
			Game.statTime = Progress.levelStats.getUint(Game.room.levelId + "t");
		}
	}

	public static setMembersAfterRoomLoad(resetCommands: boolean = true) {
		Game.finishedScripts.length = 0;
		Game.tempGameVars = Progress.gameVarsClone;

		Game.isGameActive = true;
		Game.spawnCycleCount = Game.playerTurn = Game.turnNo = 0;
		Game.isInvisible = false;
		Game.doesBrainSensePlayer = false;

		Game.isPlayerDying = false;
		Game.player.placingDoubleType = 0;

		const wasLevelComplete: boolean = (Game.isCurrentLevelComplete() && Progress.isLevelVisited(Game.room.levelId));

		Game.isNewRoom = !Game.isCurrentRoomExplored();

		if (Game.isNewRoom) {
			Game.setCurrentRoomExplored();
		}

		const wasRoomConquered: boolean = Game.isCurrentRoomConquered();

		let monsterCountAtStart: number = Game.room.monsterCount;
		Game.room.greenDoorsOpened = false;

		if (F.isCrumblyWall(Game.room.tilesOpaque[Game.player.x + Game.player.y * S.RoomWidth]) ||
			// A workaround to detect Secret Walls hidden as standard wall

			(F.isWall(Game.room.tilesOpaque[Game.player.x + Game.player.y * S.RoomWidth]) &&
				(Game.room.roomTileRenderer.opaqueData[Game.player.x + Game.player.y * S.RoomWidth] & C.REND_WALL_HIDDEN_SECRET))) {
			Game.room.destroyCrumblyWall(Game.player.x, Game.player.y);
		}

		const monster = Game.room.tilesActive[Game.player.x + Game.player.y * S.RoomWidth];
		if (monster) {
			Game.room.killMonster(monster);
		}

		if (Game.isNewRoom && attr(Level.getRoom(Game.room.roomId), 'IsSecret') == '1') {
			CueEvents.add(C.CID_SECRET_ROOM_FOUND);
		}

		if (!wasRoomConquered && !monsterCountAtStart) {
			Game.setCurrentRoomConquered();
			Game.isNewRoom = true;
		}

		Game.room.setRoomEntryState(wasLevelComplete, Game.isCurrentLevelComplete(), wasRoomConquered, monsterCountAtStart);
		if (wasRoomConquered) {
			monsterCountAtStart = 0;
		}

		Game.player.process(C.CMD_WAIT);
		Game.simultaneousSwordHits.length = 0;

		Game.executeNoMoveCommands = true;
		Game.room.preprocessMonsters();
		Game.executeNoMoveCommands = false;

		if ((monsterCountAtStart) && Game.isCurrentRoomPendingExit()) {
			Game.toggleGreenDoors();
		}

		if (resetCommands && !Commands.isFrozen()) {
			Commands.clear();
		}

		Game.room.createPathmaps();

		Game.statMoves = Progress.levelStats.getUint(Game.room.levelId + "m");
	}

	public static setPlayerToRoomStart() {
		Game.lastCheckpointX = Game.lastCheckpointY = 0;
		Game.isGameActive = true;

		Game.turnNo = 0;

		Game.player.room = Game.room;

		Game.player.x = Game.player.prevX = Game.startRoomX;
		Game.player.y = Game.player.prevY = Game.startRoomY;
		Game.player.o = Game.player.prevO = Game.startRoomO;
		Game.player.setPosition(Game.startRoomX, Game.startRoomY, true);

		if (!Commands.isFrozen()) {
			Commands.clear();
		}

		Game.isPlayerDying = false;
	}

	public static setRoomStartToPlayer() {
		Game.startRoomX = Game.player.x;
		Game.startRoomY = Game.player.y;
		Game.startRoomO = Game.player.o;
	}

	public static toggleGreenDoors(): boolean {
		return Game.room.toggleGreenDoors();
	}

	public static updatePrevCoords() {
		Game.player.prevX = Game.player.x;
		Game.player.prevY = Game.player.y;

		for (const monster of Game.room.monsters.getAllOriginal()) {
			if (monster) {
				monster.prevX = monster.x;
				monster.prevY = monster.y;
			}
		}
	}

	public static tallyKill() {
		if (!Commands.isFrozen()) {
			Game.statKills++;
		}
	}


	// ::::::::::::::::::::::::::::::::::::::::::::::
	// :: Save Data
	// ::::::::::::::::::::::::::::::::::::::::::::::

	public static setCurrentRoomExplored() {
		Progress.setRoomExplored(Game.room.roomId, true);
	}

	public static setCurrentRoomConquered() {
		Progress.setRoomConquered(Game.room.roomId, true);
	}


	//}

	//{ Level / Room Playing
	/******************************************************************************************************/
	/**                                                                               LEVEL/ROOM PLAYING  */

	/******************************************************************************************************/

	/**
	 * Retrieves the direction of the new Game.room depending on the direction Game.player moved
	 * @param	moveDirection Direction in which the Game.player moved
	 * @return Direction to the new Game.room (N, S, E or W)
	 * @throws Error when invalid orientation or NO_ORIENTATION
	 */
	public static getRoomExitDirection(moveDirection: number): number {
		switch (moveDirection) {
			case(C.N):
				return C.N;
			case(C.S):
				return C.S;
			case(C.E):
				return C.E;
			case(C.W):
				return C.W;
			case(C.NW):
				return (Game.player.y == 0 ? C.N : C.W);
			case(C.NE):
				return (Game.player.y == 0 ? C.N : C.E);
			case(C.SW):
				return (Game.player.y == S.RoomHeight - 1 ? C.S : C.W);
			case(C.SE):
				return (Game.player.y == S.RoomHeight - 1 ? C.S : C.E);
			default:
				throw new Error("Invalid orientation: " + moveDirection);
		}
	}

	public static handleLeaveLevel(entrance: number = Number.MAX_VALUE, skipDisplay: boolean = false) {
		ASSERT(F.isStairs(Game.room.tilesOpaque[Game.player.x + Game.player.y * S.RoomWidth]) || entrance != Number.MAX_VALUE);

		if (CueEvents.hasAnyOccurred(C.CIDA_PLAYER_DIED)) {
			return;
		}

		if (Commands.isFrozen()) {
			CueEvents.add(C.CID_EXIT_ROOM);
			return;
		}

		const wasMastered: boolean = Progress.isGameMastered;
		const conquered: boolean = Game.wasRoomConqueredOnThisVisit();
		if (conquered) {
			Progress.storeDemo();

			if (!Game.isCurrentRoomConquered()) {
				CueEvents.add(C.CID_CONQUER_ROOM, Game.room.roomId);
				Game.setCurrentRoomConquered();
			}
		}

		Game.levelStatsSave();

		Progress.setScriptsEnded(Game.finishedScripts, true);
		Progress.setGameVars(Game.tempGameVars);
		CueEvents.add(C.CID_EXIT_ROOM);

		let entranceId: number = entrance;
		if (entrance == Number.MAX_VALUE) {
			for (const stairs of Game.room.stairs) {
				if (Game.player.x >= stairs.left && Game.player.x <= stairs.right &&
					Game.player.y >= stairs.top && Game.player.y <= stairs.bottom) {

					if (stairs.entrance && !Level.getEntrance(stairs.entrance)) {
						continue;
					}

					entranceId = stairs.entrance;
					break;
				}
			}

			if (entranceId == Number.MAX_VALUE) {
				entranceId = 0;
			}
		}

		if (!wasMastered && Progress.checkHoldMastery()) {
			CueEvents.add(C.CID_HOLD_MASTERED);
			Progress.isGameMastered = true;
		}

		const entranceXML = Level.getEntrance(entranceId);
		if (entranceXML.tagName === 'nothingfound') {
			CueEvents.add(C.CID_WIN_GAME);
		} else {
			CueEvents.add(C.CID_EXIT_LEVEL_PENDING, new VOCoord(entranceId, skipDisplay ? 1 : 0));
		}

		Game.isGameActive = false;

		Game.updatePrevCoords();
	}

	public static handleLeaveRoom(orientation: number, force: boolean = false): boolean {
		const oldRoomID: number = Game.room.roomId;

		const roomO: number = Game.getRoomExitDirection(orientation);

		let newX: number = Game.player.x;
		let newY: number = Game.player.y;

		switch (roomO) {
			case(C.N):
				newY = S.RoomHeight - 1;
				break;
			case(C.S):
				newY = 0;
				break;
			case(C.W):
				newX = S.RoomWidth - 1;
				break;
			case(C.E):
				newX = 0;
				break;
		}

		const newRoomID: number = Level.getRoomIdByNeighbourId(oldRoomID, roomO);

		if (newRoomID == -1) {
			return false;
		}

		if (!force && !Level.canEnterRoom(newRoomID, newX, newY)) {
			return false;
		}

		if (Commands.isFrozen()) {
			CueEvents.add(C.CID_EXIT_ROOM);
			return true;
		}

		Game.levelStatsSave();

		const wasMastered = Progress.isGameMastered;
		const conquered = Game.wasRoomConqueredOnThisVisit();
		if (conquered) {
			Progress.storeDemo();

			const wasLevelCompleted: boolean = Game.isCurrentLevelComplete();
			if (!Game.isCurrentRoomConquered()) {
				CueEvents.add(C.CID_CONQUER_ROOM, Game.room.roomId);
				Game.setCurrentRoomConquered();
			}

			if (Game.isCurrentLevelComplete()) {
				if (!wasLevelCompleted) {
					CueEvents.add(C.CID_COMPLETE_LEVEL);
				}
			}
		}


		if (!wasMastered && Progress.checkHoldMastery()) {
			CueEvents.add(C.CID_HOLD_MASTERED);
			Progress.isGameMastered = true;
		}

		if (!Progress.wasRoomEverVisited(newRoomID)) {
			CueEvents.add(C.CID_ROOM_FIRST_VISIT, newRoomID);
		}

		Progress.setScriptsEnded(Game.finishedScripts, true);
		Progress.setGameVars(Game.tempGameVars);
		Progress.roomEntered(newRoomID, newX, newY, Game.player.o);

		new TEffectRoomSlide();
		TEffectRoomSlide.instance.setOld(Game.room)

		Game.room.clear();
		Game.room = new Room();

		Game.checkpointTurns.length = 0;

		Game.room.loadRoom(newRoomID);
		Game.player.setPosition(newX, newY, true);

		Game.setRoomStartToPlayer();
		Game.setPlayerToRoomStart();

		Game.setMembersAfterRoomLoad();

		CueEvents.add(C.CID_EXIT_ROOM, oldRoomID);
		CueEvents.add(C.CID_ENTER_ROOM, newRoomID);

		TWidgetLevelName.update(Game.room.roomId, Game.room.levelId);

		return true;
	}

	public static loadFromLevelEntrance(entranceID: number) {
		const entrance = Level.getEntrance(entranceID);

		Progress.roomEntered(intAttr(entrance, 'RoomID'), intAttr(entrance, 'X'), intAttr(entrance, 'Y'), intAttr(entrance, 'O'));

		if (Game.room) {
			Game.room.clear();
		}

		Game.room = new Room();

		Game.checkpointTurns.length = 0;

		Game.room.resetRoom();
		Game.room.loadRoom(intAttr(entrance, 'RoomID'));

		Game.levelStatsLoad();

		Game.startRoomX = intAttr(entrance, 'X');
		Game.startRoomY = intAttr(entrance, 'Y');
		Game.startRoomO = intAttr(entrance, 'O');

		Game.player.x = Game.player.prevX = Game.startRoomX;
		Game.player.y = Game.player.prevY = Game.startRoomY;
		Game.player.o = Game.player.prevO = Game.startRoomO;

		Game.setRoomStartToPlayer();
		Game.setPlayerToRoomStart();

		Game.setMembersAfterRoomLoad();

		CueEvents.add(C.CID_ENTER_ROOM, intAttr(entrance, 'RoomID'));
	}

	public static loadFromRoom(roomId: number, x: number, y: number, o: number) {
		if (Game.room) {
			Game.room.clear();
		}

		Game.room = new Room();

		Game.checkpointTurns.length = 0;

		Progress.roomEntered(roomId, x, y, o);
		Game.room.loadRoom(roomId);
		if (PlatformOptions.isGame) {
			TWidgetLevelName.update(Game.room.roomId, Game.room.levelId);
		}

		Game.startRoomX = x;
		Game.startRoomY = y;
		Game.startRoomO = o;

		Game.player.x = Game.player.prevX = x;
		Game.player.y = Game.player.prevY = y;
		Game.player.o = Game.player.prevO = o;

		Game.setRoomStartToPlayer();
		Game.setPlayerToRoomStart();

		Game.setMembersAfterRoomLoad();

		Game.levelStatsLoad();

		Commands.fromString(PermanentStore.holds[HoldInfo().id].currentStateCommands.value);
		if (Commands.count()) {
			if (this.setTurn(Commands.count())) {
				CueEvents.clear();
				CueEvents.add(C.CID_ENTER_ROOM, roomId);
			} else {
				this.restartRoom();
			}
		} else {
			CueEvents.add(C.CID_ENTER_ROOM, roomId);
		}
	}

	public static restartRoom() {
		Game.room.reload();

		CueEvents.clear();
		Game.setPlayerToRoomStart();
		Game.setMembersAfterRoomLoad();

		CueEvents.add(C.CID_ENTER_ROOM, Game.room.roomId);
	}

	public static restartRoomFromLastCheckpoint() {
		while (Game.checkpointTurns.length && Game.checkpointTurns[Game.checkpointTurns.length - 1] >= Game.turnNo) {
			Game.checkpointTurns.pop();
		}

		if (Game.checkpointTurns.length == 0) {
			Game.restartRoom();
			return;
		}

		const lastCheckpointTurn = Game.checkpointTurns.pop();
		if (!lastCheckpointTurn) {
			Game.restartRoom();
			return;
		}

		Game.setTurn(lastCheckpointTurn);
		Commands.truncate(lastCheckpointTurn);
	}

	//}

	//{ Checkers
	/******************************************************************************************************/
	/**                                                                                         CHECKERS  */

	/******************************************************************************************************/

	public static executingNoMoveCommands(): boolean {
		return Game.executeNoMoveCommands;
	}

	/**
	 * Retrieves the level stats as a string
	 * @param	wholeHold Whether to give a total for the whole hold
	 * @return string containing the necessary information with labels.
	 */
	public static getLevelStats(wholeHold: boolean = false) {
		if (PlatformOptions.isGame) {
			let deaths = 0;
			let moves = 0;
			let kills = 0;
			let time = 0;

			let levelId: number;

			let secretsFound: number = 0;
			let secretsTotal: number = 0;

			if (wholeHold) {
				for (const levelID of Level.getAllLevelIDs()) {
					deaths += Progress.levelStats.getUint(levelID + "d", 0);
					moves += Progress.levelStats.getUint(levelID + "m", 0);
					kills += Progress.levelStats.getUint(levelID + "k", 0);
					time += Progress.levelStats.getUint(levelID + "t", 0);
				}

				const secretRooms = Level.getAllSecretRooms();
				for (const roomXML of secretRooms) {
					secretsTotal++;

					if (Progress.wasRoomEverVisited(intAttr(roomXML, 'RoomID'))) {
						secretsFound++;
					}
				}
			} else {
				levelId = Game.room.levelId;

				deaths += Progress.levelStats.getUint(levelId + "d", 0);
				moves += Progress.levelStats.getUint(levelId + "m", 0);
				kills += Progress.levelStats.getUint(levelId + "k", 0);
				time += Progress.levelStats.getUint(levelId + "t", 0);

				for (const roomId of Level.getSecretRoomIdsByLevelId(Game.levelId)) {
					secretsTotal++;

					if (Progress.wasRoomEverVisited(roomId)) {
						secretsFound++;
					}
				}
			}

			return [
				wholeHold
					? _("ingame.result_stats.hold_totals")
					: _("ingame.result_stats.level_totals"),
				_("ingame.result_stats.moves", moves),
				_("ingame.result_stats.kills", kills),
				_("ingame.result_stats.deaths", deaths),
				_("ingame.result_stats.time", UtilsString.styleTime(time * 1000, true, true, true, false)),
				Progress.isGameCompleted
					? _("ingame.result_stats.secrets_with_total", secretsFound, secretsTotal)
					: _("ingame.result_stats.secrets", secretsFound)
			].join("\n");
		}

		return '';
	}

	public static getSpeakingEntity(cmd: VOSpeechCommand): TGameObject {
		const speech = cmd.command.speech;
		let speaker: number = speech.character;

		if (speaker == C.SPEAK_Custom) {
			speaker = C.SPEAK_None;
		}

		const monster: TMonster = cmd.speakingEntity;
		let entity: TGameObject | null = monster;

		if (speaker != C.SPEAK_Self && speaker != C.SPEAK_None) {
			let foundSpeaker: boolean = false;

			if (monster.getType() === C.M_CHARACTER) {
				const character: TCharacter = monster as TCharacter;

				if (character.visible && speaker == F.getSpeakerType(character.identity)) {
					foundSpeaker = true;
				}
			}

			if (!foundSpeaker) {
				entity = Game.room.getSpeaker(C.SPEAKERS[speaker]);
			}

			if (!entity) {
				entity = monster;
			}
		}

		return entity;
	}

	public static isCurrentRoomConquered(): boolean {
		return Progress.isRoomConquered(Game.room.roomId);
	}

	public static isCurrentRoomExplored(): boolean {
		return Progress.isRoomExplored(Game.room.roomId);
	}

	public static isCurrentRoomPendingExit(): boolean {
		return Game.room.monsterCount == 0;
	}

	public static isCurrentLevelComplete(): boolean {
		return Progress.isLevelCompleted(Level.getLevelIdByRoomId(Game.room.roomId));
	}

	public static setPlayerMood() {
		// Nervous - Aggressive - Tired - Normal
		let x: number;
		let y: number;
		const o: number = Game.player.o;
		let monster: TMonster | null = null;

		for (let i: number = 0; i < 3; i++) {
			x = Game.player.x + NERVOUS_TILES_X[o]![i];
			y = Game.player.y + NERVOUS_TILES_Y[o]![i];

			if (!F.isValidColRow(x, y)) {
				continue;
			}

			monster = Game.room.tilesActive[x + y * S.RoomWidth];

			if (monster && monster.isAggressive()) {
				CueEvents.add(C.CID_SWORDSMAN_AFRAID);
				return;
			}
		}

		const sx: number = Game.player.swordX;
		const sy: number = Game.player.swordY;

		for (x = sx - 1; x <= sx + 1; x++) {
			for (y = sy - 1; y <= sy + 1; y++) {
				if (x == sx && y == sy) {
					continue;
				}

				if (F.isValidColRow(x, y)) {
					monster = Game.room.tilesActive[x + y * S.RoomWidth];
					if (monster && !(monster instanceof TMonsterPiece) && monster.isAggressive()) {
						CueEvents.add(C.CID_SWORDSMAN_AGGRESSIVE);
						return;
					}
				}
			}
		}

		CueEvents.add(C.CID_SWORDSMAN_NORMAL);
	}

	public static wasRoomConqueredOnThisVisit(): boolean {
		if (Game.room.monsterCount) {
			return false;
		}

		return !Game.isCurrentRoomConquered();
	}

	private static addQuestionsToList(): void {
		let message = CueEvents.getFirstPrivateData(C.CID_MONSTER_SPOKE) as VOMonsterMessage;

		while (message) {
			Game.pendingQuestions.push(message);

			message = CueEvents.getNextPrivateData() as VOMonsterMessage;
		}
	}
}
