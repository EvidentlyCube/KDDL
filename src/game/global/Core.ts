import * as Pako from 'pako';
import { RecamelLayerSprite } from "../../../src.framework/net/retrocade/camel/layers/RecamelLayerSprite";
import { UtilsByteArray } from "../../../src.framework/net/retrocade/utils/UtilsByteArray";
import { PlatformOptions } from "../../platform/PlatformOptions";
import { TStateGame } from "../states/TStateGame";
import { DROD } from "./DROD";
import { PlayerAction } from './DrodInput';
import { HelpRoomOpener } from './HelpRoomOpener';
import { Level } from "./Level";
import { PermanentStore } from './store/PermanentStore';

export class Core {
	// ::::::::::::::::::::::::::::::::::::::::::::::
	// :: Game Variables
	// ::::::::::::::::::::::::::::::::::::::::::::::

	public static lMain: RecamelLayerSprite;


	// ::::::::::::::::::::::::::::::::::::::::::::::
	// :: Keys
	// ::::::::::::::::::::::::::::::::::::::::::::::

	public static keyboardMappings = new Map<PlayerAction, string>();

	public static volumeEffects = 1;
	public static volumeVoices = 1;
	public static volumeMusic = 1;
	public static repeatRate = 1;
	public static repeatDelay = 300;

	public static getKey(name: PlayerAction): string {
		const key = Core.keyboardMappings.get(name);
		if (key === undefined) {
			throw new Error(`Attempted to get key mapping for invalid action "${name}"`);
		}

		return key;
	}

	public static setKey(name: PlayerAction, value: string) {
		Core.keyboardMappings.set(name, value);
	}

	public static saveKeyMappings() {
		PermanentStore.keymap.moveNW.write(Core.keyboardMappings.get('move_nw') ?? '7');
		PermanentStore.keymap.moveN.write(Core.keyboardMappings.get('move_n') ?? '8');
		PermanentStore.keymap.moveNE.write(Core.keyboardMappings.get('move_ne') ?? '9');
		PermanentStore.keymap.moveW.write(Core.keyboardMappings.get('move_w') ?? 'u');
		PermanentStore.keymap.moveE.write(Core.keyboardMappings.get('move_e') ?? 'o');
		PermanentStore.keymap.moveSW.write(Core.keyboardMappings.get('move_sw') ?? 'j');
		PermanentStore.keymap.moveS.write(Core.keyboardMappings.get('move_s') ?? 'k');
		PermanentStore.keymap.moveSE.write(Core.keyboardMappings.get('move_se') ?? 'l');
		PermanentStore.keymap.wait.write(Core.keyboardMappings.get('wait') ?? 'i');
		PermanentStore.keymap.turnCW.write(Core.keyboardMappings.get('turn_cw') ?? 'w');
		PermanentStore.keymap.turnCCW.write(Core.keyboardMappings.get('turn_ccw') ?? 'q');
		PermanentStore.keymap.undo.write(Core.keyboardMappings.get('undo') ?? 'Backspace');
		PermanentStore.keymap.restart.write(Core.keyboardMappings.get('restart') ?? 'r');
		PermanentStore.keymap.battle.write(Core.keyboardMappings.get('battle') ?? 'a');
		PermanentStore.keymap.lock.write(Core.keyboardMappings.get('lock') ?? 'x');
	}

	public static loadKeyMappings() {
		Core.keyboardMappings.set('move_nw', PermanentStore.keymap.moveNW.read());
		Core.keyboardMappings.set('move_n', PermanentStore.keymap.moveN.read());
		Core.keyboardMappings.set('move_ne', PermanentStore.keymap.moveNE.read());
		Core.keyboardMappings.set('move_w', PermanentStore.keymap.moveW.read());
		Core.keyboardMappings.set('move_e', PermanentStore.keymap.moveE.read());
		Core.keyboardMappings.set('move_sw', PermanentStore.keymap.moveSW.read());
		Core.keyboardMappings.set('move_s', PermanentStore.keymap.moveS.read());
		Core.keyboardMappings.set('move_se', PermanentStore.keymap.moveSE.read());
		Core.keyboardMappings.set('wait', PermanentStore.keymap.wait.read());
		Core.keyboardMappings.set('turn_cw', PermanentStore.keymap.turnCW.read());
		Core.keyboardMappings.set('turn_ccw', PermanentStore.keymap.turnCCW.read());
		Core.keyboardMappings.set('undo', PermanentStore.keymap.undo.read());
		Core.keyboardMappings.set('restart', PermanentStore.keymap.restart.read());
		Core.keyboardMappings.set('battle', PermanentStore.keymap.battle.read());
		Core.keyboardMappings.set('lock', PermanentStore.keymap.lock.read());
	}


	// ::::::::::::::::::::::::::::::::::::::::::::::
	// :: Init
	// ::::::::::::::::::::::::::::::::::::::::::::::

	public static init() {
		if (PlatformOptions.isGame) {
			Core.keyboardMappings.set('move_nw', '7');
			Core.keyboardMappings.set('move_n', '8');
			Core.keyboardMappings.set('move_ne', '9');
			Core.keyboardMappings.set('move_w', 'u');
			Core.keyboardMappings.set('move_e', 'o');
			Core.keyboardMappings.set('move_sw', 'j');
			Core.keyboardMappings.set('move_s', 'k');
			Core.keyboardMappings.set('move_se', 'l');
			Core.keyboardMappings.set('wait', 'i');
			Core.keyboardMappings.set('turn_cw', 'w');
			Core.keyboardMappings.set('turn_ccw', 'q');
			Core.keyboardMappings.set('undo', 'Backspace');
			Core.keyboardMappings.set('restart', 'r');
			Core.keyboardMappings.set('battle', 'a');
			Core.keyboardMappings.set('lock', 'x');

			Core.lMain = RecamelLayerSprite.create();

			Core.volumeEffects = PermanentStore.settings.volumeSfx.read();
			Core.volumeVoices = PermanentStore.settings.volumeVoices.read();
			Core.volumeMusic = PermanentStore.settings.volumeMusic.read();
			Core.repeatRate = PermanentStore.settings.repeatRate.read();
			Core.repeatDelay = PermanentStore.settings.repeatDelay.read();

			DROD.nutkaLayerMusic.volume = Core.volumeMusic;
			DROD.nutkaLayerSfx.volume = Core.volumeEffects;
			DROD.nutkaLayerSpeech.volume = Core.volumeVoices;

			Core.loadKeyMappings();
			HelpRoomOpener.register();

			TStateGame.offsetSpeed = Core.repeatRate * 12;

			if (PlatformOptions.isDebug) {
				//RecamelCore.errorCallback = onErrorCallback;
				//RecamelCore.errorCallback = null;
			}

			// @todo TWidgetVolumeMuter
			// TWidgetVolumeMuter.init();
		}
	}

	public static unpackHold(hold: Uint8Array) {
		hold = new Uint8Array(hold);

		// Decompress
		let i: number = hold.length;
		while (i--) {
			hold[i] = hold[i] ^ 0xFF;
		}


		const inflated = Pako.inflate(hold);

		const domParser = new DOMParser();
		const holdDocument = domParser.parseFromString(UtilsByteArray.toString(inflated), 'text/xml');
		Level.prepareHold(holdDocument.firstElementChild!, holdDocument);
	}
}

