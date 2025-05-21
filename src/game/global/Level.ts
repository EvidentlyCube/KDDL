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
import { assertDefined } from 'src/ASSERT';
import { DebugConsole } from '../DebugConsole';
import { RecamelLang } from 'src.framework/net/retrocade/camel/RecamelLang';
import { generateRoomPid } from './RoomPidGenerator';
import { IPointData } from "pixi.js";


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
	private static $requiredRoomPids = new Set<string>();
	private static $secretRoomPids = new Set<string>();
	private static $levelIdToLevelMap = new Map<number, Element>();
	private static $levelIdToRawNameMap = new Map<number, string>();
	private static $levelIdToRoomPidsMap = new Map<number, string[]>();
	private static $levelIdToRequiredRoomPidsMap = new Map<number, string[]>();
	private static $orderIndexToLevelIdMap = new Map<number, number>();
	private static $roomPidToRoomMap = new Map<string, Element>();
	private static $roomPidToLevelIdMap = new Map<string, number>();
	private static $roomPosToRoomPidMap = new Map<string, string>();
	private static $roomPidToSquaresReader = new Map<string, BinaryReader>();
	private static $roomPidToRoomId = new Map<string, number>();
	private static $roomIdToRoomPid = new Map<number, string>();


	public static restoreTo(roomPid: string, x: number, y: number, o: number) {
		Game.loadFromRoom(roomPid, x, y, o);
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

	public static getLevelGidIndex(levelId: number): number {
		return intAttr(Level.getLevelByID(levelId), 'GID_LevelIndex');
	}

	public static getLevelIdByRoomPid(roomPid: string): number {
		return Level.$roomPidToLevelIdMap.get(roomPid) ?? 0;
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

	public static getAllRoomPids(): ReadonlyArray<string> {
		return Level.$rooms.map(room => attr(room, 'RoomPID'));
	}

	public static isValidRoomPid(roomPid: string) {
		return !!Level.getRoomStrict(roomPid);
	}

	public static getRoom(roomPid: string): Element {
		return Level.$roomPidToRoomMap.get(roomPid) ?? nothingElement;
	}

	public static getRoomStrict(roomPid: string): Element | undefined {
		return Level.$roomPidToRoomMap.get(roomPid);
	}

	public static getRoomByPosition(x: number, y: number): Element | undefined {
		const roomPid = Level.$roomPosToRoomPidMap.get(`${x}:${y}`);

		return Level.getRoomStrict(roomPid ?? "0");
	}

	public static getRoomPidByNeighbourPid(roomPid: string, orientation: number): string | undefined {
		const room: Element = Level.getRoom(roomPid);

		const newRoomX: number = intAttr(room, 'RoomX') + F.getOX(orientation);
		const newRoomY: number = intAttr(room, 'RoomY') + F.getOY(orientation);

		const otherRoom = Level.getRoomByPosition(newRoomX, newRoomY);
		return otherRoom ? attr(otherRoom, 'RoomPID') : undefined;
	}

	public static getRoomPidsByLevel(levelId: number): readonly string[] {
		return Level.$levelIdToRoomPidsMap.get(levelId) ?? [];
	}

	public static getRequiredRoomPidsByLevel(levelId: number): readonly string[] {
		return Level.$levelIdToRequiredRoomPidsMap.get(levelId) ?? [];
	}

	public static getRoomsByLevel(levelID: number): readonly Element[] {
		return UtilsXPath.getAllElements(`//Rooms[@LevelID="${levelID}"]`, Level.hold);
	}

	public static getRoomPidByOffsetInLevel(levelId: number, x: number, y: number): string | undefined {
		const mainEntrance = Level.getEntranceMainByLevelID(levelId);
		const mainRoom = Level.getRoom(attr(mainEntrance, 'RoomPID'));
		const roomX = intAttr(mainRoom, 'RoomX', 0) + x;
		const roomY = intAttr(mainRoom, 'RoomY', 0) + y;

		const room = Level.getRoomByPosition(roomX, roomY);
		return room ? attr(room, 'RoomPID') : undefined;
	}

	public static getRoomOffsetInLevel(roomPid: string): IPointData {
		const room = Level.getRoom(roomPid);
		const levelID = Level.getLevelIdByRoomPid(roomPid);

		const mainEntrance = Level.getEntranceMainByLevelID(levelID);
		const mainRoom = Level.getRoom(attr(mainEntrance, 'RoomPID'));

		return {
			x: parseInt(room.getAttribute('RoomX') || '0') - parseInt(mainRoom.getAttribute('RoomX') || '0'),
			y: parseInt(room.getAttribute('RoomY') || '0') - parseInt(mainRoom.getAttribute('RoomY') || '0'),
		};
	}

	public static roomHasMonsters(roomPid: string): boolean {
		const roomId = Level.roomPidToId(roomPid);
		return UtilsXPath.getAllElements(`//Rooms[@RoomID="${roomId}"]/Monsters[@Type!="29"]`, Level.hold).length > 0;
	}

	public static getAnyVisitedRoomInLevel(levelID: number): Element | null {
		for (const room of UtilsXPath.getAllElements(`//Rooms[@LevelID=${levelID}]`, Level.hold)) {
			if (Progress.getRoomEntranceState(attr(room, 'RoomPID')))
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

	public static getEntrancesByRoomPid(roomPid: string): Element[] {
		const roomId = Level.roomPidToId(roomPid);
		return UtilsXPath.getAllElements(`//Entrances[@RoomID="${roomId}"]`, Level.hold);
	}

	public static getFirstHoldEntrance(): Element {
		return UtilsXPath.getAnyElement('//Entrances[@IsMainEntrance=1]', Level.hold);
	}

	public static getVarIDByName(name: string): string {
		return variableNameToId.get(name) ?? "";
	}

	public static getEntranceMainByLevelID(levelID: number): Element {
		const roomPids = Level.getRoomPidsByLevel(levelID);

		for (const roomPid of roomPids) {
			const entrances = Level.getEntrancesByRoomPid(roomPid);

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
		const roomPid = Level.roomIdToPid(roomId);
		const room = Level.getRoom(roomPid);
		const roomOffset = Level.getRoomOffsetInLevel(roomPid);
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
		const roomPid = Level.roomIdToPid(roomId);
		const roomOffset = Level.getRoomOffsetInLevel(roomPid);
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
		const roomPid = Level.roomIdToPid(roomId);
		const roomOffset = Level.getRoomOffsetInLevel(roomPid);
		const levelId = intAttr(room, 'LevelID', 0);
		const level = Level.getLevelByID(levelId);
		const monsterX = intAttr(monster, 'X', 0);
		const monsterY = intAttr(monster, 'Y', 0);

		return ""
			+ textAttr(level, 'NameMessage')
			+ ": "
			+ F.offsetToRoomName_internalUppercase(roomOffset.x, roomOffset.y)
			+ " -- "
			+ `(${monsterX}, ${monsterY})`;
	}

	public static getSecretRoomPidsByLevelId(levelId: number): readonly string[] {
		return Level.getRoomPidsByLevel(levelId).filter(roomId => Level.$secretRoomPids.has(roomId));
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

			const translation = RecamelLang.get('en', translationId).trim().replace(/\r\n|\r/g, "\n")
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


	public static canEnterRoom(roomPid: string, playerX: number, playerY: number): boolean {
		const room = Level.getRoom(roomPid);

		let tile: number = 0;
		let i: number = 0;
		let count: number = 0;

		let square: number = 0;

		const reader = Level.$roomPidToSquaresReader.get(roomPid);
		assertDefined(reader, `No binary reader cached for room "${roomPid}"`);

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

	public static roomIdToPid(roomId: number): string {
		return Level.$roomIdToRoomPid.get(roomId) ?? '';
	}

	public static roomPidToId(roomPid: string): number {
		return Level.$roomPidToRoomId.get(roomPid) ?? 0;
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
		this.$roomPidToRoomMap.clear();
		this.$roomPidToLevelIdMap.clear();
		this.$levelIdToRoomPidsMap.clear();
		this.$levelIdToRequiredRoomPidsMap.clear();
		this.$requiredRoomPids.clear();
		this.$secretRoomPids.clear();
		this.$roomPidToSquaresReader.clear();
		this.$roomPidToRoomId.clear();
		this.$roomIdToRoomPid.clear();

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
			const roomPid = generateRoomPid(roomId, Level.hold);

			roomXml.setAttribute('RoomPID', roomPid);

			this.$roomPidToRoomId.set(roomPid, roomId);
			this.$roomIdToRoomPid.set(roomId, roomPid);
			this.$rooms.push(roomXml);
			this.$roomPidToLevelIdMap.set(roomPid, levelId);
			this.$roomPidToRoomMap.set(roomPid, roomXml);
			this.$roomPosToRoomPidMap.set(`${roomX}:${roomY}`, roomPid);
			this.$roomPidToSquaresReader.set(roomPid, reader);

			if (isRequired) {
				this.$requiredRoomPids.add(roomPid);

				const requiredRoomIds = this.$levelIdToRequiredRoomPidsMap.get(levelId) ?? [];
				requiredRoomIds.push(roomPid);
				this.$levelIdToRequiredRoomPidsMap.set(levelId, requiredRoomIds);
			}

			if (isSecret) {
				this.$secretRoomPids.add(roomPid);
			}

			const roomPids = this.$levelIdToRoomPidsMap.get(levelId) ?? [];
			roomPids.push(roomPid);
			this.$levelIdToRoomPidsMap.set(levelId, roomPids);
		}

		for (const entranceXml of UtilsXPath.getAllElements('//Entrances', Level.hold)) {
			const roomId = intAttr(entranceXml, 'RoomID');
			entranceXml.setAttribute('RoomPID', Level.roomIdToPid(roomId));
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

	public static getMonsterCounts(context: Element | Document): Record<string, number> {
		const monsterCounts: Record<string, number> = {};
		for (const monsterXml of UtilsXPath.getAllElements('.//Monsters', Level.hold, context)) {
			const type = monsterXml.getAttribute('Type');
			const name = _(`ingame.monster.${type}`);

			monsterCounts[name] = monsterCounts[name] ?? 0;
			monsterCounts[name]++;
		}

		return monsterCounts
	}

	public static getTrapdoorCount(roomXmls: readonly Element[]): number {
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

DebugConsole.registerAction('copy-i18n', "Copies to clipboard i18n details about the current hold", () => {
	const { appendLine } = DebugConsole;

	if (!Level.getHold()) {
		throw new Error("No hold is currently loaded");
	} else if (!navigator || !navigator.clipboard || !navigator.clipboard.writeText) {
		throw new Error("Clipboard modification is not available in this browser");
	}

	navigator.clipboard.writeText(JSON.stringify(Level.getAllTranslatableStrings(), null, 4));
	appendLine('JSON copied to clipboard')
});

DebugConsole.registerAction('log-hold-stats', "Print information about the current hold", () => {
	const { appendLine } = DebugConsole;

	if (!Level.getHold()) {
		throw new Error("No hold is currently loaded");
	}

	appendLine(` ‣ **Levels:** ${Level.getAllLevels().length}`);
	for (const xml of Level.getAllLevels()) {
		appendLine(`   ↳ **Level #${attr(xml, 'OrderIndex')}:** ${textAttr(xml, 'NameMessage')}`);
	}
	appendLine(` ‣ **Rooms:** ${Level.getAllRooms().length}`);
	appendLine(` ‣ **Required Rooms:** ${Level.getAllRooms().filter(xml => xml.getAttribute('IsRequired') === '1').length}`);
	appendLine(` ‣ **Secret Rooms:** ${Level.getAllSecretRooms().length}`);
	appendLine(` ‣ **Trapdoor count:** ${Level.getTrapdoorCount(Level.getAllRooms())}`);
	appendLine(` ‣ **Monster counts:**`);
	const monsterCounts = Object.entries(Level.getMonsterCounts(Level.getHold())).sort((l, r) => l[0].localeCompare(r[0]));
	for (const [monster, count] of monsterCounts) {
		appendLine(`   ↳ **${monster}:** ${count}`);
	}
})