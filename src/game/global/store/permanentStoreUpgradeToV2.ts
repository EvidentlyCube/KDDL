import { BinaryReader, BinaryWriter, Encoding } from "csharp-binary-stream";
import { PermanentStore } from "./PermanentStore";
import { PermanentStoreSlot } from "./PermanentStoreSlot";
import { UtilsBase64 } from "src.framework/net/retrocade/utils/UtilsBase64";
import { permanentStoreUpgradeToV2_mapOldRoomIdsToPidsMap, permanentStoreUpgradeToV2_mapOldRoomIdToPidMap } from "./permanentStoreUpgradeToV2_RoomMapping";
import { arraySpliceElementOut } from "src.framework/net/retrocade/utils/UtilsArray";

export async function permanentStoreUpgradeToV2() {
    if (PermanentStore.version.read() >= 2) {
        return;
    }

    for (const [holdId, holdStore] of Object.entries(PermanentStore.holds)) {
        const visitedRoomIds = PermanentStoreSlot.create<number[]>(`${holdId}/global-visited-room-ids`, []);
        const conqueredRoomIds = PermanentStoreSlot.create<number[]>(`${holdId}/global-conquered-rooms-ids`, []);

        await visitedRoomIds.waitForInit();
        await conqueredRoomIds.waitForInit();

        holdStore.currentState.value = mapSaveState(holdStore.currentState.value);
        holdStore.globalVisitedRoomPids.value = permanentStoreUpgradeToV2_mapOldRoomIdsToPidsMap(visitedRoomIds.value);
        holdStore.globalConqueredRoomPids.value = permanentStoreUpgradeToV2_mapOldRoomIdsToPidsMap(conqueredRoomIds.value);
        holdStore.demos.value = holdStore.demos.value.map(demo => mapDemo(demo)).filter(x => x);
        holdStore.saveStates.value = holdStore.saveStates.value.map(state => mapSaveState(state)).filter(x => x);

        await PermanentStoreSlot.deleteKey(visitedRoomIds.key);
        await PermanentStoreSlot.deleteKey(conqueredRoomIds.key);
    }

    PermanentStore.version.value = 2;
}

function mapSaveState(serializedState: string): string {
    try {
        const reader = new BinaryReader(UtilsBase64.decodeByteArray(serializedState));
        const writer = new BinaryWriter();

        writer.writeByte(reader.readByte()); // x
        writer.writeByte(reader.readByte()); // y
        writer.writeByte(reader.readByte()); // o

        const roomPid = permanentStoreUpgradeToV2_mapOldRoomIdToPidMap(reader.readUnsignedInt());
        if (!roomPid) {
            return "";
        }

        writer.writeString(roomPid, Encoding.Utf8);

        const varsLength = reader.readUnsignedInt();
        const bytes = reader.readBytes(varsLength);
        writer.writeUnsignedInt(varsLength);
        writer.writeBytes(bytes);

        const exploredRoomIds: number[] = JSON.parse(reader.readString(Encoding.Utf8));
        const conqueredRoomIds: number[] = JSON.parse(reader.readString(Encoding.Utf8));
        const endedScriptIds: number[] = JSON.parse(reader.readString(Encoding.Utf8));

        if (!exploredRoomIds || !conqueredRoomIds || !endedScriptIds) {
            throw new Error("Invalid save");
        }

        const exploredRoomPids = permanentStoreUpgradeToV2_mapOldRoomIdsToPidsMap(exploredRoomIds);
        const conqueredRoomPids = permanentStoreUpgradeToV2_mapOldRoomIdsToPidsMap(conqueredRoomIds);

		writer.writeString(JSON.stringify(exploredRoomPids), Encoding.Utf8);
		writer.writeString(JSON.stringify(conqueredRoomPids), Encoding.Utf8);
		writer.writeString(JSON.stringify(endedScriptIds), Encoding.Utf8);

        writer.position = 0;
		return UtilsBase64.encodeByteArray(writer.toUint8Array());

    } catch (e: unknown) {
        return "";
    }
}

function mapDemo(serializedDemo: string): string {
    try {
        const buffer: Uint8Array = UtilsBase64.decodeByteArray(serializedDemo);
        const writer = new BinaryWriter();

        const reader = new BinaryReader(buffer);
        const roomPid = permanentStoreUpgradeToV2_mapOldRoomIdToPidMap(reader.readUnsignedInt());
        if (!roomPid) {
            return "";
        }

        writer.writeString(roomPid, Encoding.Utf8); // Room PID
        writer.writeUnsignedInt(reader.readUnsignedInt()); // _startX
        writer.writeUnsignedInt(reader.readUnsignedInt()); // _startY
        writer.writeUnsignedInt(reader.readUnsignedInt()); // _startO
        writer.writeUnsignedInt(reader.readUnsignedInt()); // _score

        const endedScriptIds: number[] = JSON.parse(reader.readString(Encoding.Utf8));
        const exploredRoomIds: number[] = JSON.parse(reader.readString(Encoding.Utf8));
        const conqueredRoomIds: number[] = JSON.parse(reader.readString(Encoding.Utf8));

        if (!exploredRoomIds || !conqueredRoomIds || !endedScriptIds) {
            throw new Error("Invalid save");
        }

        const exploredRoomPids = permanentStoreUpgradeToV2_mapOldRoomIdsToPidsMap(exploredRoomIds);
        const conqueredRoomPids = permanentStoreUpgradeToV2_mapOldRoomIdsToPidsMap(conqueredRoomIds);

        arraySpliceElementOut(conqueredRoomPids, roomPid);

		writer.writeString(JSON.stringify(endedScriptIds), Encoding.Utf8); // Ended Script IDs
		writer.writeString(JSON.stringify(conqueredRoomPids), Encoding.Utf8); // Conquered Rooms PIDs
		writer.writeString(JSON.stringify(exploredRoomPids), Encoding.Utf8); // Explored Rooms PIDs
        writer.writeString(reader.readString(Encoding.Utf8), Encoding.Utf8) // Game Vars

        writer.writeUnsignedInt(reader.readUnsignedInt()); // Demo length
        writer.writeString(reader.readString(Encoding.Utf8), Encoding.Utf8) // Demo

		return UtilsBase64.encodeByteArray(writer.toUint8Array());

    } catch (e: unknown) {
        return "";
    }
}