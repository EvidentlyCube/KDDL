import { HoldId } from "src/C";
import { S } from "../../S";
import { boolAttr, intAttr } from "../../XML";
import { Achievements } from "../achievements/Achievements";
import { Level } from "./Level";
import { Progress } from "./Progress";
import { getEmptyHoldScores, PermanentStore } from "./store/PermanentStore";

const VISIT_ROOM_VALUE = 1;
const CONQUER_ROOM_VALUE = 5;
const ACHIEVEMENT_VALUE = 10;

export type HoldScores = Record<HoldId, number>;

let holdScores: HoldScores = getEmptyHoldScores();

const SAVE_NAME = 'global-score';

export const GlobalHoldScore = {
	calculateCurrentHoldScore() {
		const allRoomsIds = Level.getAllRooms().map(room => intAttr(room, 'RoomID'));
		const allRequiredRoomsIds = Level.getAllRooms()
			.filter(xml => boolAttr(xml, 'IsRequired', false))
			.map(room => intAttr(room, 'RoomID'));
		const totalRooms = allRoomsIds.length;
		const totalRequiredRooms = allRequiredRoomsIds.length;
		const totalAchievements = Achievements.getAll().length;

		const visitedRooms = allRoomsIds.reduce((total, roomId) => {
			return Progress.wasRoomEverVisited(roomId) ? total + 1 : total;
		}, 0);
		const conqueredRooms = allRequiredRoomsIds.reduce((total, roomId) => {
			return Progress.wasRoomEverConquered(roomId) ? total + 1 : total;
		}, 0);
		const doneAchievements = Achievements.getAll().reduce((total, achievement) => {
			return achievement.acquired ? total + 1 : total;
		}, 0);

		const maxScore = totalRooms * VISIT_ROOM_VALUE
			+ totalRequiredRooms * CONQUER_ROOM_VALUE
			+ totalAchievements * ACHIEVEMENT_VALUE;
		const score = visitedRooms * VISIT_ROOM_VALUE
			+ conqueredRooms * CONQUER_ROOM_VALUE
			+ doneAchievements * ACHIEVEMENT_VALUE;

		return maxScore > 0 ? score / maxScore : 0;
	},

	updateHoldScore() {
		const holdOptions = S.currentHoldOptions;

		if (!holdOptions) {
			throw new Error("Hold options are not yet loaded");
		}

		holdScores[holdOptions.id] = GlobalHoldScore.calculateCurrentHoldScore();
		PermanentStore.shared.holdScore.write({...holdScores});
	},

	loadHoldScores() {
		try {
			holdScores = PermanentStore.shared.holdScore.read();
		} catch (e) {
			holdScores = getEmptyHoldScores();
		}
	},
	getScore(holdName: HoldId): number {
		return holdScores[holdName] || 0;
	},
};