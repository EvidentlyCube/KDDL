import { IPointData } from "pixi.js";
import { UtilsXPath } from "src.framework/net/retrocade/utils/UtilsXPath";
import { intAttr } from "src/XML";

export function generateRoomPid(roomId: number, hold: Document) {
    const room = getRoom(roomId, hold);
    const levelId = intAttr(room, 'LevelID');
    const level = UtilsXPath.getAnyElement(`//Levels[@LevelID="${levelId}"]`, hold);
    const levelGid = intAttr(level, 'GID_LevelIndex');

    const offset = getRoomOffsetInLevel(room, hold);

    return `${levelGid}:${offset.x}:${offset.y}`;
}

function getRoom(roomId: number, hold: Document) {
    return UtilsXPath.getAnyElement(`//Rooms[@RoomID="${roomId}"]`, hold);
}


function getRoomOffsetInLevel(room: Element, hold: Document): IPointData {
    const roomId = intAttr(room, 'RoomID');
    const levelID = intAttr(room, 'LevelID');

    const mainEntrance = getMainEntranceForLevel(levelID, hold);
    const mainEntranceRoom = getRoom(intAttr(mainEntrance, 'RoomID'), hold);

    const roomX = intAttr(room, 'RoomX');
    const roomY = intAttr(room, 'RoomY');
    const mainEntranceX = intAttr(mainEntranceRoom, 'RoomX');
    const mainEntranceY = intAttr(mainEntranceRoom, 'RoomY');

    return {
        x: roomX - mainEntranceX,
        y: roomY - mainEntranceY,
    };
}


function getMainEntranceForLevel(levelID: number, hold: Document): Element {
    const rooms = getRoomsByLevelId(levelID, hold)

    for (const room of rooms) {
        const entrances = getEntrancesByRoomId(intAttr(room, 'RoomID'), hold);

        for (const entrance of entrances) {
            if (entrance.getAttribute('IsMainEntrance') == '1') {
                return entrance;
            }
        }
    }

    throw new Error("It should never happen - each level has main entrance!");
}

function getRoomsByLevelId(levelId: number, hold: Document): Element[] {
    return UtilsXPath.getAllElements(`//Rooms[@LevelID="${levelId}"]`, hold);
}

function getEntrancesByRoomId(roomId: number, hold: Document): Element[] {
    return UtilsXPath.getAllElements(`//Entrances[@RoomID="${roomId}"]`, hold);
}