import { C } from "./C";
import { S } from "./S";
import { Room } from "./game/global/Room";

const FLOORS = new Set([
	C.T_FLOOR,
	C.T_FLOOR_MOSAIC,
	C.T_FLOOR_ROAD,
	C.T_FLOOR_GRASS,
	C.T_FLOOR_DIRT,
	C.T_FLOOR_ALT,
	C.T_FLOOR_IMAGE,
	C.T_TRAPDOOR,
	C.T_TRAPDOOR_WATER,
	C.T_BRIDGE,
	C.T_BRIDGE_H,
	C.T_BRIDGE_V,
	C.T_HOT,
	C.T_GOO,
	C.T_PRESSPLATE,
]);

const _calculatedDistances = new Map<number, number>();
export const F = {
	destroyCanvas(source: HTMLCanvasElement | CanvasRenderingContext2D) {
		if (source instanceof HTMLCanvasElement) {
			source.width = 0;
			source.height = 0;
		} else if (source instanceof CanvasRenderingContext2D) {
			source.canvas.width = 0;
			source.canvas.height = 0;
		}
	},
	newCanvasContext(width: number, height: number): CanvasRenderingContext2D {
		const canvas = document.createElement('canvas');
		canvas.width = width;
		canvas.height = height;
		return canvas.getContext('2d')!;
	},

	/** Checks if given command is a movement command **/
	isMovementCommand(command: number): boolean {
		switch (command) {
			case C.CMD_N:
			case C.CMD_NE:
			case C.CMD_W:
			case C.CMD_E:
			case C.CMD_SW:
			case C.CMD_S:
			case C.CMD_SE:
			case C.CMD_NW:
				return true;
			default:
				return false;
		}
	},

	/** Next clockwise orientation **/
	nextCO(o: number): number {
		switch (o) {
			case C.NW:
			case C.N:
				return o + 1;
			case C.NE:
			case C.E:
				return o + 3;
			case C.S:
			case C.SE:
				return o - 1;
			case C.W:
			case C.SW:
				return o - 3;
			default:
				return C.NO_ORIENTATION;
		}
	},

	/** Next counter clockwise orientation **/
	nextCCO(o: number): number {
		switch (o) {
			case C.NW:
			case C.W:
				return o + 3;
			case C.E:
			case C.SE:
				return o - 3;
			case C.SW:
			case C.S:
				return o + 1;
			case C.N:
			case C.NE:
				return o - 1;
			default:
				return C.NO_ORIENTATION;
		}
	},

	/** Orientation from x and y **/
	getO(ox: number, oy: number): number {
		return ((oy + 1) * 3) + (ox + 1);
	},

	/** X from orientation **/
	getOX(o: number): number {
		return (o % 3) - 1;
	},

	/** Y from orientation **/
	getOY(o: number): number {
		return ((o / 3) | 0) - 1;
	},

	invertDir(o: number): number {
		return 8 - o;
	},

	isAnsweringQuestionCommand(command: number) {
		return command === C.CMD_ANSWER
			|| command === C.CMD_YES
			|| command === C.CMD_NO;
	},

	reverseCommand(command: number): number {
		switch (command) {
			case (C.CMD_C):
				return C.CMD_CC;
			case (C.CMD_CC):
				return C.CMD_C;
			case (C.CMD_NW):
				return C.CMD_SW;
			case (C.CMD_N):
				return C.CMD_S;
			case (C.CMD_NE):
				return C.CMD_SE;
			case (C.CMD_W):
				return C.CMD_E;
			case (C.CMD_E):
				return C.CMD_W;
			case (C.CMD_SW):
				return C.CMD_NE;
			case (C.CMD_S):
				return C.CMD_N;
			case (C.CMD_SE):
				return C.CMD_NW;
			default:
				return C.CMD_UNSPECIFIED;
		}
	},

	distanceInTiles(x1: number, y1: number, x2: number, y2: number): number {
		if (x1 > x2) {
			if (y1 > y2) {
				return x1 - x2 > y1 - y2 ? x1 - x2 : y1 - y2;
			} else {
				return x1 - x2 > y2 - y1 ? x1 - x2 : y2 - y1;
			}
		} else if (y1 > y2) {
			return x2 - x1 > y1 - y2 ? x2 - x1 : y1 - y2;
		} else {
			return x2 - x1 > y2 - y1 ? x2 - x1 : y2 - y1;
		}
	},

	distanceInPixels(x1: number, y1: number, x2: number, y2: number): number {
		x1 -= x2;
		y1 -= y2;

		const index: number = x1 * x1 + y1 * y1;

		if (!_calculatedDistances.has(index)) {
			_calculatedDistances.set(index, Math.sqrt(index));
		}

		return _calculatedDistances.get(index)!;

	},

	orthogonalizeDirection(o: number, vertical: boolean): number {
		if (vertical) {
			switch (o) {
				case (0):
				case (2):
					return 1;
				case (6):
				case (8):
					return 7;
			}

		} else {
			switch (o) {
				case (0):
				case (6):
					return 3;
				case (2):
				case (8):
					return 5;
			}
		}

		return o;
	},

	isArrowObstacle(arrowTile: number, direction: number): boolean {
		switch (arrowTile) {
			case (C.T_ARROW_N):
				return direction == C.S || direction == C.SW || direction == C.SE;
			case (C.T_ARROW_S):
				return direction == C.N || direction == C.NW || direction == C.NE;
			case (C.T_ARROW_E):
				return direction == C.W || direction == C.NW || direction == C.SW;
			case (C.T_ARROW_W):
				return direction == C.E || direction == C.SE || direction == C.NE;
			case (C.T_ARROW_NE):
				return direction == C.S || direction == C.SW || direction == C.W;
			case (C.T_ARROW_NW):
				return direction == C.S || direction == C.E || direction == C.SE;
			case (C.T_ARROW_SE):
				return direction == C.N || direction == C.W || direction == C.NW;
			case (C.T_ARROW_SW):
				return direction == C.N || direction == C.E || direction == C.NE;
			default:
				return false;

		}
	},

	isValidColRow(x: number, y: number): boolean {
		return x < S.RoomWidth && y < S.RoomHeight && x >= 0 && y >= 0;
	},

	isValidOrientation(o: number): boolean {
		return o < C.ORIENTATION_COUNT;
	},

	isValidMonsterType(type: number): boolean {
		return type < C.MONSTER_TYPES;
	},

	tilesArrayFromLayerID(layer: number, room: Room): unknown[] {
		switch (layer) {
			case (0):
				return room.tilesOpaque;
			case (1):
				return room.tilesTransparent;
			case (2):
				return room.tilesActive;
			case (3):
				return room.tilesFloor;
			default:
				throw new Error("Trying to access invalid layer ID (" + layer + ").");
		}
	},

	tileToX(tile: number): number {
		return (Math.abs(tile) % 18) * (S.RoomTileWidth + 2) + 1;
	},

	tileToY(tile: number): number {
		return (Math.abs(tile) / 18 | 0) * (S.RoomTileHeight + 2) + 1;
	},

	isCommandRotate(t: number) {
		return t === C.CMD_CC || t === C.CMD_C;
	},

	isCommandMoveDiagonal(t: number) {
		return t === C.CMD_NW || t === C.CMD_NE || t === C.CMD_SW || t === C.CMD_SE;
	},

	isCommandMoveOrthogonal(t: number) {
		return t === C.CMD_N || t === C.CMD_S || t === C.CMD_W || t === C.CMD_E;
	},

	isCommandMove(t: number) {
		return F.isCommandMoveDiagonal(t) || F.isCommandMoveOrthogonal(t);
	},

	isArrow(t: number): boolean {
		return t >= C.T_ARROW_N && t <= C.T_ARROW_NW;
	},
	isBeethroDouble(t: number): boolean {
		return t == C.M_MIMIC || t == C.M_BEETHRO;
	},
	isBlackDoor(t: number): boolean {
		return t == C.T_DOOR_B || t == C.T_DOOR_BO;
	},
	isBlueDoor(t: number): boolean {
		return t == C.T_DOOR_C || t == C.T_DOOR_CO;
	},
	isBriar(t: number): boolean {
		return t >= C.T_FLOW_SOURCE && t <= C.T_FLOW_EDGE;
	},
	isBridge(t: number): boolean {
		return t == C.T_BRIDGE || t == C.T_BRIDGE_H || t == C.T_BRIDGE_V;
	},
	isComplexCommand(command: number): boolean {
		return command == C.CMD_CLONE || command == C.CMD_DOUBLE || command == C.CMD_ANSWER;
	},
	isCrumblyWall(t: number): boolean {
		return t == C.T_WALL_BROKEN || t == C.T_WALL_HIDDEN;
	},
	isCustomImageTile(t: number): boolean {
		return t == C.T_FLOOR_IMAGE || t == C.T_PIT_IMAGE || t == C.T_WALL_IMAGE;
	},
	isDoor(t: number): boolean {
		return (t >= C.T_DOOR_C && t <= C.T_DOOR_Y) || t == C.T_DOOR_B;
	},
	isFloor(t: number): boolean {
		return FLOORS.has(t);
	},
	isGreenDoor(t: number): boolean {
		return t == C.T_DOOR_G || t == C.T_DOOR_GO;
	},
	isLight(t: number): boolean {
		return t == C.T_LIGHT;
	},
	isMother(t: number): boolean {
		return t == C.M_TAR_MOTHER || t == C.M_MUDMOTHER || t == C.M_GELMOTHER;
	},
	isOpenDoor(t: number): boolean {
		return t == C.T_DOOR_YO || (t >= C.T_DOOR_GO && t <= C.T_DOOR_BO);
	},
	isPit(t: number): boolean {
		return t == C.T_PIT || t == C.T_PIT_IMAGE;
	},
	isPlainFloor(t: number): boolean {
		return t == C.T_FLOOR || (t >= C.T_FLOOR_MOSAIC && t <= C.T_FLOOR_ALT) || t == C.T_FLOOR_IMAGE;
	},
	isPlatform(t: number): boolean {
		return t == C.T_PLATFORM_P || t == C.T_PLATFORM_W;
	},
	isPotion(t: number): boolean {
		return t == C.T_POTION_I || t == C.T_POTION_M || t == C.T_POTION_C || t == C.T_POTION_D || t == C.T_POTION_SP;
	},
	isRedDoor(t: number): boolean {
		return t == C.T_DOOR_R || t == C.T_DOOR_RO;
	},
	isSerpentTile(t: number): boolean {
		return t >= C.T_SNK_EW && t <= C.T_SNKT_E;
	},
	isStairs(t: number): boolean {
		return t == C.T_STAIRS || t == C.T_STAIRS_UP;
	},
	isTar(t: number): boolean {
		return t == C.T_TAR || t == C.T_MUD || t == C.T_GEL;
	},
	isTrapdoor(t: number): boolean {
		return t == C.T_TRAPDOOR || t == C.T_TRAPDOOR_WATER;
	},
	isTunnel(t: number): boolean {
		return t == C.T_TUNNEL_E || t == C.T_TUNNEL_N || t == C.T_TUNNEL_S || t == C.T_TUNNEL_W;
	},
	isWall(t: number): boolean {
		return t == C.T_WALL || t == C.T_WALL_MASTER || t == C.T_WALL2 || t == C.T_WALL_IMAGE;
	},
	isWater(t: number): boolean {
		return t == C.T_WATER;
	},
	isYellowDoor(t: number): boolean {
		return t == C.T_DOOR_Y || t == C.T_DOOR_YO;
	},

	getSpeakerType(t: number): number {
		switch (t) {
			case (C.M_BEETHRO):
				return C.SPEAK_Beethro;
			case (C.M_BEETHRO_IN_DISGUISE):
				return C.SPEAK_BeethroInDisguise;
			case (C.M_NEGOTIATOR):
				return C.SPEAK_Negotiator;
			case (C.M_NEATHER):
			case (C.M_CITIZEN1):
				return C.SPEAK_Citizen1;
			case (C.M_CITIZEN2):
				return C.SPEAK_Citizen2;
			case (C.M_CITIZEN3):
				return C.SPEAK_Citizen3;
			case (C.M_CITIZEN4):
				return C.SPEAK_Citizen4;
			case (C.M_GOBLINKING):
				return C.SPEAK_GoblinKing;
			case (C.M_INSTRUCTOR):
				return C.SPEAK_Instructor;
			case (C.M_MUDCOORDINATOR):
				return C.SPEAK_MudCoordinator;
			case (C.M_TARTECHNICIAN):
				return C.SPEAK_TarTechnician;
			case (C.M_EYE_ACTIVE):
				return C.SPEAK_EyeActive;

			//Monster types.
			case (C.M_ROACH):
				return C.SPEAK_Roach;
			case (C.M_ROACH_QUEEN):
				return C.SPEAK_QRoach;
			case (C.M_ROACH_EGG):
				return C.SPEAK_RoachEgg;
			case (C.M_GOBLIN):
				return C.SPEAK_Goblin;
			case (C.M_WRAITHWING):
				return C.SPEAK_WWing;
			case (C.M_EYE):
				return C.SPEAK_Eye;
			case (C.M_SERPENT_R):
				return C.SPEAK_Serpent;
			case (C.M_TAR_MOTHER):
				return C.SPEAK_TarMother;
			case (C.M_TAR_BABY):
				return C.SPEAK_TarBaby;
			case (C.M_BRAIN):
				return C.SPEAK_Brain;
			case (C.M_MIMIC):
				return C.SPEAK_Mimic;
			case (C.M_SPIDER):
				return C.SPEAK_Spider;
			case (C.M_SERPENTG):
				return C.SPEAK_SerpentG;
			case (C.M_SERPENTB):
				return C.SPEAK_SerpentB;
			case (C.M_ROCKGOLEM):
				return C.SPEAK_RockGolem;
			case (C.M_WATERSKIPPER):
				return C.SPEAK_WaterSkipper;
			case (C.M_SKIPPERNEST):
				return C.SPEAK_WaterSkipperNest;
			case (C.M_AUMTLICH):
				return C.SPEAK_Aumtlich;
			case (C.M_CLONE):
				return C.SPEAK_Clone;
			case (C.M_DECOY):
				return C.SPEAK_Decoy;
			case (C.M_WUBBA):
				return C.SPEAK_Wubba;
			case (C.M_SEEP):
				return C.SPEAK_Seep;
			case (C.M_STALWART):
				return C.SPEAK_Stalwart;
			case (C.M_HALPH):
				return C.SPEAK_Halph;
			case (C.M_HALPH2):
				return C.SPEAK_Halph2;
			case (C.M_SLAYER):
				return C.SPEAK_Slayer;
			case (C.M_SLAYER2):
				return C.SPEAK_Slayer2;
			case (C.M_FEGUNDO):
				return C.SPEAK_Fegundo;
			case (C.M_FEGUNDOASHES):
				return C.SPEAK_FegundoAshes;
			case (C.M_GUARD):
				return C.SPEAK_Guard;
			case (C.M_MUDMOTHER):
				return C.SPEAK_MudMother;
			case (C.M_MUDBABY):
				return C.SPEAK_MudBaby;
			case (C.M_GELMOTHER):
				return C.SPEAK_GelMother;
			case (C.M_GELBABY):
				return C.SPEAK_GelBaby;
			case (C.M_CITIZEN):
				return C.SPEAK_Citizen;
			case (C.M_ROCKGIANT):
				return C.SPEAK_RockGiant;

			default:
				return C.SPEAK_None;
		}
	},

	offsetToRoomName_internal(x: number, y: number): string {
		if (x === 0 && y === 0) {
			return 'entrance';
		}

		let roomPositionName = '';
		if (y < 0) {
			roomPositionName += `${-y}n`;
		} else if (y > 0) {
			roomPositionName += `${y}s`;
		}
		if (x < 0) {
			roomPositionName += `${-x}w`;
		} else if (x > 0) {
			roomPositionName += `${x}e`;
		}

		return roomPositionName;
	},

	offsetToRoomName_internalUppercase(x: number, y: number): string {
		if (x === 0 && y === 0) {
			return 'Entrance';
		}

		let roomPositionName = '';
		if (y < 0) {
			roomPositionName += `${-y}N`;
		} else if (y > 0) {
			roomPositionName += `${y}S`;
		}
		if (x < 0) {
			roomPositionName += `${-x}W`;
		} else if (x > 0) {
			roomPositionName += `${x}E`;
		}

		return roomPositionName;
	}

};