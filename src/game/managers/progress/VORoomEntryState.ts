import {BinaryReader, BinaryWriter, Encoding} from "csharp-binary-stream";
import {PackedVars} from "../../global/PackedVars";
import {UtilsBase64} from "../../../../src.framework/net/retrocade/utils/UtilsBase64";
import {VODemoRecord} from "../VODemoRecord";
import {Level} from "../../global/Level";
import { set_addArray, set_clearAndAdd, set_fromJson, set_toJson } from "src.framework/net/retrocade/utils/UtilsSet";

export class VORoomEntryState {
	public x: number;
	public y: number;
	public o: number;
	public roomPid: string;

	public gameVars: PackedVars;
	public exploredRoomPids = new Set<string>();
	public conqueredRoomPids = new Set<string>();
	public endedScriptIds: number[]; // @TODO - Refactor to set

	public constructor() {
		this.x = Number.MAX_VALUE;
		this.y = Number.MAX_VALUE;
		this.o = Number.MAX_VALUE;
		this.roomPid = "";

		this.gameVars = new PackedVars;
		this.endedScriptIds = [];
	}


	// ::::::::::::::::::::::::::::::::::::::::::::::
	// :: Actions
	// ::::::::::::::::::::::::::::::::::::::::::::::

	public serialize(): string {
		// FORMAT:
		// BYTE(x) . BYTE(y) . BYTE(o) . UINT(roomID) .
		// UINT(gameVars.length) . BYTE_ARRAY(gameVars) .
		// UTF_STRING(exploredRoomIDs) . UTF_STRING(completedRoomIDs) .
		// UTF_STRING(finishedScripts)

		const writer = new BinaryWriter();
		const vars: Uint8Array = this.gameVars.pack();

		writer.writeByte(this.x);
		writer.writeByte(this.y);
		writer.writeByte(this.o);
		writer.writeString(this.roomPid, Encoding.Utf8);

		writer.writeUnsignedInt(vars.length);
		writer.writeBytes(Array.from(vars));

		writer.writeString(set_toJson(this.exploredRoomPids), Encoding.Utf8);
		writer.writeString(set_toJson(this.conqueredRoomPids), Encoding.Utf8);
		writer.writeString(JSON.stringify(this.endedScriptIds), Encoding.Utf8);

		writer.position = 0;

		return UtilsBase64.encodeByteArray(writer.toUint8Array());
	}

	public unserialize(buffer: Uint8Array) {
		const reader = new BinaryReader(buffer);
		this.x = reader.readByte();
		this.y = reader.readByte();
		this.o = reader.readByte();
		this.roomPid = reader.readString(Encoding.Utf8);

		const varsLength: number = reader.readUnsignedInt();
		const bytes = reader.readBytes(varsLength);
		this.gameVars.unpack(new Uint8Array(bytes));

		this.exploredRoomPids = set_fromJson(reader.readString(Encoding.Utf8));
		this.conqueredRoomPids = set_fromJson(reader.readString(Encoding.Utf8));
		this.endedScriptIds = JSON.parse(reader.readString(Encoding.Utf8)) as number[];

		if (this.endedScriptIds === null) {
			throw new Error("Invalid save");
		}
	}

	public clear() {
		this.x = 0;
		this.y = 0;
		this.o = 0;
		this.roomPid = "";

		this.gameVars.clear();
		this.exploredRoomPids.clear();
		this.conqueredRoomPids.clear();
		this.endedScriptIds.length = 0;
	}

	public setFrom(state: VORoomEntryState) {
		this.x = state.x;
		this.y = state.y;
		this.o = state.o;
		this.roomPid = state.roomPid;

		set_clearAndAdd(state.exploredRoomPids, this.exploredRoomPids);
		set_clearAndAdd(state.conqueredRoomPids, this.conqueredRoomPids);
		this.endedScriptIds = state.endedScriptIds.concat();
		this.gameVars = state.gameVars.clone();
	}

	public setFromDemo(demo: VODemoRecord) {
		this.x = demo.startX;
		this.y = demo.startY;
		this.o = demo.startO;
		this.roomPid = demo.roomPid;

		this.exploredRoomPids.clear();
		this.conqueredRoomPids.clear();
		set_addArray(this.exploredRoomPids, demo.exploredRoomPids);
		set_addArray(this.conqueredRoomPids, demo.conqueredRoomPids);
		this.endedScriptIds = [...demo.endedScripts];
		this.gameVars = demo.gameVars.clone();
	}


	// ::::::::::::::::::::::::::::::::::::::::::::::
	// :: Checkers
	// ::::::::::::::::::::::::::::::::::::::::::::::

	public hasSaveGame(): boolean {
		return (
			this.x != Number.MAX_VALUE
			&& this.y != Number.MAX_VALUE
			&& this.o != Number.MAX_VALUE
			&& !!this.roomPid
			&& !!Level.isValidRoomPid(this.roomPid)
		);
	}

	/**
	 * Returns true if full save should be forced
	 */
	public setRoomExplored(roomPid: string, isExplored: boolean): boolean {
		if (isExplored && !this.exploredRoomPids.has(roomPid)) {
			this.exploredRoomPids.add(roomPid);
			return true;

		} else if (!isExplored && this.exploredRoomPids.has(roomPid)) {
			this.exploredRoomPids.delete(roomPid);
			return true;
		}

		return false;
	}

	/**
	 * Returns true if full save should be forced
	 */
	public setRoomConquered(roomPid: string, isConquered: boolean): boolean {
		if (isConquered && !this.conqueredRoomPids.has(roomPid)) {
			this.conqueredRoomPids.add(roomPid);
			return true;

		} else if (!isConquered && this.conqueredRoomPids.has(roomPid)) {
			this.conqueredRoomPids.delete(roomPid);
			return true;
		}

		return false;
	}

	/**
	 * Returns true if full save should be forced
	 */
	public setScriptEnded(id: number, isEnded: boolean): boolean {
		const index: number = this.endedScriptIds.indexOf(id);

		if (index == -1 && isEnded) {
			this.endedScriptIds.push(id);
			return true;

		} else if (index != -1 && !isEnded) {
			this.endedScriptIds.splice(index, 1);
			return true;
		}

		return false;
	}


	public isLevelCompleted(levelId: number): boolean {
		return Level.getRequiredRoomPidsByLevel(levelId)
			.every(roomPid => this.isRoomConquered(roomPid))
	}

	public isLevelVisited(levelId: number): boolean {
		return Level.getRoomPidsByLevel(levelId)
			.some(roomPid => this.isRoomExplored(roomPid));
	}

	public isRoomConquered(roomPid: string): boolean {
		return this.conqueredRoomPids.has(roomPid);
	}

	public isRoomExplored(roomPid: string): boolean {
		return this.exploredRoomPids.has(roomPid);
	}

	public isScriptEnded(scriptId: number): boolean {
		return this.endedScriptIds.indexOf(scriptId) !== -1;
	}

	public countConqueredRooms(): number {
		return this.conqueredRoomPids.size;
	}

	public countExploredRooms(): number {
		return this.conqueredRoomPids.size;
	}


	// ::::::::::::::::::::::::::::::::::::::::::::::
	// :: Retrievers
	// ::::::::::::::::::::::::::::::::::::::::::::::

	public getExploredRoomPidsByLevel(levelId: number): string[] {
		return Level.getRoomPidsByLevel(levelId).filter(roomPid => this.isRoomExplored(roomPid));
	}

	public clone(): VORoomEntryState {
		const cloned = new VORoomEntryState();
		cloned.x = this.x;
		cloned.y = this.y;
		cloned.o = this.o;
		cloned.roomPid = this.roomPid;

		cloned.gameVars = this.gameVars.clone();
		cloned.exploredRoomPids = new Set(this.exploredRoomPids);
		cloned.conqueredRoomPids = new Set(this.conqueredRoomPids);
		cloned.endedScriptIds = this.endedScriptIds.concat();

		return cloned;
	}
}
