import { HoldInfo } from "src/S";
import { UtilsBase64 } from "../../../src.framework/net/retrocade/utils/UtilsBase64";
import { ASSERT } from "../../ASSERT";
import { VORoomEntryState } from "../managers/progress/VORoomEntryState";
import { GlobalHoldScore } from "./GlobalHoldScore";
import { Level } from "./Level";
import { PackedVars } from "./PackedVars";
import { PermanentStore } from "./store/PermanentStore";
import { VODemoRecord } from "../managers/VODemoRecord";
import { Commands } from "./Commands";
import { Game } from "./Game";

export class Progress {
	/**
	 * Whether to save everything, should be true whenever a new
	 * room is explored or completed
	 */
	private static _forceFullSave: boolean = false;


	// ::::::::::::::::::::::::::::::::::::::::::::::
	// :: Is game completed?
	// ::::::::::::::::::::::::::::::::::::::::::::::

	/**
	 * Whether the game has been already completed at least once
	 */
	private static _isGameCompleted: boolean = false;

	public static get isGameCompleted(): boolean {
		return Progress._isGameCompleted;
	}

	public static set isGameCompleted(isCompleted: boolean) {
		if (isCompleted != Progress._isGameCompleted) {
			Progress._isGameCompleted = isCompleted;
			Progress.saveProgress_gameCompleted();
		}
	}


	// ::::::::::::::::::::::::::::::::::::::::::::::
	// :: Is game mastered
	// ::::::::::::::::::::::::::::::::::::::::::::::

	private static _isGameMastered: boolean = false;

	public static get isGameMastered(): boolean {
		return Progress._isGameMastered;
	}

	public static set isGameMastered(value: boolean) {
		if (Progress._isGameMastered != value) {
			Progress._isGameMastered = value;
			Progress.saveProgress_gameCompleted();
		}
	}


	// ::::::::::::::::::::::::::::::::::::::::::::::
	// :: Global to the whole game playthrough
	// ::::::::::::::::::::::::::::::::::::::::::::::

	/**
	 * Contains all rooms that were ever visited in all plays
	 */
	private static _allEverVisitedRoomIDs = new Set<number>();

	/**
	 * Contains all rooms that were ever conquered in all plays
	 */
	private static _allEverConqueredRoomIDs = new Set<number>();

	/**
	 * Contains information about game progress for each first room visit
	 */
	public static _roomEntranceStates: VORoomEntryState[] = [];

	private static _roomIdToDemo = new Map<number, VODemoRecord>();


	// ::::::::::::::::::::::::::::::::::::::::::::::
	// :: Local to current playthrough
	// ::::::::::::::::::::::::::::::::::::::::::::::

	/**
	 * State of current playthrough
	 */
	private static _currentState: VORoomEntryState = new VORoomEntryState();

	// Static Constructor

	// ::::::::::::::::::::::::::::::::::::::::::::::
	// :: Miscellaneous
	// ::::::::::::::::::::::::::::::::::::::::::::::

	public static levelStats: PackedVars = new PackedVars();


	/****************************************************************************************************************/
	/**                                                                                             SAVING TO DISK  */

	/****************************************************************************************************************/

	public static saveProgress(fullSave: boolean) {
		if (fullSave) {
			Progress.saveProgress_global();
		}

		Progress.saveProgress_local();
		PermanentStore.holds[HoldInfo().id].globalStats.write(UtilsBase64.encodeByteArray(Progress.levelStats.pack()));
		GlobalHoldScore.updateHoldScore();
	}

	public static storeDemo() {
		const demo = Progress.getRoomDemo(Progress._currentState.roomId);

		const result = demo.saveDemo(Game.turnNo, Progress._currentState);

		if (result) {
			PermanentStore.holds[HoldInfo().id].demos.value = Array.from(Progress._roomIdToDemo.values()).map(demo => demo.serialize());
		}
	}

	private static saveProgress_gameCompleted() {
		PermanentStore.holds[HoldInfo().id].isMastered.value = Progress._isGameMastered;
		PermanentStore.holds[HoldInfo().id].isCompleted.value = Progress._isGameCompleted;
	}

	private static saveProgress_global() {
		const {
			_roomEntranceStates,
			_allEverVisitedRoomIDs,
			_allEverConqueredRoomIDs,
		} = Progress;

		// Room entrance states
		PermanentStore.holds[HoldInfo().id].saveStates.value = _roomEntranceStates.map(x => x.serialize());

		// Visited Rooms
		PermanentStore.holds[HoldInfo().id].globalVisitedRoomIds.value = Array.from(_allEverVisitedRoomIDs.values());

		// Conquered Rooms
		PermanentStore.holds[HoldInfo().id].globalConqueredRoomIds.value = Array.from(_allEverConqueredRoomIDs.values());
	}

	private static saveProgress_local() {
		PermanentStore.holds[HoldInfo().id].currentState.value = Progress._currentState.serialize();
	}

	public static clearStoredCommands() {
		PermanentStore.holds[HoldInfo().id].currentStateCommands.value = "";
	}

	public static saveProgress_commands() {
		PermanentStore.holds[HoldInfo().id].currentStateCommands.value = Commands.toString();
	}

	public static async loadFromDisk() {
		Progress.clearProgress();

		const store = PermanentStore.holds[HoldInfo().id];

		try {
			const currentStateSave = store.currentState.value;

			if (currentStateSave) {
				Progress._currentState.unserialize(UtilsBase64.decodeByteArray(currentStateSave));
			}

			// Conquered holds
			Progress._allEverConqueredRoomIDs = new Set(store.globalConqueredRoomIds.value);

			// Visited holds
			Progress._allEverVisitedRoomIDs = new Set(store.globalVisitedRoomIds.value);

			// Entrance states
			for (const stateData of store.saveStates.value) {
				const stateInstance: VORoomEntryState = new VORoomEntryState();
				stateInstance.unserialize(UtilsBase64.decodeByteArray(stateData));
				Progress._roomEntranceStates.push(stateInstance);
			}


			// Global Hold Stats
			const globalStatsSave = store.globalStats.read();

			if (globalStatsSave) {
				Progress.levelStats.unpack(UtilsBase64.decodeByteArray(globalStatsSave));
			}

			// Game mastered
			Progress._isGameCompleted = store.isCompleted.value;

			// Game completed
			Progress._isGameMastered = store.isMastered.value;

			if (!Progress.checkHoldMastery()) {
				Progress._isGameMastered = false;
				store.isMastered.value = false;
			}

			// Demos
			Progress._roomIdToDemo.clear();

			for (const serializedDemo of store.demos.value) {
				const demo = new VODemoRecord(0, serializedDemo);
				Progress._roomIdToDemo.set(demo.roomId, demo);
			}

		} catch (e) {
			PermanentStore.holds[HoldInfo().id].isCompleted.value = false;
			PermanentStore.holds[HoldInfo().id].isMastered.value = false;
			PermanentStore.holds[HoldInfo().id].globalConqueredRoomIds.value = [];
			PermanentStore.holds[HoldInfo().id].globalVisitedRoomIds.value = [];
			PermanentStore.holds[HoldInfo().id].saveStates.value = [];
			PermanentStore.holds[HoldInfo().id].currentState.value = "";
			PermanentStore.holds[HoldInfo().id].demos.value = [];

			console.log("Failed progress load:", e);
			Progress.clearProgress();
			Progress.saveProgress(true);
		}

	}


	/****************************************************************************************************************/
	/**                                                                              IN-GAME PROGRESS MANIPULATION  */
	/****************************************************************************************************************/

	// ::::::::::::::::::::::::::::::::::::::::::::::
	// :: Action
	// ::::::::::::::::::::::::::::::::::::::::::::::

	public static roomEntered(roomID: number, playerX: number, playerY: number, playerO: number) {
		Progress._currentState.x = playerX;
		Progress._currentState.y = playerY;
		Progress._currentState.o = playerO;
		Progress._currentState.roomId = roomID;

		const currentEntranceState = Progress.getRoomEntranceState(roomID);

		if (!currentEntranceState) {
			const entranceState: VORoomEntryState = Progress._currentState.clone();
			Progress._roomEntranceStates.push(entranceState);
			Progress._forceFullSave = true;
		} else if (!Progress.isRoomConquered(roomID) && Progress._currentState.countConqueredRooms() >= currentEntranceState.countConqueredRooms()) {
			Progress.replaceRoomEntranceState(currentEntranceState, Progress._currentState.clone());
			Progress._forceFullSave = true;
		}

		if (!Progress.wasRoomEverVisited(roomID) && !Progress.isRoomExplored(roomID)) {
			Progress._allEverVisitedRoomIDs.add(roomID);
			Progress._forceFullSave = true;
		}

		Progress.saveProgress(Progress._forceFullSave);

		Progress._forceFullSave = false;
	}

	public static getRoomDemo(roomId: number): VODemoRecord {
		const demo = Progress._roomIdToDemo.get(roomId) ?? new VODemoRecord(roomId);

		Progress._roomIdToDemo.set(roomId, demo);

		return demo;
	}

	public static clearProgress() {
		Progress._roomEntranceStates.length = 0;
		Progress._allEverConqueredRoomIDs.clear();
		Progress._allEverVisitedRoomIDs.clear();

		Progress.levelStats.clear();

		Progress._currentState.clear();

		Progress.isGameCompleted = false;
		Progress.isGameMastered = false;
	}

	public static restartHold() {
		Progress._currentState.clear();
	}

	public static restoreToRoom(roomID: number) {
		const state = Progress.getRoomEntranceState(roomID);

		ASSERT(state);
		ASSERT(Level.getRoom(roomID));

		if (state) {
			Progress._currentState.setFrom(state);
		}
	}

	public static restoreToDemo(demo: VODemoRecord) {
		Progress._currentState.setFromDemo(demo);
	}


	// ::::::::::::::::::::::::::::::::::::::::::::::
	// :: Checkers
	// ::::::::::::::::::::::::::::::::::::::::::::::

	/**
	 * Whether the Restore option should be enabled
	 */
	public static hasRestoreProgress(): boolean {
		for (const i of Progress._roomEntranceStates) {
			if (Level.getRoomStrict(i.roomId)) {
				return true;
			}
		}

		return false;
	}

	/**
	 * Whether the continue option should be enabled
	 */
	public static hasSaveGame(): boolean {
		return Progress._currentState.hasSaveGame();
	}

	/**
	 * Checks if all secret rooms were ever conquered and if the hold was ever conquered
	 * @return True if the hold is mastered
	 */
	public static checkHoldMastery(): boolean {
		if (!Progress._isGameCompleted) {
			return false;
		}

		for (const room of Level.getAllSecretRooms()) {
			if (!Progress.wasRoomEverConquered(parseInt(room.getAttribute('RoomID') || '0'))) {
				return false;
			}
		}

		return true;
	}


	// ::::::::::::::::::::::::::::::::::::::::::::::
	// :: Setters
	// ::::::::::::::::::::::::::::::::::::::::::::::


	public static replaceRoomEntranceState(oldState: VORoomEntryState, newState: VORoomEntryState) {
		let i: number = 0;
		const l: number = Progress._roomEntranceStates.length;

		for (; i < l; i++) {
			if (Progress._roomEntranceStates[i] == oldState) {
				Progress._roomEntranceStates[i] = newState;
				return;
			}
		}
	}

	public static setGameVars(newGameVars: PackedVars) {
		Progress._currentState.gameVars = newGameVars;
	}

	public static setRoomConquered(id: number, isConquered: boolean) {
		if (Progress._currentState.setRoomConquered(id, isConquered)) {
			Progress._forceFullSave = true;
		}

		if (!Progress.wasRoomEverConquered(id)) {
			Progress._allEverConqueredRoomIDs.add(id);
			Progress._forceFullSave = true;
		}
	}

	public static setRoomExplored(id: number, isExplored: boolean) {
		if (Progress._currentState.setRoomExplored(id, isExplored)) {
			Progress._forceFullSave = true;
		}
	}

	public static setScriptEnded(id: number, isEnded: boolean) {
		if (Progress._currentState.setScriptEnded(id, isEnded)) {
			Progress._forceFullSave = true;
		}
	}

	public static setScriptsEnded(ids: number[], isEnded: boolean) {
		for (const id of ids) {
			if (Progress._currentState.setScriptEnded(id, isEnded)) {
				Progress._forceFullSave = true;
			}
		}
	}


	// ::::::::::::::::::::::::::::::::::::::::::::::
	// :: Getters
	// ::::::::::::::::::::::::::::::::::::::::::::::

	public static get gameVarsClone(): PackedVars {
		return Progress._currentState.gameVars.clone();
	}

	public static get playerX(): number {
		return Progress._currentState.x;
	}

	public static get playerY(): number {
		return Progress._currentState.y;
	}

	public static get playerO(): number {
		return Progress._currentState.o;
	}

	public static get playerRoomID(): number {
		return Progress._currentState.roomId;
	}

	public static isLevelCompleted(id: number): boolean {
		return Progress._currentState.isLevelCompleted(id);
	}

	public static isLevelVisited(id: number): boolean {
		return Progress._currentState.isLevelVisited(id);
	}

	public static isRoomConquered(id: number): boolean {
		return Progress._currentState.isRoomConquered(id);
	}

	public static isRoomExplored(id: number): boolean {
		return Progress._currentState.isRoomExplored(id);
	}

	public static isScriptEnded(id: number): boolean {
		return Progress._currentState.isScriptEnded(id);
	}

	public static countRoomsConquered(): number {
		return Progress._currentState.conqueredRoomIds.length;
	}


	// ::::::::::::::::::::::::::::::::::::::::::::::
	// :: Global Getters
	// ::::::::::::::::::::::::::::::::::::::::::::::

	public static wasLevelEverVisited(levelId: number): boolean {
		return Level.getRoomIdsByLevel(levelId).some(roomId => Progress.wasRoomEverVisited(roomId));
	}

	public static wasRoomEverConquered(id: number): boolean {
		return Progress._allEverConqueredRoomIDs.has(id);
	}

	public static wasRoomEverVisited(id: number): boolean {
		return Progress._allEverVisitedRoomIDs.has(id);
	}

	// ::::::::::::::::::::::::::::::::::::::::::::::
	// :: Retrievers
	// ::::::::::::::::::::::::::::::::::::::::::::::

	public static getExploredRoomIdsByLevel(levelID: number): readonly number[] {
		return Progress._currentState.getExploredRoomIdsByLevel(levelID);
	}

	public static getRoomEntranceState(roomID: number): VORoomEntryState | null {
		for (const entranceState of Progress._roomEntranceStates) {
			if (entranceState.roomId == roomID) {
				return entranceState;
			}
		}

		return null;
	}

	public static getBestRoomEntranceState(): VORoomEntryState {
		let best = Progress._currentState;

		for (const state of Progress._roomEntranceStates) {
			if (!Level.isValidRoomId(state.roomId)) {
				continue;
			}

			if (state.conqueredRoomIds.length > best.conqueredRoomIds.length) {
				best = state;
			} else if (state.conqueredRoomIds.length == best.conqueredRoomIds.length &&
				state.exploredRoomIds.length > best.exploredRoomIds.length) {
				best = state;
			}
		}

		return best;
	}
}