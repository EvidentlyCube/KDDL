import { T } from 'src/T';
import { ASSERT } from "../../ASSERT";
import { C } from "../../C";
import { Level } from "../global/Level";
import { Progress } from "../global/Progress";
import { Achievement } from "./Achievement";
import { AchievementFactory, AchievementHelpers, addAchievement } from "./AchievementHelpers";

const {
	countTrapdoors,
	ev,
	roomO,
	evKilled,
	hasMonster,
} = AchievementHelpers;


export function AchievementsListTAP(to: Achievement[]) {
	ASSERT(to);

	// In "Inside The Palace: Entrance" drop all but one trapdoor and leave the room
	addAchievement(to, {
		id: '79245a4e48623872931f7c796ed81186',
		name: "achievement.name.l2.entrance",
		description: "achievement.description.l2.entrance",
		in: [2, 'Entrance'],
		initOnConquered: true,

		icon: ['Deep Spaces', 0, T.TI_BEETHRO_S, -T.TI_TRAPDOOR, T.TI_BEETHRO_SWORD_S],

		winNeedsConquer: false,
		winOn: () => countTrapdoors() === 1 && AchievementHelpers.playerAtEdge(),
	})

	// Inside The Palace: 1S1W -- Clear the central chamber before killing any roach queen
	addAchievement(to, {
		id: '473d009d1ced17c0d776d39e62946624',
		name: "achievement.name.l2.1s1w",
		description: "achievement.description.l2.1s1w",
		in: [2, '1S1W'],

		icon: ['Deep Spaces', T.TI_RQUEEN_NW, T.TI_BRAIN, T.TI_BRAIN_A, T.TI_RQUEEN_ASE],

		failOn: () => evKilled(C.M_ROACH_QUEEN) && hasMonster(C.M_TAR_BABY, C.M_BRAIN, C.M_EYE, C.M_EYE_ACTIVE),
	})

	// Inside The Palace: 2S1W -- Do not rotate your sword until the brains are dead, then clear the room
	addAchievement(to, {
		id: '734b65b40dedc0ab446ed6b5680c460d',
		name: "achievement.name.l2.2s1w",
		description: "achievement.description.l2.2s1w",
		in: [2, '2S1W'],

		icon: ['Deep Spaces', T.TI_BRAIN_A, T.TI_BEETHRO_SW, T.TI_BEETHRO_SWORD_SW, T.TI_BRAIN],

		failOn: data => (evKilled(C.M_BRAIN) || hasMonster(C.M_BRAIN)) && data.swordTurnCount > 0,
	});

	// Inside The Palace: 2S1E -- Close the door after killing the serpent, then clear the room
	addAchievement(to, {
		id: '6701011a39d660174b425faf8130e891',
		name: "achievement.name.l2.2s1e",
		description: "achievement.description.l2.2s1e",
		in: [2, '2S1E'],

		icon: ['Deep Spaces', T.TI_EEYE_E, T.TI_SNKT_N, T.TI_EEYE_AE, T.TI_SNKH_S],

		failOn: () => (hasMonster(C.M_SERPENT_R) || ev(C.CID_SNAKE_DIED_FROM_TRUNCATION))
			&& roomO(19, 12) === C.T_DOOR_Y,
	});

	// Treasure Chambers: 1N1E -- Kill all serpents before killing any other monster
	addAchievement(to, {
		id: 'b7a90e0c48205aa691185a2fdb76551e',
		name: "achievement.name.l6.1n1e",
		description: "achievement.description.l6.1n1e",
		in: [6, '1N1E'],

		icon: ['Aboveground', T.TI_TARBABY_N, T.TI_ROACH_N, T.TI_WWING_N, T.TI_GOBLIN_N],

		failOn: () => ev(C.CID_MONSTER_DIED_FROM_STAB) && hasMonster(C.M_SERPENT_R),
	});

	addAchievement(to, {
		id: '0c7df412091fa4a65ee0597c97e7d71e',
		name: "achievement.name.l5.1n",
		description: "achievement.description.l5.1n",
		in: 5,

		icon: ['Fortress', [[T.TI_CHECKPOINT, 0.5, 0.5]]],

		initOnConquered: true,
		winNeedsConquer: false,
		winOn: () => {
			const levelId = Level.getLevelIdByOrderIndex(5);
			const roomId = Level.getRoomIdByOffsetInLevel(levelId, 0, -1);

			return Progress.wasRoomEverConquered(roomId);
		},
	})

	AchievementFactory.levelCleared(to, 7, 'Scroll');
	AchievementFactory.levelCleared(to, 1, '1/5');
	AchievementFactory.levelCleared(to, 2, '2/5');
	AchievementFactory.levelCleared(to, 3, '3/5');
	AchievementFactory.levelCleared(to, 4, '4/5');
	AchievementFactory.levelCleared(to, 6, '5/5');

	AchievementFactory.masterHold(to);

	AchievementFactory.tuningFork_inSequence(to, 4);

	AchievementFactory.monsterKills(to, C.M_BRAIN, T.TI_BRAIN, 21);
	AchievementFactory.monsterKills(to, C.M_ROACH, T.TI_ROACH_N, 19);
	AchievementFactory.monsterKills(to, C.M_EYE, T.TI_EEYE_NW, 103);
	AchievementFactory.monsterKills(to, C.M_WRAITHWING, T.TI_WWING_ANW, 4);
	AchievementFactory.monsterKills(to, C.M_TAR_MOTHER, 0, 15);
	AchievementFactory.monsterKills(to, C.M_SERPENT_R, 0, 46);
	AchievementFactory.monsterKills(to, C.M_ROACH_QUEEN, T.TI_RQUEEN_ANW, 23);
	AchievementFactory.monsterKills(to, C.M_TAR_BABY, T.TI_TARBABY_NW, 100);
	AchievementFactory.monsterKills(to, C.M_GOBLIN, T.TI_GOBLIN_NW, 17);


	AchievementFactory.rooms(to, 49);
	AchievementFactory.allKills(to, 873);
	AchievementFactory.trapdoors(to, 'Foundation', 373);
	AchievementFactory.steps(to, 2953);
	AchievementFactory.undo(to, 241);
	AchievementFactory.deaths(to, 59);
	AchievementFactory.cutTar(to, 37);
}