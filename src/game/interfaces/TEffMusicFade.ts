import {RecamelEffect, RecamelEffectEndCallback} from "../../../src.framework/net/retrocade/camel/effects/RecamelEffect";
import {NutkaMusic} from "../../../src.evidently_audio/NutkaMusic";

export class TEffMusicFade extends RecamelEffect {

	public readonly channel: NutkaMusic;
	private _volumeFrom: number;
	private _volumeTo: 1 | 0;

	public constructor(channel: NutkaMusic, to: 1 | 0 = 1, duration: number = 500, callback?: RecamelEffectEndCallback,
	) {
		super(duration * Math.abs(to - channel.volume), callback);

		this.channel = channel;
		this._volumeFrom = channel.volume;
		this._volumeTo = to;

		this.updateVolume();
	}

	public update() {
		this.updateVolume();

		super.update();
	}

	private updateVolume() {
		this.channel.volume = this._volumeFrom + (this._volumeTo - this._volumeFrom) * this.interval;
	}

	public toFadeOut(duration: number) {
		if (this._volumeTo === 0 && duration > this.duration) {
			return this;
		}

		const fade = new TEffMusicFade(this.channel, 0, duration, this.callback);
		this.stop();
		return fade;
	}

	public toFadeIn(duration: number) {
		if (this._volumeTo === 1 && duration > this.duration) {
			return this;
		}

		const fade = new TEffMusicFade(this.channel, 1, duration, this.callback);
		this.stop();
		return fade;
	}

	protected finish() {
		if (this._volumeTo === 0) {
			this.channel.stop();
		}

		super.finish();
	}

	public endMusic() {
		this.channel.stop();
		super.finish();
	}

	public stop() {
		super.finish();
	}

}

