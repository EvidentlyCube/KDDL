import { intAttr } from "src/XML";
import {UtilsBase64} from "../../../src.framework/net/retrocade/utils/UtilsBase64";
import { _def } from "src.framework/_";

export class VOSpeech {
	public id: number;
	public character: number;
	public mood: number;
	public message: string;
	public delay: number;
	public soundID: number;

	public get translatedMessage() {
		return _def(
			`speech.${this.id}`,
			this.message
		);
	}

	public constructor(xml: Element) {
		this.id = intAttr(xml, 'SpeechID');
		this.character = parseInt(xml.getAttribute('Character')!);
		this.mood = parseInt(xml.getAttribute('Mood')!);
		this.message = UtilsBase64.decodeWChar(xml.getAttribute('Message')!);
		this.delay = parseInt(xml.getAttribute('Delay')!);
		this.soundID = parseInt(xml.getAttribute('DataID')!);
	}
}
