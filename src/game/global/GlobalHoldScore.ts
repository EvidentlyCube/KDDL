import { HoldId } from "src/C";
import { S } from "../../S";
import { boolAttr, intAttr } from "../../XML";
import { Achievements } from "../achievements/Achievements";
import { Level } from "./Level";
import { Progress } from "./Progress";
import { getEmptyHoldScores, PermanentStore } from "./store/PermanentStore";
import { DebugConsole } from "../DebugConsole";
import { UtilsString } from "src.framework/net/retrocade/utils/UtilsString"

const VISIT_ROOM_VALUE = 1;
const CONQUER_ROOM_VALUE = 5;
const ACHIEVEMENT_VALUE = 10;
const MASTERED_VALUE = 3;
const COMPLETED_VALUE = 7;

export type HoldScores = Record<HoldId, number>;

let holdScores: HoldScores = getEmptyHoldScores();

export const GlobalHoldScore = {
	calculateCurrentHoldScore() {
		const scores = GlobalHoldScore.calculateCurrentHoldScoreParts();
		const maxScore = Object.values(scores).reduce((total, score) => total + score.value * score.total, 0);
		const score = Object.values(scores).reduce((total, score) => total + score.value * score.has, 0);
		return maxScore > 0 ? score / maxScore : 0;
	},

	calculateCurrentHoldScoreParts() {
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

		return {
			visitRooms: { value: VISIT_ROOM_VALUE, has: visitedRooms, total: totalRooms },
			conquerRooms: { value: CONQUER_ROOM_VALUE, has: conqueredRooms, total: totalRequiredRooms },
			achievements: { value: ACHIEVEMENT_VALUE, has: doneAchievements, total: totalAchievements },
			completed: { value: COMPLETED_VALUE, has: Progress.isGameCompleted ? 1 : 0, total: 1 },
			mastered: { value: MASTERED_VALUE, has: Progress.isGameMastered ? 1 : 0, total: 1 },
		}
	},

	updateHoldScore() {
		const holdOptions = S.currentHoldOptions;

		if (!holdOptions) {
			throw new Error("Hold options are not yet loaded");
		}

		holdScores[holdOptions.id] = GlobalHoldScore.calculateCurrentHoldScore();
		PermanentStore.shared.holdScore.write({ ...holdScores });
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

DebugConsole.registerAction('log-global-hold-score', "Print information about the global score for the currently selected hold", () => {
	const { appendLine } = DebugConsole;
	const scoreParts = GlobalHoldScore.calculateCurrentHoldScoreParts();

	const maxScore = Object.values(scoreParts).reduce((total, score) => total + score.value * score.total, 0);
	const score = Object.values(scoreParts).reduce((total, score) => total + score.value * score.has, 0);

	const table:string[][] = [
		['NAME', 'VALUE OF 1', 'HAS', 'THIS-%', 'ALL-%']
	]
	for (const [key, score] of Object.entries(scoreParts)) {
		const { value, has, total } = score;

		table.push([
			key,
			value.toString(),
			`${has.toString().padStart(4, ' ')} / ${total.toString().padStart(4, ' ')}`,
			total > 0 ? (100 * has / total).toFixed(2) + "%" : "n/a",
			total > 0 ? (100 * has * value / maxScore).toFixed(2) + "%" : "n/a",
		]);
	}

	// Print everything
	appendLine(` ‣ **Current score** = ${score}`);
	appendLine(` ‣ **Max score** = ${maxScore}`);
	appendLine(` ‣ **Score %** = ${maxScore > 0 ? (100 * score / maxScore).toFixed(2) + "%" : "n/a"}`);

	appendLine(UtilsString.tableToFormattedString(table));
})