import { NutkaLayer } from "../../../src.evidently_audio/NutkaLayer";
import { NutkaDefinition } from "../../../src.evidently_audio/NutkaDefinition";
import { RecamelLang, ValidLanguage } from "src.framework/net/retrocade/camel/RecamelLang";

interface ResourceImg {
	type: 'image';
	img: HTMLImageElement;
	url: string;

	isLoading: boolean;
	isLoaded: boolean;
}

interface ResourceText {
	type: 'text';
	data: string;
	url: string;
	isLoading: boolean;
	isLoaded: boolean;
}

interface ResourceLocale {
	type: 'locale';
	language: ValidLanguage;
	data: string;
	url: string;
	isLoading: boolean;
	isLoaded: boolean;
}

interface ResourceBinary {
	type: 'binary';
	data: Uint8Array;
	url: string;
	isLoading: boolean;
	isLoaded: boolean;
}

interface ResourceSound {
	type: 'sound';
	layer: NutkaLayer;
	definition?: NutkaDefinition;
	url: string;
	isLoading: boolean;
	isLoaded: boolean;
}

type QueueResource = ResourceImg | ResourceText | ResourceBinary | ResourceSound | ResourceLocale;

const queue = new Map<string, QueueResource>();
const idToPromise = new Map<string, Promise<string>>();
function loadResource(id: string) {
	const oldPromise = idToPromise.get(id);
	if (oldPromise) {
		return oldPromise;
	}

	const promise = new Promise<string>(resolve => loadResourceInternal(id, resolve));
	idToPromise.set(id, promise);
	return promise;
}

async function loadResourceInternal(id: string, resolve: (res: string) => void) {
	const resource = queue.get(id)!;

	if (resource.isLoaded) {
		resolve(id);
		return;

	} else if (resource.isLoading) {
		// Do nothing?
		return;
	}

	resource.isLoading = true;

	// console.log(`Loading resource ${id}: ${resource.url}`);

	switch (resource.type) {
		case 'image':
			resource.img.onload = () => {
				resource.isLoaded = true;
				const timer = setInterval(() => {
					// console.log("IMG loaded:", id, resource.img.width, resource.img.height)
					if (resource.img.width > 0 && resource.img.height > 0) {
						clearInterval(timer);
						resolve(id);
					}
				}, 16);
			};
			resource.isLoading = true;
			resource.img.src = resource.url;
			break;
		case 'text': {
			resource.isLoading = true;
			const result = await fetch(resource.url);
			const text = await result.text();
			resource.isLoaded = true;
			resource.data = text;
			resolve(id);
		}
			break;
		case 'locale': {
			resource.isLoading = true;
			const result = await fetch(resource.url);
			const text = await result.text();
			resource.isLoaded = true;
			resource.data = text;

			RecamelLang.loadLanguageFile(text, resource.language, resource.url.toLocaleLowerCase().endsWith('.yml'));

			resolve(id);
		}
			break;
		case 'binary': {
			resource.isLoading = true;
			const result = await fetch(resource.url);
			const buffer = await result.arrayBuffer();
			resource.isLoaded = true;
			resource.data = new Uint8Array(buffer);
			resolve(id);
		}
			break;
		case 'sound': {
			resource.isLoading = true;
			resource.definition = await resource.layer.loader.loadUrlAsync('', resource.url);
			resource.isLoaded = true;
			resolve(id);
		}
			break;
		default:
			resolve(id);
	}
}

export const ResourcesQueue = {
	get resourcesCount() {
		return queue.size;
	},
	get resourcesLoadedCount() {
		return Array.from(queue.values()).reduce((sum, res) => sum + (res.isLoaded ? 1 : 0), 0);
	},
	queueImage(id: string, img: HTMLImageElement, url: string) {
		if (!queue.has(id)) {
			queue.set(id, {
				type: "image",
				img, url,
				isLoading: false,
				isLoaded: false,
			});
		}
	},
	queueText(id: string, url: string) {
		if (!queue.has(id)) {
			queue.set(id, {
				type: "text",
				data: '', url,
				isLoading: false,
				isLoaded: false,
			});
		}
	},
	queueLocale(id: string, language: ValidLanguage, url: string) {
		if (!queue.has(id)) {
			queue.set(id, {
				type: "locale",
				language,
				data: '',
				url,
				isLoading: false,
				isLoaded: false,
			});
		}
	},
	queueSound(id: string, layer: NutkaLayer, url: string) {
		if (!queue.has(id)) {
			queue.set(id, {
				type: "sound",
				layer: layer,
				url,
				isLoaded: false,
				isLoading: false,
			});
		}
	},
	queueBinary(id: string, url: string) {
		if (!queue.has(id)) {
			queue.set(id, {
				type: "binary",
				data: new Uint8Array(), url,
				isLoading: false,
				isLoaded: false,
			});
		}
	},
	async startLoadingAll() {
		const promises = Array.from(queue.keys()).map(id => loadResource(id));

		return Promise.all(promises);
	},
	loadResource(id: string) {
		if (!ResourcesQueue.hasResource(id)) {
			throw new Error(`Failed to find data in queue for ID=${id}`);
		}

		return loadResource(id);
	},
	isLoaded(id: string): boolean {
		const resource = queue.get(id);
		if (!resource) {
			throw new Error(`Failed to find resouce in queue for ID=${id}`);
		}

		return resource.isLoaded;
	},
	getImg(id: string): HTMLImageElement {
		const resource = queue.get(id);
		if (!resource) {
			throw new Error(`Failed to find data in queue for ID=${id}`);
		} else if (resource.type !== 'image') {
			throw new Error(`Expected resource ID=${id} to be of type 'image' but is '${resource.type}' instead`);
		}

		return resource.img;
	},
	getText(id: string): string {
		const resource = queue.get(id);
		if (!resource) {
			throw new Error(`Failed to find data in queue for ID=${id}`);
		} else if (resource.type !== 'text') {
			throw new Error(`Expected resource ID=${id} to be of type 'text' but is '${resource.type}' instead`);
		}

		return resource.data;
	},
	getBinary(id: string): Uint8Array {
		const resource = queue.get(id);
		if (!resource) {
			throw new Error(`Failed to find data in queue for ID=${id}`);
		} else if (resource.type !== 'binary') {
			throw new Error(`Expected resource ID=${id} to be of type 'binary' but is '${resource.type}' instead`);
		}

		return resource.data;
	},
	getSound(id: string): NutkaDefinition {
		const resource = queue.get(id);
		if (!resource) {
			throw new Error(`Failed to find data in queue for ID=${id}`);
		} else if (resource.type !== 'sound') {
			throw new Error(`Expected resource ID=${id} to be of type 'sound' but is '${resource.type}' instead`);
		} else if (!resource.definition) {
			throw new Error(`Resource ID=${id} is not loaded yet`);
		}

		return resource.definition;
	},
	getUrl(id: string): string {
		const resource = queue.get(id);
		if (!resource) {
			throw new Error(`Failed to find data in queue for ID=${id}`);
		} else if (!resource.url) {
			throw new Error(`Resource ID=${id} has no URL`);
		}

		return resource.url;
	},
	hasResource(id: string) {
		return queue.has(id);
	},
};