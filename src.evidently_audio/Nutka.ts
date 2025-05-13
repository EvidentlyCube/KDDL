import {NutkaLayer} from "./NutkaLayer";

export class Nutka {
	private readonly _context: AudioContext;
	private readonly _masterLayer: NutkaLayer;
	private readonly _layers: Map<string, NutkaLayer>;

	public get context(): AudioContext {
		return this._context;
	}

	public get masterLayer(): NutkaLayer {
		return this._masterLayer;
	}

	public constructor() {
		const AudioContextClass = window.AudioContext || ((window as any).webkitAudioContext as AudioContext);
		this._context = new AudioContextClass();

		this._layers = new Map();
		this._masterLayer = new NutkaLayer("master", this._context.destination, this);

		this._layers.set(this._masterLayer.name, this._masterLayer);
	}

	public newLayer(name: string) {
		if (this._layers.has(name)) {
			throw new Error(`Nutka layer with name '${name}' already exists.`);
		}

		const layer = new NutkaLayer(name, this._masterLayer.node, this);
		this._layers.set(name, layer);
		return layer;
	}
}