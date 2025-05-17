import * as PIXI from 'pixi.js';
import {RecamelEffectScreen} from "./RecamelEffectScreen";
import {RecamelEffect, RecamelEffectEndCallback} from "./RecamelEffect";
import {S} from "../../../../../src/S";

export class RecamelEffectFadeScreen extends RecamelEffectScreen {
	private readonly _alphaFrom: number;
	private readonly _alphaTo: number;

	private readonly _background: PIXI.Graphics;

	public constructor(
		alphaFrom: number = 1,
		alphaTo: number = 1,
		color: number = 0,
		duration: number = 200,
		callback: RecamelEffectEndCallback | undefined = undefined,
	) {
		super(duration, callback);

		this._background = new PIXI.Graphics();
		this._background.beginFill(color, 1);
		this._background.drawRect(0, 0, S.SIZE_GAME_WIDTH, S.SIZE_GAME_HEIGHT);
		this._background.endFill();

		this.layer.add(this._background);

		this._alphaFrom = alphaFrom;
		this._alphaTo = alphaTo;

		this.update();
	}

	public update() {
		if (RecamelEffect._blocked) {
			return this.blockUpdate();
		}

		this.layer.alpha = 1 - this._alphaFrom - (this._alphaTo - this._alphaFrom) * this.interval;

		super.update();
	}

	protected finish() {
		super.finish();
	}
}
