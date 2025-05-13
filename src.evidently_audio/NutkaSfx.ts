import {NutkaDefinition} from "./NutkaDefinition";
import {NutkaLayer} from "./NutkaLayer";
import {NutkaPlayback} from "./NutkaPlayback";
import {NutkaManagedSound} from "./Interfaces";

export class NutkaSfx implements NutkaManagedSound {
	private readonly _defaultLayer: NutkaLayer;
	private readonly _definition: NutkaDefinition;
	private readonly _playbacks: NutkaPlayback[];

	public get duration() {
		return this._definition.durationSeconds;
	}

	constructor(definition: NutkaDefinition) {
		this._defaultLayer = definition.defaultLayer;
		this._definition = definition;
		this._playbacks = [];
	}

	public play(pan: number = 1, playbackRate: number = 1) {
		const playback = this._definition.play({
			pan, playbackRate,
			onFinished: this.removePlayback
		});

		this._playbacks.push(playback);
	}

	public stop() {
		this._playbacks.forEach(playback => playback.stop());
	}

	private removePlayback = (playback: NutkaPlayback) => {
		const index = this._playbacks.indexOf(playback);

		if (index !== -1) {
			this._playbacks.splice(index, 1);
		}
	}
}