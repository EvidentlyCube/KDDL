import * as PIXI from 'pixi.js';

import {RecamelEffectScreen} from "./RecamelEffectScreen";
import {RecamelCore} from "../core/RecamelCore";
import {RecamelDisplay} from "../core/RecamelDisplay";
import {RecamelEffectEndCallback} from "./RecamelEffect";
import {S} from "../../../../../src/S";

export class RecamelEffectScreenshot extends RecamelEffectScreen {
	private readonly _texture: PIXI.RenderTexture;
	private readonly _screenshot: PIXI.Sprite;

	public get screenshot(): PIXI.Sprite {
		return this._screenshot;
	}

	public constructor(
		duration: number = Number.MAX_VALUE,
		callback: RecamelEffectEndCallback | undefined = undefined,
	) {
		super(duration, callback);

		this._texture = PIXI.RenderTexture.create(S.SIZE_GAME_WIDTH, S.SIZE_GAME_HEIGHT);

		const oldScale = RecamelDisplay.application.scale.x;
		RecamelDisplay.application.scale.set(1, 1);
		(RecamelCore.app.renderer as PIXI.Renderer).render(RecamelDisplay.application, this._texture, true);
		RecamelDisplay.application.scale.set(oldScale, oldScale);

		this._screenshot = new PIXI.Sprite(this._texture);

		this.layer.add2(this._screenshot);
	}

	public update() {
		this.moveForward();
	}

	public moveForward() {
		RecamelDisplay.removeLayer(this.layer);
		RecamelDisplay.addLayer(this.layer);
	}

	/**
	 * Stops and removes this effect
	 */
	public stop = () => {
		this.finish();
	}
	public finish() {
		super.finish();

		this._texture.destroy(true);
	}
}
