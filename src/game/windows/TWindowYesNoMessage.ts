import * as PIXI from 'pixi.js';
import { RecamelWindow } from "../../../src.framework/net/retrocade/camel/core/RecamelWindow";
import { __ } from "../../../src.framework/__";
import { Button } from "../../../src.framework/net/retrocade/standalone/Button";
import { Make } from "../global/Make";
import { Text } from "../../../src.framework/net/retrocade/standalone/Text";
import { _ } from "../../../src.framework/_";
import { S } from "../../S";
import { RecamelEffectFade } from "../../../src.framework/net/retrocade/camel/effects/RecamelEffectFade";
import RawInput from "../../../src.tn/RawInput";
import { Core } from '../global/Core';
import { TStateGame } from '../states/TStateGame';

type CloseCallback = (answer: boolean) => void;

export class TWindowYesNoMessage extends RecamelWindow {
	private static _instance: TWindowYesNoMessage;

	public static show(message: string, textWidth: number, selectable: boolean = false, html: boolean = false, closeCallback?: CloseCallback) {
		if (!TWindowYesNoMessage._instance) {
			TWindowYesNoMessage._instance = new TWindowYesNoMessage();
		}

		TWindowYesNoMessage._instance.showText(message, textWidth, html, closeCallback);
	}


	private _modal: PIXI.Graphics;
	private _bg: PIXI.NineSlicePlane;
	private _text: Text;
	private _yes: Button;
	private _no: Button;
	private _closeCallback?: CloseCallback;

	public constructor() {
		super();

		this._modal = new PIXI.Graphics();
		this._bg = Make.windowGrid9();
		this._text = Make.text(16);
		this._yes = Make.buttonColor(() => this.onClose(true), _("ui.common.yes"));
		this._no = Make.buttonColor(() => this.onClose(false), _("ui.common.no"));

		this._text.textAlignJustify();
		this._text.wordWrap = true;

		this.addChild(this._bg);
		this.addChild(this._text);
		this.addChild(this._yes);
		this.addChild(this._no);
	}

	public showText(message: string, textWidth: number, html: boolean = false, closeCallback?: CloseCallback) {
		this._closeCallback = closeCallback;

		this._modal.clear();
		this.setText(message, textWidth, html);

		this._yes.width = 100;
		this._no.width = 100;
		this._yes.alignCenterParent(5, this._text.textWidth + 30);
		this._no.alignCenterParent(5, this._text.textWidth + 30);
		this._yes.x -= this._yes.width / 2 + 10;
		this._no.x  += this._no.width / 2 + 10;
		this._yes.y = this._text.textHeight + this._text.y + 40;
		this._no.y = this._yes.y;

		this._bg.width = this._text.textWidth + 35;
		this._bg.height = this._yes.bottom + 15;

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
		if (this.interactiveChildren && RawInput.isKeyPressed(Core.getKey('undo'))) {
			RawInput.flushAll();
			TStateGame.instance.undoCommand();
			this.onClose(undefined);
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

	private onClose(answer?: boolean) {
		this.interactiveChildren = false;

		new RecamelEffectFade(this, 1, 0, 400, () => this.onFadedOut());

		if (answer !== undefined) {
			this._closeCallback?.(answer);
		}
	}

	private onFadedIn() {
		this.interactiveChildren = true;
	}

	private onFadedOut() {
		this.close();
	}
}
