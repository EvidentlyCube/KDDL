import { PackedVars } from "../global/PackedVars";
import { Commands } from "../global/Commands";
import { UtilsBase64 } from "../../../src.framework/net/retrocade/utils/UtilsBase64";
import { BinaryReader, BinaryWriter, Encoding } from "csharp-binary-stream";
import { VORoomEntryState } from "./progress/VORoomEntryState";

const UINT_MAX = 4294967295;

export class VODemoRecord {
    private _roomId: number = 0;
    private _score: number = 0;
    private _demo: string;

    private _startX: number = 0;
    private _startY: number = 0;
    private _startO: number = 0;

	private _exploredRoomIds: number[]; // @TODO - Refactor to set
	private _conqueredRoomIds: number[]; // @TODO - Refactor to set
    private _endedScriptIds: number[]; // @TODO - Refactor to set
    private _gameVars: PackedVars;


    public get roomId(): number {
        return this._roomId;
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

    public get exploredRoomIds() {
        return this._exploredRoomIds;
    }

    public get conqueredRoomIds() {
        return this._conqueredRoomIds;
    }

    public constructor(roomId: number, data?: string) {
        this._roomId = roomId;
        this._score = UINT_MAX;
        this._demo = "";

        this._endedScriptIds = [];
        this._exploredRoomIds = [];
        this._conqueredRoomIds = [];
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
            this._conqueredRoomIds = [...roomEntryState.conqueredRoomIds];
            this._exploredRoomIds = [...roomEntryState.exploredRoomIds];
            this._gameVars = roomEntryState.gameVars.clone();

            this._demo = Commands.toString();

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
        this._roomId = reader.readUnsignedInt();
        this._startX = reader.readUnsignedInt();
        this._startY = reader.readUnsignedInt();
        this._startO = reader.readUnsignedInt();
        this._score = reader.readUnsignedInt();
        this._endedScriptIds = JSON.parse(reader.readString(Encoding.Utf8)) as number[];
        this._conqueredRoomIds = JSON.parse(reader.readString(Encoding.Utf8)) as number[];
        this._exploredRoomIds = JSON.parse(reader.readString(Encoding.Utf8)) as number[];
        this._gameVars = new PackedVars(UtilsBase64.decodeByteArray(reader.readString(Encoding.Utf8)));

        this._demo = reader.readString(Encoding.Utf8);
    }

    public serialize(): string {
        const writer = new BinaryWriter();

        writer.writeUnsignedInt(this._roomId);
        writer.writeUnsignedInt(this._startX);
        writer.writeUnsignedInt(this._startY);
        writer.writeUnsignedInt(this._startO);
        writer.writeUnsignedInt(this._score);
        writer.writeString(JSON.stringify(this._endedScriptIds), Encoding.Utf8);
        writer.writeString(JSON.stringify(this._conqueredRoomIds), Encoding.Utf8);
        writer.writeString(JSON.stringify(this._exploredRoomIds), Encoding.Utf8);
        writer.writeString(UtilsBase64.encodeByteArray(this._gameVars.pack()), Encoding.Utf8);
        writer.writeUnsignedInt(this._demo.length);
        writer.writeString(this._demo, Encoding.Utf8);

        const buffer = writer.toUint8Array();

        return UtilsBase64.encodeByteArray(buffer);
    }
}

