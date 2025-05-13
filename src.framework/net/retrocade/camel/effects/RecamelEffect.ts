import {RecamelGroup} from "../core/RecamelGroup";
import {RecamelObject} from "../objects/RecamelObject";
import {S} from "../../../../../src/S";
import {RecamelCore} from "../core/RecamelCore";

export type RecamelEffectEndCallback = (effect: RecamelEffect | undefined) => void;

export class RecamelEffect extends RecamelObject {
	/****************************************************************************************************************/
	/**                                                                                                     STATIC  */
	/****************************************************************************************************************/

	/**
	 * boolean indicating if the effects are blocked
	 */
	protected static _blocked = false;

	/**
	 * Time when the block started
	 */
	protected static _blockStarted = NaN;

	/**
	 * Blocks all effects playing
	 */
	public static block() {
		if (!RecamelEffect._blocked) {
			RecamelEffect._blocked = true;
			RecamelEffect._blockStarted = Date.now();
		}
	}

	/**
	 * Unblocks all effects
	 */
	public static unblock() {
		RecamelEffect._blocked = false;
	}


	/****************************************************************************************************************/
	/**                                                                                                  VARIABLES  */
	/****************************************************************************************************************/

	/**
	 * Duration of the effect in milliseconds
	 */
	private _duration: number;

	/**
	 * Duration of the effect in milliseconds
	 */
	public get duration(): number {
		return this._duration;
	}

	/**
	 * Time when the effect started
	 */
	private _startTime: number;

	/**
	 * Function to be called after the effect finishes
	 */
	private _callback: RecamelEffectEndCallback | undefined;

	public get callback(): RecamelEffectEndCallback | undefined {
		return this._callback;
	}

	public set callback(value) {
		this._callback = value;
	}

	/**
	 * If the object was added to the default group and has to be removed automatically
	 */
	private _addTo: RecamelGroup<RecamelObject>;

	/**
	 * If this effect is blocked
	 */
	private _isBlocked: boolean = false;


	/****************************************************************************************************************/
	/**                                                                                                  FUNCTIONS  */

	/****************************************************************************************************************/

	/**
	 * Constructor
	 * @param duration Duration of the effect in millisecs
	 * @param callback Function to be called when the effect finishes
	 * @param addTo RecamelGroup to which this effect has to be added, if null adds to current state
	 */
	public constructor(duration: number, callback: RecamelEffectEndCallback | undefined, addTo: RecamelGroup<RecamelObject> | undefined = undefined) {
		super();

		this.active = true;
		this._duration = duration;
		this._callback = callback;

		this._startTime = Date.now();
		this._addTo = addTo || RecamelCore.groupBefore;

		this._addTo.add(this);
	}

	/**
	 * Returns true if the effect is and should be finished
	 */
	private get isFinished(): boolean {
		if (S.DEBUG) {
			return true;
		}

		return this._isBlocked
			? false
			: Date.now() >= this._startTime + this._duration;
	}

	/**
	 * Update, should be overriden and then super-called. Checks if the
	 * effect is finished
	 */
	public update() {
		if (this.isFinished) {
			this.finish();
		}
	}

	/**
	 * Called when the effect has finished, calls the callback function
	 */
	protected finish() {
		this._callback?.(this);

		this._addTo.nullify(this);
	}

	/**
	 * Returns the interval of the current animation state, as a value between 0 and 1
	 */
	protected get interval(): number {
		const timer: number = Date.now();

		if (this._isBlocked) {
			this._startTime += Date.now() - RecamelEffect._blockStarted;
			this._isBlocked = false;
		}

		if (S.DEBUG) {
			return 1;
		}

		return Math.max(0, Math.min(1, (timer - this._startTime) / this._duration));
	}

	/**
	 *  Called by update() when the animation playback is blocked
	 */
	protected blockUpdate() {
		if (RecamelEffect._blocked && !this._isBlocked) {
			this._isBlocked = true;
		}
	}

	protected resetDuration(newDuration: number) {
		this._startTime = Date.now();

		this._duration = newDuration;
	}
}
