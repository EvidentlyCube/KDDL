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
import { attr, intAttr } from "src/XML";

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
	private static _allEverVisitedRoomPids = new Set<string>();

	/**
	 * Contains all rooms that were ever conquered in all plays
	 */
	private static _allEverConqueredRoomPids = new Set<string>();

	/**
	 * Contains information about game progress for each first room visit
	 */
	public static _roomEntranceStates: VORoomEntryState[] = [];

	private static _roomPidToDemo = new Map<string, VODemoRecord>();


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
		const demo = Progress.getRoomDemo(Progress._currentState.roomPid);

		const result = demo.saveDemo(Game.turnNo, Progress._currentState);

		if (result) {
			PermanentStore.holds[HoldInfo().id].demos.value = Array.from(Progress._roomPidToDemo.values())
				.map(demo => demo.serialize());
		}
	}

	private static saveProgress_gameCompleted() {
		PermanentStore.holds[HoldInfo().id].isMastered.value = Progress.isGameMastered;
		PermanentStore.holds[HoldInfo().id].isCompleted.value = Progress.isGameCompleted;
		GlobalHoldScore.updateHoldScore();
	}

	private static saveProgress_global() {
		const {
			_roomEntranceStates,
			_allEverVisitedRoomPids: _allEverVisitedRoomIDs,
			_allEverConqueredRoomPids: _allEverConqueredRoomIDs,
		} = Progress;

		// Room entrance states
		PermanentStore.holds[HoldInfo().id].saveStates.value = _roomEntranceStates.map(x => x.serialize());

		// Visited Rooms
		PermanentStore.holds[HoldInfo().id].globalVisitedRoomPids.value = Array.from(_allEverVisitedRoomIDs.values());

		// Conquered Rooms
		PermanentStore.holds[HoldInfo().id].globalConqueredRoomPids.value = Array.from(_allEverConqueredRoomIDs.values());
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
			Progress._allEverConqueredRoomPids = new Set(store.globalConqueredRoomPids.value);

			// Visited holds
			Progress._allEverVisitedRoomPids = new Set(store.globalVisitedRoomPids.value);

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

			Progress._isGameCompleted = store.isCompleted.value;
			Progress._isGameMastered = store.isMastered.value;

			if (!Progress.checkHoldMastery()) {
				Progress._isGameMastered = false;
				store.isMastered.value = false;
			}

			// Demos
			Progress._roomPidToDemo.clear();

			for (const serializedDemo of store.demos.value) {
				const demo = new VODemoRecord("", serializedDemo);
				Progress._roomPidToDemo.set(demo.roomPid, demo);
			}

		} catch (e) {
			PermanentStore.holds[HoldInfo().id].isCompleted.value = false;
			PermanentStore.holds[HoldInfo().id].isMastered.value = false;
			PermanentStore.holds[HoldInfo().id].globalConqueredRoomPids.value = [];
			PermanentStore.holds[HoldInfo().id].globalVisitedRoomPids.value = [];
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

	public static roomEntered(roomPid: string, playerX: number, playerY: number, playerO: number) {
		Progress._currentState.x = playerX;
		Progress._currentState.y = playerY;
		Progress._currentState.o = playerO;
		Progress._currentState.roomPid = roomPid;

		const currentEntranceState = Progress.getRoomEntranceState(roomPid);

		if (!currentEntranceState) {
			const entranceState: VORoomEntryState = Progress._currentState.clone();
			Progress._roomEntranceStates.push(entranceState);
			Progress._forceFullSave = true;

		} else if (
			!Progress.isRoomConquered(roomPid)
			 && Progress._currentState.countConqueredRooms() >= currentEntranceState.countConqueredRooms()
		) {
			Progress.replaceRoomEntranceState(currentEntranceState, Progress._currentState.clone());
			Progress._forceFullSave = true;
		}

		if (!Progress.wasRoomEverVisited(roomPid) && !Progress.isRoomExplored(roomPid)) {
			Progress._allEverVisitedRoomPids.add(roomPid);
			Progress._forceFullSave = true;
		}

		Progress.saveProgress(Progress._forceFullSave);

		Progress._forceFullSave = false;
	}

	public static getRoomDemoByPid(roomPid: string): VODemoRecord {
		const demo = Progress._roomPidToDemo.get(roomPid) ?? new VODemoRecord(roomPid);

		Progress._roomPidToDemo.set(roomPid, demo);

		return demo;
	}
	public static getRoomDemo(roomPid: string): VODemoRecord {
		const demo = Progress._roomPidToDemo.get(roomPid) ?? new VODemoRecord(roomPid);

		if (Level.isValidRoomPid(roomPid)) {
			Progress._roomPidToDemo.set(roomPid, demo);
		}

		return demo;
	}

	public static getRoomPidsWithDemo(): string[] {
		return Array.from(Progress._roomPidToDemo.values())
			.filter(demo => demo.hasScore)
			.map(demo => demo.roomPid);
	}

	public static clearProgress() {
		Progress._roomEntranceStates.length = 0;
		Progress._allEverConqueredRoomPids.clear();
		Progress._allEverVisitedRoomPids.clear();

		Progress.levelStats.clear();

		Progress._currentState.clear();

		Progress._isGameCompleted = false;
		Progress._isGameMastered = false;
	}

	public static restartHold() {
		Progress._currentState.clear();
	}

	public static restoreToRoom(roomPid: string) {
		const state = Progress.getRoomEntranceState(roomPid);

		ASSERT(state);
		ASSERT(Level.getRoomStrict(roomPid));

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
			if (Level.isValidRoomPid(i.roomPid)) {
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

		for (const roomXml of Level.getAllSecretRooms()) {
			const roomPid = attr(roomXml, 'RoomPID');
			if (!Progress.wasRoomEverConquered(roomPid)) {
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

	public static setRoomConquered(roomPid: string, isConquered: boolean) {
		if (Progress._currentState.setRoomConquered(roomPid, isConquered)) {
			Progress._forceFullSave = true;
		}

		if (!Progress.wasRoomEverConquered(roomPid)) {
			Progress._allEverConqueredRoomPids.add(roomPid);
			Progress._forceFullSave = true;
		}
	}

	public static setRoomExplored(roomPid: string, isExplored: boolean) {
		if (Progress._currentState.setRoomExplored(roomPid, isExplored)) {
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

	public static get playerRoomPid(): string {
		return Progress._currentState.roomPid;
	}

	public static isLevelCompleted(id: number): boolean {
		return Progress._currentState.isLevelCompleted(id);
	}

	public static isLevelVisited(id: number): boolean {
		return Progress._currentState.isLevelVisited(id);
	}

	public static isRoomConquered(roomPid: string): boolean {
		return Progress._currentState.isRoomConquered(roomPid);
	}

	public static isRoomExplored(roomPid: string): boolean {
		return Progress._currentState.isRoomExplored(roomPid);
	}

	public static isScriptEnded(scriptId: number): boolean {
		return Progress._currentState.isScriptEnded(scriptId);
	}

	public static countRoomsConquered(): number {
		return Progress._currentState.conqueredRoomPids.size;
	}


	// ::::::::::::::::::::::::::::::::::::::::::::::
	// :: Global Getters
	// ::::::::::::::::::::::::::::::::::::::::::::::

	public static wasLevelEverVisited(levelId: number): boolean {
		return Level.getRoomPidsByLevel(levelId).some(roomId => Progress.wasRoomEverVisited(roomId));
	}

	public static wasRoomEverConquered(roomPid: string): boolean {
		return Progress._allEverConqueredRoomPids.has(roomPid);
	}

	public static wasRoomEverVisited(roomPid: string): boolean {
		return Progress._allEverVisitedRoomPids.has(roomPid);
	}

	// ::::::::::::::::::::::::::::::::::::::::::::::
	// :: Retrievers
	// ::::::::::::::::::::::::::::::::::::::::::::::

	public static getExploredRoomPidsByLevel(levelID: number): readonly string[] {
		return Progress._currentState.getExploredRoomPidsByLevel(levelID);
	}

	public static getRoomEntranceState(roomPid: string): VORoomEntryState | undefined {
		return Progress._roomEntranceStates.find(state => state.roomPid === roomPid);
	}

	public static getBestRoomEntranceState(): VORoomEntryState {
		let best = Progress._currentState;

		for (const state of Progress._roomEntranceStates) {
			if (!Level.isValidRoomPid(state.roomPid)) {
				continue;
			}

			if (state.conqueredRoomPids.size > best.conqueredRoomPids.size) {
				best = state;

			} else if (
				state.conqueredRoomPids.size == best.conqueredRoomPids.size
				&& state.exploredRoomPids.size > best.exploredRoomPids.size
			) {
				best = state;
			}
		}

		return best;
	}
}