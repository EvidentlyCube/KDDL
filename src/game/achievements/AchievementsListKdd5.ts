import { ASSERT } from "../../ASSERT";
import { C } from "../../C";
import { T } from "../../T";
import { Achievement } from "./Achievement";

import { S } from "src/S";
import { AchievementFactory, AchievementHelpers, addAchievement } from './AchievementHelpers';

const {
	ev,
	evConquered,
	player,
	playerAt,
	evKilled,
	getMonster,
	anyMonsterIn,
	evTarGrowth,
	countTar,
	countTrapdoors,
} = AchievementHelpers;

export function AchievementsListKdd5(to: Achievement[]) {
	ASSERT(to);

	// ::::::::::::::::::::::::::::::::::::::::::::::
	// :: Room Specific
	// ::::::::::::::::::::::::::::::::::::::::::::::

	// 17th Level: 1W -- Clear the room before 4th tar growth
	addAchievement(to, {
		id: '56917faf9cfa7d93881e336eaa39a61f',
		name: 'achievement.name.l1.1w',
		description: 'achievement.description.l1.1w',

		icon: ['Fortress', T.TI_TAR_NW, T.TI_BEETHRO_SW, T.TI_BEETHRO_SWORD_SW, T.TI_TAR_SE],

		in: [1, "1W"],

		init: data => {
			data.$count = 0;
			return true;
		},
		update: data => {
			data.$count = (data.$count ?? 0) + (evTarGrowth() ? 1 : 0);

			return true;
		},
		failOn: data => (data.$count ?? 0) >= 4
	});

	// 17th Level: 1N1W -- Clear all tar, drop all trapdoors, conquer the room and leave north in one go
	addAchievement(to, {
		id: 'fcca55f8e3eeff426fceb287ec372cd9',
		name: 'achievement.name.l1.1n1w',
		description: 'achievement.description.l1.1n1w',

		icon: ['Fortress', [
			[T.TI_TAR_SW, 0, 1],
			[-T.TI_TRAPDOOR, 1, 1],
			[T.TI_BEETHRO_N, 0.5, 0],
		]],

		in: [1, "1N1W"],

		winOn: () => countTrapdoors() === 0 && countTar() === 0 && evConquered() && player().y === 0
	});

	// 17th Level: 1N1W -- Clear the room before 2nd tar growth
	addAchievement(to, {
		id: '68bf8a9f0a27cc99732c6c117980b05a',
		name: 'achievement.name.l1.1n1w_2',
		description: 'achievement.description.l1.1n1w_2',

		icon: ['Fortress', T.TI_TAR_SW, T.TI_BEETHRO_SWORD_N, T.TI_TAR_NW, T.TI_BEETHRO_N],

		in: [1, "1N1W"],

		init: data => {
			data.$count = 0;
			return true;
		},
		update: data => {
			data.$count = (data.$count ?? 0) + (evTarGrowth() ? 1 : 0);

			return true;
		},
		failOn: data => (data.$count ?? 0) >= 2
	});

	// 17th Level: 2S1E -- Kill the tar mother before killing any tar baby
	addAchievement(to, {
		id: '7cacafb3265c86085f7690bf08a38c4c',
		name: 'achievement.name.l1.2s1e',
		description: 'achievement.description.l1.2s1e',

		icon: ['Fortress', [
			[T.TI_TAR_INESW, 0, 0],
			[T.TI_TAR_INESW, 0, 1],
			[T.TI_TAR_INESW, 1, 0],
			[T.TI_TAR_INESW, 1, 1],
			[T.TI_TMOTHER_WO, 0, 0.5],
			[T.TI_TMOTHER_EO, 1, 0.5],
		]],

		in: [1, "2S1E"],

		failOn: () => evKilled(C.M_TARBABY) && !!getMonster(C.M_TARMOTHER),
	});

	// 18th Level: 1N -- Conquer the room without turning
	addAchievement(to, {
		id: '7c6155671804832dbfcf4c236f2b4262',
		name: 'achievement.name.l2.1n',
		description: 'achievement.description.l2.1n',

		icon: ['Fortress', [
			[-T.TI_ARROW_S, 0, 0],
			[-T.TI_ARROW_S, 1, 0],
			[-T.TI_TRAPDOOR, 0, 1],
			[-T.TI_TRAPDOOR, 1, 1],
			[T.TI_GOBLIN_S, 0, 0],
			[T.TI_BEETHRO_SWORD_N, 1, 0],
			[T.TI_BEETHRO_N, 1, 1],
		]],

		in: [2, "1N"],

		failOn: data => data.hasTurnedSword
	});

	// 18th Level: 2N1E -- Clear the room without moving diagonally
	addAchievement(to, {
		id: '61711a1100f78513ef6996eff337d40c',
		name: 'achievement.name.l2.2n1e',
		description: 'achievement.description.l2.2n1e',

		icon: ['Fortress', [
			[-T.TI_TRAPDOOR, 0, 0],
			[-T.TI_TRAPDOOR, 0, 1],
			[-T.TI_TRAPDOOR, 1, 0],
			[-T.TI_TRAPDOOR, 1, 1],
			[T.TI_GOBLIN_S, 0, 0],
			[T.TI_GOBLIN_W, 1, 1],
			[T.TI_BEETHRO_SWORD_NE, 1, 0],
			[T.TI_BEETHRO_NE, 0, 1],
		]],

		in: [2, "2N1E"],

		failOn: data => data.hasMovedDiagonally
	});

	// 18th Level: 1N2E -- Clear the room by entering from the east and without turning
	addAchievement(to, {
		id: 'b22d962286b2ca8a847b514ee5e8ce06',
		name: 'achievement.name.l2.1n2e',
		description: 'achievement.description.l2.1n2e',

		icon: ['Fortress', -T.TI_WALL_N, T.TI_GOBLIN_S, T.TI_BEETHRO_SWORD_W, T.TI_BEETHRO_W],

		in: [2, "1N2E"],

		init: () => player().x === 26,
		failOn: data => data.hasTurnedSword
	});

	// 18th Level: 1E -- Use a goblin for only one of the corner serpents and clear the room
	addAchievement(to, {
		id: 'e139fa5562cba07ebd4d65f6aecdbe9f',
		name: 'achievement.name.l2.1e',
		description: 'achievement.description.l2.1e',

		icon: ['Fortress', T.TI_SNK_NS, -T.TI_WALL_N, T.TI_SNKH_S, T.TI_GOBLIN_E],

		in: [2, "1E"],

		failOn: data => anyMonsterIn(22, 20, 26, 24, C.M_GOBLIN)
	});

	// 18th Level: 1E -- Drop all trapdoors before any serpent dies and clear the room
	addAchievement(to, {
		id: 'a5bf0b16a1fb9d75124ad9f3ed0f1cfe',
		name: 'achievement.name.l2.1e_2',
		description: 'achievement.description.l2.1e_2',

		icon: ['Fortress', [

			[-T.TI_TRAPDOOR, 0, 0],
			[-T.TI_TRAPDOOR, 0, 1],
			[-T.TI_TRAPDOOR, 1, 0],
			[-T.TI_TRAPDOOR, 1, 1],
			[T.TI_SNK_NE, 0, 0],
			[T.TI_SNKH_E, 1, 0],
			[T.TI_BEETHRO_W, 0, 1],
			[0, 1, 1, T.TILES_PITSIDE_SMALL],
		]],

		in: [2, "1E"],

		failOn: () => ev(C.CID_SNAKE_DIED_FROM_TRUNCATION) && countTrapdoors() > 0
	});

	// 18th Level: 1N1E -- Clear the room without drinking the potion
	addAchievement(to, {
		id: '384ae523fc533aabea253c7675d325c4',
		name: 'achievement.name.l2.1n1e',
		description: 'achievement.description.l2.1n1e',

		icon: ['Fortress', T.TI_BEETHRO_NW, 0, 0, T.TI_POTION_M],

		in: [2, "1N1E"],

		failOn: () => playerAt(25, 15)
	});

	// 19th Level: 2S -- Clear the room without going past the second row of tiles
	addAchievement(to, {
		id: 'ac15b5730efbe0dc35a3adf7dd1204e7',
		name: 'achievement.name.l3.2s',
		description: 'achievement.description.l3.2s',

		icon: ['Fortress', [
			[T.TI_BEETHRO_E, 1, 0.5],
			[T.TI_WWING_AE, 0, 0.5],
		]],

		in: [3, "2S"],

		failOn: () => player().y > 1
	});

	// 20th Level: Entrance -- Don't turn your sword after killing the first monster; then conquer the room
	addAchievement(to, {
		id: '5b7923e211a8774c6189ffa17c41d88a',
		name: 'achievement.name.l4.entrance',
		description: 'achievement.description.l4.entrance',

		icon: ['Fortress', T.TI_ROACH_SE, T.TI_ROACH_SW, T.TI_BEETHRO_SWORD_W, T.TI_BEETHRO_W],

		in: [4, "Entrance"],

		trackSwordTurnFrom: () => ev(C.CID_MONSTER_DIED_FROM_STAB),
		failOn: data => data.hasTurnedSword
	});

	// 20th Level: 1N -- Kill the brain before killing any roach queen; then clear the room
	addAchievement(to, {
		id: '330cc834779d341c9856685ede3b7b2c',
		name: 'achievement.name.l4.1n',
		description: 'achievement.description.l4.1n',

		icon: ['Fortress', T.TI_BEETHRO_E, T.TI_BEETHRO_SWORD_E, T.TI_RQUEEN_ASW, T.TI_BRAIN_A],

		in: [4, "1N"],

		failOn: () => evKilled(C.M_QROACH) && !!getMonster(C.M_BRAIN)
	});

	// 20th Level: 3N1W -- Kill all brains before killing any goblin
	addAchievement(to, {
		id: 'e308237ae849e7ec751dfa232795162f',
		name: 'achievement.name.l4.3n1w',
		description: 'achievement.description.l4.3n1w',

		icon: ['Fortress', T.TI_BRAIN, T.TI_BRAIN_A, T.TI_BEETHRO_NW, T.TI_GOBLIN_NE],

		in: [4, "3N1W"],

		failOn: () => evKilled(C.M_GOBLIN) && !!getMonster(C.M_BRAIN)
	});

	// 20th Level: 3N -- Kill all brains before killing any roach queen; then clear the room
	addAchievement(to, {
		id: '4ba201d292ee82ebd414ebca5f24b181',
		name: 'achievement.name.l4.3n',
		description: 'achievement.description.l4.3n',

		icon: ['Fortress', T.TI_BRAIN, T.TI_RQUEEN_N, T.TI_BRAIN_A, T.TI_BEETHRO_SWORD_NW],

		in: [4, "3N"],

		failOn: () => evKilled(C.M_QROACH) && !!getMonster(C.M_BRAIN)
	});

	// 20th Level: 2N2W -- Kill all serpents before killing any roach queen then clear the room
	addAchievement(to, {
		id: '3bf8f7307208f176cc9261acb9f9704c',
		name: 'achievement.name.l4.2n2w',
		description: 'achievement.description.l4.2n2w',

		icon: ['Fortress', -T.TI_WALLB, T.TI_RQUEEN_NW, T.TI_SNKH_W, T.TI_SNKT_E],

		in: [4, "2N2W"],

		failOn: () => evKilled(C.M_QROACH) && !!getMonster(C.M_SERPENT)
	});

	// 20th Level: 1N2W -- Kill all other monsters before killing the serpent
	addAchievement(to, {
		id: '00a6e5745164a94c8e9a43e47bebe004',
		name: 'achievement.name.l4.1n2w',
		description: 'achievement.description.l4.1n2w',

		icon: ['Fortress', T.TI_SNK_NS, T.TI_SNKT_W, T.TI_SNK_NS, T.TI_SNK_SE],

		in: [4, "1N2W"],

		failOn: () => evKilled(C.M_SERPENT) && anyMonsterIn(0, 0, S.RoomWidth, S.RoomHeight)
	});

	// 20th Level: 2N1W -- Kill all evil eyes before killing any roach queen then clear the room
	addAchievement(to, {
		id: 'e5a02079ef6c92bb253871280980043d',
		name: 'achievement.name.l4.2n1w',
		description: 'achievement.description.l4.2n1w',

		icon: ['Fortress', T.TI_EEYE_ASW, T.TI_RQUEEN_ANE, T.TI_EEYE_SW, T.TI_EEYE_ASW],

		in: [4, "2N1W"],

		failOn: () => ev(C.CID_SNAKE_DIED_FROM_TRUNCATION) && (!!getMonster(C.M_EYE) || !!getMonster(C.M_EYE_ACTIVE))
	});


	AchievementFactory.levelCleared(to, 1, "1/4");
	AchievementFactory.levelCleared(to, 2, "2/4");
	AchievementFactory.levelCleared(to, 3, "3/4");
	AchievementFactory.levelCleared(to, 4, "4/4");

	AchievementFactory.masterHold(to);
	AchievementFactory.postMasterHold(to, 5, "1S", 18, 8);

	AchievementFactory.tuningFork_inSequence(to, 13); // 18th Level: 1N1E
	const tuningFork2 = AchievementFactory.tuningFork_inSequence(false, 6); // 18th Level: 2N
	tuningFork2.in = [2, '2N'];
	tuningFork2.icon = ['Iceworks', [
		[T.TI_ORB, -0.5, 0],
		[T.TI_ORB, -0.5, 1],
		[T.TI_ORB, 0.5, 0],
		[T.TI_ORB, 0.5, 1],
		[T.TI_ORB, 1.5, 0],
		[T.TI_ORB, 1.5, 1],
	]];
	tuningFork2.id = `monster-tuning-fork-in-sequence-2`;
	tuningFork2.name = `achievement.name.tuning_fork_in_sequence-2`;
	tuningFork2.description = `achievement.description.tuning_fork_in_sequence-2`;
	addAchievement(to, tuningFork2);

	AchievementFactory.monsterKills(to, C.M_ROACH, T.TI_ROACH_NW, 429);
	AchievementFactory.monsterKills(to, C.M_QROACH, T.TI_RQUEEN_ANW, 91);
	AchievementFactory.monsterKills(to, C.M_ROACH_EGG, T.TI_REGG_W, 3);
	AchievementFactory.monsterKills(to, C.M_EYE, T.TI_EEYE_NW, 83);
	AchievementFactory.monsterKills(to, C.M_SERPENT, 0, 53);
	AchievementFactory.monsterKills(to, C.M_WWING, T.TI_WWING_ANW, 14);
	AchievementFactory.monsterKills(to, C.M_TARBABY, T.TI_TARBABY_ANW, 101);
	AchievementFactory.monsterKills(to, C.M_TARMOTHER, 0, 47);
	AchievementFactory.monsterKills(to, C.M_GOBLIN, T.TI_GOBLIN_NW, 57);
	AchievementFactory.monsterKills(to, C.M_BRAIN, T.TI_BRAIN, 51);

	AchievementFactory.rooms(to, 19);
	AchievementFactory.allKills(to, 929);
	AchievementFactory.trapdoors(to, 'Iceworks', 997);
	AchievementFactory.cutTar(to, 737);
	AchievementFactory.steps(to, 3221);
	AchievementFactory.undo(to, 237);
	AchievementFactory.deaths(to, 141);
}