import {VOSpeech} from "../managers/VOSpeech";
import {NutkaSfx} from "../../../src.evidently_audio/NutkaSfx";
import {VODBLoader} from "../managers/VODBLoader";
import {UtilsBase64} from "../../../src.framework/net/retrocade/utils/UtilsBase64";
import {DROD} from "./DROD";

export class DB {
	private static _speech = new Map<number, VOSpeech>();
	private static _sounds = new Map<number, NutkaSfx>();

	private static _queue:VODBLoader[] = [];

	private static _queueTotal :number = 0;
	private static _queueLoaded:number = 0;

	public static getSpeech(id:number):VOSpeech{
		return DB._speech.get(id)!;
	}

	public static getSound(id:number):NutkaSfx{
		return DB._sounds.get(id)!;
	}

	public static get queueTotal():number {
		return DB._queueTotal;
	}

	public static get queueLoaded():number {
		return DB._queueLoaded;
	}

	public static resetQueue() {
		DB._queueTotal = 0;
		DB._queueLoaded = 0;
	}


	/******************************************************************************************************/
	/**                                                                                            QUEUE  */
	/******************************************************************************************************/

	/**
	 * @return True if anything was run
	 */
	public static advanceQueue():boolean {
		const loader = DB._queue.pop();

		loader?.run();

		return !!loader;
	}

	public static async autoAdvanceQueue() {
		return new Promise<void>(resolve => {
			const interval = setInterval(() => {
				if (!DB.advanceQueue()) {
					clearInterval(interval);
					resolve();
				}
			})
		});
	}

	/******************************************************************************************************/
	/**                                                                                    SPEECH LOADER  */
	/******************************************************************************************************/

	public static queueSpeech(id:number, xml:Element) {
		DB._queue.push(new VODBLoader(id, xml, DB.loadSpeech));
		DB._queueTotal++;
	}

	private static loadSpeech(id:number, xml:Element){
		DB._speech.set(id, new VOSpeech(xml));
		DB._queueLoaded++;
	}



	/******************************************************************************************************/
	/**                                                                                     SOUND LOADER  */
	/******************************************************************************************************/

	public static queueSound(id:number, packedData:string) {
		DB._queue.push(new VODBLoader(id, packedData, DB.loadSound));

		DB._queueTotal++;
	}

	private static async loadSound(id:number, packedData:string) {
		const data = UtilsBase64.decodeByteArray(packedData);

		const definition = await DROD.nutkaLayerSfx.loader.fromArrayBuffer(`sfx-${id}`, data.buffer);

		DB._sounds.set(id, new NutkaSfx(definition));
		DB._queueLoaded++;
	}
}

