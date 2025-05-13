import { T } from 'src/T';
import { _r } from "../../../src.framework/_";
import { ASSERT } from "../../ASSERT";
import { C } from "../../C";
import { S } from "../../S";
import { CueEvents } from "../global/CueEvents";
import { Game } from "../global/Game";
import { Level } from "../global/Level";
import { TRoachQueen } from "../objects/actives/TRoachQueen";
import { Achievement } from "./Achievement";

import { TWidgetLevelName } from '../widgets/TWidgetLevelName';
import { AchievementFactory, AchievementHelpers, addAchievement } from './AchievementHelpers';

const {
	roomO,
	ev,
	evConquered,
	playerAt,
	playerIn,
	room,
	hasTile,
	roomID,
	anyMonsterIn,
	hasMonsterAt,
	playerAtEdge,
	hasMonster,
} = AchievementHelpers;

export function AchievementsListKdd1(to: Achievement[]) {
	ASSERT(to);

	// Wake up three evil eyes in the same turn
	addAchievement(to, {
		id: '9d68b049bdff26e2c42a0d2ea309ac9b',
		name: 'achievement.name.wake_up_eyes',
		description: 'achievement.description.wake_up_eyes',
		icon: ['Deep Spaces', [
			[T.TI_EEYEW_S, 0, 0],
			[T.TI_EEYEW_S, 1, 0],
			[T.TI_EEYEW_S, 0.5, 1]
		]],

		init: () => !!room().getMonsterOfType(C.M_EYE),

		winNeedsConquer: false,
		winOn: () => CueEvents.countOccurred(C.CID_EVIL_EYE_WOKE) >= 3
	});

	// Kill a roach queen while her eggs are growing
	addAchievement(to, {
		id: '5bf1c0225da3602fa2b94249a1f82a4f',
		name: 'achievement.name.kill_queen_mother',
		description: 'achievement.description.kill_queen_mother',
		icon: ['Deep Spaces', [
			[T.TI_RQUEEN_ASW, 0.5, 0.5],
			[T.TI_REGG_AN, -0.5, -0.5],
			[T.TI_REGG_ASW, 0.5, -0.5],
			[T.TI_REGG_SW, 1.5, -0.5],
			[T.TI_REGG_AW, -0.5, 0.5],
			[T.TI_REGG_NW, 1.5, 0.5],
			[T.TI_REGG_W, -0.5, 1.5],
			[T.TI_REGG_N, 0.5, 1.5],
			[T.TI_REGG_ANW, 1.5, 1.5],
		]],

		init: () => !!room().getMonsterOfType(C.M_QROACH),

		winNeedsConquer: false,
		winOn: () => CueEvents.anyData(C.CID_MONSTER_DIED_FROM_STAB, monster => (
			monster
			&& monster instanceof TRoachQueen
			&& room().isMonsterInRectOfType(
				Math.max(0, monster.x - 1),
				Math.max(0, monster.y - 1),
				Math.min(S.RoomWidth - 1, monster.x + 1),
				Math.min(S.RoomHeight, monster.y + 1),
				C.M_ROACH_EGG
			)
		))
	});

	// Level 2 1N1E: Destroy all broken walls
	addAchievement(to, {
		id: '5f1c70a7d2078ebae8c7e213c4adce47',
		name: 'achievement.name.l2.1n1e',
		description: 'achievement.description.l2.1n1e',
		icon: ['Foundation', -T.TI_WALLB_SE4, -T.TI_WALLB_SW3, -T.TI_WALLB_NE2, -T.TI_WALLB_NW1],

		in: [2, '1N1E'],
		fakeActiveIn: () => true,

		initOnConquered: true,

		winNeedsConquer: false,
		winOn: () => !hasTile(C.T_WALL_BROKEN)
	});


	// ::::::::::::::::::::::::::::::::::::::::::::::
	// :: Room-specific Level 1
	// ::::::::::::::::::::::::::::::::::::::::::::::

	// First Level 6N2W -- Don't hide in the alcove
	addAchievement(to, {
		id: '6a82119fe491524caa1e3d9bedecee03',
		name: 'achievement.name.l1.6n2w',
		description: 'achievement.description.l1.6n2w',
		icon: ['Foundation', [
			[T.TI_ROACH_AE, -6 / 22, 0],
			[T.TI_ROACH_E, -2 / 22, 1],
			[T.TI_BEETHRO_SWORD_W, 8 / 22, 0.5],
			[T.TI_BEETHRO_W, 30 / 22, 0.5],
		]],

		in: [1, '6N2W'],

		failOn: () => roomO(11, 6) === C.T_DOOR_YO && playerIn(15, 10, 16, 11),

		winNeedsConquer: false,
		winOn: () => !anyMonsterIn(0, 0, 19, 11),
	});

	// First Level -- Clear 7 infested, non-secret rooms without turning your sword
	addAchievement(to, {
		id: '2bb1b556bcc2b05566aa98d6d9e8211a',
		name: 'achievement.name.l1.steady_hand',
		description: ach => _r('achievement.descriptions.l1.steady_hand', {
			rooms: (ach._data.$roomCoords?.length ?? 0) > 0
				? `${ach._data.$roomCoords?.length} (${ach._data.$roomCoords?.join(", ")})`
				: "0",
		}),
		icon: ['Foundation', T.TI_BEETHRO_SE, T.TI_BEETHRO_SWORD_NE, T.TI_BEETHRO_NE, T.TI_BEETHRO_SWORD_SE],

		in: 1,

		failOn: data => data.hasTurnedSword,

		update: data => {
			data.$roomCoords = data.$roomCoords ?? [];

			if (evConquered() && !data.hasTurnedSword) {
				const offset = Level.getRoomOffsetInLevel(roomID());
				const coord = TWidgetLevelName.shortNameFromPosition(offset.x, offset.y);

				if (!data.$roomCoords.includes(coord)) {
					data.$roomCoords.push(coord);
				}
			}

			return true;
		},

		winNeedsConquer: false,
		winOn: data => (data.$roomCoords?.length ?? 0) >= 7,
	});

	// Second Level 2E -- Kill the roach queen before she reaches the northeast corner and clear the room
	addAchievement(to, {
		id: '37a3cd0fcfe02c24538680eba2c16178',
		name: 'achievement.name.l2.2e',
		description: 'achievement.description.l2.2e',

		icon: ['Deep Spaces', -T.TI_WALL_E, -T.TI_WALL_SW, T.TI_RQUEEN_ANE, -T.TI_WALL_N],

		in: [2, '2E'],

		failOn: () => hasMonsterAt(25, 1, C.M_QROACH),
	})

	// Second Level 1S -- After hitting the orb do not rotate your sword and clear the room
	addAchievement(to, {
		id: '873c8a066373c3e443f224800bd1581b',
		name: 'achievement.name.l2.1s',
		description: 'achievement.description.l2.1s',

		icon: ['Deep Spaces', [
			[T.TI_BEETHRO_E, 0, 0.5],
			[T.TI_BEETHRO_SWORD_E, 1, 0.5],
			[T.TI_ROACH_S, 0, -0.5],
			[T.TI_ROACH_AS, 1, -8 / 22],
			[T.TI_ROACH_AN, 0, 35 / 22],
			[T.TI_ROACH_AN, 1, 36 / 22],
		]],

		in: [2, '1S'],

		init: data => {
			data.checkSwordTurn = false;
			return true;
		},

		update: data => {
			if (roomO(9, 2) === C.T_DOOR_YO) {
				data.checkSwordTurn = true;
			}
			return true;
		},

		failOn: data => data.hasTurnedSword,
	})


	// Second Level 2S2E -- Clear the room before queens lay any eggs
	addAchievement(to, {
		id: '1c7b5dacd87c6fb13b38c50f33d66871',
		name: 'achievement.name.l2.2s2e',
		description: 'achievement.description.l2.2s2e',

		icon: ['Deep Spaces', [
			[T.TI_RQUEEN_AN, 0.5, 0],
			[T.TI_RQUEEN_SW, 0, 1],
			[T.TI_RQUEEN_SE, 1, 1],
		]],

		in: [2, '2S2E'],

		failOn: () => hasMonster(C.M_ROACH_EGG)
	})

	// Second Level 2S3E -- Clear the room before queens lay any eggs
	addAchievement(to, {
		id: 'c96dbc86093d595444051d63392a0f2c',
		name: 'achievement.name.l2.2s3e',
		description: 'achievement.description.l2.2s3e',

		icon: ['Deep Spaces', T.TI_RQUEEN_NE, T.TI_RQUEEN_ANE, T.TI_REGG_AN, T.TI_RQUEEN_ANE],

		in: [2, '2S3E'],

		failOn: () => hasMonster(C.M_ROACH_EGG)
	})

	// Second Level 3N -- Clear the room without turning your sword
	addAchievement(to, {
		id: '5ff967a6354cd8fc86f5573b6f15baa8',
		name: 'achievement.name.l2.3n',
		description: 'achievement.description.l2.3n',

		icon: ['Deep Spaces', T.TI_BEETHRO_SWORD_NW, 0, 0, T.TI_BEETHRO_NW],

		in: [2, '3N'],

		failOn: data => data.hasTurnedSword
	})

	// Third Level 2N -- Reach the scroll without reentering the room
	addAchievement(to, {
		id: 'be87af484a2b27199cfd29132454682a',
		name: 'achievement.name.l3.2n',
		description: 'achievement.description.l3.2n',

		icon: ['Deep Spaces', [[T.TI_SCROLL, 0.5, 0.5]]],

		in: [3, '2N'],

		winNeedsConquer: false,
		winOn: () => playerIn(5, 23, 5, 23),
	})

	// Third Level 1N1W -- Clear the room without drinking the potion
	addAchievement(to, {
		id: 'afc6c0d869b065e974490971da76850f',
		name: 'achievement.name.l3.1n1w',
		description: 'achievement.description.l3.1n1w',

		icon: ['Deep Spaces', [[T.TI_POTION_I, 0.5, 0.5]]],

		in: [3, '1N1W'],

		failOn: () => playerIn(25, 4, 25, 4),
	})

	// Third Level 1N2W -- Clear the room without drinking the potion
	addAchievement(to, {
		id: '1a05e10f77418da58dbfbdf3ddc9c0d8',
		name: 'achievement.name.l3.1n2w',
		description: 'achievement.description.l3.1n2w',

		icon: ['Deep Spaces', [
			[T.TI_POTION_I, 0, 8 / 22],
			[T.TI_POTION_I, 1, 14 / 22],
		]],

		in: [3, '1N2W'],

		failOn: () => playerIn(25, 4, 25, 4),
	})

	// Third Level 1N1E -- Clear the room without queens laying any eggs
	addAchievement(to, {
		id: 'c1af59a0ebd36f20d6b5766dd5c8639f',
		name: 'achievement.name.l3.1n1e',
		description: 'achievement.description.l3.1n1e',

		icon: ['Deep Spaces', [
			[-T.TI_WALL_EW, 0, -0.5],
			[-T.TI_WALL_EW, 1, -0.5],
			[-T.TI_ARROW_S, -0.5, 1.5],
			[-T.TI_ARROW_S, 0.5, 1.5],
			[-T.TI_ARROW_S, 1.5, 1.5],
			[T.TI_RQUEEN_AN, -0.5, 0.5],
			[T.TI_RQUEEN_NW, 0.5, 0.5],
			[T.TI_RQUEEN_NE, 1.5, 0.5],
		]],

		in: [3, '1N1E'],

		failOn: () => Game.spawnCycleCount >= 30
	})

	// Third Level 1S -- Solve The Eight Gates of Bill in 5 orb hits
	addAchievement(to, {
		id: 'b4579b9343d177ae0ba5d05f12366e0b',
		name: 'achievement.name.l3.1s',
		description: 'achievement.description.l3.1s',

		icon: ['Deep Spaces', [
			[T.TI_DOOR_Y_NS, -0.5, 0],
			[T.TI_DOOR_Y_NS, 1.5, 0],
			[T.TI_DOOR_Y_NS, -0.5, 1],
			[T.TI_DOOR_Y_NS, 1.5, 1],
		]],

		in: [3, '1S'],

		init: data => {
			data.$count = 0;
			return true;
		},

		update: data => {
			data.$count = data.$count ?? 0;

			data.$count += ev(C.CID_ORB_ACTIVATED_BY_PLAYER) ? 1 : 0;

			return true;
		},

		failOn: data => (data.$count ?? 0) > 5,
	})

	// Third Level 2N1E -- Release all three roaches before killing any of them
	addAchievement(to, {
		id: 'ee61633c14af918489612e96fccb1947',
		name: 'achievement.name.l3.2n1e',
		description: 'achievement.description.l3.2n1e',

		icon: ['Deep Spaces', [
			[T.TI_ROACH_AS, 0.5, 0],
			[T.TI_ROACH_ANE, 0, 1],
			[T.TI_ROACH_NW, 1, 1],
		]],

		in: [3, '2N1E'],

		failOn: () => ev(C.CID_MONSTER_DIED_FROM_STAB) && room().isMonsterInRect(3, 3, 23, 22, true),
	})

	// Third Level 3N -- Clear the room without drinking the potion or turning your sword
	addAchievement(to, {
		id: '985d28893157787e110f8583693e2187',
		name: 'achievement.name.l3.3n',
		description: 'achievement.description.l3.3n',

		icon: ['Deep Spaces', [
			[T.TI_POTION_M, -0.5, 0.5],
			[-T.TI_WALL_NS, 0.5, 0],
			[-T.TI_WALL_NS, 0.5, 1],
			[T.TI_BEETHRO_E, 1.5, 0.5],
		]],

		in: [3, '3N'],

		failOn: data => playerAt(6, 12) || data.hasTurnedSword,
	})

	// Fourth Level 1N -- Clear the room without returning to the entrance corridor
	addAchievement(to, {
		id: '234f4368d90c64ac753360b08cf5440f',
		name: 'achievement.name.l4.1n',
		description: 'achievement.description.l4.1n',

		icon: ['Deep Spaces', [
			[-T.TI_WALL_S, -16/22, 1],
			[-T.TI_WALL_S, 38/22, 1],
			[T.TI_BEETHRO_SWORD_N, 0.5, 0],
			[T.TI_BEETHRO_N, 0.5, 1],
		]],

		in: [4, '1N'],

		init: data => {
			data.$started = false;
			return true;
		},

		update: data => {
			if (!playerIn(7, 16, 9, 24)) {
				data.$started = true;
			}

			return true;
		},

		failOn: data => !!data.$started && playerIn(7, 16, 9, 24),
	})

	// Fourth Level 1S1E -- Clear without drinking the mimic potion
	addAchievement(to, {
		id: '4edaf7c04cf584ffa50f52962012e422',
		name: 'achievement.name.l4.1s1e',
		description: 'achievement.description.l4.1s1e',

		icon: ['Deep Spaces', [[T.TI_POTION_M, 0.5, 0.5],]],

		in: [4, '1S1E'],

		failOn: data => playerAt(13, 10),
	})

	// Fourth Level 1S2E -- Drop all trapdoors in and clear the room on the same visit
	addAchievement(to, {
		id: 'bea4dce8ad52b7f5d416e99afd254cff',
		name: 'achievement.name.l4.1s2e',
		description: 'achievement.description.l4.1s2e',

		icon: ['Deep Spaces', [[-T.TI_TRAPDOOR, 0.5, 0.5],]],

		in: [4, '1S2E'],

		winOn: () => room().trapdoorsLeft === 0 && playerAtEdge()
	})

	// Fourth Level 2S1E -- Drop all trapdoors in and clear the room on the same visit
	addAchievement(to, {
		id: '0d32fd1503f8bef4d5372cbe679ed3a9',
		name: 'achievement.name.l4.2s1e',
		description: 'achievement.description.l4.2s1e',

		icon: ['Deep Spaces', -T.TI_TRAPDOOR, -T.TI_TRAPDOOR, -T.TI_TRAPDOOR, -T.TI_TRAPDOOR],

		in: [4, '2S1E'],

		winOn: () => room().trapdoorsLeft === 0
	})

	// Fourth Level 2E -- Have good style (line up the mimics)
	addAchievement(to, {
		id: '26c2f7f735be844d3c0cce3c0bff2eee',
		name: 'achievement.name.l4.2e',
		description: 'achievement.description.l4.2e',

		icon: ['Deep Spaces', [
			[T.TI_MIMIC_W, 1, -0.5],
			[T.TI_MIMIC_W, 1, 0.5],
			[T.TI_MIMIC_W, 1, 1.5],
			[T.TI_MIMIC_SWORD_W, 0, -0.5],
			[T.TI_MIMIC_SWORD_W, 0, 0.5],
			[T.TI_MIMIC_SWORD_W, 0, 1.5],
		]],

		in: [4, '2E'],

		winOn: () => hasMonsterAt(7, 8, C.M_MIMIC)
			&&  hasMonsterAt(7, 9, C.M_MIMIC)
			&&  hasMonsterAt(7, 10, C.M_MIMIC)
			&&  hasMonsterAt(7, 11, C.M_MIMIC)
			&&  hasMonsterAt(7, 12, C.M_MIMIC)
			&&  hasMonsterAt(7, 13, C.M_MIMIC)
			&&  hasMonsterAt(7, 14, C.M_MIMIC)
			&&  hasMonsterAt(7, 15, C.M_MIMIC)
			&&  hasMonsterAt(7, 16, C.M_MIMIC)
	})

	// ::::::::::::::::::::::::::::::::::::::::::::::
	// :: Common Challenges
	// ::::::::::::::::::::::::::::::::::::::::::::::

	AchievementFactory.levelCleared(to, 1, "1/4");
	AchievementFactory.levelCleared(to, 2, "2/4");
	AchievementFactory.levelCleared(to, 3, "3/4");
	AchievementFactory.levelCleared(to, 4, "4/4");

	AchievementFactory.masterHold(to);
	AchievementFactory.postMasterHold(to, 5, "1S", 18, 8);

	AchievementFactory.tuningFork_inSequence(to, 3);

	AchievementFactory.monsterKills(to, C.M_ROACH, T.TI_ROACH_N, 823);
	AchievementFactory.monsterKills(to, C.M_QROACH, T.TI_RQUEEN_ANW, 131);
	AchievementFactory.monsterKills(to, C.M_ROACH_EGG, T.TI_REGG_W, 3);
	AchievementFactory.monsterKills(to, C.M_EYE, T.TI_EEYE_NW, 53);
	AchievementFactory.monsterKills(to, C.M_WWING, T.TI_WWING_ANW, 4);

	AchievementFactory.rooms(to, 47);
	AchievementFactory.allKills(to, 1103);
	AchievementFactory.trapdoors(to, 'Foundation', 51);
	AchievementFactory.steps(to, 3701);
	AchievementFactory.undo(to, 367);
	AchievementFactory.deaths(to, 139);
}