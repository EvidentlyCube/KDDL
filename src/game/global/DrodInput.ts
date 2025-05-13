import {Core} from "./Core";
import RawInput from "../../../src.tn/RawInput";

const COOLDOWN_KEYS = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'PageDown', "PageUp"];

export type PlayerAction = 'move_nw' | 'move_n' | 'move_ne' | 'move_w' | 'move_e' | 'move_sw' | 'move_s' | 'move_se'
	| 'wait'
	| 'turn_cw' | 'turn_ccw'
	| 'undo' | 'restart'
	| 'battle' | 'lock';

export class DrodInput {
	public static init() {
		window.addEventListener('blur', DrodInput.pruneKeys);
		document.addEventListener('mousedown', DrodInput.pruneKeys);

		document.addEventListener('keydown', DrodInput.onKeyDown);
		document.addEventListener('keyup', DrodInput.onKeyUp);
	}

	private static onKeyDown(e: KeyboardEvent) {
		if (DrodInput._shiftCooldownFrame == DrodInput._currentFrame && COOLDOWN_KEYS.indexOf(e.key) !== -1) {
			DrodInput._isShiftDown = true;
		}

		if (e.key == DrodInput._lastKey) {
			return;
		}

		if (e.key == 'Shift') {
			DrodInput._isShiftDown = true;
			DrodInput._lastKey = '';
		} else {
			DrodInput._lastKey = RawInput.mapKey(e.key, e.location, e.code, e.which);
			DrodInput._lastKeyRepeat = -1;
		}
	}

	private static onKeyUp(e: KeyboardEvent) {
		if (e.key == 'Shift') {
			DrodInput._isShiftDown = false;
			DrodInput._shiftCooldownFrame = DrodInput._currentFrame;
			DrodInput._lastShiftReleaseFrame = DrodInput._currentFrame;

		} else if (RawInput.mapKey(e.key, e.location, e.code, e.which) == DrodInput._lastKey) {
			DrodInput._lastKey = '';
			DrodInput._lastKeyRepeat = -1;
		}
	}

	private static pruneKeys() {
		DrodInput._isShiftDown = false;
		DrodInput._lastKey = '';
		DrodInput._lastKeyRepeat = -1;
		DrodInput._lastShiftReleaseFrame = -1;
	}


	private static _currentTime: number;

	private static _isShiftDown: boolean = false;
	private static _shiftCooldownFrame: number = -1;
	private static _lastShiftReleaseFrame: number = -1;
	private static _lastKey: string = '';
	private static _lastKeyRepeat: number = -1;

	private static _currentFrame: number = 0;

	public static update() {
		DrodInput._currentTime = Date.now();
		DrodInput._currentFrame++;
		DrodInput._shiftCooldownFrame = 0;
	}

	public static flush() {
		DrodInput._lastKeyRepeat = Date.now();
	}

	public static isShiftDown(): boolean {
		return DrodInput._isShiftDown
			// Weird behavior observed in Chrome on Windows - Shift+Numpad5 with numlock off (ie. Shift+Clear)
			// causes shift up event to be dispatched before handling clear
			|| DrodInput._lastShiftReleaseFrame === DrodInput._currentFrame - 1;
	}

	private static doMoveCheck(...keys: string[]): boolean {
		if (keys.indexOf(DrodInput._lastKey) === -1) {
			return false;
		}

		if (DrodInput._lastKeyRepeat == -1) {
			DrodInput._lastKeyRepeat = DrodInput._currentTime + Core.repeatDelay;
			return true;

		} else if (DrodInput._currentTime >= DrodInput._lastKeyRepeat) {
			DrodInput._lastKeyRepeat += 26 + Core.repeatRate * 40;
			return true;
		}

		return false;
	}

	// @todo fix numpad keys in all of those
	public static doMoveNW(): boolean {
		return DrodInput.doMoveCheck(Core.getKey('move_nw'), '7', 'Numpad7');
	}

	public static doMoveN(): boolean {
		return DrodInput.doMoveCheck(Core.getKey('move_n'), 'Numpad8', '8');
	}

	public static doMoveNE(): boolean {
		return DrodInput.doMoveCheck(Core.getKey('move_ne'), '9', 'Numpad9');
	}

	public static doMoveW(): boolean {
		return DrodInput.doMoveCheck(Core.getKey('move_w'), 'Numpad4', '4');
	}

	public static doMoveE(): boolean {
		return DrodInput.doMoveCheck(Core.getKey('move_e'), 'Numpad6', '6');
	}

	public static doMoveSW(): boolean {
		return DrodInput.doMoveCheck(Core.getKey('move_sw'), '1', 'Numpad1');
	}

	public static doMoveS(): boolean {
		return DrodInput.doMoveCheck(Core.getKey('move_s'), 'Numpad2', '2');
	}

	public static doMoveSE(): boolean {
		return DrodInput.doMoveCheck(Core.getKey('move_se'), '3', 'Numpad3');
	}

	public static doMoveWait(): boolean {
		return DrodInput.doMoveCheck(Core.getKey('wait'), '5', 'Numpad5');
	}

	public static doRotateCW(): boolean {
		return DrodInput.doMoveCheck(Core.getKey('turn_cw'));
	}

	public static doRotateCCW(): boolean {
		return DrodInput.doMoveCheck(Core.getKey('turn_ccw'));
	}


}
