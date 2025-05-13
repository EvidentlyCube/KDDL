import * as PIXI from 'pixi.js';
import { UtilsBase64 } from "../../../src.framework/net/retrocade/utils/UtilsBase64";
import { UtilsXPath } from "../../../src.framework/net/retrocade/utils/UtilsXPath";
import { F } from "../../F";
import { BinaryReader } from "csharp-binary-stream";
import { S } from "src/S";
import { C } from "../../C";
import { DB } from "./DB";
import { attr, boolAttr, intAttr, textAttr } from "../../XML";
import { Game } from "./Game";
import { Progress } from "./Progress";
import { _, _def, _has } from 'src.framework/_';
import { PackedVars } from './PackedVars';
import { VOCharacterCommand } from '../managers/VOCharacterCommand';
import { ASSERT, assertDefined } from 'src/ASSERT';


const nothingElement = document.createElement('nothingfound');
const variableNameToId = new Map<string, string>();

export class Level {
	private static hold: Document;

	public static currentRoom: number;
	public static currentLevel: number;

	private static $holdElement: Element = nothingElement;
	private static $holdName = "";
	private static $holdTimestamp = 0;
	private static $levels: Element[] = [];
	private static $rooms: Element[] = [];
	private static $requiredRoomIds = new Set<number>();
	private static $secretRoomIds = new Set<number>();
	private static $levelIdToLevelMap = new Map<number, Element>();
	private static $levelIdToRawNameMap = new Map<number, string>();
	private static $levelIdToRoomIdsMap = new Map<number, number[]>();
	private static $levelIdToRequiredRoomIdsMap = new Map<number, number[]>();
	private static $orderIndexToLevelIdMap = new Map<number, number>();
	private static $roomIdToRoomMap = new Map<number, Element>();
	private static $roomIdToLevelIdMap = new Map<number, number>();
	private static $roomPosToRoomIdMap = new Map<string, number>();
	private static $roomIdToSquaresReader = new Map<number, BinaryReader>();


	public static restoreTo(roomID: number, x: number, y: number, o: number) {
		Game.loadFromRoom(roomID, x, y, o);
	}

	public static getHoldName(): string {
		return _def('hold_name', Level.$holdName);
	}

	public static getHoldTimestamp(): number {
		return Level.$holdTimestamp;
	}

	public static getHold(): Document {
		return this.hold;
	}

	public static getHoldXml(): Element {
		return Level.$holdElement!;
	}


	/****************************************************************************************************************/
	/**                                                                                                      LEVEL  */

	/****************************************************************************************************************/

	public static getLevelByID(levelId: number): Element {
		return Level.$levelIdToLevelMap.get(levelId) ?? nothingElement;
	}

	/**
	 * Counts from 1
	 */
	public static getLevelIdByOrderIndex(orderIndex: number): number {
		return Level.$orderIndexToLevelIdMap.get(orderIndex) ?? 0;
	}

	public static getLevelIndex(levelId: number): number {
		return intAttr(Level.getLevelByID(levelId), 'GID_LevelIndex');
	}

	public static getLevelIdByRoomId(roomId: number): number {
		return Level.$roomIdToLevelIdMap.get(roomId) ?? 0;
	}

	private static getRawLevelName(levelId: number): string {
		return Level.$levelIdToRawNameMap.get(levelId) ?? '';
	}

	public static getLevelNameTranslated(levelID: number): string {
		const index = intAttr(Level.getLevelByID(levelID), 'OrderIndex', -1);

		return _def(`level_name_${index}`, Level.getRawLevelName(levelID));
	}

	public static getAllLevels(): ReadonlyArray<Element> {
		return Level.$levels;
	}

	public static getAllLevelIDs(): number[] {
		return Array.from(Level.$levelIdToLevelMap.keys());
	}


	/****************************************************************************************************************/
	/**                                                                                                       ROOM  */

	/****************************************************************************************************************/

	public static getAllRooms(): ReadonlyArray<Element> {
		return Level.$rooms;
	}

	public static isValidRoomId(roomId: number) {
		return !!Level.getRoomStrict(roomId);
	}

	public static getRoom(roomId: number): Element {
		return Level.$roomIdToRoomMap.get(roomId) ?? nothingElement;
	}

	public static getRoomStrict(roomId: number): Element | undefined {
		return Level.$roomIdToRoomMap.get(roomId);
	}

	public static getRoomByPosition(x: number, y: number): Element {
		const roomId = Level.$roomPosToRoomIdMap.get(`${x}:${y}`);

		return Level.getRoom(roomId ?? -1);
	}

	public static getRoomIdByNeighbourId(id: number, orientation: number): number {
		const room: Element = Level.getRoom(id);

		const newRoomX: number = intAttr(room, 'RoomX') + F.getOX(orientation);
		const newRoomY: number = intAttr(room, 'RoomY') + F.getOY(orientation);

		return intAttr(Level.getRoomByPosition(newRoomX, newRoomY), 'RoomID', -1);
	}

	public static getRoomIdsByLevel(levelId: number): readonly number[] {
		return Level.$levelIdToRoomIdsMap.get(levelId) ?? [];
	}

	public static getRequiredRoomIdsByLevel(levelId: number): readonly number[] {
		return Level.$levelIdToRequiredRoomIdsMap.get(levelId) ?? [];
	}

	public static getRoomsByLevel(levelID: number): readonly Element[] {
		return UtilsXPath.getAllElements(`//Rooms[@LevelID="${levelID}"]`, Level.hold);
	}

	public static getRoomIdByOffsetInLevel(levelID: number, x: number, y: number): number {
		const mainEntrance = Level.getEntranceMainByLevelID(levelID);
		const mainRoom = Level.getRoom(intAttr(mainEntrance, 'RoomID', 0));
		const roomX = intAttr(mainRoom, 'RoomX', 0) + x;
		const roomY = intAttr(mainRoom, 'RoomY', 0) + y;

		return intAttr(Level.getRoomByPosition(roomX, roomY), 'RoomID', -1);
	}

	public static getRoomOffsetInLevel(roomID: number): PIXI.IPointData {
		const room = Level.getRoom(roomID);
		const levelID = Level.getLevelIdByRoomId(roomID);

		const mainEntrance = Level.getEntranceMainByLevelID(levelID);
		const mainRoom = Level.getRoom(parseInt(mainEntrance.getAttribute('RoomID') || '0'));

		return {
			x: parseInt(room.getAttribute('RoomX') || '0') - parseInt(mainRoom.getAttribute('RoomX') || '0'),
			y: parseInt(room.getAttribute('RoomY') || '0') - parseInt(mainRoom.getAttribute('RoomY') || '0'),
		};
	}

	public static roomHasMonsters(roomID: number): boolean {
		return UtilsXPath.getAllElements(`//Rooms[@RoomID="${roomID}"]/Monsters[@Type!="29"]`, Level.hold).length > 0;
	}

	public static getAnyVisitedRoomInLevel(levelID: number): Element | null {
		for (const room of UtilsXPath.getAllElements(`//Rooms[@LevelID=${levelID}]`, Level.hold)) {
			if (Progress.getRoomEntranceState(intAttr(room, 'RoomID')))
				return room;
		}

		return null;
	}

	public static getAllSecretRooms(): Element[] {
		return Level.getAllRooms().filter(x => x.getAttribute('IsSecret') === '1');
	}


	/****************************************************************************************************************/
	/**                                                                                                      OTHER  */

	/****************************************************************************************************************/

	public static getEntrance(entranceID: number): Element {
		return UtilsXPath.getAnyElement(`//Entrances[@EntranceID="${entranceID}"]`, Level.hold);
	}

	public static getEntrancesByRoomID(roomID: number): Element[] {
		return UtilsXPath.getAllElements(`//Entrances[@RoomID="${roomID}"]`, Level.hold);
	}

	public static getFirstHoldEntrance(): Element {
		return UtilsXPath.getAnyElement('//Entrances[@IsMainEntrance=1]', Level.hold);
	}

	public static getVarIDByName(name: string): string {
		return variableNameToId.get(name) ?? "";
	}

	public static getEntranceMainByLevelID(levelID: number): Element {
		const roomIds = Level.getRoomIdsByLevel(levelID);

		for (const roomID of roomIds) {
			const entrances = Level.getEntrancesByRoomID(roomID);

			for (const entrance of entrances) {
				if (entrance.getAttribute('IsMainEntrance') == '1') {
					return entrance;
				}
			}
		}

		throw new Error("It should never happen - each level has main entrance!");
	}

	public static getEntranceDescription(entranceID: number): string {
		return UtilsBase64.decodeWChar(Level.getEntrance(entranceID).getAttribute('DescriptionMessage') || '');
	}

	public static getEntranceDescriptionTranslated(entranceID: number): string {
		return _def(
			Level.getEntranceDescriptionTranslationId(entranceID),
			Level.getEntranceDescription(entranceID)
		);
	}

	public static getEntranceDescriptionTranslationId(entranceID: number): string {
		const entrance = Level.getEntrance(entranceID);
		const roomId = intAttr(entrance, 'RoomID', 0);
		const room = Level.getRoom(roomId);
		const roomOffset = Level.getRoomOffsetInLevel(roomId);
		const levelId = intAttr(room, 'LevelID', 0);
		const level = Level.getLevelByID(levelId);
		const orderIndex = intAttr(level, 'OrderIndex', 0);
		const entranceX = intAttr(entrance, 'X', 0);
		const entranceY = intAttr(entrance, 'Y', 0);

		return [
			'entrance',
			`lvl_${orderIndex}`,
			`${F.offsetToRoomName_internal(roomOffset.x, roomOffset.y)}`,
			`${entranceX}x${entranceY}`
		].join('.');
	}

	public static getScrollTranslationId(scroll: Element): string {
		const room = scroll.parentElement!;
		const roomId = intAttr(room, 'RoomID', 0);
		const roomOffset = Level.getRoomOffsetInLevel(roomId);
		const levelId = intAttr(room, 'LevelID', 0);
		const level = Level.getLevelByID(levelId);
		const orderIndex = intAttr(level, 'OrderIndex', 0);
		const scrollX = intAttr(scroll, 'X', 0);
		const scrollY = intAttr(scroll, 'Y', 0);

		return [
			'scroll',
			`lvl_${orderIndex}`,
			`${F.offsetToRoomName_internal(roomOffset.x, roomOffset.y)}`,
			`${scrollX}x${scrollY}`
		].join('.');
	}

	public static getMonsterContextIdForSpeech(monster: Element): string {
		const room = monster.parentElement!;
		const roomId = intAttr(room, 'RoomID', 0);
		const roomOffset = Level.getRoomOffsetInLevel(roomId);
		const levelId = intAttr(room, 'LevelID', 0);
		const level = Level.getLevelByID(levelId);
		const orderIndex = intAttr(level, 'OrderIndex', 0);
		const monsterX = intAttr(monster, 'X', 0);
		const monsterY = intAttr(monster, 'Y', 0);

		return ""
			+ textAttr(level, 'NameMessage')
			+ ": "
			+ F.offsetToRoomName_internalUppercase(roomOffset.x, roomOffset.y)
			+ " -- "
			+ `(${monsterX}, ${monsterY})`;
	}

	public static getSecretRoomIdsByLevelId(levelId: number): readonly number[] {
		return Level.getRoomIdsByLevel(levelId).filter(roomId => Level.$secretRoomIds.has(roomId));
	}

	public static getAllTranslatableStrings(): Record<string, unknown> {
		const strings: string[] = [];
		const missingTranslations: unknown[] = [];
		const differentTranslations: unknown[] = [];

		const logString = (translationId: string, holdText: string, context?: string) => {
			holdText = holdText.trim().replace(/\r\n|\r/g, "\n");
			strings.push(translationId);

			if (!_has(translationId)) {
				context = context ? `# ${context}$N$` : '';
				missingTranslations.push({
					translationId,
					holdText,
					i18nEntryOld: `${translationId}=${holdText.replace(/\n/g, "///\n")}`,
					i18nEntryYaml: holdText.includes("\n")
						? `${context}${translationId}: >\n[INDENT]${holdText.replace(/\n/g, "$N$")}`
						: `${context}${translationId}: ${holdText}`
				});
				return;
			}

			const translation = _(translationId).trim().replace(/\r\n|\r/g, "\n")
			if (translation !== holdText) {
				differentTranslations.push({
					translationId,
					holdText___: holdText,
					translation,
				})
			}
		}

		for (const xml of UtilsXPath.getAllElements('//Entrances', Level.hold)) {
			const id = intAttr(xml, 'EntranceID', -1);
			const translationId = Level.getEntranceDescriptionTranslationId(id);

			logString(translationId, textAttr(xml, 'DescriptionMessage'));
		}

		for (const xml of UtilsXPath.getAllElements('//Scrolls', Level.hold)) {
			const translationId = Level.getScrollTranslationId(xml);

			logString(translationId, textAttr(xml, 'Message'));
		}

		const speechIdToContextMap = new Map<number, string>();
		for (const xml of UtilsXPath.getAllElements('//Monsters', Level.hold)) {
			if (intAttr(xml, 'Type') !== C.M_CHARACTER) {
				continue;
			}

			const extraVars = attr(xml, 'ExtraVars');
			if (!extraVars) {
				continue;
			}

			const packedVars = new PackedVars(UtilsBase64.decodeByteArray(extraVars));

			const commandBuffer = packedVars.getByteArray("Commands", null);

			if (!commandBuffer) {
				continue;
			}

			const context = Level.getMonsterContextIdForSpeech(xml);
			const commands = VOCharacterCommand.deserializeBuffer(commandBuffer);

			let commandIndex = 0;
			for (const command of commands) {
				if (command.speechId) {
					speechIdToContextMap.set(command.speechId, `${context} -- #${commandIndex.toString().padStart(3, "0")}`);
					commandIndex++;
				}
			}
		}

		for (const xml of UtilsXPath.getAllElements('//Speech', Level.hold)) {
			const message = textAttr(xml, 'Message');
			if (!message) {
				// Empty messages are often used with sound effects, don't need to translate those
				continue;
			}

			const speechId = intAttr(xml, 'SpeechID');
			const translationId = `speech.${speechId}`;

			logString(translationId, message, speechIdToContextMap.get(speechId));
		}

		// for (const message of UtilsXPath.getAllTexts('//@NameMessage', Level.hold)) {
		// 	strings.push(UtilsBase64.decodeWChar(message));
		// }

		// for (const message of UtilsXPath.getAllTexts('//@GID_OriginalNameMessage', Level.hold)) {
		// 	strings.push(UtilsBase64.decodeWChar(message));
		// }
		// for (const message of UtilsXPath.getAllTexts('//@Message', Level.hold)) {
		// 	strings.push(UtilsBase64.decodeWChar(message));
		// }
		// for (const message of UtilsXPath.getAllTexts('//@DescriptionMessage', Level.hold)) {
		// 	strings.push(UtilsBase64.decodeWChar(message));
		// }

		return { strings, missingTranslations, differentTranslations };
	}


	public static canEnterRoom(roomId: number, playerX: number, playerY: number): boolean {
		const room = Level.getRoom(roomId);

		let positionOffset: number = playerX + playerY * S.RoomWidth;
		let tile: number = 0;
		let i: number = 0;
		let count: number = 0;

		let square: number = 0;

		const reader = Level.$roomIdToSquaresReader.get(roomId);
		assertDefined(reader, `No binary reader cached for room "${roomId}"`);

		reader.position = 0;

		const startingByte = reader.readByte();
		if (startingByte != 6) {
			throw new Error("Invalid data format version, should be 6 was: " + startingByte);
		}

		// CHECKING OPAQUE LAYER
		for (let y = 0; y < S.RoomHeightOriginal; y++) {
			for (let x = 0; x < S.RoomWidthOriginal; x++) {
				if (!count) {
					count = reader.readByte();
					tile = reader.readByte();
				}

				if (x === playerX && y === playerY) {
					square = tile;
				}

				count--;
			}
		}


		switch (square) {
			case (C.T_WALL_MASTER):
				return Progress.isGameMastered;

			case (C.T_WALL):
			case (C.T_WALL2):
			case (C.T_WALL_IMAGE):
			case (C.T_PIT):
			case (C.T_PIT_IMAGE):
			case (C.T_WATER):
				return false;
		}


		// SKIPPING FLOOR LAYER
		for (i = 0; i < S.RoomTotalTilesOriginal; i++) {
			if (!count) {
				count = reader.readByte();
				tile = reader.readByte();
			}

			count--;
		}

		// Transparent Layer with Parameter (ignored)
		for (let y = 0; y < S.RoomHeightOriginal; y++) {
			for (let x = 0; x < S.RoomWidthOriginal; x++) {

				if (!count) {
					count = reader.readByte();
					tile = reader.readByte();
					reader.readByte();
				}

				if (x === playerX && y === playerY) {
					square = tile;
				}

				count--;
			}
		}

		switch (square) {
			case (C.T_ORB):
			case (C.T_TAR):
			case (C.T_MUD):
			case (C.T_GEL):
			case (C.T_BOMB):
			case (C.T_FLOW_EDGE):
			case (C.T_FLOW_INNER):
			case (C.T_FLOW_SOURCE):
			case (C.T_OBSTACLE):
				return false;
		}

		for (const piece of UtilsXPath.getAllElements('Pieces', Level.hold, room)) {
			if (piece.getAttribute('X') === playerX.toString() && piece.getAttribute('Y') === playerY.toString()) {
				return false;
			}
		}

		return true;
	}

	public static prepareHold(holdElement: Element, document: Document) {
		Level.hold = document;

		// Build cache
		this.$holdElement = UtilsXPath.getAnyElement('//Holds[0]', Level.hold);
		this.$holdName = UtilsBase64.decodeWChar(UtilsXPath.getAnyText('(//Holds)[1]/@NameMessage', Level.hold));
		this.$holdTimestamp = parseInt(UtilsXPath.getAnyText('(//Holds)[1]/@LastUpdated', Level.hold));
		this.$levels.length = 0
		this.$rooms.length = 0
		this.$orderIndexToLevelIdMap.clear();
		this.$levelIdToLevelMap.clear();
		this.$levelIdToRawNameMap.clear();
		this.$roomIdToRoomMap.clear();
		this.$roomIdToLevelIdMap.clear();
		this.$levelIdToRoomIdsMap.clear();
		this.$levelIdToRequiredRoomIdsMap.clear();
		this.$requiredRoomIds.clear();
		this.$secretRoomIds.clear();
		this.$roomIdToSquaresReader.clear();

		for (const levelXml of UtilsXPath.getAllElements(`//Levels`, Level.hold)) {
			const levelId = intAttr(levelXml, 'LevelID');
			const orderIndex = intAttr(levelXml, 'OrderIndex');

			this.$levels.push(levelXml)
			this.$levelIdToLevelMap.set(levelId, levelXml);
			this.$levelIdToRawNameMap.set(levelId, textAttr(levelXml, 'NameMessage'));
			this.$orderIndexToLevelIdMap.set(orderIndex, levelId);
		}

		for (const roomXml of UtilsXPath.getAllElements(`//Rooms`, Level.hold)) {
			const levelId = intAttr(roomXml, 'LevelID');
			const roomId = intAttr(roomXml, 'RoomID');
			const roomX = intAttr(roomXml, 'RoomX');
			const roomY = intAttr(roomXml, 'RoomY');
			const isRequired = boolAttr(roomXml, 'IsRequired', false);
			const isSecret = boolAttr(roomXml, 'IsSecret', false);
			const reader = new BinaryReader(UtilsBase64.decodeByteArray(attr(roomXml, 'Squares', '')));

			this.$rooms.push(roomXml);
			this.$roomIdToLevelIdMap.set(roomId, levelId);
			this.$roomIdToRoomMap.set(roomId, roomXml);
			this.$roomPosToRoomIdMap.set(`${roomX}:${roomY}`, roomId);
			this.$roomIdToSquaresReader.set(roomId, reader);

			if (isRequired) {
				this.$requiredRoomIds.add(roomId);

				const requiredRoomIds = this.$levelIdToRequiredRoomIdsMap.get(levelId) ?? [];
				requiredRoomIds.push(roomId);
				this.$levelIdToRequiredRoomIdsMap.set(levelId, requiredRoomIds);
			}

			if (isSecret) {
				this.$secretRoomIds.add(roomId);
			}

			const roomIds = this.$levelIdToRoomIdsMap.get(levelId) ?? [];
			roomIds.push(roomId);
			this.$levelIdToRoomIdsMap.set(levelId, roomIds);
		}

		// Retrieve data
		for (const data of UtilsXPath.getAllElements('//Data', Level.hold)) {
			switch (parseInt(data.getAttribute('DataFormat') ?? '0')) {
				case (40):
				case (41):
				case (42):
					DB.queueSound(intAttr(data, 'DataID'), attr(data, 'RawData'));
					break;

				case (1):
				case (2):
				case (3):
					// Unsupported
					break;
			}
		}

		// Retrieve variable names
		for (const variable of UtilsXPath.getAllElements('//Vars', Level.hold)) {
			const name = UtilsBase64.decodeWChar(variable.getAttribute('VarNameText') || '');
			const id = variable.getAttribute('VarID') || '';
			variableNameToId.set(name, id);
		}

		// Retrieve Speech
		for (const speech of UtilsXPath.getAllElements('//Speech', Level.hold)) {
			DB.queueSpeech(intAttr(speech, 'SpeechID'), speech);
		}
	}

	public static debugHoldInfo() {
		const info: Record<string, unknown> = {
			'Level Count': Level.getAllLevels().length,
			'Level Names': Level.getAllLevels().map(xml => `${textAttr(xml, 'NameMessage')} (Order=${attr(xml, 'OrderIndex')})`),
			'Room Count': Level.getAllRooms().length,
			'Required Room Count': Level.getAllRooms().filter(xml => xml.getAttribute('IsRequired') === '1').length,
			'Monster Counts': Level.getMonsterCounts(Level.hold),
			'Trapdoors Count': Level.getTrapdoorCount(UtilsXPath.getAllElements('//Rooms', Level.hold)),
			'i18n': Level.getAllTranslatableStrings(),
		};

		console.debug(info);
	}

	private static getMonsterCounts(context: Element | Document): Record<string, number> {
		const monsterCounts: Record<string, number> = {};
		for (const monsterXml of UtilsXPath.getAllElements('.//Monsters', Level.hold, context)) {
			const type = monsterXml.getAttribute('Type');
			const name = _(`ingame.monster.${type}`);

			monsterCounts[name] = monsterCounts[name] ?? 0;
			monsterCounts[name]++;
		}

		return monsterCounts
	}

	private static getTrapdoorCount(roomXmls: Element[]): number {
		let trapdoorCount = 0;
		for (const roomXml of roomXmls) {
			const squaresBA = UtilsBase64.decodeByteArray(attr(roomXml, 'Squares'));
			const reader = new BinaryReader(squaresBA);

			const version = reader.readByte();
			if (version != 6) {
				throw new Error(`Invalid data format version, should be 6 was: ${version}`);
			}

			let count = 0;
			let tile = 0;
			for (let y = 0; y < S.RoomHeightOriginal; y++) {
				for (let x = 0; x < S.RoomWidthOriginal; x++) {
					if (!count) {
						count = reader.readByte();
						tile = reader.readByte();
					}

					count--;

					if (x >= S.RoomWidth || y >= S.RoomHeight) {
						continue;
					}

					if (tile === C.T_TRAPDOOR) {
						trapdoorCount++;
					}
				}
			}
		}

		return trapdoorCount;
	}
}