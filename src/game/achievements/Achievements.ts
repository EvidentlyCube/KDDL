import { Achievement, EncodedAchievement } from "./Achievement";
import { TGrowlAchievement } from "../windows/TGrowlAchievement";
import { HoldOptions } from "../../platform/PlatformSpecific";
import { PermanentStore } from "../global/store/PermanentStore";
import { HoldInfo } from "src/S";

const _allAchievements: Achievement[] = [];
const _activeAchievements: Achievement[] = [];
const _uncompletedAchievements: Achievement[] = [];

export class Achievements {
	public static getAll(): ReadonlyArray<Achievement> {
		return _allAchievements;
	}

	public static getActive(): ReadonlyArray<Achievement> {
		return _activeAchievements;
	}

	public static init(holdOptions: HoldOptions) {
		_allAchievements.length = 0;
		_activeAchievements.length = 0;
		_uncompletedAchievements.length = 0;

		holdOptions.achievementsSetter(_allAchievements);


		const ids = new Set();
		for (const ach of _allAchievements) {
			if (!ach.id) {
				throw new Error(`Achievement ${ach.name} has no ID`);
			} else if (ids.has(ach.id)) {
				throw new Error(`Achievement ${ach.name} has the same ID as another achievement`);
			}

			ids.add(ach.id);
		}

		Achievements.loadAchievements();

		for (const achievement of _allAchievements) {
			if (!achievement.acquired) {
				_uncompletedAchievements.push(achievement);
			}
		}
	}

	private static saveAchievements() {
		PermanentStore.holds[HoldInfo().id].achievements.write(_allAchievements.map(x => x.encode()));
	}

	private static loadAchievements() {
		try {
			const encodedAchievements = PermanentStore.holds[HoldInfo().id].achievements.read();

			const achievementMap = new Map<string, EncodedAchievement>();

			for (const encodedAchievement of encodedAchievements) {
				achievementMap.set(encodedAchievement.id, encodedAchievement);
			}

			_allAchievements.forEach((achievement, index) => {
				achievement.decode(achievementMap.get(achievement.id));
			});

		} catch (e: any) {
			for (const a of _allAchievements) {
				a.clear();
			}

			console.log("Achievements load failed: ", e.errorID, e.name, e.message);
		}
	}

	public static initRoomStarted() {
		_activeAchievements.length = 0;

		Achievements.saveAchievements();

		for (const achievement of _allAchievements) {
			if (!achievement.acquired && achievement.init()) {
				_activeAchievements.push(achievement);
			}
		}
	}

	public static turnPassed() {
		const completed: Achievement[] = [];

		for (const achievement of _activeAchievements) {
			if (!achievement.acquired && achievement.update()) { // returns true if it was completed
				completed.push(achievement);
			}
		}

		if (completed) {
			for (const achievement of completed) {
				Achievements.markAchievementCompleted(achievement);
			}
		}
	}

	public static clearAll() {
		for (const achievement of _allAchievements) {
			achievement.clear();
		}
	}

	public static isActive(achievement: Achievement): boolean {
		return _activeAchievements.indexOf(achievement) !== -1;
	}

	public static markAchievementCompleted(achievement: Achievement) {
		achievement.acquired = true;

		new TGrowlAchievement(achievement);

		Achievements.saveAchievements();
	}
}