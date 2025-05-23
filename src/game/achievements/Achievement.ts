import { Texture } from "pixi.js";
import { BitmapDataWritable } from "../../C";
import { F } from "../../F";
import { Game } from "../global/Game";
import { TStateGame } from "../states/TStateGame";
import { AchievementIconSource, AchievementRenderer } from "./AchievementRenderer";
import { Achievements } from "./Achievements";

export type AchievementDescription = string | ((achievement: Achievement) => string);
type AchievementDrawFunction = (bd: BitmapDataWritable) => void;

export interface AchievementData {
	failed: boolean;
	fakeActive: boolean;
	fakeInactive: boolean;
	hasMovedDiagonally: boolean;
	hasMovedOrthogonally: boolean;
	hasTurnedSword: boolean;
	checkMovedDiagonal: boolean;
	checkMovedOrthogonally: boolean;
	checkSwordTurn: boolean;
	swordTurnCount: number;
	lastTurn: number;

	$count?: number;
	$coords?: number[];
	$markedForConquer?: boolean;
	$started?: boolean;
	$serpentsLeft?: number;
	$kills?: number;
	$isStrikingOrb?: boolean;
	$strikingOrbCombo?: number;
	$lastRoom?: number;
	$roomCoords?: string[];

	[key: string]: number|boolean|boolean[]|number[]|string[]|undefined;
}

export interface EncodedAchievement {
	id: string;
	acquired: boolean;
	data: AchievementData;
}

export class Achievement {
	public name: string;
	public desc: AchievementDescription;

	public acquired: boolean = false;

	public id: string;

	private _texture?: Texture;

	/**
	 * Three param function (bitmapData, x:number, y:number) which draws
	 * this achievement's graphic into a given bitmapData
	 */
	private _iconSource: AchievementIconSource;

	/**
	 * No-param function which returns true if this achievement should be activated
	 */
	private _init: (self: Achievement) => boolean;

	/**
	 * No-param function which returns true if this achievement has been acquired
	 */
	private _update: (self: Achievement) => boolean;

	public _data: AchievementData = {
		failed: false,
		fakeActive: false,
		fakeInactive: false,
		hasMovedDiagonally: false,
		hasMovedOrthogonally: false,
		hasTurnedSword: false,
		checkMovedDiagonal: true,
		checkMovedOrthogonally: true,
		checkSwordTurn: true,
		swordTurnCount: 0,
		lastTurn: 0,
	};

	public get isRunning(): boolean {
		if (this._data.fakeInactive) {
			return false;
		}

		return Achievements.isActive(this) || this._data.fakeActive;
	}

	public get texture() {
		return this._texture
			?? (this._texture = AchievementRenderer.getAchievementTexture(this.id, this._iconSource));
	}

	public constructor() {
		this.id = '';
		this.desc = '';
		this.name = '';
		this._iconSource = ['default', 0, 0, 0, 0];
		this._init = () => false;
		this._update = () => false;
	}

	/**
	 * Called when progress does not load successfully
	 */
	public clear() {
		this._data = {
			failed: false,
			fakeActive: false,
			fakeInactive: false,
			hasMovedDiagonally: false,
			hasMovedOrthogonally: false,
			hasTurnedSword: false,
			checkMovedDiagonal: true,
			checkMovedOrthogonally: true,
			checkSwordTurn: true,
			swordTurnCount: 0,
			lastTurn: 0,
			$markedForConquer: false
		};
		this.acquired = false;
	}

	/**
	 * Checks if given achievement relates to this room
	 * @return True if this achievement relates to current room
	 */
	public init(): boolean {
		this._data.failed = false;
		this._data.fakeActive = false;
		this._data.fakeInactive = false;
		this._data.hasMovedDiagonally = false;
		this._data.hasMovedOrthogonally = false;
		this._data.hasTurnedSword = false;
		this._data.checkMovedDiagonal = true;
		this._data.checkMovedOrthogonally = true;
		this._data.checkSwordTurn = true;
		this._data.swordTurnCount = 0;
		this._data.lastTurn = 0;
		if (this._data.$markedForConquer === true) {
			this._data.$markedForConquer = false;
		}

		return this._init(this);
	}

	/**
	 * Checks if given achievement was completed on this turn
	 * @return True if this achievement has just been completed
	 */
	public update(): boolean {
		if (this._data.failed) {
			return false;
		}

		if (this._data.checkMovedDiagonal && F.isCommandMoveDiagonal(TStateGame.lastCommand)) {
			this._data.hasMovedDiagonally = true;
		}
		if (this._data.checkMovedOrthogonally && F.isCommandMoveOrthogonal(TStateGame.lastCommand)) {
			this._data.hasMovedOrthogonally = true;
		}
		if (this._data.checkSwordTurn && F.isCommandRotate(TStateGame.lastCommand)) {
			this._data.hasTurnedSword = true;
		}

		if (F.isCommandRotate(TStateGame.lastCommand)) {
			this._data.swordTurnCount++;
		}

		const result = this._update(this);

		this._data.lastTurn = Game.turnNo;

		if (this._data.failed) {
			return false;
		}

		return result;
	}

	public encode(): EncodedAchievement {
		return {
			id: this.id,
			acquired: this.acquired,
			data: this._data
		};
	}

	/**
	 * Decodes achievement status and returns true if the data was valid or false if it was invalid
	 */
	public decode(data: EncodedAchievement | undefined): boolean {
		if (!data || data.id !== this.id) {
			return false;
		}

		this._data = data.data;

		this.acquired = data.acquired;

		return true;
	}

	public static get(
		name: string,
		desc: AchievementDescription,
		id: string,
		iconSource: AchievementIconSource,
		init: (self: Achievement) => boolean,
		update: (self: Achievement) => boolean,
	): Achievement {
		const achievement: Achievement = new Achievement();

		achievement.name = name;
		achievement.desc = desc;
		achievement.id = id;

		achievement._iconSource = iconSource;
		achievement._init = init;
		achievement._update = update;

		return achievement;
	}
}
