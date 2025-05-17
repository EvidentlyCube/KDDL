import {BinaryReader, BinaryWriter, Encoding} from "csharp-binary-stream";
import {PackedVars} from "../../global/PackedVars";
import {UtilsBase64} from "../../../../src.framework/net/retrocade/utils/UtilsBase64";
import {VODemoRecord} from "../VODemoRecord";
import {Level} from "../../global/Level";

export class VORoomEntryState {
	public x: number;
	public y: number;
	public o: number;
	public roomId: number;

	public gameVars: PackedVars;
	public exploredRoomIds: number[]; // @TODO - Refactor to set
	public conqueredRoomIds: number[]; // @TODO - Refactor to set
	public endedScriptIds: number[]; // @TODO - Refactor to set

	public constructor() {
		this.x = Number.MAX_VALUE;
		this.y = Number.MAX_VALUE;
		this.o = Number.MAX_VALUE;
		this.roomId = Number.MAX_VALUE;

		this.gameVars = new PackedVars;
		this.exploredRoomIds = [];
		this.conqueredRoomIds = [];
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
		writer.writeUnsignedInt(this.roomId);

		writer.writeUnsignedInt(vars.length);
		writer.writeBytes(Array.from(vars));

		writer.writeString(JSON.stringify(this.exploredRoomIds), Encoding.Utf8);
		writer.writeString(JSON.stringify(this.conqueredRoomIds), Encoding.Utf8);
		writer.writeString(JSON.stringify(this.endedScriptIds), Encoding.Utf8);

		writer.position = 0;

		return UtilsBase64.encodeByteArray(writer.toUint8Array());
	}

	public unserialize(buffer: Uint8Array) {
		const reader = new BinaryReader(buffer);
		this.x = reader.readByte();
		this.y = reader.readByte();
		this.o = reader.readByte();
		this.roomId = reader.readUnsignedInt();

		const varsLength: number = reader.readUnsignedInt();
		const bytes = reader.readBytes(varsLength);
		this.gameVars.unpack(new Uint8Array(bytes));

		let json: string;

		json = reader.readString(Encoding.Utf8);
		this.exploredRoomIds = JSON.parse(json) as number[];

		json = reader.readString(Encoding.Utf8);
		this.conqueredRoomIds = JSON.parse(json) as number[];

		json = reader.readString(Encoding.Utf8);
		this.endedScriptIds = JSON.parse(json) as number[];

		if (this.endedScriptIds === null) {
			throw new Error("Invalid save");
		}
	}

	public clear() {
		this.x = Number.MAX_VALUE;
		this.y = Number.MAX_VALUE;
		this.o = Number.MAX_VALUE;
		this.roomId = Number.MAX_VALUE;

		this.gameVars.clear();
		this.exploredRoomIds.length = 0;
		this.conqueredRoomIds.length = 0;
		this.endedScriptIds.length = 0;
	}

	public setFrom(state: VORoomEntryState) {
		this.x = state.x;
		this.y = state.y;
		this.o = state.o;
		this.roomId = state.roomId;

		this.exploredRoomIds = state.exploredRoomIds.concat();
		this.conqueredRoomIds = state.conqueredRoomIds.concat();
		this.endedScriptIds = state.endedScriptIds.concat();
		this.gameVars = state.gameVars.clone();
	}

	public setFromDemo(demo: VODemoRecord) {
		this.x = demo.startX;
		this.y = demo.startY;
		this.o = demo.startO;
		this.roomId = demo.roomId;

		this.endedScriptIds = [...demo.endedScripts];
		this.conqueredRoomIds = [...demo.conqueredRoomIds];
		this.exploredRoomIds = [...demo.exploredRoomIds];
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
			&& this.roomId != Number.MAX_VALUE
			&& !!Level.getRoomStrict(this.roomId)
		);
	}

	/**
	 * Returns true if full save should be forced
	 */
	public setRoomExplored(id: number, isExplored: boolean): boolean {
		const index: number = this.exploredRoomIds.indexOf(id);

		if (index == -1 && isExplored) {
			this.exploredRoomIds.push(id);
			return true;

		} else if (index != -1 && !isExplored) {
			this.exploredRoomIds.splice(index, 1);
			return true;
		}

		return false;
	}

	/**
	 * Returns true if full save should be forced
	 */
	public setRoomConquered(id: number, isConquered: boolean): boolean {
		const index: number = this.conqueredRoomIds.indexOf(id);

		if (index == -1 && isConquered) {
			this.conqueredRoomIds.push(id);
			return true;

		} else if (index != -1 && !isConquered) {
			this.conqueredRoomIds.splice(index, 1);
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
		return Level.getRequiredRoomIdsByLevel(levelId).every(roomId => this.isRoomConquered(roomId))
	}

	public isLevelVisited(levelId: number): boolean {
		return Level.getRoomIdsByLevel(levelId).some(roomId => this.isRoomExplored(roomId));
	}

	public isRoomConquered(roomId: number): boolean {
		return this.conqueredRoomIds.indexOf(roomId) !== -1;
	}

	public isRoomExplored(roomId: number): boolean {
		return this.exploredRoomIds.indexOf(roomId) !== -1;
	}

	public isScriptEnded(scriptId: number): boolean {
		return this.endedScriptIds.indexOf(scriptId) !== -1;
	}

	public countConqueredRooms(): number {
		return this.conqueredRoomIds.length;
	}

	public countExploredRooms(): number {
		return this.exploredRoomIds.length;
	}


	// ::::::::::::::::::::::::::::::::::::::::::::::
	// :: Retrievers
	// ::::::::::::::::::::::::::::::::::::::::::::::

	public getExploredRoomIdsByLevel(levelID: number): number[] {
		return Level.getRoomIdsByLevel(levelID).filter(roomId => this.isRoomExplored(roomId));
	}

	public clone(): VORoomEntryState {
		const cloned = new VORoomEntryState();
		cloned.x = this.x;
		cloned.y = this.y;
		cloned.o = this.o;
		cloned.roomId = this.roomId;

		cloned.gameVars = this.gameVars.clone();
		cloned.exploredRoomIds = this.exploredRoomIds.concat();
		cloned.conqueredRoomIds = this.conqueredRoomIds.concat();
		cloned.endedScriptIds = this.endedScriptIds.concat();

		return cloned;
	}
}
