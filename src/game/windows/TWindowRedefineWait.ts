import * as PIXI from 'pixi.js';
import {Make} from "../global/Make";
import {RecamelWindow} from "../../../src.framework/net/retrocade/camel/core/RecamelWindow";
import {Text} from "../../../src.framework/net/retrocade/standalone/Text";
import {S} from "../../S";
import {DropShadowFilter} from "@pixi/filter-drop-shadow";
import RawInput from "../../../src.tn/RawInput";
import {_, _r} from "../../../src.framework/_";
import {Core} from "../global/Core";
import { PlayerAction } from '../global/DrodInput';

type RedefineCallback = (remappedAction: PlayerAction, newKey: string) => void;

export class TWindowRedefineWait extends RecamelWindow {
	private static _instance: TWindowRedefineWait;

	public static show(remappedAction: PlayerAction, callback: RedefineCallback) {
		if (!TWindowRedefineWait._instance) {
			TWindowRedefineWait._instance = new TWindowRedefineWait();
		}

		TWindowRedefineWait._instance.showWindow(remappedAction, callback);
	}


	private _modal: PIXI.Graphics;
	private _text: Text;

	private _remappedAction: PlayerAction = 'wait';
	private _callback?: RedefineCallback;

	public constructor() {
		super();

		this._text = Make.text(18, 0xFFFFFF);

		this._text.wordWrap = true;
		this._text.wordWrapWidth = S.SIZE_GAME_WIDTH;

		this._text.textAlignCenter();
		this._text.filters = [new DropShadowFilter({quality: 5, distance: 2, blur: 1, alpha: 1})];

		this._modal = new PIXI.Graphics();
		this._modal.beginFill(0, 0.7);
		this._modal.drawRect(0, 0, S.SIZE_GAME_WIDTH, S.SIZE_GAME_HEIGHT);

		this.addChild(this._modal);
		this.addChild(this._text);
	}

	public showWindow(remappedAction: PlayerAction, callback: RedefineCallback) {
		this._callback = callback;
		this._remappedAction = remappedAction;

		this._text.text = _r('ui.redefine.changing_prompt', {
			control_name: _(`controls_${this._remappedAction}`),
			current_key: RawInput.translateKeyName(Core.getKey(remappedAction))
		})

		this._text.alignCenter();
		this._text.alignMiddle();

		this.show();
	}

	public update() {
		if (RawInput.isAnyKeyPressed()) {
			switch (RawInput.lastKey) {
				case('Enter'):
				case(' '):
				case('Tab'):
				case('F1'):
				case('F2'):
				case('F3'):
				case('F4'):
				case('F5'):
				case('F6'):
				case('F7'):
				case('F8'):
				case('F9'):
				case('F10'):
				case('F11'):
				case('F12'):
				case('CapsLock'):
				case('Shift'):
				case('Control'):
				case('NumLock'):
				case('Meta'):
				case('ContextMenu'):
				case('AltGraph'):
				case('Pause'):
				case('PrintScreen'):
					this._text.text = _r("ui.redefine.invalid_key", {
						control_name: _(`controls_${this._remappedAction}`),
						pressed_key: RawInput.translateKeyName(RawInput.lastKey),
						current_key: RawInput.translateKeyName(Core.getKey(this._remappedAction)),
					});

					this._text.alignCenter();
					this._text.alignMiddle();
					break;

				case('Numpad1'):
				case('Numpad2'):
				case('Numpad3'):
				case('Numpad4'):
				case('Numpad5'):
				case('Numpad6'):
				case('Numpad7'):
				case('Numpad8'):
				case('Numpad9'):
				case('End'):
				case('Home'):
				case('PageUp'):
				case('PageDown'):
				case('Delete'):
				case('Insert'):
					this._text.text = _r("ui.redefine.reserved_key", {
						control_name: _(`controls_${this._remappedAction}`),
						pressed_key: RawInput.translateKeyName(RawInput.lastKey),
						current_key: RawInput.translateKeyName(Core.getKey(this._remappedAction)),
					});

					this._text.alignCenter();
					this._text.alignMiddle();
					break;

				case('Escape'):
					RawInput.flushAll();
					this.close();
					break;

				default:
					this._callback?.(this._remappedAction!, RawInput.lastKey);
					this.close();
					break;
			}
		}
	}
}
