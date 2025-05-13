import * as PIXI from 'pixi.js';
import {RecamelWindow} from "../../../src.framework/net/retrocade/camel/core/RecamelWindow";
import {__} from "../../../src.framework/__";
import {Button} from "../../../src.framework/net/retrocade/standalone/Button";
import {Make} from "../global/Make";
import {Text} from "../../../src.framework/net/retrocade/standalone/Text";
import {_} from "../../../src.framework/_";
import {S} from "../../S";
import {RecamelEffectFade} from "../../../src.framework/net/retrocade/camel/effects/RecamelEffectFade";
import RawInput from "../../../src.tn/RawInput";

export class TWindowMessage extends RecamelWindow {
	private static _instance: TWindowMessage;

	public static show(message: string, textWidth: number, selectable: boolean = false, html: boolean = false, closeCallback?: () => void) {
		if (!TWindowMessage._instance) {
			TWindowMessage._instance = new TWindowMessage();
		}

		TWindowMessage._instance.showText(message, textWidth, html, closeCallback);
	}


	private _modal: PIXI.Graphics;
	private _bg: PIXI.NineSlicePlane;
	private _text: Text;
	private _close: Button;
	private _closeCallback?: () => void;

	public constructor() {
		super();

		this._modal = new PIXI.Graphics();
		this._bg = Make.windowGrid9();
		this._text = Make.text(16);
		this._close = Make.buttonColor(() => this.onClose(), _("ui.common.close"));

		this._text.textAlignJustify();
		this._text.wordWrap = true;

		this.addChild(this._bg);
		this.addChild(this._text);
		this.addChild(this._close);
	}

	public showText(message: string, textWidth: number, html: boolean = false, closeCallback?: () => void) {
		this._closeCallback = closeCallback;

		this._modal.clear();
		this.setText(message, textWidth, html);

		this._close.alignCenterParent(5, this._text.textWidth + 30);
		this._close.y = this._text.textHeight + this._text.y + 40;

		this._bg.width = this._text.textWidth + 35;
		this._bg.height = this._close.bottom + 15;

		this._text.x = this._text.y = 15;

		this.show();

		this.center();

		this._modal.beginFill(0, 0.6);
		this._modal.drawRect(-this.x, -this.y, S.SIZE_GAME_WIDTH, S.SIZE_GAME_HEIGHT);

		this._text.interactiveChildren = this._text.interactive = false;
		this.interactiveChildren = false;

		new RecamelEffectFade(this, 0, 1, 400, () => this.onFadedIn());
	}

	public update() {
		if (this.interactiveChildren && (RawInput.isKeyPressed('Escape') || RawInput.isKeyPressed('Enter') || RawInput.isKeyPressed(' '))) {
			RawInput.flushAll();
			this.onClose();
		}
	}

	private setText(message: string, textWidth: number, html: boolean) {
		this._text.wordWrapWidth = textWidth;
		this._text.wordWrap = true;
		if (html) {
			this._text.htmlText = message;
		} else {
			this._text.text = message;
		}
	}

	private onClose() {
		this.interactiveChildren = false;

		new RecamelEffectFade(this, 1, 0, 400, () => this.onFadedOut());

		this._closeCallback?.();
	}

	private onFadedIn() {
		this.interactiveChildren = true;
	}

	private onFadedOut() {
		this.close();
	}
}
