import * as PIXI from 'pixi.js';
import { RecamelLang } from 'src.framework/net/retrocade/camel/RecamelLang';
import { UtilsBitmapData } from 'src.framework/net/retrocade/utils/UtilsBitmapData';
import { ASSERT } from 'src/ASSERT';
import { F } from 'src/F';
import { S } from 'src/S';
import { T } from 'src/T';
import { attr } from 'src/XML';
import { PlatformOptions } from 'src/platform/PlatformOptions';
import { _, _r } from "../../../src.framework/_";
import { BitmapDataWritable, C, StyleName, StyleTilesets } from "../../C";
import { CueEvents } from "../global/CueEvents";
import { Game } from "../global/Game";
import { Gfx } from '../global/Gfx';
import { Level } from "../global/Level";
import { Progress } from "../global/Progress";
import { Room } from "../global/Room";
import { VOCoord } from '../managers/VOCoord';
import { VOOrb } from '../managers/VOOrb';
import { TMonster } from "../objects/actives/TMonster";
import { TPlayer } from "../objects/actives/TPlayer";
import { TStateGame } from "../states/TStateGame";
import { Achievement, AchievementData, AchievementDescription } from './Achievement';
import { AchievementIconSource } from './AchievementRenderer';

export type RoomCoord =
	"6N2W" |
	"5N5W" | "4N5W" | "3N5W" | "2N5W" | "1N5W" | "5W" | "1S5W" | "2S5W" | "3S5W" | "4S5W" | "5S5W" |
	"5N4W" | "4N4W" | "3N4W" | "2N4W" | "1N4W" | "4W" | "1S4W" | "2S4W" | "3S4W" | "4S4W" | "5S4W" |
	"5N3W" | "4N3W" | "3N3W" | "2N3W" | "1N3W" | "3W" | "1S3W" | "2S3W" | "3S3W" | "4S3W" | "5S3W" |
	"5N2W" | "4N2W" | "3N2W" | "2N2W" | "1N2W" | "2W" | "1S2W" | "2S2W" | "3S2W" | "4S2W" | "5S2W" |
	"5N1W" | "4N1W" | "3N1W" | "2N1W" | "1N1W" | "1W" | "1S1W" | "2S1W" | "3S1W" | "4S1W" | "5S1W" |
	"5N" | "4N" | "3N" | "2N" | "1N" | "Entrance" | "1S" | "2S" | "3S" | "4S" | "5S" |
	"5N1E" | "4N1E" | "3N1E" | "2N1E" | "1N1E" | "1E" | "1S1E" | "2S1E" | "3S1E" | "4S1E" | "5S1E" |
	"5N2E" | "4N2E" | "3N2E" | "2N2E" | "1N2E" | "2E" | "1S2E" | "2S2E" | "3S2E" | "4S2E" | "5S2E" |
	"5N3E" | "4N3E" | "3N3E" | "2N3E" | "1N3E" | "3E" | "1S3E" | "2S3E" | "3S3E" | "4S3E" | "5S3E" |
	"5N4E" | "4N4E" | "3N4E" | "2N4E" | "1N4E" | "4E" | "1S4E" | "2S4E" | "3S4E" | "4S4E" | "5S4E" |
	"5N5E" | "4N5E" | "3N5E" | "2N5E" | "1N5E" | "5E" | "1S5E" | "2S5E" | "3S5E" | "4S5E" | "5S5E";

export const AchievementHelpers = {

	roomConquered(): boolean {
		return Progress.isRoomConquered(AchievementHelpers.roomPid());
	},

	roomPos(x: number, y: number): boolean {
		const position: PIXI.IPointData = AchievementHelpers.roomOffset();

		return position.x == x && position.y == y;
	},

	roomPosName(pos: RoomCoord): boolean {
		if (pos === 'Entrance') {
			return AchievementHelpers.roomPos(0, 0);
		}

		const match = pos.match(/^(?:(\d+)(N|S))?(?:(\d+)(E|W))?$/);

		if (!match) {
			return false;
		}

		let x = 0;
		let y = 0;
		if (match[1]) {
			y = parseInt(match[1]) * (match[2] === 'S' ? 1 : -1)
		}
		if (match[3]) {
			x = parseInt(match[3]) * (match[4] === 'E' ? 1 : -1)
		}
		return AchievementHelpers.roomPos(x, y);
	},

	roomOffset(): PIXI.IPointData {
		return Level.getRoomOffsetInLevel(AchievementHelpers.roomPid());
	},

	turn(): number {
		return Game.turnNo;
	},

	roomPid(): string {
		return AchievementHelpers.room().roomPid;
	},

	levelID(): number {
		return AchievementHelpers.room().levelId;
	},

	getLevID(order: number): number {
		return Level.getLevelIdByOrderIndex(order);
	},

	levPos(order: number): boolean {
		const orderLevelId = AchievementHelpers.getLevID(order);
		const currentLevelId = AchievementHelpers.levelID();

		return orderLevelId == currentLevelId;
	},

	evConquered(): boolean {
		return CueEvents.hasOccurred(C.CID_ROOM_CONQUER_PENDING) || Game.room.monsterCount == 0;
	},

	evTarGrowth(): boolean {
		return CueEvents.hasOccurred(C.CID_TAR_GREW);
	},

	evKilled(type: number): boolean {
		for (
			let i: TMonster = CueEvents.getFirstPrivateData(C.CID_MONSTER_DIED_FROM_STAB);
			i;
			i = CueEvents.getNextPrivateData()
		) {
			if (i.getType() == type) {
				return true;
			}
		}

		return false;
	},

	evKilledCount(type: number): number {
		if (type === C.M_SERPENT_R) {
			return CueEvents.countOccurred(C.CID_SNAKE_DIED_FROM_TRUNCATION);

		} else if (type === C.M_EYE || type === C.M_EYE_ACTIVE) {
			return CueEvents.countOccurred(C.CID_MONSTER_DIED_FROM_STAB, data => {
				if (data instanceof TMonster) {
					return data.getType() === C.M_EYE || data.getType() === C.M_EYE_ACTIVE;
				}

				return false;
			});

		} else {
			return CueEvents.countOccurred(C.CID_MONSTER_DIED_FROM_STAB, data => {
				if (data instanceof TMonster) {
					return data.getType() === type;
				}

				return false;
			});
		}
	},

	evOrbHit(x: number, y: number): boolean {
		const callback = (coord: any) => {
			return coord && coord.x === x && coord.y === y;
		}

		return CueEvents.anyData(C.CID_ORB_ACTIVATED_BY_DOUBLE, callback) || CueEvents.anyData(C.CID_ORB_ACTIVATED_BY_PLAYER, callback)
	},

	hasMonster(...types: number[]): boolean {
		for (const type of types) {
			if (AchievementHelpers.getMonster(type)) {
				return true;
			}
		}

		return false;
	},

	getMonster(type: number): TMonster | null {
		return AchievementHelpers.room().getMonsterOfType(type);
	},

	getNeather(): TMonster | undefined {
		return AchievementHelpers.room().monsters.getAll().find(monster => monster?.isNeather) ?? undefined;
	},

	hasMonsterAt(x: number, y: number, type?: number): boolean {
		const monster = AchievementHelpers.room().tilesActive[x + y * S.RoomWidth];

		return !!monster && (type === undefined || monster.getType() === type);
	},

	room(): Room {
		return Game.room;
	},

	roomO(x: number, y: number): number {
		if (!F.isValidColRow(x, y)) {
			throw new Error(`Invalid coordinates (${x}, ${y})`);
		}

		return AchievementHelpers.room().tilesOpaque[x + y * S.RoomWidth];
	},

	roomF(x: number, y: number): number {
		if (!F.isValidColRow(x, y)) {
			throw new Error(`Invalid coordinates (${x}, ${y})`);
		}

		return AchievementHelpers.room().tilesFloor[x + y * S.RoomWidth];
	},

	roomT(x: number, y: number): number {
		if (!F.isValidColRow(x, y)) {
			throw new Error(`Invalid coordinates (${x}, ${y})`);
		}

		return AchievementHelpers.room().tilesTransparent[x + y * S.RoomWidth];
	},

	playerTileO(): number {
		const { roomO, player } = AchievementHelpers;

		return roomO(player().x, player().y);
	},

	hasTile(type: number): boolean {
		return AchievementHelpers.room().hasTile(type);
	},

	isLevelCompleted(levID: number = NaN): boolean {
		return isNaN(levID) ? Progress.isLevelCompleted(AchievementHelpers.levelID()) : Progress.isLevelCompleted(levID);
	},

	getPos(): PIXI.IPointData {
		return Level.getRoomOffsetInLevel(AchievementHelpers.roomPid());
	},

	ev(...type: number[]): boolean {
		return CueEvents.hasAnyOccurred(type);
	},

	player(): TPlayer {
		return Game.player;
	},

	playerAtEdge(): boolean {
		return Game.player.x === 0
			|| Game.player.y === 0
			|| Game.player.x === S.RoomWidth - 1
			|| Game.player.y === S.RoomHeight - 1;
	},

	isUndo(): boolean {
		return TStateGame.isDoingUndo;
	},

	countMonsters() {
		return AchievementHelpers.room().monsterCount;
	},

	countMonster(...monsterType: number[]) {
		let count = 0;
		for (const monster of AchievementHelpers.room().monsters.getAll()) {
			if (monster && monsterType.includes(monster.getType())) {
				count++
			}
		}

		return count;
	},

	countTar() {
		return AchievementHelpers.room().tarLeft;
	},

	countTrapdoors() {
		return AchievementHelpers.room().trapdoorsLeft;
	},

	percDesc(base: number | undefined | boolean, max: number) {
		base = typeof base === 'number' ? base : 0;

		return _('achievement.description.hidden_with_percent', (100 * base / max).toFixed(3));
	},

	anyMonsterIn(left: number, top: number, right: number, bottom: number, type?: number): boolean {
		ASSERT(F.isValidColRow(left, top));
		ASSERT(F.isValidColRow(right, bottom));

		for (let x = left; x <= right; x++) {
			for (let y = top; y <= bottom; y++) {
				const monster = AchievementHelpers.room().tilesActive[x + y * S.RoomWidth];
				if (monster && (type === undefined || monster.getType() === type)) {
					return true;
				}
			}
		}
		return false;
	},

	monsterIn(monster: TMonster, left: number, top: number, right: number, bottom: number): boolean {
		return (monster.x >= left && monster.y >= top && monster.x <= right && monster.y <= bottom);
	},

	playerIn(left: number, top: number, right: number, bottom: number): boolean {
		return AchievementHelpers.player().x >= left
			&& AchievementHelpers.player().y >= top
			&& AchievementHelpers.player().x <= right
			&& AchievementHelpers.player().y <= bottom;
	},

	playerAt(x: number, y: number): boolean {
		return AchievementHelpers.player().x === x
			&& AchievementHelpers.player().y === y;
	},
};


type DataCallback = (data: AchievementData) => boolean;
type DataCounterCallback = (data: AchievementData) => boolean | number;

type AddAchievementInCondition = number | RoomCoord | [number, RoomCoord] | DataCallback;
interface AddAchievementDetails {
	id: string;
	name: string;
	description: AchievementDescription;
	icon: AchievementIconSource;

	in?: AddAchievementInCondition;
	fakeActiveIn?: AddAchievementInCondition;
	fakeInactiveIn?: AddAchievementInCondition;
	initOnConquered?: true;
	init?: DataCallback;

	trackSwordTurnFrom?: DataCallback;
	trackOrthogonalMovesFrom?: DataCallback;
	updateOncePerTurn?: true;
	update?: DataCallback;
	failOn?: DataCallback;
	winOn?: DataCallback;
	winNeedsConquer?: false;
	countDuringUndo?: true;
	count?: [number, DataCounterCallback];

	descriptionKeys?: Record<string, string | number>;
}

export function addAchievement(to: Achievement[], details: AddAchievementDetails) {
	const inIsActive = ($in: AddAchievementInCondition | undefined, data: AchievementData) => {
		if (typeof $in !== 'undefined') {
			if (Array.isArray($in)) {
				if (!AchievementHelpers.levPos($in[0]) || !AchievementHelpers.roomPosName($in[1])) {
					return false;
				}
			} else if (typeof $in === 'number' && !AchievementHelpers.levPos($in)) {
				return false;

			} else if (typeof $in === 'string' && !AchievementHelpers.roomPosName($in)) {
				return false;

			} else if (typeof $in === 'function' && !$in(data)) {
				return false;
			}
		}

		return true;
	};

	const init = (data: AchievementData): boolean => {
		if (details.fakeActiveIn !== undefined) {
			if (inIsActive(details.fakeActiveIn, data)) {
				data.fakeActive = true;
			} else {
				data.fakeInactive = true;
			}
		}

		if (details.trackSwordTurnFrom) {
			data.checkSwordTurn = false;
		}
		if (details.trackOrthogonalMovesFrom) {
			data.checkMovedOrthogonally = false;
		}

		if (!inIsActive(details.in, data)) {
			return false;

		} else if (details.fakeInactiveIn !== undefined && inIsActive(details.fakeInactiveIn, data)) {
			data.fakeInactive = true;
		}

		if (!details.initOnConquered && AchievementHelpers.roomConquered()) {
			return false;
		}

		if (details.init && !details.init(data)) {
			return false;
		}

		return true;
	}

	const update = (data: AchievementData): boolean => {
		if (details.updateOncePerTurn && data.lastTurn === Game.turnNo) {
			return false;
		}

		if (!data.checkSwordTurn && details.trackSwordTurnFrom?.(data)) {
			data.checkSwordTurn = true;
		}
		if (!data.checkMovedOrthogonally && details.trackOrthogonalMovesFrom?.(data)) {
			data.checkMovedOrthogonally = true;
		}

		if (details.failOn && details.failOn(data)) {
			data.failed = true;
			return false;
		}

		if (details.update && !details.update(data)) {
			return false;
		}

		// Second check because update might have failed it
		if (details.failOn && details.failOn(data)) {
			data.failed = true;
			return false;
		}

		if (details.count) {
			data.$count = data.$count ?? 0;

			if (details.countDuringUndo || !TStateGame.isDoingUndo) {
				const increase = details.count[1](data);
				if (increase === true) {
					data.$count++;
				} else if (typeof increase === 'number') {
					data.$count += increase;
				}
			}

			return data.$count >= details.count[0];
		}

		const conquerFulfilled = AchievementHelpers.evConquered() || details.winNeedsConquer === false;

		if (conquerFulfilled) {
			return !details.winOn || details.winOn(data);
		}

		return false;
	}

	if (!RecamelLang.has(RecamelLang.selected, details.name)) {
		console.error(`Missing translation for achievement name "${details.name}"`);

	} else if (typeof details.description === 'string' && !RecamelLang.has(RecamelLang.selected, details.description)) {
		console.error(`Missing translation for achievement description "${details.description}"`);
	}

	to.push(Achievement.get(
		_(details.name),
		(ach: Achievement) => {
			if (details.count && !ach.acquired) {
				let desc = AchievementHelpers.percDesc(ach._data.$count ?? 0, details.count[0]);

				if (PlatformOptions.isDebug) {
					desc += ` (DEBUG: ${ach._data.$count ?? 0} / ${details.count[0]})`;
				}

				return desc;

			} else {
				return typeof details.description === 'function'
					? details.description(ach)
					: _r(details.description, {
						count: ach._data.$count ?? 0,
						total_count: details.count?.[0] ?? 0,
						...details.descriptionKeys
					});
			}
		},
		details.id,
		details.icon,
		a => init(a._data),
		a => update(a._data)
	));
}

const LEVEL_CLEARED_ICONS = {
	'Scroll': ['default', [[T.TI_SCROLL, 0.5, 0.5]]],
	'Scrolls': ['default', [
		[T.TI_SCROLL, 0.1, -0.1],
		[T.TI_SCROLL, 1.1, -0.1],
		[T.TI_SCROLL, -0.1, 0.9],
		[T.TI_SCROLL, 0.9, 1.1],
		[T.TI_SCROLL, 0.4, 0.35],
		[T.TI_SCROLL, 0.15, 0.5],
		[T.TI_SCROLL, 0.85, 0.4],
		[T.TI_SCROLL, 0.5, 0.65],
		[T.TI_SCROLL, 0.5, 0.5],
	]],
	'Checkpoint': ['default', [[T.TI_CHECKPOINT, 0.5, 0.5]]],
	'SadBeethro': ['default', [
		[T.TI_BEETHRO_S, 0.5, 0],
		[T.TI_BEETHRO_SWORD_S, 0.5, 1],
	]],

	'1/4': ['default', T.TI_DOOR_CO, T.TI_DOOR_C, T.TI_DOOR_C, T.TI_DOOR_C],
	'2/4': ['default', T.TI_DOOR_CO, T.TI_DOOR_C, T.TI_DOOR_CO, T.TI_DOOR_C],
	'3/4': ['default', T.TI_DOOR_CO, T.TI_DOOR_C, T.TI_DOOR_CO, T.TI_DOOR_CO],
	'4/4': ['default', T.TI_DOOR_CO, T.TI_DOOR_CO, T.TI_DOOR_CO, T.TI_DOOR_CO],

	'1/5': ['default', T.TI_DOOR_C, T.TI_DOOR_C, T.TI_DOOR_C, T.TI_DOOR_C],
	'2/5': ['default', T.TI_DOOR_CO, T.TI_DOOR_C, T.TI_DOOR_C, T.TI_DOOR_C],
	'3/5': ['default', T.TI_DOOR_CO, T.TI_DOOR_C, T.TI_DOOR_CO, T.TI_DOOR_C],
	'4/5': ['default', T.TI_DOOR_CO, T.TI_DOOR_C, T.TI_DOOR_CO, T.TI_DOOR_CO],
	'5/5': ['default', T.TI_DOOR_CO, T.TI_DOOR_CO, T.TI_DOOR_CO, T.TI_DOOR_CO],

	'1/6': ['default', T.TI_DOOR_C, T.TI_DOOR_C, T.TI_DOOR_C, T.TI_DOOR_C],
	'2/6': ['default', T.TI_DOOR_CO, T.TI_DOOR_C, T.TI_DOOR_C, T.TI_DOOR_C],
	'3/6': ['default', T.TI_DOOR_CO, T.TI_DOOR_C, T.TI_DOOR_CO, T.TI_DOOR_C],
	'4/6': ['default', T.TI_DOOR_CO, T.TI_DOOR_C, T.TI_DOOR_CO, T.TI_DOOR_CO],
	'5/6': ['default', T.TI_DOOR_CO, T.TI_DOOR_CO, T.TI_DOOR_CO, T.TI_DOOR_CO],
	'6/6': ['default', T.TI_DOOR_CO_SE, T.TI_DOOR_CO_SW, T.TI_DOOR_CO_NE, T.TI_DOOR_CO_NW],
} satisfies Record<string, AddAchievementDetails['icon']>;

export const AchievementFactory = {
	levelCleared(toArray: Achievement[], levelIndex: number, iconIndex: keyof typeof LEVEL_CLEARED_ICONS) {
		addAchievement(toArray, {
			id: `clear-level-${levelIndex}`,
			name: `achievement.name.level_${levelIndex}`,
			description: `achievement.description.level_${levelIndex}`,

			fakeActiveIn: levelIndex,
			icon: LEVEL_CLEARED_ICONS[iconIndex],

			initOnConquered: true,

			winNeedsConquer: false,
			winOn: () => AchievementHelpers.isLevelCompleted(AchievementHelpers.getLevID(levelIndex)),
		});
	},
	masterHold(toArray: Achievement[]) {
		addAchievement(toArray, {
			id: `mastery`,
			name: `achievement.name.mastery`,
			description: `achievement.description.mastery`,

			fakeActiveIn: () => {
				const room = AchievementHelpers.room();

				const isRequired = attr(Level.getRoom(room.roomPid), 'IsRequired') === '1';
				const isSecret = attr(Level.getRoom(room.roomPid), 'IsSecret') === '1';

				return (
					isRequired
					&& !Progress.wasRoomEverConquered(room.roomPid)
				) || (
						isSecret
						&& !Progress.wasRoomEverConquered(room.roomPid)
					);
			},
			icon: ['default', [[T.TI_MASTER_WALL, 0.5, 0.5]]],

			initOnConquered: true,
			winOn: () => Progress.isGameMastered,
		});
	},
	postMasterHold(toArray: Achievement[], level: number, room: RoomCoord, playerX: number, playerY: number) {
		addAchievement(toArray, {
			id: `post-mastery`,
			name: `achievement.name.post_mastery`,
			description: `achievement.description.post_mastery`,

			icon: ['default', T.TI_MASTER_WALL, T.TI_MASTER_WALL, T.TI_MASTER_WALL, T.TI_MASTER_WALL],

			in: [level, room],
			fakeActiveIn: level,
			initOnConquered: true,

			winOn: () => AchievementHelpers.playerIn(playerX, playerY, playerX, playerX),
		});
	},
	undo(toArray: Achievement[], count: number) {
		addAchievement(toArray, {
			id: `total-undo`,
			name: `achievement.name.undo`,
			description: `achievement.description.undo`,

			icon: ['default', [
				[T.TI_BEETHRO_NE, 1, 0],
				[T.TI_BEETHRO_NE, 0, 1],
				[T.TI_ROACH_ANW, 30 / 22, 8 / 22],
			]],

			initOnConquered: true,
			countDuringUndo: true,
			count: [count, () => TStateGame.lastCommand === C.CMD_UNDO],
		});
	},
	deaths(toArray: Achievement[], count: number) {
		addAchievement(toArray, {
			id: `total-deaths`,
			name: `achievement.name.deaths`,
			description: `achievement.description.deaths`,

			icon: ['default', [
				[T.TI_BEETHRO_NE, 0.5, 0.5],
				[T.TI_BEETHRO_SWORD_NW, 1, 0],
				[T.TI_BEETHRO_SWORD_NW, 1, 0],
				[T.TI_ROACH_ASE, 0, 0],
				[T.TI_ROACH_ANE, 0, 1],
				[T.TI_ROACH_ANW, 1, 1],
			]],

			initOnConquered: true,
			count: [count, () => AchievementHelpers.ev(...C.CIDA_PLAYER_DIED)],
		});
	},
	rooms(toArray: Achievement[], count: number) {
		addAchievement(toArray, {
			id: `total-rooms`,
			name: `achievement.name.rooms`,
			description: `achievement.description.rooms`,

			icon: ['default', T.TI_DOOR_G_SE, T.TI_DOOR_G_SW, T.TI_DOOR_G_NE, T.TI_DOOR_G_NW],

			initOnConquered: true,
			count: [count, () => AchievementHelpers.ev(C.CID_ROOM_CONQUER_PENDING)],
		});
	},
	steps(toArray: Achievement[], count: number) {
		addAchievement(toArray, {
			id: `total-steps`,
			name: `achievement.name.steps`,
			description: `achievement.description.steps`,

			icon: ['default', [
				[T.TI_BEETHRO_N, 0.5, 1.5],
				[T.TI_BEETHRO_N, 0.5, -0.5],
				[T.TI_BEETHRO_SWORD_N, 0.5, 0.5],
			]],

			initOnConquered: true,
			count: [count, () => AchievementHelpers.ev(C.CID_STEP)],
		});
	},
	trapdoors(toArray: Achievement[], style: StyleName, count: number) {
		addAchievement(toArray, {
			id: `total-trapdoors`,
			name: `achievement.name.trapdoors`,
			description: `achievement.description.trapdoors`,

			icon: [style, [
				[-T.TI_TRAPDOOR, -0.5, -0.5],
				[-T.TI_TRAPDOOR, -0.5, 0.5],
				[-T.TI_TRAPDOOR, -0.5, 1.5],
				[-T.TI_TRAPDOOR, 0.5, -0.5],
				[-T.TI_TRAPDOOR, 0.5, 0.5],
				[-T.TI_TRAPDOOR, 0.5, 1.5],
				[-T.TI_TRAPDOOR, 1.5, -0.5],
				[-T.TI_TRAPDOOR, 1.5, 0.5],
				[-T.TI_TRAPDOOR, 1.5, 1.5],
			]],

			initOnConquered: true,
			init: () => AchievementHelpers.hasTile(C.T_TRAPDOOR),
			count: [count, () => AchievementHelpers.ev(C.CID_TRAPDOOR_REMOVED)],
		});
	},
	cutTar(toArray: Achievement[], count: number) {
		addAchievement(toArray, {
			id: `total-cut_tar`,
			name: `achievement.name.cut_tar`,
			description: `achievement.description.cut_tar`,

			icon: ['default', [
				[T.TI_TAR_ISE, 0, 0],
				[T.TI_TAR_NEW, 1, 0],
				[T.TI_TAR_NSW, 0, 1],
				[T.TI_BEETHRO_NW, 1, 1],
				[T.TI_BEETHRO_SWORD_NW, 0, 0],
			]],

			initOnConquered: true,
			init: () => AchievementHelpers.hasTile(C.T_TAR) || !!AchievementHelpers.getMonster(C.M_TAR_MOTHER),
			count: [count, () => AchievementHelpers.ev(C.CID_TARSTUFF_DESTROYED)],
		});
	},
	allKills(toArray: Achievement[], count: number) {
		addAchievement(toArray, {
			id: `total-kills`,
			name: `achievement.name.total_kills`,
			description: `achievement.description.total_kills`,

			icon: ['default', [
				[T.TI_ROACH_NW, -0.75, -0.5],
				[T.TI_ROACH_NW, 0.25, -0.5],
				[T.TI_ROACH_NW, 1.25, -0.5],
				[T.TI_ROACH_NW, -0.50, 0.5],
				[T.TI_ROACH_NW, 0.50, 0.5],
				[T.TI_ROACH_NW, 1.50, 0.5],
				[T.TI_ROACH_NW, -0.25, 1.5],
				[T.TI_ROACH_NW, 0.75, 1.5],
				[T.TI_ROACH_NW, 1.75, 1.5],
			]],

			initOnConquered: true,
			count: [count, () => CueEvents.countOccurred(C.CID_MONSTER_DIED_FROM_STAB)
				+ CueEvents.countOccurred(C.CID_SNAKE_DIED_FROM_TRUNCATION)],
		});
	},
	monsterKills(toArray: Achievement[], monsterType: number, monsterTile: number | AddAchievementDetails['icon'], count: number) {
		let icon: AddAchievementDetails['icon'];

		const initMonsterTypes = [monsterType];

		if (monsterType === C.M_EYE) {
			initMonsterTypes.push(C.M_EYE_ACTIVE);
		} else if (monsterType === C.M_EYE_ACTIVE) {
			initMonsterTypes.push(C.M_EYE);
		}

		if (typeof monsterTile === 'number') {
			if (monsterType === C.M_TAR_MOTHER) {
				icon = ['default', [
					[T.TI_TMOTHER_EO, 0, 0.5],
					[T.TI_TMOTHER_WO, 1, 0.5]
				]];

			} else if (monsterType === C.M_SERPENT_R) {
				icon = ['default', [
					[T.TI_SNKH_N, 0.5, 0],
					[T.TI_SNKT_S, 0.5, 1],
				]];

			} else if (monsterType === C.M_MIMIC) {
				icon = ['default', [
					[T.TI_MIMIC_NW, 0.5, 0.5],
					[T.TI_MIMIC_SWORD_NW, -0.5, -0.5],
				]];

			} else {
				icon = ['default', [[monsterTile, 0.5, 0.5]]];
			}
		} else {
			icon = monsterTile;
		}

		addAchievement(toArray, {
			id: `monster-kills-${monsterType}`,
			name: `achievement.name.monster_kills_${monsterType}`,
			description: `achievement.description.monster_kills_${monsterType}`,

			icon,

			initOnConquered: true,
			init: () => AchievementHelpers.hasMonster(...initMonsterTypes)
				|| (monsterType === C.M_TAR_BABY && AchievementHelpers.hasTile(C.T_TAR))
				|| (monsterType === C.M_TAR_BABY && AchievementHelpers.hasMonster(C.M_TAR_MOTHER))
				|| (monsterType === C.M_ROACH_EGG && AchievementHelpers.hasMonster(C.M_ROACH_QUEEN))
				|| (monsterType === C.M_ROACH && AchievementHelpers.hasMonster(C.M_ROACH_QUEEN)),

			count: [count, () => AchievementHelpers.evKilledCount(monsterType)],
		});
	},
	tuningFork_atOnce(toArray: Achievement[], hitsCount: number) {
		addAchievement(toArray, {
			id: `monster-tuning-fork-at-once`,
			name: `achievement.name.tuning_fork_at_once`,
			description: `achievement.description.tuning_fork_at_once`,

			icon: ['default', [[T.TI_ORB, 0.5, 0.5]]],

			initOnConquered: true,

			winNeedsConquer: false,
			winOn: () => CueEvents.countOccurred(C.CID_ORB_ACTIVATED_BY_PLAYER)
				+ CueEvents.countOccurred(C.CID_ORB_ACTIVATED) >= hitsCount
		});
	},
	tuningFork_inSequence(toArray: Achievement[] | false, hitsCount: number): AddAchievementDetails {
		const details: AddAchievementDetails = {
			id: `monster-tuning-fork-in-sequence`,
			name: `achievement.name.tuning_fork_in_sequence`,
			description: `achievement.description.tuning_fork_in_sequence`,
			descriptionKeys: { orbs: hitsCount },

			icon: ['default', T.TI_ORB, T.TI_ORB, T.TI_ORB, T.TI_ORB],

			initOnConquered: true,

			winNeedsConquer: false,
			init: data => {
				data.$count = 0;
				data.$coords = [];

				return true;
			},
			updateOncePerTurn: true,
			winOn: data => {
				data.$coords = data.$coords ?? [];
				data.$count = data.$count ?? 0;

				const orbs: number[] = [];
				let increase = false;

				const orbHits = [
					...CueEvents.getData(C.CID_ORB_ACTIVATED_BY_PLAYER),
					...CueEvents.getData(C.CID_ORB_ACTIVATED_BY_DOUBLE),
				];

				for (const orbHit of orbHits) {
					if (orbHit instanceof VOOrb || orbHit instanceof VOCoord) {
						const i = orbHit.x + orbHit.y * S.RoomWidth;

						if (!orbs.includes(i)) {
							orbs.push(i);

							if (!data.$coords.includes(i)) {
								data.$coords.push(i)
								increase = true;
							}
						}
					}
				}

				if (increase) {
					data.$count++;

				} else {
					data.$count = Math.min(1, orbs.length);
					data.$coords = orbs;
				}


				return data.$count >= hitsCount;
			}
		};

		if (toArray) {
			addAchievement(toArray, details);
		}

		return details;
	}
}