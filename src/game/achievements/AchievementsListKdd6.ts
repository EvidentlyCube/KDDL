import { ASSERT } from "../../ASSERT";
import { C } from "../../C";
import { T } from "../../T";
import { CueEvents } from "../global/CueEvents";
import { Achievement } from "./Achievement";

import { F } from "src/F";
import { MonsterMessageType, VOMonsterMessage } from "../managers/VOMonsterMessage";
import { AchievementFactory, AchievementHelpers, addAchievement } from './AchievementHelpers';

const {
	roomO,
	roomF,
	roomT,
	ev,
	evConquered,
	evOrbHit,
	playerAt,
	evKilled,
	getMonster,
	getNeather,
	hasMonster,
	hasMonsterAt,
	countMonster,
	countTrapdoors,
} = AchievementHelpers;

export function AchievementsListKdd6(to: Achievement[]) {
	ASSERT(to);

	// ::::::::::::::::::::::::::::::::::::::::::::::
	// :: Room Specific
	// ::::::::::::::::::::::::::::::::::::::::::::::

	// Twenty-First Level: 1N -- Drink the potion before killing any monster then clear the room
	addAchievement(to, {
		id: '0f8d387d69892a58b482e4adcd07ed8d',
		name: 'achievement.name.l1.1n',
		description: 'achievement.description.l1.1n',

		icon: ['default', T.TI_RQUEEN_NW, T.TI_BEETHRO_NE, T.TI_POTION_M, T.TI_RQUEEN_ASE],

		in: [1, '1N'],

		failOn: () => ev(C.CID_MONSTER_DIED_FROM_STAB) && roomT(19, 9) === C.T_POTION_M
	})

	// Twenty-First Level: 1S -- Kill the goblin last without trapping it on an arrow
	addAchievement(to, {
		id: '35af2f780f086b08f94515a718a742b0',
		name: 'achievement.name.l1.1s',
		description: 'achievement.description.l1.1s',

		icon: ['Aboveground', -T.TI_ARROW_N, -T.TI_ARROW_NE, T.TI_GOBLIN_NE, -T.TI_ARROW_E],

		in: [1, '1S'],

		failOn: () => {
			const goblin = getMonster(C.M_GOBLIN);

			if (goblin && F.isArrow(roomF(goblin.x, goblin.y))) {
				return true;
			}

			return evKilled(C.M_GOBLIN) && !evConquered();
		}
	})

	// Twenty-First Level: 1N1W -- Kill all brains before killing any roach queen, don't drop any trapdoor and clear the room
	addAchievement(to, {
		id: '3091f29e665c2bb8db4607075feb5ba4',
		name: 'achievement.name.l1.1n1w',
		description: 'achievement.description.l1.1n1w',

		icon: ['default', T.TI_BRAIN, T.TI_BRAIN_A, T.TI_BRAIN, T.TI_BRAIN], // @FIXME Icon

		in: [1, '1N1W'],

		failOn: () => {
			return ev(C.CID_TRAPDOOR_REMOVED)
				|| (evKilled(C.M_ROACH_QUEEN) && hasMonster(C.M_BRAIN));
		}
	});

	// Twenty-First Level: 1N1E -- Release the goblins before killing any monster then clear the room
	addAchievement(to, {
		id: '9f7f7d270d7eb72b5622ca91750542e3',
		name: 'achievement.name.l1.1n1e',
		description: 'achievement.description.l1.1n1e',

		icon: ['default', T.TI_GOBLIN_ASE, T.TI_GOBLIN_SW, T.TI_GOBLIN_ANE, T.TI_GOBLIN_NW],

		in: [1, '1N1E'],

		failOn: () => {
			return ev(C.CID_MONSTER_DIED_FROM_STAB) && roomO(10, 3) === C.T_DOOR_Y;
		}
	});

	// Twenty-First Level: 1S1E -- Kill the easternmost roach queen before killing any other monster then clear the room
	addAchievement(to, {
		id: 'd821c0e71a3337eed2647865ce498d45',
		name: 'achievement.name.l1.1s1e',
		description: 'achievement.description.l1.1s1e',

		icon: ['default', 0, T.TI_RQUEEN_AE, T.TI_BRAIN, T.TI_ORB],

		in: [1, '1S1E'],

		failOn: data => {
			if (data.$markedForConquer) {
				return false;

			} else if (!hasMonsterAt(23, 11)) {
				data.$markedForConquer = true;
				return false;

			} else {
				return ev(C.CID_MONSTER_DIED_FROM_STAB);
			}
		}
	});


	// Twenty-Second Level: 1E -- Clear the room without hitting any of the two northernmost orbs
	addAchievement(to, {
		id: '7f1150a2648091aaae2881667459786d',
		name: 'achievement.name.l2.1e',
		description: 'achievement.description.l2.1e',

		icon: ['default', [
			[T.TI_ORB, 0, 0],
			[T.TI_ORB, 1, 4 / 22],
			[T.TI_MIMIC_SWORD_N, 0.5, 0],
			[T.TI_MIMIC_N, 0.5, 1],
		]],

		in: [2, '1E'],

		failOn: () => evOrbHit(12, 2) || evOrbHit(21, 9)
	});

	// Twenty-Third Level: 1N1W -- Kill a serpent in the goblin's starting alcove then clear the room
	addAchievement(to, {
		id: '4e4697c2a3ab064a7ebeb9c0f2c0886a',
		name: 'achievement.name.l3.1n1w',
		description: 'achievement.description.l3.1n1w',

		icon: ['City', [
			[T.TI_GOBLIN_N, 0.5, 0],
			[T.TI_SNKH_AN, 0.5, 1],
			[-T.TI_WALL_NSW13, -0.5, 0],
			[-T.TI_WALL_NSW13, -0.5, 1],
			[-T.TI_WALL_NSE24, 1.5, 0],
			[-T.TI_WALL_NSE24, 1.5, 1],
		]],

		in: [3, '1N1W'],

		update: data => {
			if (hasMonsterAt(11, 17, C.M_SERPENT_R)) {
				data.$markedForConquer = true;
			}

			return true;
		},

		winOn: data => data.$markedForConquer === true
	});

	// Twenty-Third Level: 1W -- Clear the room without turning
	addAchievement(to, {
		id: 'dc5bacc56cae7ecb70c84a424974a138',
		name: 'achievement.name.l3.1w',
		description: 'achievement.description.l3.1w',

		icon: ['default', T.TI_BEETHRO_SWORD_NW, T.TI_GOBLIN_AS, 0, T.TI_BEETHRO_NW],

		in: [3, '1W'],

		failOn: data => data.hasTurnedSword
	});

	// Twenty-Third Level: 2S -- Do not drop any trapdoors until the serpent dies then clear the room
	addAchievement(to, {
		id: 'd85f4cf043f49391462857a5589ca2ef',
		name: 'achievement.name.l3.2s',
		description: 'achievement.description.l3.2s',

		icon: ['City', T.TI_SNKT_W, T.TI_SNKH_E, -T.TI_TRAPDOOR, T.TI_GOBLIN_W],

		in: [3, '2S'],

		failOn: () => ev(C.CID_TRAPDOOR_REMOVED) && hasMonster(C.M_SERPENT_R)
	});

	// Twenty-Third Level: 1N -- Go past red gates with both goblins alive then clear the room
	addAchievement(to, {
		id: '76c06176333d6b384e6340a2e429d726',
		name: 'achievement.name.l3.1n',
		description: 'achievement.description.l3.1n',

		icon: ['default', [
			[T.TI_DOOR_RO, 0.5, 0.5],
			[T.TI_GOBLIN_N, 0, 1],
			[T.TI_GOBLIN_N, 1, 1],
			[T.TI_BEETHRO_N, 0.5, 0],
		]],

		in: [3, '1N'],

		failOn: data => {
			if (data.$markedForConquer) {
				return false;

			} else if (evKilled(C.M_GOBLIN)) {
				return true;

			} else if (playerAt(24, 9) && countMonster(C.M_GOBLIN) === 2) {
				data.$markedForConquer = true;
			}

			return false;
		},
		winOn: data => (data.$markedForConquer ?? false)
	});

	// Twenty-Third Level: 1N -- Go past red gates with only one goblin alive then clear the room
	addAchievement(to, {
		id: '5414573e904bd300fd7a76116cfb3458',
		name: 'achievement.name.l3.1n_2',
		description: 'achievement.description.l3.1n_2',

		icon: ['default', [
			[T.TI_DOOR_RO, 0.5, 0.5],
			[T.TI_GOBLIN_N, 0.5, 1],
			[T.TI_BEETHRO_N, 0.5, 0],
		]],

		in: [3, '1N'],

		failOn: data => {
			if (data.$markedForConquer) {
				return false;

			} else if (playerAt(24, 9) && countMonster(C.M_GOBLIN) === 1) {
				data.$markedForConquer = true;
			}

			return false;
		},
		winOn: data => (data.$markedForConquer ?? false)
	});

	// Twenty-Third Level: 1S1W -- Kill all goblins before waking up any evil eye then clear the room
	addAchievement(to, {
		id: 'bb3adbfff4c1336f3009d4bfdd0fdb21',
		name: 'achievement.name.l3.1s1w',
		description: 'achievement.description.l3.1s1w',

		icon: ['default', [
			[T.TI_ORB, 0.5, 0.5],
			[T.TI_GOBLIN_S, 0.5, -0.5],
			[T.TI_GOBLIN_N, 0.5, 1.5],
			[T.TI_GOBLIN_E, -0.5, 0.5],
		]],

		in: [3, '1S1W'],

		failOn: () => ev(C.CID_EVIL_EYE_WOKE) && hasMonster(C.M_GOBLIN),
	});

	// Twenty-Third Level: 1S2W -- Drop all trapdoors before killing any monster then clear the room
	addAchievement(to, {
		id: '0d92c92ef09b381e1edd87ba8f8005a1',
		name: 'achievement.name.l3.1s2w',
		description: 'achievement.description.l3.1s2w',

		icon: ['City', -T.TI_TRAPDOOR, T.TI_SNKH_AS, T.TI_GOBLIN_E, -T.TI_TRAPDOOR],

		in: [3, '1S2W'],

		failOn: () => countTrapdoors() > 0 && (ev(C.CID_MONSTER_DIED_FROM_STAB) || ev(C.CID_SNAKE_DIED_FROM_TRUNCATION)),
	});

	// Twenty-Third Level: 1S3W -- Clear the room without letting the goblin step on a trapdoor
	addAchievement(to, {
		id: '9ecb450af003b76d52fc010e399c0338',
		name: 'achievement.name.l3.1s3w',
		description: 'achievement.description.l3.1s3w',

		icon: ['default', [
			[T.TI_SNK_SE, 0, 1],
			[T.TI_SNK_SW, 1, 1],
			[T.TI_MIMIC_S, 0, 0],
			[T.TI_MIMIC_SWORD_S, 0, 1],
			[T.TI_ROACH_S, 1, 0],
		]],

		in: [3, '1S3W'],

		failOn: () => hasMonsterAt(8, 10, C.M_GOBLIN)
	});

	// Twenty-Fourth Level: 1W -- Kill all brains before killing all serpents then clear the room
	addAchievement(to, {
		id: 'e4be2ff0e1b10aee2a3a0c3bf4c92537',
		name: 'achievement.name.l4.1w',
		description: 'achievement.description.l4.1w',

		icon: ['default', [
			[T.TI_SNKH_N, 0.5, 0.5],
			[T.TI_SNK_NS, 0.5, 1.5],
			[T.TI_BRAIN, -0.5, 0.5],
			[T.TI_BRAIN, 1.5, 0.5],
			[T.TI_BRAIN, 0.5, -0.5],
		]],

		in: [4, '1W'],

		failOn: () => ev(C.CID_SNAKE_DIED_FROM_TRUNCATION)
			&& countMonster(C.M_BRAIN) > 0
			&& countMonster(C.M_SERPENT_R) === 0
	});

	// Twenty-Fourth Level: 2W -- Clear the room without hitting any orb with a mimic
	addAchievement(to, {
		id: 'ec7dbd898b991dd85d4a87a36f2b1092',
		name: 'achievement.name.l4.2w',
		description: 'achievement.description.l4.2w',

		icon: ['default', [
			[T.TI_ORB, 1.5, -0.5],
			[T.TI_ORB, 1.5, 0.5],
			[T.TI_ORB, 1.5, 1.5],
			[T.TI_MIMIC_E, -0.5, 0.5],
			[T.TI_MIMIC_SWORD_E, 0.5, 0.5],
		]],

		in: [4, '2W'],

		failOn: () => ev(C.CID_ORB_ACTIVATED_BY_DOUBLE)
	});

	// Twenty-Fourth Level: 1N -- Kill the tar mother last
	addAchievement(to, {
		id: 'bff0784c916683d8b0367d13a1550ca5',
		name: 'achievement.name.l4.1n',
		description: 'achievement.description.l4.1n',

		icon: ['default', [
			[T.TI_TMOTHER_EC, 0.5, 0.5]
		]],

		in: [4, '1N'],

		winOn: () => evKilled(C.M_TAR_MOTHER) && evConquered()
	});

	// Twenty-Fifth Level: 2W -- Go past the trapdoors without killing any goblin
	addAchievement(to, {
		id: 'd0115e74aebb3dc5008b59e0e1270146',
		name: 'achievement.name.l5.2w',
		description: 'achievement.description.l5.2w',

		icon: ['Fortress', [
			[-T.TI_TRAPDOOR, 0.5, 0.5],
			[T.TI_BEETHRO_S, 0.5, 0.5],
			[T.TI_BEETHRO_SWORD_S, 0.5, 1.5],
			[T.TI_GOBLIN_SE, -0.5, -0.5],
			[T.TI_GOBLIN_S, 0.5, -0.5],
			[T.TI_GOBLIN_SW, 1.5, -0.5],
			[T.TI_GOBLIN_E, -0.5, 0.5],
			[T.TI_GOBLIN_W, 1.5, 0.5],
		]],

		in: [5, '2W'],

		failOn: () => evKilled(C.M_GOBLIN),

		winNeedsConquer: false,
		winOn: () => playerAt(23, 16)
	});

	// Twenty-Fifth Level -- Get 'Neather stuck and unable to move because of a monster
	addAchievement(to, {
		id: '12d445193c986e665bbfeb4329a617b2',
		name: 'achievement.name.l5.stuck_neather',
		description: 'achievement.description.l5.stuck_neather',

		icon: ['default', [
			[T.TI_CITIZEN_S, 0.5, 0.5],
			[T.TI_ROACH_N, 0, 0],
			[T.TI_ROACH_N, 1, 0],
			[T.TI_ROACH_AN, 0, 1],
			[T.TI_ROACH_AN, 1, 1],
		]],

		in: [5, '1N2W'],
		fakeActiveIn: 5,

		winNeedsConquer: false,
		winOn: () => getNeather()?.isFailingToMove === true
	});

	// Twenty-Fifth Level -- Stab Neather in a room in a place where it should be impossible
	addAchievement(to, {
		id: '580314f945c4c2dd943935acd1d460dd',
		name: 'achievement.name.l5.stab_neather',
		description: 'achievement.description.l5.stab_neather',

		icon: ['default', [
			[T.TI_CITIZEN_S, 0, 0],
			[T.TI_BEETHRO_SWORD_NW, 0, 0],
			[T.TI_BEETHRO_NW, 1, 1],
		]],

		in: 5,

		winNeedsConquer: false,
		winOn: () => CueEvents.anyData(C.CID_MONSTER_SPOKE, data => {
			return data instanceof VOMonsterMessage
				&& data.type === MonsterMessageType.NeatherImpossibleKill;
		})
	});


	AchievementFactory.levelCleared(to, 1, "1/5");
	AchievementFactory.levelCleared(to, 2, "2/5");
	AchievementFactory.levelCleared(to, 3, "3/5");
	AchievementFactory.levelCleared(to, 4, "4/5");
	AchievementFactory.levelCleared(to, 5, "5/5");

	AchievementFactory.masterHold(to);
	AchievementFactory.postMasterHold(to, 6, "1S", 18, 8);

	AchievementFactory.tuningFork_inSequence(to, 13); // 25nd Level: 1N2W
	addAchievement(to, { // 22nd Level: 1N1W
		...AchievementFactory.tuningFork_inSequence(false, 4),

		id: '59d0e33bc832de0bd79beb3e184756fa',
		name: 'achievement.name.l2.tuning_fork',
		description: 'achievement.description.l2.tuning_fork',

		icon: ['City', [
			[T.TI_ORB, 0.5, -0.5],
			[T.TI_ORB, -0.5, 0.5],
			[T.TI_ORB, 0.5, 1.5],
			[T.TI_ORB, 1.5, 0.5],
		]],

		in: [2, '1N1W'],
	});

	AchievementFactory.monsterKills(to, C.M_ROACH, T.TI_ROACH_NW, 1997);
	AchievementFactory.monsterKills(to, C.M_ROACH_QUEEN, T.TI_RQUEEN_ANW, 239);
	AchievementFactory.monsterKills(to, C.M_ROACH_EGG, T.TI_REGG_W, 3);
	AchievementFactory.monsterKills(to, C.M_EYE, T.TI_EEYE_NW, 227);
	AchievementFactory.monsterKills(to, C.M_SERPENT_R, 0, 37);
	AchievementFactory.monsterKills(to, C.M_WRAITHWING, T.TI_WWING_ANW, 7);
	AchievementFactory.monsterKills(to, C.M_TAR_BABY, T.TI_TARBABY_ANW, 101);
	AchievementFactory.monsterKills(to, C.M_TAR_MOTHER, 0, 13);
	AchievementFactory.monsterKills(to, C.M_SPIDER, T.TI_SPIDER_NW, 67);
	AchievementFactory.monsterKills(to, C.M_GOBLIN, T.TI_GOBLIN_NW, 113);
	AchievementFactory.monsterKills(to, C.M_BRAIN, T.TI_BRAIN, 149);
	AchievementFactory.monsterKills(to, C.M_MIMIC, 0, 1);

	AchievementFactory.rooms(to, 40);
	AchievementFactory.allKills(to, 2953);
	AchievementFactory.trapdoors(to, 'City', 313);
	AchievementFactory.cutTar(to, 73);
	AchievementFactory.steps(to, 4139);
	AchievementFactory.undo(to, 317);
	AchievementFactory.deaths(to, 197);
}