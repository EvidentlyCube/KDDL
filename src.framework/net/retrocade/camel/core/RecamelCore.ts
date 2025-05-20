import * as PIXI from 'pixi.js';
import { RecamelGroup } from "./RecamelGroup";
import { RecamelObject } from "../objects/RecamelObject";
import { RecamelState } from "./RecamelState";
import { RecamelDisplay } from "./RecamelDisplay";
import { RecamelTooltip } from "./RecamelTooltip";
import { RecamelWindowManager } from "./RecamelWindowManager";
import RawInput from "../../../../../src.tn/RawInput";
import { UtilsRandom } from "../../utils/UtilsRandom";
import { Sfx } from "../../../../../src/game/global/Sfx";
import { Core } from 'src/game/global/Core';

export class RecamelCore {
	/**
	 * Time spent since last step
	 */
	private static _deltaTime: number = 0;

	/**
	 * Time which passed since last step
	 */
	public static get deltaTime(): number {
		return RecamelCore._deltaTime;
	}


	// ::::::::::::::::::::::::::::::::::::::::::::::
	// :: Global update groups
	// ::::::::::::::::::::::::::::::::::::::::::::::

	/**
	 * Global updates group which is always updated before anything else
	 */
	private static _groupBefore: RecamelGroup<RecamelObject> = new RecamelGroup();

	/**
	 * Retrieves global updates group which is always updated before everything else
	 */
	public static get groupBefore(): RecamelGroup<RecamelObject> {
		return RecamelCore._groupBefore;
	}

	/**
	 * Global updates group which is always updated after anything else
	 */
	private static _groupAfter: RecamelGroup<RecamelObject> = new RecamelGroup();

	/**
	 * Retrieves global updates group which is always updated after everything else
	 */
	public static get groupAfter(): RecamelGroup<RecamelObject> {
		return RecamelCore._groupAfter;
	}


	/**
	 * Time of last enter frame
	 */
	private static _lastTime: number = 0;

	/**
	 * Currently displayed state
	 */
	private static _currentState: RecamelState;

	/**
	 * Retrieves current state
	 */
	public static get currentState(): RecamelState {
		return RecamelCore._currentState;
	}

	public static errorCallback: (error: any) => void;

	public static app: PIXI.Application;

	public static get renderer(): PIXI.Renderer {
		const { renderer } = RecamelCore.app;

		if (!(renderer instanceof PIXI.Renderer)) {
			throw new Error("rendered has incorrect type");
		}

		return renderer;
	}
	/**
	 * Initialzes the whole game
	 */
	public static init(app: PIXI.Application, main: PIXI.Container) {
		RecamelDisplay.initialize(main);
		RecamelCore.app = app;

		app.ticker.add(RecamelCore.onEnterFrame);
		document.addEventListener('pointermove', RecamelCore.onMouseMove);

		UtilsRandom.setSeed(Math.max(Date.now(), 1));
	}


	// ::::::::::::::::::::::::::::::::::::::::::::::
	// :: State Manipulation
	// ::::::::::::::::::::::::::::::::::::::::::::::

	/**
	 * Changes the current state
	 * @param state State to be set
	 */
	public static setState(state: RecamelState) {
		if (RecamelCore._currentState) {
			RecamelCore._currentState.destroy();
		}

		RecamelCore._currentState = state;
		RecamelCore._currentState.create();
	}

	private static fpsCounter: number = 0;

	private static onEnterFrame() {
		if (RecamelCore.errorCallback != null) {
			try {
				RecamelCore.onEnterFrameSub();
			} catch (error) {
				RecamelCore.errorCallback(error);
			}
		} else {
			RecamelCore.onEnterFrameSub();
		}
	}

	private static onEnterFrameSub() {
		let repeats: number = 1;

		RecamelCore.fpsCounter = Date.now();

		while (repeats--) {
			RecamelTooltip.update();
			Sfx.update();

			RecamelCore._deltaTime = Date.now() - RecamelCore._lastTime;
			RecamelCore._lastTime = Date.now();

			RecamelWindowManager.update();

			RecamelCore._groupBefore.update();
			if (RecamelCore._currentState && !RecamelWindowManager.pauseGame) {
				RecamelCore._currentState.update();
			}
			RecamelCore._groupAfter.update();

			RawInput.update();
		}

		if (Date.now() - RecamelCore.fpsCounter > 14) {
			RecamelCore.fpsCounter = Date.now();
		}
	}

	private static onMouseMove() {
		Core.mouseVisibility(true);
	}
}
