import {NutkaLayer} from "./NutkaLayer";
import {NutkaPlayback, NutkaPlaybackParams} from "./NutkaPlayback";

export class NutkaDefinition {
	private readonly _name: string;
	private readonly _context: AudioContext;
	private readonly _defaultLayer: NutkaLayer;

	private _buffer?: AudioBuffer;

	public get name(): string {
		return this._name;
	}

	public set buffer(buffer: AudioBuffer) {
		this._buffer = buffer;
	}

	public get defaultLayer(): NutkaLayer {
		return this._defaultLayer;
	}

	public get durationSeconds() {
		return this._buffer?.duration ?? 0;
	}

	constructor(name: string, context: AudioContext, defaultLayer: NutkaLayer) {
		this._name = name;
		this._context = context;
		this._defaultLayer = defaultLayer;
	}

	public play(params?: NutkaPlaybackParams, layer?: NutkaLayer) {
		if (!this._buffer) {
			throw new Error(`Audio ${this._name} is not loaded yet so it cannot be played`);
		}

		const source = this._context.createBufferSource();
		source.buffer = this._buffer;

		return new NutkaPlayback(
			source,
			layer ?? this._defaultLayer,
			params
		);
	}
}