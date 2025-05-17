import {TGameObject} from "../objects/TGameObject";
import {DrodLayer} from "./DrodLayer";
import {RecamelGroup} from "../../../src.framework/net/retrocade/camel/core/RecamelGroup";
import {TCharacter} from "../objects/actives/TCharacter";
import {Pathmap} from "./Pathmap";
import {VOOrb} from "../managers/VOOrb";
import {VOScroll} from "../managers/VOScroll";
import {VOCheckpoints} from "../managers/VOCheckpoints";
import {RoomTileRenderer} from "./RoomTileRenderer";
import {PlatformOptions} from "../../platform/PlatformOptions";
import {S} from "../../S";
import {Gfx} from "./Gfx";
import {Level} from "./Level";
import {UtilsBase64} from "../../../src.framework/net/retrocade/utils/UtilsBase64";
import {UtilsXPath} from "../../../src.framework/net/retrocade/utils/UtilsXPath";
import {attr, intAttr, textAttr} from "../../XML";
import {VOStairs} from "../managers/VOStairs";
import {ASSERT} from "../../ASSERT";
import {BinaryReader} from "csharp-binary-stream";
import {C, StyleName} from "../../C";
import {CueEvents} from "./CueEvents";
import {VOCoord} from "../managers/VOCoord";
import {F} from "../../F";
import {TMonster} from "../objects/actives/TMonster";
import {Game} from "./Game";
import {Progress} from "./Progress";
import {TRoach} from "../objects/actives/TRoach";
import {TRoachQueen} from "../objects/actives/TRoachQueen";
import {TRoachEgg} from "../objects/actives/TRoachEgg";
import {TGoblin} from "../objects/actives/TGoblin";
import {TWraithwing} from "../objects/actives/TWraithwing";
import {TEvilEye} from "../objects/actives/TEvilEye";
import {TRedSerpent} from "../objects/actives/TRedSerpent";
import {TTarMother} from "../objects/actives/TTarMother";
import {TTarBaby} from "../objects/actives/TTarBaby";
import {TMimic} from "../objects/actives/TMimic";
import {TSpider} from "../objects/actives/TSpider";
import {TBrain} from "../objects/actives/TBrain";
import {PackedVars} from "./PackedVars";
import {TPlayerDouble} from "../objects/actives/TPlayerDouble";
import {RecamelLayerSprite} from "../../../src.framework/net/retrocade/camel/layers/RecamelLayerSprite";
import { Sprite } from "pixi.js";

const tarOrthoCheckX = [0, 1, 0, -1];
const tarOrthoCheckY = [-1, 0, 1, 0];

export class Room {
	/**
	 * Opaque tiles BYTE
	 */
	public tilesOpaque: number[] = [];

	/**
	 * Transparent BYTE
	 */
	public tilesTransparent: number[] = [];

	/**
	 * Transparent param BYTE
	 */
	public tilesTransparentParam: number[] = [];

	/**
	 * Active TGameObject
	 */
	public tilesActive: (TMonster | null)[] = [];

	/**
	 * Floor BYTE
	 */
	public tilesFloor: number[] = [];

	/**
	 * Counts amount of swords on the given tile BYTE
	 */
	public tilesSwords: number[] = [];

	public layerUnder: DrodLayer;
	public layerActive: DrodLayer;
	public layerEffects: DrodLayer;
	public layerDebug: DrodLayer;
	public layerUnderTextured: RecamelLayerSprite;
	public layerUI: RecamelLayerSprite;

	public monsters = new RecamelGroup<TMonster>();
	public plots = new Set<number>();

	public charactersWaitingForCueEvents: TCharacter[] = [];

	public trapdoorsLeft: number = 0;
	public tarLeft: number = 0;
	public monsterCount: number = 0;
	public brainCount: number = 0;

	public roomId: number = Number.MAX_VALUE;
	public levelId: number = Number.MAX_VALUE;

	public lastRoomID: number = Number.MAX_VALUE; // Used to help myself with some of
	public lastLevelID: number = Number.MAX_VALUE; // Minimap widget calculations

	public currentTurn: number = 1;

	public brainMove: boolean = true;
	public greenDoorsOpened: boolean = false;
	public tarWasStabbed: boolean = false;

	public pathmapGround?: Pathmap;
	public pathmapAir?: Pathmap;

	// Agents
	public orbs = new Map<number, VOOrb>();
	public stairs: VOStairs[] = [];
	public scrolls = new Map<number, VOScroll>();
	public checkpoints = new VOCheckpoints();

	public roomTileRenderer = new RoomTileRenderer();


	//{ Uncategorized

	/******************************************************************************************************/
	/**                                                                                    UNGATEGORIZED  */

	/******************************************************************************************************/

	public constructor() {
		this.layerUnder = DrodLayer.create(S.SIZE_GAME_WIDTH, S.SIZE_GAME_HEIGHT, 0, 0);
		this.layerUnderTextured = RecamelLayerSprite.create();
		this.layerActive = DrodLayer.create(S.RoomWidthPixels, S.RoomHeightPixels, S.LEVEL_OFFSET_X, S.LEVEL_OFFSET_Y);
		this.layerEffects = DrodLayer.create(S.SIZE_GAME_WIDTH, S.SIZE_GAME_HEIGHT, 0, 0);
		this.layerDebug = DrodLayer.create(S.RoomWidthPixels, S.RoomHeightPixels, S.LEVEL_OFFSET_X, S.LEVEL_OFFSET_Y);
		this.layerUI = RecamelLayerSprite.create();

		this.layerUnderTextured.add(this.roomTileRenderer.spriteLayer.container);
		this.roomTileRenderer.spriteLayer.container.x = S.LEVEL_OFFSET_X;
		this.roomTileRenderer.spriteLayer.container.y = S.LEVEL_OFFSET_Y;

		this.layerEffects.offsetX = S.LEVEL_OFFSET_X;
		this.layerEffects.offsetY = S.LEVEL_OFFSET_Y;

		if (PlatformOptions.isGame) {
			this.layerUnderTextured.addAt(new Sprite(Gfx.InGameScreenTexture), 0);
		}
	}

	public clear() {
		this.checkpoints.clear();
		this.roomTileRenderer.teardown();
		this.monsters.clear();

		if (PlatformOptions.isGame) {
			this.layerUnder.removeLayer();
			this.layerUnderTextured.removeLayer();
			this.layerActive.removeLayer();
			this.layerEffects.removeLayer();
			this.layerDebug.removeLayer();
			this.layerUI.removeLayer();
		}

		this.pathmapGround?.clear();
		this.pathmapAir?.clear();
	}

	public loadRoom(roomID: number) {
		this.resetRoom();

		this.lastRoomID = this.roomId;
		this.roomId = roomID;

		const room = Level.getRoom(roomID);

		this.lastLevelID = this.levelId;
		this.levelId = intAttr(room, 'LevelID');

		const styleName = textAttr(room, 'StyleName', PlatformOptions.defaultStyle) as StyleName;

		this.loadSquaresIntoArrays(roomID, this.tilesOpaque, this.tilesTransparent, this.tilesTransparentParam, this.tilesFloor);

		// Load monsters
		for (const monster of UtilsXPath.getAllElements('Monsters', room.ownerDocument, room)) {
			this.addNewMonsterXML(monster);
		}

		// Load orbs
		for (const orb of UtilsXPath.getAllElements('Orbs', room.ownerDocument, room)) {
			const orbData = new VOOrb(intAttr(orb, 'X'), intAttr(orb, 'Y'));

			for (const orbAgent of orb.children) {
				orbData.addAgent(
					intAttr(orbAgent, 'Type'),
					intAttr(orbAgent, 'X'),
					intAttr(orbAgent, 'Y'),
				);
			}

			this.orbs.set(orbData.x + orbData.y * S.RoomWidth, orbData);
			this.plot(orbData.x, orbData.y, C.T_ORB);
		}

		// Load stairs
		for (const exit of UtilsXPath.getAllElements('Exits', room.ownerDocument, room)) {
			this.stairs.push(new VOStairs(exit));
		}

		// Load checkpoints
		for (const checkpoint of UtilsXPath.getAllElements('Checkpoints', room.ownerDocument, room)) {
			this.checkpoints.addCheckpoint(checkpoint);
		}

		// Load scrolls
		for (const xml of UtilsXPath.getAllElements('Scrolls', room.ownerDocument, room)) {
			const scrollData = new VOScroll(
				intAttr(xml, 'X'),
				intAttr(xml, 'Y'),
				UtilsBase64.decodeWChar(attr(xml, 'Message')),
				Level.getScrollTranslationId(xml)
			);
			this.scrolls.set(scrollData.x + scrollData.y * S.RoomWidth, scrollData);
		}

		this.roomTileRenderer.prepareRoom(
			styleName,
			this.tilesOpaque,
			this.tilesTransparent,
			this.tilesTransparentParam,
			this.tilesFloor,
			this.checkpoints
		);
		this.drawRoom();

		this.initRoomStats();
	}

	public loadSquaresIntoArrays(roomID: number, tilesO: number[], tilesT: number[], tilesTParam: number[], tilesF: number[]) {
		tilesO.length = S.RoomTotalTiles;
		tilesT.length = S.RoomTotalTiles;
		tilesTParam.length = S.RoomTotalTiles;
		tilesF.length = S.RoomTotalTiles;

		const room = Level.getRoom(roomID);

		ASSERT(room, "Invalid Room ID: " + roomID);

		this.lastLevelID = this.levelId;
		this.levelId = intAttr(room, 'LevelID');

		const squaresReader = new BinaryReader(UtilsBase64.decodeByteArray(attr(room, 'Squares')));

		const version = squaresReader.readByte();
		if (version != 6) {
			throw new Error(`Invalid data format version, should be 6 was: ${version}`);
		}

		let count: number = 0;
		let tile: number = 0;

		// Opaque Layer

		for (let y = 0; y < S.RoomHeightOriginal; y++) {
			for (let x = 0; x < S.RoomWidthOriginal; x++) {
				if (!count) {
					count = squaresReader.readByte();
					tile = this.tileSanitizer(squaresReader.readByte());
				}

				if (x < S.RoomWidth && y < S.RoomHeight) {
					tilesO[x + y * S.RoomWidth] = tile;
				}
				count--;
			}
		}

		if (count > 0) {
			throw new Error("THE HELL COUNT");
		}
		// Floor Layer
		for (let y = 0; y < S.RoomHeightOriginal; y++) {
			for (let x = 0; x < S.RoomWidthOriginal; x++) {
				if (!count) {
					count = squaresReader.readByte();
					tile = this.tileSanitizer(squaresReader.readByte());
				}

				if (x < S.RoomWidth && y < S.RoomHeight) {
					tilesF[x + y * S.RoomWidth] = tile;
				}
				count--;
			}
		}

		let lastParam: number = 0;
		// Transparent Layer with Parameter (ignored)

		if (count > 0) {
			throw new Error("THE HELL COUNT");
		}

		for (let y = 0; y < S.RoomHeightOriginal; y++) {
			for (let x = 0; x < S.RoomWidthOriginal; x++) {
				if (!count) {
					count = squaresReader.readByte();
					tile = this.tileSanitizer(squaresReader.readByte());

					lastParam = squaresReader.readByte();
				}

				if (x < S.RoomWidth && y < S.RoomHeight) {
					if (tile != C.T_EMPTY) {
						tilesT[x + y * S.RoomWidth] = tile;
					}

					tilesTParam[x + y * S.RoomWidth] = lastParam;
				}
				count--;
			}
		}
	}

	public reload() {
		this.loadRoom(this.roomId);
	}

	/** Counts all elements in the room and gathers other data **/
	public initRoomStats() {
		for (let i: number = 0; i < S.RoomTotalTiles; i++) {
			switch (this.tilesOpaque[i]) {
				case(C.T_TRAPDOOR):
				case(C.T_TRAPDOOR_WATER):
					this.trapdoorsLeft++;
					break;
			}

			switch (this.tilesTransparent[i]) {
				case(C.T_MUD):
				case(C.T_TAR):
				case(C.T_GEL):
					this.tarLeft++;
					break;
			}
		}
	}

	public setRoomEntryState(wasLevelComplete: boolean, isCurrentLevelComplete: boolean, wasRoomConquered: boolean, monsterCountAtStart: number) {
		if (wasRoomConquered) {
			this.toggleGreenDoors();
			this.clearMonsters(true);
			monsterCountAtStart = 0;

		} else if (!monsterCountAtStart) {
			CueEvents.add(C.CID_CONQUER_ROOM, this.roomId);
			this.toggleGreenDoors();
			this.clearMonsters(true);

		}

		this.removeFinishedCharacters();

		if (isCurrentLevelComplete) {
			if (!wasLevelComplete) {
				CueEvents.add(C.CID_COMPLETE_LEVEL);
			}
			this.toggleOTiles(C.T_DOOR_C, C.T_DOOR_CO);
		}

		if (this.trapdoorsLeft == 0) {
			this.toggleOTiles(C.T_DOOR_R, C.T_DOOR_RO);
		}

		if (this.tarLeft == 0) {
			this.toggleBlackGates();
		} else if (!monsterCountAtStart) {
			this.fixUnstableTar();
		}
	}

	public resetRoom() {
		let i: number, l: number;

		for (i = 0, l = S.RoomTotalTiles; i < l; i++) {
			this.tilesOpaque[i] = C.T_FLOOR;
			this.tilesTransparent[i] = C.T_EMPTY;
			this.tilesTransparentParam[i] = 0;
			this.tilesFloor[i] = C.T_EMPTY;
			this.tilesActive[i] = null;
			this.tilesSwords[i] = 0;
		}

		this.monsters.clear();

		this.trapdoorsLeft = 0;
		this.tarLeft = 0;
		this.brainCount = 0;
		this.monsterCount = 0;

		if (PlatformOptions.isGame) {
			this.roomTileRenderer.clearTiles();
			this.layerActive.clearTiles();
			this.layerEffects.clearTiles();
		}

		this.orbs.clear();
		this.stairs.length = 0;
		this.scrolls.clear();

		this.checkpoints.clear();
	}

	//}

	//{ Action

	/******************************************************************************************************/
	/**                                                                                           ACTION  */

	/******************************************************************************************************/

	public activateOrb(wX: number, wY: number, activationType: number) {
		const orb = this.orbs.get(wX + wY * S.RoomWidth);

		switch (activationType) {
			case(C.OAT_PLAYER):
				CueEvents.add(C.CID_ORB_ACTIVATED_BY_PLAYER, orb || new VOCoord(wX, wY, 0));
				break;

			case(C.OAT_MONSTER):
			case(C.OAT_SCRIPT_ORB):
				CueEvents.add(C.CID_ORB_ACTIVATED_BY_DOUBLE, orb || new VOCoord(wX, wY, 0));
				break;
		}

		if (!orb || !orb.agents) {
			return;
		}

		for (const agent of orb.agents) {
			switch (agent.type) {
				case(C.OA_TOGGLE):
					this.toggleYellowDoor(agent.tX, agent.tY);
					break;

				case(C.OA_OPEN):
					this.openYellowDoors(agent.tX, agent.tY);
					break;

				case(C.OA_CLOSE):
					this.closeYellowDoors(agent.tX, agent.tY);
					break;
			}
		}
	}

	/**
	 * Calls checkForCueEvents() on all characters which
	 * failed to get their CueEvent wait resolved this turn
	 */
	public charactersCheckForCueEvents() {
		for (const character of this.charactersWaitingForCueEvents) {
			character.checkForCueEvents();
		}

		this.charactersWaitingForCueEvents.length = 0;
	}

	public fixUnstableTar() {
		let stable: boolean;

		let x: number, y: number, index: number, tile: number;
		do {
			stable = true;
			for (y = 0; y < S.RoomHeight; y++) {
				for (x = 0; x < S.RoomWidth; x++) {
					tile = this.tilesTransparent[index = x + y * S.RoomWidth];

					if (F.isTar(tile) && !this.isTarStableAt(x, y, tile)) {
						const monster = this.tilesActive[index];

						if (monster && F.isMother(monster.getType())) {
							continue;
						}

						this.destroyTar(x, y);
						stable = false;
					}
				}
			}
		} while (!stable);
	}

	public isTarStableAt(tx: number, ty: number, type: number): boolean {
		const tar = [];

		for (let y = ty - 1; y != ty + 2; y++) {
			if (y < S.RoomHeight) {
				for (let x = tx - 1; x != tx + 2; x++) {
					if (x < S.RoomWidth) {
						tar[x - tx + 1 + (y - ty + 1) * 3] =
							(this.tilesTransparent[x + y * S.RoomWidth] == type);
					}
				}
			}
		}

		return (tar[0] && tar[3] && tar[1]) ||
			(tar[6] && tar[3] && tar[7]) ||
			(tar[2] && tar[5] && tar[1]) ||
			(tar[8] && tar[5] && tar[7]);
	}

	public preprocessMonsters() {
		for (const monster of this.monsters.getAllOriginal()) {
			if (monster && monster.getType() === C.M_CHARACTER) {
				monster.process(C.CMD_WAIT);
			}
		}
	}

	public processTurn(fullMove: boolean) {
		if (fullMove) {
			if (CueEvents.hasOccurred(C.CID_TAR_GREW)) {
				this.growTar(C.T_TAR);
			}
		}
	}

	public stabTar(x: number, y: number, removeNow: boolean, stabO: number = C.NO_ORIENTATION): boolean {
		if (removeNow) {
			const tSquare: number = this.tilesTransparent[x + y * S.RoomWidth];
			if (F.isTar(tSquare)) {
				this.removeStabbedTar(x, y);
				this.tarWasStabbed = true;

				CueEvents.add(C.CID_TARSTUFF_DESTROYED, new VOCoord(x, y, stabO));

				return true;
			}
			return false;
		}

		return this.isTarVulnerableToStab(x, y);
	}

	//}

	//{ Setters

	/******************************************************************************************************/
	/**                                                                                          SETTERS  */

	/******************************************************************************************************/

	public updatePathmapAt(x: number, y: number) {
		this.pathmapGround?.squareChanged(x, y);
		this.pathmapAir?.squareChanged(x, y);
	}

	public createPathmap(x: number, y: number, movementType: number) {
		switch (movementType) {
			case(C.MOVEMENT_GROUND):
				if (!this.pathmapGround) {
					this.pathmapGround = new Pathmap(movementType, false);
				}
				this.pathmapGround.setTarget(x, y);

				this.pathmapGround.room = this;
				this.pathmapGround.resetDeep();
				break;

			case(C.MOVEMENT_AIR):
				if (!this.pathmapAir) {
					this.pathmapAir = new Pathmap(movementType, false);
				}
				this.pathmapAir.setTarget(x, y);

				this.pathmapAir.room = this;
				this.pathmapAir.resetDeep();
				break;
		}
		// @todo Add other pathmaps
	}

	public deletePathmaps() {
		this.pathmapGround?.clear();
		this.pathmapAir?.clear();

		this.pathmapGround = undefined;
		this.pathmapAir = undefined;
	}

	public createPathmaps() {
		if (!this.isPathmapNeeded()) {
			return;
		}

		this.createPathmap(Game.player.x, Game.player.y, C.MOVEMENT_GROUND);

		if (this.getMonsterOfType(C.M_WRAITHWING)) {
			this.createPathmap(Game.player.x, Game.player.y, C.MOVEMENT_AIR);
		}
	}

	public setPathmapTarget(x: number, y: number) {
		this.pathmapGround?.setTarget(x, y);
		this.pathmapAir?.setTarget(x, y);
	}

	public pathmapTileModified(x: number, y: number) {
		this.pathmapGround?.deepResetTile(x, y);
		this.pathmapAir?.deepResetTile(x, y);
	}

	public resetPathmaps() {
		this.pathmapGround?.reset();
		this.pathmapAir?.reset();
	}

	//}

	//{ Checkers

	/******************************************************************************************************/
	/**                                                                                         CHECKERS  */

	/******************************************************************************************************/

	public doesSquareContainDoublePlacementObstacle(x: number, y: number): boolean {
		ASSERT(F.isValidColRow(x, y));

		const index: number = x + y * S.RoomWidth;
		if (this.tilesActive[index]) {
			return true;
		}

		let tile: number = this.tilesTransparent[index];
		if (!(tile == C.T_EMPTY || tile == C.T_FUSE || tile == C.T_TOKEN)) {
			return true;
		}

		if (F.isArrow(this.tilesFloor[index])) {
			return true;
		}

		tile = this.tilesOpaque[index];
		if (F.isTrapdoor(tile) || !(F.isFloor(tile) || F.isPlatform(tile) ||
			(F.isOpenDoor(tile) && tile != C.T_DOOR_YO))) {
			return true;
		}

		if (x == Game.player.x && y == Game.player.y) {
			return true;
		}

		return !!this.tilesSwords[index];
	}

	public getSpeaker(type: number): TGameObject | null {
		if (type == C.M_BEETHRO) {
			return Game.player;
		}

		for (const monster of this.monsters.getAllOriginal()) {
			if (!monster) {
				continue;
			}

			if (monster.getType() === C.M_CHARACTER) {
				const character = monster as TCharacter;
				if (character.visible && type == character.logicalIdentity) {
					return character;
				}

			} else {
				if (monster.getType() == type) {
					return monster;
				}
			}
		}

		return null;
	}

	public hasTile(tile: number): boolean {
		const layer = F.tilesArrayFromLayerID(C.TILE_LAYER[tile], this);

		for (let i: number = 0; i < S.RoomTotalTiles; i++) {
			if (layer[i] == tile) {
				return true;
			}
		}

		return false;
	}

	public isMonsterInRect(left: number, top: number, right: number, bottom: number, considerPieces: boolean): boolean {
		ASSERT(left <= right && top <= bottom);
		ASSERT(right < S.RoomWidth && top < S.RoomHeight);

		for (let y: number = top; y <= bottom; y++) {
			for (let x: number = left; x <= right; x++) {
				const monster = this.tilesActive[x + y * S.RoomWidth];

				if (monster && monster.isAlive && !(
					F.isBeethroDouble(monster.getType()) ||
					monster.getType() == C.M_CHARACTER) &&
					(considerPieces || !monster.isPiece())) {
					return true;
				}
			}
		}

		return false;
	}

	public isMonsterInRectOfType(left: number, top: number, right: number, bottom: number, type: number, considerNPC: boolean = false): boolean {
		ASSERT(left <= right && top <= bottom);
		ASSERT(right < S.RoomWidth && top < S.RoomHeight);

		for (let y: number = top; y <= bottom; y++) {
			for (let x: number = left; x <= right; x++) {
				const monster = this.tilesActive[x + y * S.RoomWidth];

				if (monster && monster.isAlive) {
					if (monster.getType() == type) {
						return true;
					}

					if (monster.getType() === C.M_CHARACTER && considerNPC && monster.getIdentity() == type) {
						return true;
					}
				}
			}
		}

		return false;
	}

	public isPathmapNeeded(): boolean {
		if (this.brainCount > 0) {
			return true;
		}

		return false;
	}

	public isSwordWithinRect(left: number, top: number, right: number, bottom: number): boolean {
		if (left < 0) {
			left = 0;
		}
		if (top < 0) {
			top = 0;
		}
		if (right >= S.RoomWidth) {
			right = S.RoomWidth - 1;
		}
		if (bottom >= S.RoomHeight) {
			bottom = S.RoomHeight - 1;
		}

		for (let i: number = left; i <= right; i++) {
			for (let j: number = top; j <= bottom; j++) {
				if (this.tilesSwords[i + j * S.RoomWidth]) {
					return true;
				}
			}
		}

		return false;
	}

	public isTarVulnerableToStab(x: number, y: number): boolean {
		let i: number;
		let j: number;

		let tx: number;
		let ty: number;

		let dx: number;
		let dy: number;

		let failed: boolean = true;

		const tarType: number = this.tilesTransparent[x + y * S.RoomWidth];

		switch (tarType) {
			case(C.T_TAR):
				for (i = 0; i < 4; i++) {
					tx = x + tarOrthoCheckX[i];
					ty = y + tarOrthoCheckY[i];

					if (!F.isValidColRow(tx, ty) || this.tilesTransparent[tx + ty * S.RoomWidth] != tarType) {
						failed = false;
						break;
					}
				}

				if (failed) {
					return false;
				}

				dx = tarOrthoCheckX[i];
				dy = tarOrthoCheckY[i];

				for (i = 0; i <= 1; i++) {
					for (j = -1; j <= 1; j++) {
						tx = x + dy * j - dx * i;
						ty = y + dx * j - dy * i;

						if (!F.isValidColRow(tx, ty) || this.tilesTransparent[tx + ty * S.RoomWidth] != tarType) {
							return false;
						}
					}
				}

				return true;
		}

		throw new Error("This should have never happened!");
	}

	public isTimerNeeded(): boolean {
		for (const monster of this.monsters.getAllOriginal()) {
			if (!monster) {
				continue;
			}

			if (monster.getType() === C.M_ROACH_QUEEN || monster.getType() === C.M_TAR_MOTHER || monster.getType() === C.M_SERPENT_R) {
				return true;
			}
		}

		return false;
	}

	public getMonsterOfType(type: number): TMonster | null {
		for (const monster of this.monsters.getAllOriginal()) {
			if (monster && monster.getType() == type && (!(monster.getType() === C.M_CHARACTER) || monster.isVisible())) {
				return monster;
			}
		}

		return null;
	}

	public countMonsterOfType(type: number): number {
		let count = 0;
		for (const monster of this.monsters.getAllOriginal()) {
			if (monster && monster.getType() == type && (!(monster.getType() === C.M_CHARACTER) || monster.isVisible())) {
				count++
			}
		}

		return count;
	}

	/** TODO EightNeighbour, ignore and region mask not implemented **/
	public getConnectedTiles(wX: number, wY: number, tileMask: number[]): number[] {

		const squares = new Set<number>();
		const coords: number[] = [];

		let coordNow: number = 0;
		let coordsTotal: number = 1;

		let posNow: number = 0;

		coords[0] = wX + wY * S.RoomWidth;


		const pushTileIfOfType = (pos: number) => {
			if (
				(tileMask.indexOf(this.tilesOpaque[pos]) != -1 || tileMask.indexOf(this.tilesTransparent[pos]) != -1)
				&& !squares.has(pos)) {
				coords[coordsTotal++] = pos;
			}
		};

		while (coordNow < coordsTotal) {
			posNow = coords[coordNow++];

			squares.add(posNow);

			const notTop: boolean = (posNow / S.RoomWidth | 0) > 0;
			const notBottom: boolean = (posNow / S.RoomWidth | 0) < S.RoomHeight - 1;

			if (posNow % S.RoomWidth > 0) {
				pushTileIfOfType(posNow - 1);
			}

			if (notTop) {
				pushTileIfOfType(posNow - S.RoomWidth);
			}

			if (posNow % S.RoomWidth < S.RoomWidth - 1) {
				pushTileIfOfType(posNow + 1);
			}

			if (notBottom) {
				pushTileIfOfType(posNow + S.RoomWidth);
			}

		}

		return Array.from(squares.values());
	}

	public newTarWouldBeStable(addedTar: Map<number, number>, tx: number, ty: number): boolean {
		const tar: boolean[] = [];
		const endX: number = tx + 2;
		const endY: number = ty + 2;
		let x: number, y: number;

		for (y = ty - 1; y != endY; y++) {
			if (y < S.RoomHeight && y >= 0) {
				for (x = tx - 1; x != endX; x++) {
					if (x < S.RoomWidth && x>= 0) {
						tar[x - tx + 1 + (y - ty + 1) * 3] = addedTar.get(x + y * S.RoomWidth)! > 0;
					}
				}
			}
		}

		return (tar[0] && tar[3] && tar[1]) ||
			(tar[6] && tar[3] && tar[7]) ||
			(tar[2] && tar[5] && tar[1]) ||
			(tar[8] && tar[5] && tar[7]);
	}

	//}

	//{ Level Modifiers

	/******************************************************************************************************/
	/**                                                                                  LEVEL MODIFIERS  */

	/******************************************************************************************************/

	public destroyTrapdoor(x: number, y: number) {
		this.plot(x, y, C.T_PIT);
		if (--this.trapdoorsLeft == 0) {
			CueEvents.add(C.CID_ALL_TRAPDOORS_REMOVED);

			if (this.toggleOTiles(C.T_DOOR_R, C.T_DOOR_RO)) {
				CueEvents.add(C.CID_RED_GATES_TOGGLED);
			}
		}

		CueEvents.add(C.CID_TRAPDOOR_REMOVED, new VOCoord(x, y));
	}

	public destroyCrumblyWall(x: number, y: number, o: number = C.NO_ORIENTATION) {
		ASSERT(
			F.isCrumblyWall(this.tilesOpaque[x + y * S.RoomWidth]) ||

			// A workaround to detect Secret Walls hidden as standard wall
			(this.roomTileRenderer.opaqueData[x + y * S.RoomWidth] & C.REND_WALL_HIDDEN_SECRET),
		);
		this.plot(x, y, this.roomTileRenderer.getNeighbourFloor(x, y));
		CueEvents.add(C.CID_CRUMBLY_WALL_DESTROYED, new VOCoord(x, y, o));
	}

	public destroyTar(x: number, y: number) {
		ASSERT(F.isTar(this.tilesTransparent[x + y * S.RoomWidth]));
		ASSERT(this.tarLeft);
		this.plot(x, y, C.T_EMPTY);
		--this.tarLeft;

		if (!this.tarLeft) {
			CueEvents.add(C.CID_ALL_TAR_REMOVED);
			this.toggleBlackGates();
		}
	}

	public growTar(tarType: number) {
		const playerX = Game.player.x;
		const playerY = Game.player.y;

		const motherType = C.M_TAR_MOTHER;
		const cid = C.CID_TAR_GREW;

		const roomHasTar = this.tarLeft > 0;
		let motherIsAlive = false;

		ASSERT(CueEvents.hasOccurred(cid));

		let monster: TMonster = CueEvents.getFirstPrivateData(cid);
		const mothers: TMonster[] = [];

		ASSERT(monster);

		while (monster) {
			if (monster.isAlive) {
				motherIsAlive = true;
				mothers.push(monster);
			}

			monster = CueEvents.getNextPrivateData();
		}

		if (!motherIsAlive) {
			return;
		}

		for (const monster of mothers) {
			if (monster.getType() == motherType && this.tilesTransparent[monster.x + monster.y * S.RoomWidth] != tarType) {
				this.plot(monster.x, monster.y, tarType);
				this.tarLeft++;
			}
		}

		let x: number, y: number;

		const possible: number[] = [];
		const addedTar = new Map<number, number>();
		let index: number;

		for (x = 0; x < S.RoomWidth; x++) {
			for (y = 0; y < S.RoomHeight; y++) {
				index = x + y * S.RoomWidth;
				const tileT: number = this.tilesTransparent[index];
				let tileO: number;
				let o: number;
				let nx: number;
				let ny: number;

				if (tileT == tarType) {
					addedTar.set(index, C.TAR_OLD);
					continue;
				}

				addedTar.set(index, C.TAR_NO);
				const monster = this.tilesActive[index];
				tileO = this.tilesOpaque[index];
				if ((F.isFloor(tileO) || F.isOpenDoor(tileO)) &&
					this.tilesFloor[index] == C.T_EMPTY && tileT == C.T_EMPTY && !(x == playerX && y == playerY) &&
					(!monster || monster.getType() == motherType)) {
					for (o = 0; o < C.ORIENTATION_COUNT; ++o) {
						if (o == C.NO_ORIENTATION) {
							continue;
						}

						nx = x + F.getOX(o);
						ny = y + F.getOY(o);

						if (!F.isValidColRow(nx, ny)) {
							continue;
						}
						if (this.tilesTransparent[nx + ny * S.RoomWidth] == tarType) {
							addedTar.set(index, C.TAR_NEW);
							possible.push(index);
							break;
						}
					}
				}
			}
		} // EndFor

		let i: number = possible.length;
		while (i--) {
			index = possible[i];

			x = index % S.RoomWidth;
			y = index / S.RoomWidth | 0;

			if (this.newTarWouldBeStable(addedTar, x, y)) {
				this.plot(x, y, tarType);
				this.tarLeft++;
			} else {
				if (this.tilesSwords[index]) {
					continue;
				}

				monster = this.addNewMonster(C.M_TAR_BABY, x, y, 0);
				CueEvents.add(C.CID_TAR_BABY_FORMED, monster);
			}

		}

		if (!roomHasTar && this.tarLeft) {
			this.toggleBlackGates();
		}
	}

	public removeFinishedCharacters() {
		for (const monster of this.monsters.getAllOriginal()) {
			if (monster && monster.getType() === C.M_CHARACTER && Progress.isScriptEnded((monster as TCharacter).scriptID)) {
				this.killMonster(monster);
			}

		}
	}

	public removeStabbedTar(x: number, y: number) {
		const tarType: number = this.tilesTransparent[x + y * S.RoomWidth];

		ASSERT(F.isTar(tarType));

		this.destroyTar(x, y);

		// @todo optimize
		const recompute = () => {
			for (let j = y - 1; j != y + 2; ++j) {
				for (let i = x - 1; i != x + 2; i++) {
					if (!F.isValidColRow(i, j) || this.tilesTransparent[i + j * S.RoomWidth] != tarType) {
						continue;
					}

					const isNorthTar: boolean = (j > 0 ? this.tilesTransparent[i + (j - 1) * S.RoomWidth] == tarType : false);
					const isSouthTar: boolean = (j < S.RoomHeight - 1 ? this.tilesTransparent[i + (j + 1) * S.RoomWidth] == tarType : false);
					const isWestTar: boolean = (i > 0 ? this.tilesTransparent[i - 1 + j * S.RoomWidth] == tarType : false);
					const isEastTar: boolean = (i < S.RoomWidth - 1 ? this.tilesTransparent[i + 1 + j * S.RoomWidth] == tarType : false);

					if ((i > 0 && j > 0 &&
						this.tilesTransparent[i - 1 + (j - 1) * S.RoomWidth] == tarType &&
						isNorthTar && isWestTar) ||

						(i < S.RoomWidth - 1 && j > 0 &&
							this.tilesTransparent[i + 1 + (j - 1) * S.RoomWidth] == tarType &&
							isNorthTar && isEastTar) ||

						(i > 0 && j < S.RoomHeight - 1 &&
							this.tilesTransparent[i - 1 + (j + 1) * S.RoomWidth] == tarType &&
							isSouthTar && isWestTar) ||

						(i < S.RoomWidth - 1 && j < S.RoomHeight - 1 &&
							this.tilesTransparent[i + 1 + (j + 1) * S.RoomWidth] == tarType &&
							isSouthTar && isEastTar)) {
						continue;
					}

					const index: number = i + j * S.RoomWidth;

					let monster = this.tilesActive[index];
					if (!monster || !F.isMother(monster.getType())) {
						this.destroyTar(i, j);

						if (!monster) {
							const tileO = this.tilesOpaque[index];
							if (!(this.tilesSwords[index] || F.isStairs(tileO) || F.isPit(tileO))) {
								switch (tarType) {
									case(C.T_TAR):
										monster = this.addNewMonster(C.M_TAR_BABY, i, j, 0);
										CueEvents.add(C.CID_TAR_BABY_FORMED, monster);
										break;
								}
							}
						}

						return true;
					}
				}
			}

			return false;
		};

		while (recompute()) {
		}
	}


	// ::::::::::::::::::::::::::::::::::::::::::::::
	// :: Monster Related
	// ::::::::::::::::::::::::::::::::::::::::::::::

	public addNewMonster(type: number, x: number, y: number, o: number, pieces: (Element | null) = null, extra: string = ''): TMonster {
		let monster: TMonster;

		switch (type) {
			case(C.M_ROACH):
				monster = new TRoach();
				break;
			case(C.M_ROACH_QUEEN):
				monster = new TRoachQueen();
				break;
			case(C.M_ROACH_EGG):
				monster = new TRoachEgg();
				break;
			case(C.M_GOBLIN):
				monster = new TGoblin();
				break;
			case(C.M_WRAITHWING):
				monster = new TWraithwing();
				break;
			case(C.M_EYE):
				monster = new TEvilEye();
				break;
			case(C.M_SERPENT_R):
				monster = new TRedSerpent();
				break;
			case(C.M_TAR_MOTHER):
				monster = new TTarMother();
				break;
			case(C.M_TAR_BABY):
				monster = new TTarBaby();
				break;
			case(C.M_BRAIN):
				monster = new TBrain();
				break;
			case(C.M_MIMIC):
				monster = new TMimic();
				break;
			case(C.M_SPIDER):
				monster = new TSpider();
				break;
			case(C.M_CHARACTER):
				monster = new TCharacter();
				break;
			default:
				throw new Error(`Invalid monster type ${type}`);
		}

		monster.x = monster.prevX = x;
		monster.y = monster.prevY = y;
		monster.o = monster.prevO = o;

		monster.room = this;

		switch (monster.getType()) {
			case(C.M_CHARACTER):
			case(C.M_SLAYER):
			case(C.M_SLAYER2):
			case(C.M_CLONE):
			case(C.M_DECOY):
			case(C.M_MIMIC):
			case(C.M_CITIZEN):
			case(C.M_WUBBA):
			case(C.M_HALPH):
			case(C.M_HALPH2):
			case(C.M_FEGUNDO):
			case(C.M_FEGUNDOASHES):
			case(C.M_STALWART):
				break;

			case(C.M_BRAIN):
				this.monsterCount++;
				this.brainCount++;
				break;

			default:
				this.monsterCount++;
				break;
		}

		if (extra) {
			monster.setMembersFromExtraVars(new PackedVars(UtilsBase64.decodeByteArray(extra)));
		}

		monster.initialize(pieces);
		monster.setGfx();

		this.linkMonster(monster, monster.isVisible());

		return monster;
	}

	public addNewMonsterXML(xml: Element): TMonster {
		return this.addNewMonster(
			intAttr(xml, 'Type'),
			intAttr(xml, 'X'),
			intAttr(xml, 'Y'),
			intAttr(xml, 'O'),
			xml,
			attr(xml, 'ExtraVars'),
		);
	}

	public clearMonsters(retainCharacters: boolean) {
		let i: number = 0;
		const k: number = this.monsters.length;
		for (; i < k; i++) {
			const monster = this.monsters.getAt(i);

			if (!monster) {
				continue;
			}

			if (retainCharacters) {
				switch (monster.getType()) {
					case(C.M_WUBBA):
					case(C.M_HALPH):
					case(C.M_HALPH2):
					case(C.M_SLAYER):
					case(C.M_SLAYER2):
					case(C.M_CHARACTER):
					case(C.M_CITIZEN):
					case(C.M_MIMIC):
					case(C.M_DECOY):
					case(C.M_CLONE):
					case(C.M_FEGUNDO):
					case(C.M_STALWART):
						continue;

					case(C.M_SERPENT_R):
						monster.killPieces();
						break;
				}
			}


			this.tilesActive[monster.x + monster.y * S.RoomWidth] = null;
			this.monsters.nullifyAt(i);
		}

		this.monsters.garbageCollectAdvanced();

		this.monsterCount = this.brainCount = 0;
	}

	public killMonster(monster: TMonster, force: boolean = false, ignoreEvents: boolean = false): boolean {
		this.tilesActive[monster.x + monster.y * S.RoomWidth] = null;

		this.monsters.nullify(monster);

		switch (monster.getType()) {
			case(C.M_CHARACTER):
				const character = monster as TCharacter;
				if (character.imperative == C.IMP_REQUIRED_TO_CONQUER) {
					this.monsterCount--;
					Game.tallyKill();
				}

				if (!character.swordSheathed) {
					this.tilesSwords[character.swordX + character.swordY * S.RoomWidth]--;
				}

				if (!ignoreEvents) {
					CueEvents.add(C.CID_NPC_KILLED, this);
				}
				break;
			case(C.M_MIMIC):
				const mimic = monster as TPlayerDouble;
				if (!mimic.swordSheathed) {
					this.tilesSwords[mimic.swordX + mimic.swordY * S.RoomWidth]--;
				}
				break;

			case(C.M_BRAIN):
				ASSERT(this.brainCount);

				Game.tallyKill();
				this.monsterCount--;
				this.brainCount--;
				if (this.brainCount == 0) {
					CueEvents.add(C.CID_ALL_BRAINS_REMOVED);
					Game.doesBrainSensePlayer = Game.doesBrainSenseSwordsman();
				}

				if (!this.isPathmapNeeded()) {
					this.deletePathmaps();
				}

				break;

			case(C.M_SERPENT_R):
				monster.killPieces();
				Game.tallyKill();
				this.monsterCount--;
				break;

			default:
				if (monster.isAlive) {
					this.monsterCount--;
					Game.tallyKill();
				}
		}

		monster.isAlive = false;

		return true;
	}

	public killMonsterAtSquare(x: number, y: number, force: boolean = false): boolean {
		const monster = this.tilesActive[x + y * S.RoomWidth];

		if (monster) {
			return this.killMonster(monster, force);
		}

		return false;
	}

	public linkMonster(monster: TMonster, isInRoom: boolean) {
		const monstersArray = this.monsters.getAllOriginal();

		let lastMonster: TMonster | null = null;
		let nowMonster: TMonster | null = null;

		let i = 0;
		let l = monstersArray.length;
		for (; i < l; i++) {
			nowMonster = monstersArray[i];

			if (nowMonster && nowMonster.getProcessSequence() > monster.getProcessSequence()) {
				break;
			}

			if (nowMonster) {
				lastMonster = nowMonster;
			}
		}

		if (lastMonster) {
			if (i == l) {
				this.monsters.add(monster);
			} else {
				this.monsters.addAt(monster, i);
			}

		} else {
			this.monsters.addAt(monster, 0);
		}

		if (isInRoom) {
			this.tilesActive[monster.x + monster.y * S.RoomWidth] = monster;
		}
	}


	// ::::::::::::::::::::::::::::::::::::::::::::::
	// :: Doors
	// ::::::::::::::::::::::::::::::::::::::::::::::

	public toggleYellowDoor(x: number, y: number) {
		if (this.tilesOpaque[x + y * S.RoomWidth] == C.T_DOOR_Y) {
			this.openYellowDoors(x, y);
		} else {
			this.closeYellowDoors(x, y);
		}
	}

	public openYellowDoors(x: number, y: number) {
		if (this.tilesOpaque[x + y * S.RoomWidth] == C.T_DOOR_Y) {
			this.floodPlot(x, y, C.T_DOOR_YO);
		}
	}

	public closeYellowDoors(x: number, y: number) {
		if (this.tilesOpaque[x + y * S.RoomWidth] == C.T_DOOR_YO) {
			this.floodPlot(x, y, C.T_DOOR_Y);
		}
	}

	public toggleGreenDoors(): boolean {
		this.greenDoorsOpened = true;
		return this.toggleOTiles(C.T_DOOR_G, C.T_DOOR_GO);
	}

	public toggleBlackGates() {
		if (this.toggleOTiles(C.T_DOOR_B, C.T_DOOR_BO)) {
			CueEvents.add(C.CID_BLACK_GATES_TOGGLED);
		}
	}


	// ::::::::::::::::::::::::::::::::::::::::::::::
	// :: General Usage
	// ::::::::::::::::::::::::::::::::::::::::::::::

	public floodPlot(wX: number, wY: number, tileNo: number) {
		const layerID: number = C.TILE_LAYER[tileNo];
		const layer = F.tilesArrayFromLayerID(layerID, this) as number[];

		const tileMask = [layer[wX + wY * S.RoomWidth]];
		const filledSquares = this.getConnectedTiles(wX, wY, tileMask);

		let i: number = 0;
		const l: number = filledSquares.length;
		for (; i < l; i++) {
			this.plot(filledSquares[i] % S.RoomWidth, filledSquares[i] / S.RoomWidth | 0, tileNo);
		}
	}

	/** Toggles given tiles on the Opaque layer, returns true if any tiles were changed **/
	public toggleOTiles(tileA: number, tileB: number): boolean {
		let tile: number;
		let anyTileChanged: boolean = false;
		for (let i: number = 0; i < S.RoomWidth; i++) {
			for (let j: number = 0; j < S.RoomHeight; j++) {
				tile = this.tilesOpaque[i + j * S.RoomWidth];
				if (tile == tileA) {
					this.plot(i, j, tileB);
					anyTileChanged = true;
				} else if (tile == tileB) {
					this.plot(i, j, tileA);
					anyTileChanged = true;
				}
			}
		}

		return anyTileChanged;
	}


	//}

	//{ Drawing

	/******************************************************************************************************/
	/**                                                                                          DRAWING  */

	/******************************************************************************************************/

	public setSaturation(saturation: number) {
		this.layerActive.saturation = saturation;
		this.layerUnderTextured.saturation = saturation;
	}

	public drawRoom() {
		this.roomTileRenderer.clearTiles();

		for (let j: number = 0; j < S.RoomHeight; j++) {
			for (let i: number = 0; i < S.RoomWidth; i++) {
				this.roomTileRenderer.drawTile(i, j);
			}
		}

		this.roomTileRenderer.refreshCache();
	}

	public redrawTile(x: number, y: number) {
		if (!F.isValidColRow(x, y)) {
			return;
		}

		this.roomTileRenderer.redrawTile(x, y);
	}

	/** Plots a tile to the level and redraws all necessary tiles. **/
	public plot(x: number, y: number, tile: number) {
		const arrPos: number = x + y * S.RoomWidth;

		const tileOld: number = F.tilesArrayFromLayerID(C.TILE_LAYER[tile], this)[arrPos] as number;

		if (tile == tileOld) {
			return;
		}

		F.tilesArrayFromLayerID(C.TILE_LAYER[tile], this)[arrPos] = tile;

		this.updatePathmapAt(x, y);

		this.roomTileRenderer.recheckAroundTile(x, y, this.plots);
	}

	public drawPlots() {
		for (const j of this.plots.values()) {
			this.redrawTile(j % S.RoomWidth, j / S.RoomWidth | 0);
		}

		this.plots.clear();
		this.roomTileRenderer.refreshCache();
	}

	private tileSanitizer(tileInput: number): number {
		switch (tileInput) {
			case(38):
				throw new Error("Speed Potions are not supported!");
			case(39):
			case(40):
			case(41):
				throw new Error("Briar is not supported!");
			case(43):
				throw new Error("Bomb is not supported!");
			case(45):
				throw new Error("OrthoSquares are not supported!");
			case(46):
				throw new Error("Tokens are not supported!");
			case(47):
			case(48):
			case(63):
			case(64):
				throw new Error("Tunnels are not supported!");
			case(49):
				throw new Error("Mirrors are not supported!");
			case(50):
				throw new Error("Clone Potions are not supported!");
			case(51):
				throw new Error("Decoy Potions are not supported!");
			case(52):
			case(53):
				throw new Error("Platforms are not supported!");
			case(60):
				throw new Error("Mud is not supported!");
			case(67):
				throw new Error("Water is not supported!");

			case(42): // Ceiling Light
			case(44): // Fuse
				return C.T_EMPTY;
			case(72): // Trapdoor over water
				return C.T_TRAPDOOR;
		}

		return tileInput;
	}

	//}

}
