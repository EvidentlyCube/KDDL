import {NutkaDefinition} from "./NutkaDefinition";
import {NutkaLayer} from "./NutkaLayer";
import {NutkaPlayback} from "./NutkaPlayback";
import {NutkaManagedSound} from "./Interfaces";

export class NutkaMusic  implements NutkaManagedSound {
	private readonly _defaultLayer: NutkaLayer;
	private readonly _definition: NutkaDefinition;

	private _volume: number;
	private _isLooping: boolean;

	private _playback?: NutkaPlayback;
	private _resumePosition: number;

	public name = "";

	public get isPlaying() {
		return !!this._playback;
	}

	public get positionSeconds() {
		return this._playback?.positionSeconds ?? this._resumePosition;
	}

	public set positionSeconds(value: number) {
		const isPlaying = this.isPlaying;
		if (isPlaying) {
			this.stop();
		}

		this._resumePosition = Math.max(
			0, value
		);

		if (isPlaying) {
			this.play();
		}
	}

	get volume(): number {
		return this._volume;
	}

	set volume(value: number) {
		this._volume = value;
		if (this._playback) {
			this._playback.volume = value;
		}
	}

	get isLooping(): boolean {
		return this._isLooping;
	}

	set isLooping(value: boolean) {
		this._isLooping = value;
		if (this._playback) {
			this._playback.isLooping = value;
		}
	}

	constructor(definition: NutkaDefinition, name = "") {
		this._defaultLayer = definition.defaultLayer;
		this._definition = definition;
		this._resumePosition = 0;
		this._isLooping = false;
		this._volume = 0;
		this.name = name;
	}

	public play() {
		if (this._playback) {
			return;
		}

		this._playback = this._definition.play({
			volume: this._volume,
			startOffset: this._resumePosition,
			isLooping: this._isLooping
		});
	}

	public stop() {
		if (!this._playback) {
			return;
		}

		this._resumePosition = this._playback.positionSeconds;
		this._playback.stop();
		this._playback = undefined;
	}
}