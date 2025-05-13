import * as PIXI from 'pixi.js';
import {RecamelWindowManager} from "./RecamelWindowManager";
import {S} from "../../../../../src/S";

export class RecamelWindow extends PIXI.Container {
	/**
	 * Should this window block input to all underlying windows?
	 */
	protected _blockUnder = true;

	public get blockUnder(): boolean {
		return this._blockUnder;
	}

	/**
	 * Should the game be paused when this window is displayed?
	 */
	protected _pauseGame = true;

	public get pauseGame(): boolean {
		return this._pauseGame;
	}


	// ::::::::::::::::::::::::::::::::::::::::::::::
	// :: Helpers
	// ::::::::::::::::::::::::::::::::::::::::::::::

	/**
	 * HELPER: Value of this.interactiveChildren before block
	 */
	private _lastInteractiveChildren? = true;

	/**
	 * HELPER: Value of this.interactive before block
	 */
	private _lastInteractive? = true;

	private _isBlocked = false;

	public get isBlocked(): boolean {
		return this._isBlocked;
	}


	/**
	 * Adds the window to display and show it
	 */
	public show(): void {
		RecamelWindowManager.addWindow(this);
	}

	/**
	 * Remove the window from the display
	 */
	public close() {
		this.cacheAsBitmap = false;
		RecamelWindowManager.removeWindow(this);
	}

	/**
	 * Called by windows manager when window above it blocks this one
	 */
	public block(): void {
		if (this._isBlocked) {
			return;
		}

		this._isBlocked = true;
		this._lastInteractiveChildren = this.interactiveChildren;
		this._lastInteractive = this.interactive;

		this.interactiveChildren = false;
		this.interactive = false;
	}

	public unblock(): void {
		if (!this._isBlocked) {
			return;
		}

		this._isBlocked = false;
		this.interactiveChildren = this._lastInteractiveChildren;
		this.interactive = this._lastInteractive;
	}

	public center(): void {
		this.x = (S.SIZE_GAME_WIDTH - this.getLocalBounds().width) / 2 | 0;
		this.y = (S.SIZE_GAME_HEIGHT - this.getLocalBounds().height) / 2 | 0;
	}

	public update(): void {
	}
}
