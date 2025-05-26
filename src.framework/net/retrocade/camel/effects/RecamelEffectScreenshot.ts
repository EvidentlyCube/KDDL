import {RecamelEffectScreen} from "./RecamelEffectScreen";
import {RecamelCore} from "../core/RecamelCore";
import {RecamelDisplay} from "../core/RecamelDisplay";
import {RecamelEffectEndCallback} from "./RecamelEffect";
import {S} from "../../../../../src/S";
import { RenderTexture, Sprite } from "pixi.js";

export class RecamelEffectScreenshot extends RecamelEffectScreen {
	private readonly _texture: RenderTexture;
	private readonly _screenshot: Sprite;

	public get screenshot(): Sprite {
		return this._screenshot;
	}

	public constructor(
		duration: number = Number.MAX_VALUE,
		callback: RecamelEffectEndCallback | undefined = undefined,
	) {
		super(duration, callback);

		this._texture = RenderTexture.create({
			width: S.SIZE_GAME_WIDTH,
			height: S.SIZE_GAME_HEIGHT
		});

		const oldScale = RecamelDisplay.application.scale.x;
		RecamelDisplay.application.scale.set(1, 1);
		RecamelCore.renderer.render(RecamelDisplay.application, {
			renderTexture: this._texture,
			clear: true
		});
		RecamelDisplay.application.scale.set(oldScale, oldScale);

		this._screenshot = new Sprite(this._texture);

		this.layer.add(this._screenshot);
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
