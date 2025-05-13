import {RecamelEffect, RecamelEffectEndCallback} from "../../../src.framework/net/retrocade/camel/effects/RecamelEffect";
import {NutkaMusic} from "../../../src.evidently_audio/NutkaMusic";

export class TEffMusicCrossFade extends RecamelEffect {

	private _channel: NutkaMusic;
	private _volume: number;
	private _fadeIn: boolean;

	private _volumeOnInvert: number = 1;

	public constructor(channel: NutkaMusic, fadeIn: boolean, volume: number = 1,
	                   duration: number = 500, callback?: RecamelEffectEndCallback,
	) {
		super(duration, callback);

		this._channel = channel;
		this._fadeIn = fadeIn;

		this._volume = volume;

		this.updateVolume();
	}

	public update() {
		this.updateVolume();

		super.update();
	}

	private updateVolume() {
		if (this._fadeIn) {
			this._channel.volume = this.interval * this._volume * this._volumeOnInvert;
		} else {
			this._channel.volume = this._volume * this._volumeOnInvert - this.interval * this._volume * this._volumeOnInvert;
		}
	}

	protected finish() {
		if (!this._fadeIn) {
			this._channel.stop();
		}

		super.finish();
	}

	public invertOrStop(): TEffMusicCrossFade | undefined {
		if (this._fadeIn) {
			return this.invert();

		} else {
			this.finish();
		}

		return undefined;
	}

	public invert(): TEffMusicCrossFade | undefined {
		if (!this._fadeIn) {
			return undefined;
		}

		this._volumeOnInvert = this.interval;
		const effect: TEffMusicCrossFade = new TEffMusicCrossFade(this._channel, false, this._volume,
			this.duration, this.callback);

		effect._volumeOnInvert = this._volumeOnInvert;
		this.finish();

		return effect;
	}

	public stop() {
		if (this._fadeIn) {
			this._channel.stop();
		}

		this.finish();
	}

}

