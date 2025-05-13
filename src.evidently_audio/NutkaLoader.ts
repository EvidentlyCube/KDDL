import {NutkaLayer} from "./NutkaLayer";
import {Nutka} from "./Nutka";
import {NutkaDefinition} from "./NutkaDefinition";

interface LoadUrlCallbacks {
	onLoaded?: (definition: NutkaDefinition) => void;
	onError?: (definition: NutkaDefinition) => void;
	onProgress?: (definition: NutkaDefinition, loaded: number, total: number) => void;
}

export class NutkaLoader {
	private readonly _nutka: Nutka;
	private readonly _layer: NutkaLayer;

	public constructor(layer: NutkaLayer, nutka: Nutka) {
		this._layer = layer;
		this._nutka = nutka;
	}


	public async fromArrayBuffer(name: string, data: ArrayBuffer) {
		const {context} = this._nutka;

		const definition = new NutkaDefinition(name, context, this._layer);
		definition.buffer = await context.decodeAudioData(data);
		return definition;
	}

	public loadUrl(name: string, url: string, callbacks?: LoadUrlCallbacks) {
		const {context} = this._nutka;

		const definition = new NutkaDefinition(name, context, this._layer);

		const xhr = new XMLHttpRequest();
		xhr.responseType = "arraybuffer";
		xhr.addEventListener("progress", e => {
			callbacks?.onProgress?.(definition, e.loaded, e.total);
		});
		xhr.addEventListener("load", async () => {
			definition.buffer = await context.decodeAudioData(xhr.response);

			callbacks?.onLoaded?.(definition);
		});
		xhr.addEventListener("error", () =>{
			callbacks?.onError?.(definition);
		});

		xhr.open('GET', url, true);
		xhr.send();

		return definition;
	}

	public async loadUrlAsync(name: string, url: string, callbacks?: LoadUrlCallbacks): Promise<NutkaDefinition> {
		return new Promise((resolve, reject) => {
			this.loadUrl(name, url, {
				onProgress: callbacks?.onProgress,
				onLoaded: definition => {
					callbacks?.onLoaded?.(definition);
					resolve(definition);
				},
				onError: definition => {
					callbacks?.onError?.(definition);
					reject("Load failed");
				}
			});
		});
	}
}