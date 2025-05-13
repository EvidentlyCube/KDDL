import * as PIXI from 'pixi.js';
import {RecamelWindow} from "../../../src.framework/net/retrocade/camel/core/RecamelWindow";
import {Text} from "../../../src.framework/net/retrocade/standalone/Text";
import {Button} from "../../../src.framework/net/retrocade/standalone/Button";
import {Make} from "../global/Make";
import {_} from "../../../src.framework/_";
import {RecamelEffectFade} from "../../../src.framework/net/retrocade/camel/effects/RecamelEffectFade";
import RawInput from "../../../src.tn/RawInput";
import {S} from "../../S";
import {_n} from "../../../src.framework/_n";

export class TWindowBackStory extends RecamelWindow {
	private static _instance: TWindowBackStory;

	public static show() {
		if (!TWindowBackStory._instance) {
			TWindowBackStory._instance = new TWindowBackStory();
		}
		TWindowBackStory._instance.show();
	}


	private _modal: PIXI.Graphics;
	private _bg: PIXI.NineSlicePlane;
	private _text: Text;
	private _close: Button;
	private _next: Button;
	private _prev: Button;
	private _pageText: Text;

	private _page: number = 0;

	public constructor() {
		super();

		this._modal = new PIXI.Graphics();
		this._bg = Make.windowGrid9();
		this._text = Make.text(16);
		this._pageText = Make.text(16);
		this._close = Make.buttonColor(() => this.onClose(), _("ui.common.close"));
		this._next = Make.buttonColor(() => this.onNext(), _("ui.help.backstory.buttons.next"));
		this._prev = Make.buttonColor(() => this.onPrev(), _("ui.help.backstory.buttons.prev"));

		this._text.wordWrap = true;
		this._text.textAlignJustify();

		this.addChild(this._modal);
		this.addChild(this._bg);
		this.addChild(this._text);
		this.addChild(this._pageText);
		this.addChild(this._close);
		this.addChild(this._next);
		this.addChild(this._prev);
	}

	public show() {
		super.show();

		this.interactiveChildren = false;

		new RecamelEffectFade(this, 0, 1, 400, () => this.onFadedIn());

		this.showPage(0);
	}

	public update() {
		if (this.interactiveChildren && RawInput.isKeyPressed('Escape')) {
			RawInput.flushAll();
			this.onClose();
		}
	}

	private showText(message: string, textWidth: number) {
		this._modal.clear();

		this.setText(message, textWidth);

		this._close.alignCenterParent(5, this._text.textWidth + 20);
		this._close.y = this._text.textHeight + this._text.y + 40;

		this._next.y = this._prev.y = this._close.y;
		this._next.x = this._close.right + 10;
		this._prev.right = this._close.x - 10;

		this._bg.width = this._text.textWidth + 35;
		this._bg.height = this._close.bottom + 15;

		this._text.x = this._text.y = 15;

		this._pageText.text = (this._page + 1).toString() + " / 4";
		this._pageText.right = this._bg.width + this._bg.x - 18;
		this._pageText.bottom = this._bg.height + this._bg.y - 14;

		this.center();

		this._modal.beginFill(0, 0.6);
		this._modal.drawRect(-this.x, -this.y, S.SIZE_GAME_WIDTH, S.SIZE_GAME_HEIGHT);

		this._text.interactiveChildren = this._text.interactive = false;

		if (this._page == 0) {
			this._prev.disable();
			this._prev.alpha = 0.5;
		} else {
			this._prev.enable();
			this._prev.alpha = 1;
		}

		if (this._page == 3) {
			this._next.disable();
			this._next.alpha = 0.5;
		} else {
			this._next.enable();
			this._next.alpha = 1;
		}
	}

	private setText(message: string, textWidth: number) {
		this._text.wordWrapWidth = textWidth;
		this._text.text = message;
	}

	private onNext() {
		this.showPage(this._page + 1);
	}

	private onPrev() {
		this.showPage(this._page - 1);
	}

	private showPage(page: number) {
		this._page = page;

		switch (this._page) {
			case(0):
				this.showText(_("ui.help.backstory.page_1.body"), _n("ui.help.backstory.page_1.width"));
				break;
			case(1):
				this.showText(_("ui.help.backstory.page_2.body"), _n("ui.help.backstory.page_2.width"));
				break;
			case(2):
				this.showText(_("ui.help.backstory.page_3.body"), _n("ui.help.backstory.page_3.width"));
				break;
			case(3):
				this.showText(_("ui.help.backstory.page_4.body"), _n("ui.help.backstory.page_4.width"));
				break;
		}
	}

	private onClose() {
		this.interactiveChildren = false;

		new RecamelEffectFade(this, 1, 0, 400, () => this.onFadedOut());
	}

	private onFadedIn() {
		this.interactiveChildren = true;
	}

	private onFadedOut() {
		this.close();
	}
}
