import { PackedVars } from "../global/PackedVars";
import { Commands } from "../global/Commands";
import { UtilsBase64 } from "../../../src.framework/net/retrocade/utils/UtilsBase64";
import { BinaryReader, BinaryWriter, Encoding } from "csharp-binary-stream";
import { VORoomEntryState } from "./progress/VORoomEntryState";
import { set_clearAndAdd, set_fromJson, set_toJson } from "src.framework/net/retrocade/utils/UtilsSet";

const UINT_MAX = 4294967295;

export class VODemoRecord {
    private _roomPid = "";
    private _score = 0;
    private _demo = "";

    private _startX: number = 0;
    private _startY: number = 0;
    private _startO: number = 0;

    private _exploredRoomPids = new Set<string>()
    private _conqueredRoomPids = new Set<string>()
    private _endedScriptIds: number[]; // @TODO - Refactor to set
    private _gameVars: PackedVars;

    public get roomPid() {
        return this._roomPid;
    }

    public get score(): number {
        return this._score;
    }

    public get startX(): number {
        return this._startX;
    }

    public get startY(): number {
        return this._startY;
    }

    public get startO(): number {
        return this._startO;
    }

    public get endedScripts(): number[] {
        return this._endedScriptIds;
    }

    public get gameVars(): PackedVars {
        return this._gameVars;
    }

    public get demoBuffer(): string {
        return this._demo;
    }

    public get hasScore() {
        return this._score !== UINT_MAX && this._demo;
    }

    public get exploredRoomPids() {
        return this._exploredRoomPids;
    }

    public get conqueredRoomPids() {
        return this._conqueredRoomPids;
    }

    public constructor(roomPid: string, data?: string) {
        this._roomPid = roomPid;
        this._score = UINT_MAX;
        this._demo = "";

        this._endedScriptIds = [];
        this._gameVars = new PackedVars();

        if (data) {
            this.unserialize(data);
        }
    }

    /**
     * @return
     */
    public saveDemo(newScore: number, roomEntryState: VORoomEntryState): boolean {
        if (newScore < this._score && newScore > 1) {
            this._score = newScore;
            this._startX = roomEntryState.x;
            this._startY = roomEntryState.y;
            this._startO = roomEntryState.o;
            this._endedScriptIds = [...roomEntryState.endedScriptIds];
            set_clearAndAdd(roomEntryState.exploredRoomPids, this._exploredRoomPids);
            set_clearAndAdd(roomEntryState.conqueredRoomPids, this._conqueredRoomPids);
            this._gameVars = roomEntryState.gameVars.clone();

            this._demo = Commands.toString();

            // There was a bug in the past where for some reason the conquered room's ID was
            // also being stored here which caused issues during demo playback
            this._conqueredRoomPids.delete(this._roomPid);

            return true;
        }

        return false;
    }

    public clearDemo() {
        this._score = UINT_MAX;

        this._demo = "";
    }

    public unserialize(data: string) {
        const buffer: Uint8Array = UtilsBase64.decodeByteArray(data);

        const reader = new BinaryReader(buffer);
        this._roomPid = reader.readString(Encoding.Utf8);
        this._startX = reader.readUnsignedInt();
        this._startY = reader.readUnsignedInt();
        this._startO = reader.readUnsignedInt();
        this._score = reader.readUnsignedInt();
        this._endedScriptIds = JSON.parse(reader.readString(Encoding.Utf8)) as number[];
        this._conqueredRoomPids = set_fromJson(reader.readString(Encoding.Utf8));
        this._exploredRoomPids = set_fromJson(reader.readString(Encoding.Utf8));
        this._gameVars = new PackedVars(UtilsBase64.decodeByteArray(reader.readString(Encoding.Utf8)));

        reader.readUnsignedInt(); // Demo length is read but not needed
        this._demo = reader.readString(Encoding.Utf8);
    }

    public serialize(): string {
        const writer = new BinaryWriter();

        writer.writeString(this._roomPid, Encoding.Utf8);
        writer.writeUnsignedInt(this._startX);
        writer.writeUnsignedInt(this._startY);
        writer.writeUnsignedInt(this._startO);
        writer.writeUnsignedInt(this._score);
        writer.writeString(JSON.stringify(this._endedScriptIds), Encoding.Utf8);
        writer.writeString(set_toJson(this._conqueredRoomPids), Encoding.Utf8);
        writer.writeString(set_toJson(this._exploredRoomPids), Encoding.Utf8);
        writer.writeString(UtilsBase64.encodeByteArray(this._gameVars.pack()), Encoding.Utf8);
        writer.writeUnsignedInt(this._demo.length);
        writer.writeString(this._demo, Encoding.Utf8);

        return UtilsBase64.encodeByteArray(writer.toUint8Array());
    }
}

