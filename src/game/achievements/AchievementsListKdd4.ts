import {Achievements} from "./Achievements";
import {Progress} from "../global/Progress";
import {CueEvents} from "../global/CueEvents";
import {BitmapDataWritable, C} from "../../C";
import {TMonster} from "../objects/actives/TMonster";
import {TStateGame} from "../states/TStateGame";
import {ASSERT} from "../../ASSERT";
import {Achievement} from "./Achievement";
import {_, _r} from "../../../src.framework/_";
import {Gfx} from "../global/Gfx";
import {T} from "../../T";
import {UtilsBitmapData} from "../../../src.framework/net/retrocade/utils/UtilsBitmapData";
import {TRoachQueen} from "../objects/actives/TRoachQueen";
import {S} from "../../S";
import {PlatformOptions} from "../../platform/PlatformOptions";

import {AchievementFactory, AchievementHelpers, addAchievement} from './AchievementHelpers';
import { F } from "src/F";
import { Level } from "../global/Level";
import { TWidgetLevelName } from "../widgets/TWidgetLevelName";

const {
	levPos,
	roomPos,
	roomO,
	playerTileO,
	roomConquered,
	ev,
	evConquered,
	player,
	playerAt,
	playerIn,
	room,
	evKilled,
	levelID,
	getLevID,
	isLevelCompleted,
	getMonster,
	isUndo,
	hasTile,
	roomID,
	percDesc,
	monsterIn,
	anyMonsterIn,
	hasMonsterAt,
} = AchievementHelpers;

export function AchievementsListKdd4(to: Achievement[]) {
	ASSERT(to);

	// 13th Level: 2S1W -- Clear the room without turning
	addAchievement(to, {
		id: "787b18e787761da7342e3648ec2cd32d",
		name: 'achievement.name.l1.2s1w',
		description: 'achievement.description.l1.2s1w',

		icon: ['default', -T.TI_OBST_3_1, 0, 0, T.TI_BEETHRO_SWORD_SE],

		in : [1, '2S1W'],

		failOn: data => data.hasTurnedSword
	});

	// 13th Level: 1S -- Clear the room without turning
	addAchievement(to, {
		id: "fda9701e9e4fda561c6233624ddf298d",
		name: 'achievement.name.l1.1s',
		description: 'achievement.description.l1.1s',

		icon: ['default', T.TI_SNKH_AE, T.TI_BEETHRO_SWORD_E, T.TI_SNKT_W, T.TI_SNK_EW],

		in : [1, '1S'],

		failOn: data => data.hasTurnedSword
	});

	// 13th Level: 1S1E -- Clear the room without turning
	addAchievement(to, {
		id: "2cc453353ada7bb0b0be6c5ff6fc5af4",
		name: 'achievement.name.l1.1s1e',
		description: 'achievement.description.l1.1s1e',

		icon: ['default', T.TI_BEETHRO_SWORD_N, T.TI_TAR_NSW, T.TI_BEETHRO_N, T.TI_TAR_NSW],

		in : [1, '1S1E'],

		failOn: data => data.hasTurnedSword
	});

	// 13th Level: 1S2W -- Clear the room without turning
	addAchievement(to, {
		id: "cc4962a2bc8df499c67b4d7f7703ad70",
		name: 'achievement.name.l1.1s2w',
		description: 'achievement.description.l1.1s2w',

		icon: ['default', T.TI_EEYEW_E, T.TI_BEETHRO_NE, T.TI_EEYEW_NE, T.TI_EEYEW_N],

		in : [1, '1S2W'],

		failOn: data => data.hasTurnedSword
	});

	// 14th Level: 1S -- Clear the room facing North-West the entire time
	addAchievement(to, {
		id: "420383bbc1871600bca6610252bb89e2",
		name: 'achievement.name.l2.1s',
		description: 'achievement.description.l2.1s',

		icon: ['default', [[T.TI_GOBLIN_AS, 0.5, 0.5]]],

		in : [2, '1S'],

		failOn: () => player().o !== C.NW
	});

	// 14th Level: 2S -- Clear the room facing East the entire time
	addAchievement(to, {
		id: "d0d8006bdd60e1eb9364c1f79b78ae66",
		name: 'achievement.name.l2.2s',
		description: 'achievement.description.l2.2s',

		icon: ['default', 0, T.TI_GOBLIN_ANE, T.TI_GOBLIN_ASW, 0],

		in : [2, '2S'],

		failOn: () => player().o !== C.E
	});

	// 14th Level: 1N -- Clear the room facing South the entire time
	addAchievement(to, {
		id: "0b6959de716c45027efd8632282c02be",
		name: 'achievement.name.l2.1n',
		description: 'achievement.description.l2.1n',

		icon: ['default', [
			[T.TI_GOBLIN_AN, 0.5, 0],
			[T.TI_GOBLIN_SE, 1, 1],
			[T.TI_GOBLIN_SW, 0, 1],
		]],

		in : [2, '1N'],

		failOn: () => player().o !== C.S
	});

	// 14th Level: 2E -- Clear the room without stepping on the trapdoor
	addAchievement(to, {
		id: "6a7292cd4e4ab846f09d51124de85efe",
		name: 'achievement.name.l2.2e',
		description: 'achievement.description.l2.2e',

		icon: ['default', [
			[-T.TI_TRAPDOOR, 0.5, 0.5],
			[T.TI_GOBLIN_S, 0.5, 0.5],
		]],

		in : [2, '2E'],

		failOn: () => playerAt(20, 15)
	});

	// 14th Level: 2N -- Clear the room without letting the tar mother grow
	addAchievement(to, {
		id: "db90622be10ba20c9d8b85a7d4054819",
		name: 'achievement.name.l2.2n',
		description: 'achievement.description.l2.2n',

		icon: ['default', [
			[T.TI_TAR_NSEW, 0, 0],
			[T.TI_TAR_NSEW, 1, 0],
			[T.TI_TAR_NSEW, 0, 1],
			[T.TI_TAR_NSEW, 1, 1],
			[T.TI_TMOTHER_WC, 0, 0.5],
			[T.TI_TMOTHER_EO, 1, 0.5],
		]],

		in : [2, '2N'],

		failOn: () => ev(C.CID_TAR_GREW)
	});

	// 14th Level: 1N3E -- Clear the room without turning
	addAchievement(to, {
		id: "cfff54cdd47dd7719981d5bf6b32d0a5",
		name: 'achievement.name.l2.1n3e',
		description: 'achievement.description.l2.1n3e',

		icon: ['default', T.TI_GOBLIN_ASE, T.TI_GOBLIN_SW, T.TI_GOBLIN_NE, T.TI_GOBLIN_ANW],

		in : [2, '1N3E'],

		failOn: data => data.hasTurnedSword
	});

	// 14th Level: 2N2E -- Clear the room without letting the goblin stand on the gray road tiles
	addAchievement(to, {
		id: "0c95358d6ba66ccd5514b84458defe7c",
		name: 'achievement.name.l2.2n2e',
		description: 'achievement.description.l2.2n2e',

		icon: ['default', T.TI_DOOR_Y_S, T.TI_GOBLIN_NE, T.TI_DOOR_Y_N, T.TI_BEETHRO_SWORD_N],

		in : [2, '2N2E'],

		failOn: () => anyMonsterIn(1, 13, 7, 13, C.M_GOBLIN)
			|| anyMonsterIn(3, 17, 3, 21, C.M_GOBLIN)
			|| anyMonsterIn(25, 21, 25, 21, C.M_GOBLIN)
	});

	// 14th Level: 1N1E -- Clear the room by killing a goblin as the final monster
	addAchievement(to, {
		id: "bbf65ba1c7dcd8170bd99736255e2181",
		name: 'achievement.name.l2.1n1e',
		description: 'achievement.description.l2.1n1e',

		icon: ['default', T.TI_GOBLIN_ANW, T.TI_GOBLIN_N, T.TI_GOBLIN_E, T.TI_BEETHRO_SE],

		in : [2, '1N1E'],

		winOn: () => evConquered() && evKilled(C.M_GOBLIN)
	});

	// 15th Level: Entrance -- Clear the room without turning
	addAchievement(to, {
		id: "ddd4ea15a634dc6091d1483e3dfacbed",
		name: 'achievement.name.l3.entrance',
		description: 'achievement.description.l3.entrance',

		icon: ['default', [
			[T.TI_BEETHRO_W, 0, 0.5],
			[T.TI_ROACH_ASW, 1, 0],
			[T.TI_ROACH_NW, 1, 1],
		]],

		in : [3, 'Entrance'],

		failOn: data => data.hasTurnedSword
	});

	// 15th Level: Entrance -- Drop all trapdoors before clearing the room
	addAchievement(to, {
		id: "a6d46c1a950ef9e29b6487f6aad0c192",
		name: 'achievement.name.l3.entrance_2',
		description: 'achievement.description.l3.entrance_2',

		icon: ['default', [
			[-T.TI_TRAPDOOR, 1, 0],
			[-T.TI_TRAPDOOR, 1, 1],
			[T.TI_BEETHRO_SE, 0, 0],
			[T.TI_ROACH_N, 0, 1],
			[T.TI_BEETHRO_SWORD_SE, 1, 1],
		]],

		in : [3, 'Entrance'],

		failOn: () => evConquered() && room().trapdoorsLeft > 0
	});

	// 15th Level: 1N -- After hitting the orb clear the room without orthogonal moves - you can turn, wait and move diagonally
	addAchievement(to, {
		id: "3083b4d5bba9db2115670bf077732485",
		name: 'achievement.name.l3.1n',
		description: 'achievement.description.l3.1n',

		icon: ['default', [
			[-T.TI_TRAPDOOR, 0, 0],
			[-T.TI_TRAPDOOR, 1, 0],
			[-T.TI_TRAPDOOR, 0, 1],
			[-T.TI_TRAPDOOR, 1, 1],
			[T.TI_SPIDER_S, 0, 0],
			[T.TI_SPIDER_NE, 1, 0],
			[T.TI_SPIDER_W, 1, 1],
			[T.TI_BEETHRO_NE, 0, 1],
			[T.TI_BEETHRO_SWORD_NE, 1, 0],
		]],

		in : [3, '1N'],

		trackOrthogonalMovesFrom: () => ev(C.CID_ORB_ACTIVATED_BY_PLAYER),
		failOn: data => data.hasMovedOrthogonally && room().monsterCount > 0,
		winOn: () => playerAt(5, 14)
	});

	// 16th Level: 1S1E -- Clear the room without letting tar mother grow
	addAchievement(to, {
		id: "df9f9743e8f6e8dd303649067d6cae0f",
		name: 'achievement.name.l4.1s1e',
		description: 'achievement.description.l4.1s1e',

		icon: ['default', [
			[T.TI_TAR_NSEW, 0, 0],
			[T.TI_TAR_NSEW, 1, 0],
			[T.TI_TAR_NSEW, 0, 1],
			[T.TI_TAR_NSEW, 1, 1],
			[T.TI_TMOTHER_WO, 0, 0.5],
			[T.TI_TMOTHER_EC, 1, 0.5],
		]],

		in : [4, '1S1E'],

		failOn: () => ev(C.CID_TAR_GREW),
	});

	// 16th Level: 2S -- Clear the room with only 5 orb hits (5,1,3,6,2)
	addAchievement(to, {
		id: "1bda770d02302f70c8e3892d3fc4f370",
		name: 'achievement.name.l4.2s',
		description: 'achievement.description.l4.2s',

		icon: ['default', T.TI_SNKH_W, T.TI_SNK_SW, T.TI_ORB, T.TI_SNKT_S],

		in : [4, '2S'],

		init: data => {
			data.$count = 0;
			return true;
		},
		update: data => {
			if (ev(C.CID_ORB_ACTIVATED_BY_PLAYER)) {
				data.$count = (data.$count ?? 0) + 1;
			}
			return true;
		},
		failOn: data => (data.$count ?? 0) > 5
	});

	// Mastery Level: 2N -- Clear the room without eyes waking or roach eggs spawning
	addAchievement(to, {
		id: "f7c58c408525e42a531e56ae9af91ea7",
		name: 'achievement.name.l5.2n',
		description: 'achievement.description.l5.2n',

		icon: ['default', 0, T.TI_RQUEEN_NE, T.TI_EEYE_SW, 0],

		in : [5, '2N'],

		failOn: () => ev(C.CID_EVIL_EYE_WOKE) || !!getMonster(C.M_ROACH_EGG),
	});

	// Mastery Level: 1N1E -- Kill the wraithwing without dropping all trapdoors
	addAchievement(to, {
		id: "36e1f5b7b5303e7d0ccff4f1ca891764",
		name: 'achievement.name.l5.1n1e',
		description: 'achievement.description.l5.1n1e',

		icon: ['default', [
			[-T.TI_TRAPDOOR, 0, 0],
			[-T.TI_TRAPDOOR, 1, 0],
			[-T.TI_TRAPDOOR, 0, 1],
			[-T.TI_TRAPDOOR, 1, 1],
			[T.TI_WWING_SE, 0.5, 0.5],
		]],

		in : [5, '1N1E'],

		failOn: () => ev(C.CID_ALL_TRAPDOORS_REMOVED)
	});

	// Original 13th Level -- Visit each room at least once (%count% / 56)
	addAchievement(to, {
		id: "4272760e5912bc710150ace5c9c5860b",
		name: 'achievement.name.l5.1n1e',
		description: ach => _r('achievement.description.l6.explore', {
				count: ach._data.$roomCoords?.length ?? 0
		}),

		icon: ['default', [
			[-T.TI_WALL_NEW, -0.5, -0.5],
			[-T.TI_WALL_NEW, 0.5, -0.5],
			[-T.TI_WALL_NEW, 1.5, -0.5],
			[-T.TI_WALL_SEW, -0.5, 1.5],
			[-T.TI_WALL_SEW, 0.5, 1.5],
			[-T.TI_WALL_SEW, 1.5, 1.5],
			[T.TI_BEETHRO_E, 0, 0.5],
			[T.TI_BEETHRO_SWORD_E, 1, 0.5],
		]],

		in : 6,

		initOnConquered: true,

		init: data => {
			data.$roomCoords = data.$roomCoords ?? [];

			const offset = Level.getRoomOffsetInLevel(roomID());
			const coord = TWidgetLevelName.shortNameFromPosition(offset.x, offset.y);

			if (!data.$roomCoords.includes(coord)) {
				data.$roomCoords.push(coord);
			}

			return true;
		},
		winNeedsConquer: false,
		winOn: data => (data.$roomCoords?.length ?? 0) >= 56
	});

	AchievementFactory.levelCleared(to, 1, "1/4");
	AchievementFactory.levelCleared(to, 2, "2/4");
	AchievementFactory.levelCleared(to, 3, "3/4");
	AchievementFactory.levelCleared(to, 4, "4/4");
	AchievementFactory.levelCleared(to, 6, "SadBeethro");

	AchievementFactory.masterHold(to);
	AchievementFactory.postMasterHold(to, 5, "1S", 18, 8);

	AchievementFactory.tuningFork_inSequence(to, 6);

	AchievementFactory.monsterKills(to, C.M_ROACH, T.TI_ROACH_NW, 321);
	AchievementFactory.monsterKills(to, C.M_QROACH, T.TI_RQUEEN_ANW, 53);
	AchievementFactory.monsterKills(to, C.M_ROACH_EGG, T.TI_REGG_W, 3);
	AchievementFactory.monsterKills(to, C.M_EYE, T.TI_EEYE_NW, 256);
	AchievementFactory.monsterKills(to, C.M_SERPENT, 0, 31);
	AchievementFactory.monsterKills(to, C.M_SPIDER, T.TI_SPIDER_NW, 29);
	AchievementFactory.monsterKills(to, C.M_WWING, T.TI_WWING_ANW, 73);
	AchievementFactory.monsterKills(to, C.M_TARBABY, T.TI_TARBABY_ANW, 321);
	AchievementFactory.monsterKills(to, C.M_TARMOTHER, 0, 41);
	AchievementFactory.monsterKills(to, C.M_GOBLIN, T.TI_GOBLIN_NW, 93);

	AchievementFactory.rooms(to, 31);
	AchievementFactory.allKills(to, 1221);
	AchievementFactory.trapdoors(to, 'Foundation', 113);
	AchievementFactory.cutTar(to, 473);
	AchievementFactory.steps(to, 3221);
	AchievementFactory.undo(to, 321);
	AchievementFactory.deaths(to, 171);
}