import * as PIXI from 'pixi.js';
import {RecamelEffect, RecamelEffectEndCallback} from "./RecamelEffect";
import {RecamelGroup} from "../core/RecamelGroup";
import {RecamelObject} from "../objects/RecamelObject";

export class RecamelEffectFade extends RecamelEffect {
	private readonly _alphaFrom: number;
	private readonly _alphaTo: number;

	private readonly _toFade: PIXI.DisplayObject;

	public constructor(
		toFade: PIXI.DisplayObject,
		alphaFrom: number = 1,
		alphaTo: number = 1,
		duration: number = 200,
		callback: RecamelEffectEndCallback | undefined = undefined,
		addTo: RecamelGroup<RecamelObject> | undefined = undefined,
	) {
		super(duration, callback, addTo);

		this._toFade = toFade;

		this._alphaFrom = alphaFrom;
		this._alphaTo = alphaTo;

		this._toFade.visible = true;

		this.update();
	}

	public update() {
		if (RecamelEffect._blocked) {
			return this.blockUpdate();
		}

		this._toFade.visible = true;
		this._toFade.alpha = this._alphaFrom + (this._alphaTo - this._alphaFrom) * this.interval;

		super.update();
	}

	protected finish() {
		if (this._alphaTo == 0) {
			this._toFade.visible = false;
		}

		super.finish();
	}

	public skip() {
		this._toFade.alpha = this._alphaTo;
		this.finish();
	}
}
