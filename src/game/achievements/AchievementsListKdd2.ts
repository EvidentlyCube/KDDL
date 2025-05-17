import { T } from 'src/T';
import { ASSERT } from "../../ASSERT";
import { C } from "../../C";
import { Achievement } from "./Achievement";

import { AchievementFactory, AchievementHelpers, addAchievement } from './AchievementHelpers';

const {
	playerTileO,
	ev,
	player,
	playerAt,
	room,
	getMonster,
	hasTile,
	playerAtEdge,
} = AchievementHelpers;

export function AchievementsListKdd2(to: Achievement[]) {
	ASSERT(to);

	// ::::::::::::::::::::::::::::::::::::::::::::::
	// :: Room Specific
	// ::::::::::::::::::::::::::::::::::::::::::::::

	// Fifth Level: 1W -- Clear the room facing East the entire time
	addAchievement(to, {
		id: '73b00573aa2e093cb0e28771e91b7366',
		name: 'achievement.name.l1.1w',
		description: 'achievement.description.l1.1w',

		icon: ['default', [
			[T.TI_BEETHRO_E, 0, 0.5],
			[T.TI_BEETHRO_SWORD_E, 1, 0.5],
		]],

		in: [1, "1W"],

		failOn: () => player().o !== C.E,
	});

	// Fifth Level: 1N2W -- Drop all trapdoors and clear the room on the same visit
	addAchievement(to, {
		id: '6caa97d73df0de77ac0c24f9f18df7c9',
		name: 'achievement.name.l1.1n2w',
		description: 'achievement.description.l1.1n2w',

		icon: ['default', 0, -T.TI_TRAPDOOR, T.TI_BEETHRO_NE, T.TI_BEETHRO_SWORD_NE],

		in: [1, "1N2W"],

		winOn: () => room().trapdoorsLeft === 0
	});

	// Fifth Level: 2N -- Clear the room without hitting any orb
	addAchievement(to, {
		id: 'c51440aca12c4f8618658c4ad68aee7d',
		name: 'achievement.name.l1.2n',
		description: 'achievement.description.l1.2n',

		icon: ['default', T.TI_ORB, 0, 0, T.TI_BEETHRO_SE],

		in: [1, "2N"],

		failOn: () => ev(C.CID_ORB_ACTIVATED_BY_DOUBLE, C.CID_ORB_ACTIVATED_BY_PLAYER),
		winOn: () => playerAtEdge()
	});

	// Fifth Level: 1S -- Clear the room without turning
	addAchievement(to, {
		id: '0f4fd00433d8a8dfc6b96d6cf8e97dae',
		name: 'achievement.name.l1.1s',
		description: 'achievement.description.l1.1s',

		icon: ['default', T.TI_BEETHRO_SE, 0, 0, T.TI_BEETHRO_SWORD_SE],

		in: [1, "1S"],

		failOn: data => data.hasTurnedSword,
	});

	// Fifth Level: 2S -- Clear the room without drinking the potion
	addAchievement(to, {
		id: '5fc68d55a92cde0adcfa2718b1ec5ebf',
		name: 'achievement.name.l1.2s',
		description: 'achievement.description.l1.2s',

		icon: ['default', [[T.TI_POTION_I, 0.5, 0.5]]],

		in: [1, "2S"],

		failOn: () => playerAt(14, 16),
	});

	// Fifth Level: 3E -- Clear the room without hitting the orb
	addAchievement(to, {
		id: 'e8194ec0cc5a0d613cf7e28a11c287f0',
		name: 'achievement.name.l1.3e',
		description: 'achievement.description.l1.3e',

		icon: ['default', 0, T.TI_ORB, T.TI_BEETHRO_SW, 0],

		in: [1, "3E"],

		failOn: () => ev(C.CID_ORB_ACTIVATED_BY_DOUBLE, C.CID_ORB_ACTIVATED_BY_PLAYER),
	});

	// Fifth Level: 1S1W -- Clear the room without leaving the marked area
	addAchievement(to, {
		id: '528f03486840ddf60e00336b572735fa',
		name: 'achievement.name.l1.1s1w',
		description: 'achievement.description.l1.1s1w',

		icon: ['default', [[T.TI_POTION_M, 0.5, 0.5]]],

		in: [1, "1S1W"],

		failOn: () => !!getMonster(C.M_MIMIC)
			&& playerTileO() !== C.T_FLOOR_MOSAIC,
	});

	// Fifth Level: 2S2E -- Clear the room without stepping on open yellow doors
	addAchievement(to, {
		id: '934f2c27478b83458801b90644ea1d4c',
		name: 'achievement.name.l1.2s2e',
		description: 'achievement.description.l1.2s2e',

		icon: ['default', [
			[T.TI_DOOR_YO, 0.5, 0.5],
			[T.TI_BEETHRO_SE, -0.5, -0.5],
			[T.TI_BEETHRO_SWORD_SE, 0.5, 0.5],
			[T.TI_WWING_ASE, 1.5, 1.5],
		]],

		in: [1, "2S2E"],

		failOn: () => playerTileO() === C.T_DOOR_YO
	});

	// Seventh Level: 1S -- Clear the room without moving diagonally
	addAchievement(to, {
		id: 'fa7423560480f03dfba4d7a6d84d5915',
		name: 'achievement.name.l3.1s',
		description: 'achievement.description.l3.1s',

		icon: ['default', [
			[T.TI_BEETHRO_E, -0.5, 0.5],
			[T.TI_BEETHRO_W, 1.5, 0.5],
			[T.TI_BEETHRO_S, 0.5, -0.5],
			[T.TI_BEETHRO_N, 0.5, 1.5],
			[T.TI_BEETHRO_SWORD_E, 0.5, 0.5],
			[T.TI_BEETHRO_SWORD_S, 0.5, 0.5],
			[T.TI_BEETHRO_SWORD_W, 0.5, 0.5],
			[T.TI_BEETHRO_SWORD_N, 0.5, 0.5],
		]],

		in: [3, "1S"],

		failOn: data => data.hasMovedDiagonally
	});

	// Seventh Level: 1E -- Clear the room without turning
	addAchievement(to, {
		id: 'da9a7696395292b6a519d898b0d98b00',
		name: 'achievement.name.l3.1e',
		description: 'achievement.description.l3.1e',

		icon: ['default', T.TI_BEETHRO_SWORD_NW, 0, 0, T.TI_BEETHRO_NW],

		in: [3, "1E"],

		failOn: data => data.hasTurnedSword
	});

	// Seventh Level: 1N2E -- Kill the snake before any roach and clear the room
	addAchievement(to, {
		id: '0c8f5401fc568e936ea2e08ad2913767',
		name: 'achievement.name.l3.1n2e',
		description: 'achievement.description.l3.1n2e',

		icon: ['default', T.TI_SNKH_W, T.TI_SNK_SW, T.TI_ROACH_ANE, T.TI_SNKT_S],

		in: [3, "1N2E"],

		failOn: () => ev(C.CID_MONSTER_DIED_FROM_STAB) && !!getMonster(C.M_SERPENT_R)
	});

	// Seventh Level: 3N1E -- Clear the room without turning
	addAchievement(to, {
		id: '845f052683fc646cad9374218e509c43',
		name: 'achievement.name.l3.3n1e',
		description: 'achievement.description.l3.3n1e',

		icon: ['default', 0, T.TI_BEETHRO_SW, T.TI_BEETHRO_SWORD_SW, 0],

		in: [3, "3N1E"],

		failOn: data => data.hasTurnedSword
	});

	// Seventh Level: 2N1W -- Clear this optional room
	addAchievement(to, {
		id: '119ee2d6c60477fc6a9c88d7ac87e79b',
		name: 'achievement.name.l3.2n1w',
		description: 'achievement.description.l3.2n1w',

		icon: ['default', [
			[T.TI_SNKH_AS, 0, 0],
			[T.TI_ROACH_S, 1, 0],
			[T.TI_ROACH_E, 0, 1],
			[T.TI_BEETHRO_NW, 1, 1],
			[T.TI_BEETHRO_SWORD_NW, 0, 0],
		]],

		in: [3, "2N1W"],
	});

	// Eighth Level: 4S3E -- Clear the room without drinking the potion
	addAchievement(to, {
		id: '63ac715d928e51c25a3bbb7ba434329c',
		name: 'achievement.name.l4.4s3e',
		description: 'achievement.description.l4.4s3e',

		icon: ['default', T.TI_POTION_M, 0, 0, T.TI_TAR_SE],

		in: [4, "4S3E"],

		failOn: () => playerAt(8, 6)
	});

	// Eighth Level -- Clear all tar in any room
	addAchievement(to, {
		id: '995749d8dc69a6a06cea16360cf79ad5',
		name: 'achievement.name.l4.clear_tar',
		description: 'achievement.description.l4.clear_tar',

		icon: ['default', T.TI_TAR_SE, T.TI_TAR_SW, T.TI_TAR_NE, T.TI_TAR_NW],

		in: 4,
		init: () => hasTile(C.T_TAR),

		winNeedsConquer: false,
		winOn: () => !hasTile(C.T_TAR)
	});

	// Eighth Level -- Kill a tar mother before she has chance to grow tar
	addAchievement(to, {
		id: '561a8da69a7515513e6d1154c9d4cd89',
		name: 'achievement.name.l4.quick_tar_mother_kill',
		description: 'achievement.description.l4.quick_tar_mother_kill',

		icon: ['default', [
			[T.TI_TAR_SE, 0, 0],
			[T.TI_TAR_SW, 1, 0],
			[T.TI_TAR_NE, 0, 1],
			[T.TI_TAR_NW, 1, 1],
			[T.TI_TMOTHER_WO, 0, 0.5],
			[T.TI_TMOTHER_EO, 1, 0.5],
		]],

		in: 4,
		init: () => !!getMonster(C.M_TAR_MOTHER),

		winNeedsConquer: false,
		failOn: () => ev(C.CID_TAR_GREW),
		winOn: () => !getMonster(C.M_TAR_MOTHER)
	});

	// Any Level -- Clear a room with evil eyes without waking any
	addAchievement(to, {
		id: '1c0d5ed558281d0084e6a838c326cdff',
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


	// Find the master wall
	addAchievement(to, {
		id: 'd7c7031b125fe0a4ff08ef3ccc2a1215',
		name: 'achievement.name.find_master_wall',
		description: 'achievement.description.find_master_wall',

		icon: ['default', T.TI_MASTER_WALL, T.TI_MASTER_WALL, T.TI_MASTER_WALL, T.TI_MASTER_WALL],

		initOnConquered: true,

		winNeedsConquer: false,
		winOn: () => hasTile(C.T_WALL_MASTER)
	});


	// ::::::::::::::::::::::::::::::::::::::::::::::
	// :: Common Challenges
	// ::::::::::::::::::::::::::::::::::::::::::::::

	AchievementFactory.levelCleared(to, 6, "Scrolls");
	AchievementFactory.levelCleared(to, 1, "1/4");
	AchievementFactory.levelCleared(to, 2, "2/4");
	AchievementFactory.levelCleared(to, 3, "3/4");
	AchievementFactory.levelCleared(to, 4, "4/4");

	AchievementFactory.masterHold(to);
	AchievementFactory.postMasterHold(to, 5, "1S", 18, 8);

	AchievementFactory.tuningFork_inSequence(to, 4);

	AchievementFactory.monsterKills(to, C.M_ROACH, T.TI_ROACH_NW, 631);
	AchievementFactory.monsterKills(to, C.M_ROACH_QUEEN, T.TI_RQUEEN_ANW, 101);
	AchievementFactory.monsterKills(to, C.M_ROACH_EGG, T.TI_REGG_W, 3);
	AchievementFactory.monsterKills(to, C.M_EYE, T.TI_EEYE_NW, 653);
	AchievementFactory.monsterKills(to, C.M_SERPENT_R, 0, 37);
	AchievementFactory.monsterKills(to, C.M_WRAITHWING, T.TI_WWING_ANW, 107);
	AchievementFactory.monsterKills(to, C.M_TAR_BABY, T.TI_TARBABY_ANW, 1033);
	AchievementFactory.monsterKills(to, C.M_TAR_MOTHER, 0, 43);

	AchievementFactory.rooms(to, 47);
	AchievementFactory.allKills(to, 2593);
	AchievementFactory.trapdoors(to, 'Fortress', 1009);
	AchievementFactory.cutTar(to, 491);
	AchievementFactory.steps(to, 3613);
	AchievementFactory.undo(to, 363);
	AchievementFactory.deaths(to, 181);
}