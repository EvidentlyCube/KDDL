import {Nutka} from "./Nutka";
import {NutkaLoader} from "./NutkaLoader";

export class NutkaLayer {
	private readonly _name: string;
	private readonly _gainNode: GainNode;
	private readonly _nutka: Nutka;
	private readonly _loader: NutkaLoader;

	public get name() {
		return this._name;
	}

	public get node() {
		return this._gainNode;
	}

	public get loader() {
		return this._loader;
	}

	public set volume(value: number) {
		this._gainNode.gain.value = Math.max(0, Math.min(1, value));
	}

	public get volume(): number {
		return this._gainNode.gain.value;
	}

	constructor(name: string, parent: AudioNode, nutka: Nutka) {
		this._name = name;
		this._nutka = nutka;
		this._loader = new NutkaLoader(this, nutka);

		this._gainNode = parent.context.createGain();
		this._gainNode.connect(parent);
	}
}