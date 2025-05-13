import {Achievements} from "./Achievements";
import {Progress} from "../global/Progress";
import {CueEvents} from "../global/CueEvents";
import {BitmapDataWritable, C} from "../../C";
import {Game} from "../global/Game";
import {TMonster} from "../objects/actives/TMonster";
import {TStateGame} from "../states/TStateGame";
import {ASSERT} from "../../ASSERT";
import {Achievement} from "./Achievement";
import {_} from "../../../src.framework/_";
import {Gfx} from "../global/Gfx";
import {T} from "../../T";
import {UtilsBitmapData} from "../../../src.framework/net/retrocade/utils/UtilsBitmapData";
import {TRoachQueen} from "../objects/actives/TRoachQueen";
import {S} from "../../S";

import {AchievementFactory, AchievementHelpers, addAchievement} from './AchievementHelpers';

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
	anyMonsterIn,
	hasMonsterAt,
} = AchievementHelpers;

export function AchievementsListKdd3(to: Achievement[]) {
	ASSERT(to);

	// ::::::::::::::::::::::::::::::::::::::::::::::
	// :: Room Specific
	// ::::::::::::::::::::::::::::::::::::::::::::::

	// Ninth Level 4N3E -- Clear the room without stepping on each of the marked areas more than once
	addAchievement(to, {
		id: 'bbf28d894f7431e7a64621a3bf67c2c1',
		name: 'achievement.description.l1.4n3e',
		description: 'achievement.description.l1.4n3e',

		icon: ['Aboveground', [
			[-T.TI_WALL, 0.5, 0.5],
			[T.TI_BEETHRO_SE, -0.5, -0.5],
			[T.TI_BEETHRO_SW, 1.5, -0.5],
			[T.TI_BEETHRO_NW, 1.5, 1.5],
			[T.TI_BEETHRO_NE, -0.5, 1.5],
		]],

		in: [1, "4N3E"],

		init: data => {
			data.$coords = [];
			data.isOn = 0;

			return true;
		},
		update: data => {
			data.$coords = data.$coords ?? [];
			data.isOn = data.isOn ?? 0;

			let isOn = -1;
			if (playerIn(1, 2, 2, 3)) {
				isOn = 1;
			} else if (playerIn(14, 1, 16, 1)) {
				isOn = 2;
			} else if (playerIn(25, 4, 25, 6)) {
				isOn = 3;
			} else if (playerIn(25, 17, 25, 19)) {
				isOn = 4;
			} else if (playerIn(21, 22, 22, 23)) {
				isOn = 5;
			} else if (playerIn(10, 21, 11, 23)) {
				isOn = 6;
			}

			if (isOn === -1) {
				data.isOn = 0;
			} else if (data.isOn !== isOn) {
				if (data.$coords.includes(isOn)) {
					data.failed = true;
					return false;
				}

				data.isOn = isOn;
				data.$coords.push(isOn);
			}

			return true;
		}
	});

	// Ninth Level 3N3E -- Clear the room without stepping on each of the marked areas more than once
	addAchievement(to, {
		id: 'faf7a3578615b1b93b91cd4c14c048a9',
		name: 'achievement.description.l1.3n3e',
		description: 'achievement.description.l1.3n3e',

		icon: ['Aboveground', [
			[-T.TI_WALL, 0.5, 0.5],
			[T.TI_BEETHRO_S, 0.5, -0.5],
			[T.TI_BEETHRO_W, 1.5, 0.5],
			[T.TI_BEETHRO_N, 0.5, 1.5],
			[T.TI_BEETHRO_E, -0.5, 0.5],
		]],

		in: [1, "3N3E"],

		init: data => {
			data.$coords = [];
			data.isOn = 0;

			return true;
		},
		update: data => {
			data.$coords = data.$coords ?? [];
			data.isOn = data.isOn ?? 0;

			let isOn = -1;

			if (playerIn(0, 9, 2, 11)) {
				isOn = 1;
			} else if (playerIn(11, 1, 13, 1)) {
				isOn = 2;
			} else if (playerIn(23, 11, 25, 13)) {
				isOn = 3;
			} else if (playerIn(12, 22, 14, 23)) {
				isOn = 4;
			}

			if (isOn === -1) {
				data.isOn = 0;
			} else if (data.isOn !== isOn) {
				if (data.$coords.includes(isOn)) {
					data.failed = true;
					return false;
				}

				data.isOn = isOn;
				data.$coords.push(isOn);
			}

			return true;
		}
	});

	// Tenth Level: 1N1E -- Clear the room without turning
	addAchievement(to, {
		id: '8e04e8be71fa5c42391f0e9630698215',
		name: 'achievement.name.l2.1n1e',
		description: 'achievement.description.l2.1n1e',

		icon: ['default', T.TI_SPIDER_S, T.TI_BEETHRO_SWORD_NE, T.TI_BEETHRO_NE, T.TI_SPIDER_AW],

		in: [2, "1N1E"],

		trackSwordTurnFrom: () => room().trapdoorsLeft === 0,
		failOn: data => data.hasTurnedSword
	});

	// Tenth Level: 1E -- Clear the room without turning
	addAchievement(to, {
		id: 'c09b5aa4c0e23056efafaded55826c29',
		name: 'achievement.name.l2.1e',
		description: 'achievement.description.l2.1e',

		icon: ['default', T.TI_BEETHRO_SWORD_NW, T.TI_SPIDER_AS, T.TI_SPIDER_E, T.TI_BEETHRO_NW],

		in: [2, "1E"],

		trackSwordTurnFrom: () => roomO(7, 4) === C.T_DOOR_YO,
		failOn: data => data.hasTurnedSword
	});

	// Tenth Level: 1S1W -- Clear the room without turning
	addAchievement(to, {
		id: '759fce8b66c429ed4dc2516a604c5388',
		name: 'achievement.name.l2.1s1w',
		description: 'achievement.description.l2.1s1w',

		icon: ['default', T.TI_RQUEEN_W, T.TI_BEETHRO_SW, T.TI_BEETHRO_SWORD_SW, T.TI_RQUEEN_AS],

		in: [2, "1S1W"],

		trackSwordTurnFrom: () => playerAt(3, 21) || hasMonsterAt(3, 21),
		failOn: data => data.hasTurnedSword
	});

	// Tenth Level: 1S -- Clear the room without drinking the potion
	addAchievement(to, {
		id: 'f02688dc91ff5c464a3af81cda357278',
		name: 'achievement.name.l2.1s',
		description: 'achievement.description.l2.1s',

		icon: ['default', [[T.TI_POTION_M, 0.5, 0.5]]],

		in: [2, "1S"],

		failOn: () => playerAt(14, 13)
	});

	// Eleventh Level: 1S2E -- Clear the room in less than 150 moves
	addAchievement(to, {
		id: 'e3e74811cf5b80218c16904c1ff4810e',
		name: 'achievement.name.l3.1s2e',
		description: 'achievement.description.l3.1s2e',

		icon: ['Aboveground', [
			[-T.TI_WALLB_NSEW123, -0.5, -0.5],
			[-T.TI_WALLB_NEW12, 0.5, -0.5],
			[-T.TI_WALLB_NSEW124, 1.5, -0.5],
			[-T.TI_WALLB_NSW13, -0.5, 0.5],
			[-T.TI_WALLB_NSE24, 1.5, 0.5],
			[-T.TI_WALLB_NSEW134, -0.5, 1.5],
			[-T.TI_WALLB_SEW34, 0.5, 1.5],
			[-T.TI_WALLB_NSEW234, 1.5, 1.5],
			[T.TI_ROACH_ASE, 0.5, 0.5]
		]],

		in: [3, "1S2E"],

		failOn: () => Game.turnNo >= 150
	});

	// Eleventh Level -- Clear all tar in any room
	addAchievement(to, {
		id: '260c5192997525b33495a35ad4d1832f',
		name: 'achievement.name.l3.clear_tar',
		description: 'achievement.description.l3.clear_tar',

		icon: ['Aboveground', T.TI_TAR_SE, T.TI_TAR_SW, T.TI_TAR_NE, T.TI_TAR_NW],

		in: 3,
		init: () => hasTile(C.T_TAR),

		winNeedsConquer: false,
		winOn: () => !hasTile(C.T_TAR)
	});

	// Twelfth Level: 1S2E - Clear the room without moving diagonally
	addAchievement(to, {
		id: '64b82de4f8a734eb2fadb268988b7e6b',
		name: 'achievement.name.l4.1s2e',
		description: 'achievement.description.l4.1s2e',

		icon: ['Aboveground', [
			[T.TI_BEETHRO_N, 0.5, 0.5],
			[T.TI_SNKH_AN, 0.5, 1.5],
			[T.TI_SNKH_AS, 0.5, -0.5],
			[T.TI_SNKH_AE, -0.5, 0.5],
			[T.TI_SNKH_AW, 1.5, 0.5],
		]],

		in: [4, '1S2E'],

		failOn: data => data.hasMovedDiagonally,
	});

	// Twelfth Level: 2S1E -- Clear the room without drinking a potion
	addAchievement(to, {
		id: 'e6a152fc2a11d08c2ccef13da91c490b',
		name: 'achievement.name.l4.2s1e',
		description: 'achievement.description.l4.2s1e',

		icon: ['Aboveground', [
			[T.TI_POTION_M, 0, 0.5],
			[T.TI_POTION_M, 1, 0.5],
		]],

		in: [4, '2S1E'],

		failOn: () => playerAt(12, 10)
	});

	// Twelfth Level: 1S -- Wake exactly one eye and clear the room
	addAchievement(to, {
		id: '5d4aa5e3dde3d0978c3578b28c045759',
		name: 'achievement.name.l4.1s',
		description: 'achievement.description.l4.1s',

		icon: ['Aboveground', [
			[T.TI_EEYEW_S, 0.5, 0.5],
			[T.TI_EEYEW_S, 0.5, -0.5],
			[T.TI_BEETHRO_W, 0.5, 1.5],
			[T.TI_BEETHRO_SWORD_W, -0.5, 1.5],
			[T.TI_SNKH_W, 1.5, 1.5],
			[-T.TI_WALL_NW1, -0.5, 0.5],
			[-T.TI_WALL_NSW13, -0.5, -0.5],
			[-T.TI_WALL_NE2, 1.5, 0.5],
			[-T.TI_WALL_NSE24, 1.5, -0.5],
		]],

		in: [4, '1S'],

		init: data => {
			data.$count = 0;
			return true;
		},
		update: data => {
			data.$count = data.$count ?? 0;
			data.$count += CueEvents.countOccurred(C.CID_EVIL_EYE_WOKE);

			return true;
		},
		failOn: data => (data.$count ?? 0) > 1
	});


	// Any Level -- Clear a room with evil eyes without waking any
	addAchievement(to, {
		id: '8b1ffc953c776c0a9d4e6f904a558921',
		name: 'achievement.name.do_not_wake_eyes',
		description: 'achievement.description.do_not_wake_eyes',

		icon: ['default', [
			[T.TI_EEYE_AN, -0.5, -0.5],
			[T.TI_EEYE_SW, -0.5, 0.5],
			[T.TI_EEYE_ANE, -0.5, 1.5],
			[T.TI_EEYE_AE, 0.5, -0.5],
			[T.TI_EEYE_SW, 0.5, 0.5],
			[T.TI_EEYE_S, 0.5, 1.5],
			[T.TI_EEYE_ANW, 1.5, -0.5],
			[T.TI_EEYE_SE, 1.5, 0.5],
			[T.TI_EEYE_W, 1.5, 1.5],
		]],

		init: () => !!getMonster(C.M_EYE),

		failOn: () => ev(C.CID_EVIL_EYE_WOKE),
	});

	AchievementFactory.levelCleared(to, 6, "Scrolls");
	AchievementFactory.levelCleared(to, 1, "1/4");
	AchievementFactory.levelCleared(to, 2, "2/4");
	AchievementFactory.levelCleared(to, 3, "3/4");
	AchievementFactory.levelCleared(to, 4, "4/4");

	AchievementFactory.masterHold(to);
	AchievementFactory.postMasterHold(to, 5, "1S", 18, 8);

	AchievementFactory.tuningFork_inSequence(to, 4);

	AchievementFactory.monsterKills(to, C.M_ROACH, T.TI_ROACH_NW, 761);
	AchievementFactory.monsterKills(to, C.M_QROACH, T.TI_RQUEEN_ANW, 73);
	AchievementFactory.monsterKills(to, C.M_ROACH_EGG, T.TI_REGG_W, 3);
	AchievementFactory.monsterKills(to, C.M_EYE, T.TI_EEYE_NW, 193);
	AchievementFactory.monsterKills(to, C.M_SERPENT, 0, 61);
	AchievementFactory.monsterKills(to, C.M_SPIDER, T.TI_SPIDER_NW, 139);
	AchievementFactory.monsterKills(to, C.M_WWING, T.TI_WWING_ANW, 103);
	AchievementFactory.monsterKills(to, C.M_TARBABY, T.TI_TARBABY_ANW, 199);
	AchievementFactory.monsterKills(to, C.M_TARMOTHER, 0, 37);

	AchievementFactory.rooms(to, 43);
	AchievementFactory.allKills(to, 1223);
	AchievementFactory.trapdoors(to, 'Aboveground', 113);
	AchievementFactory.cutTar(to, 473);
	AchievementFactory.steps(to, 3541);
	AchievementFactory.undo(to, 353);
	AchievementFactory.deaths(to, 211);
}