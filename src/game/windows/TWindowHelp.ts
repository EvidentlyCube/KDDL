import * as PIXI from 'pixi.js';
import {RecamelWindow} from "../../../src.framework/net/retrocade/camel/core/RecamelWindow";
import {Button} from "../../../src.framework/net/retrocade/standalone/Button";
import {Text} from "../../../src.framework/net/retrocade/standalone/Text";
import {Make} from "../global/Make";
import {_} from "../../../src.framework/_";
import {_n} from "../../../src.framework/_n";
import {S} from "../../S";
import {RecamelEffectFade} from "../../../src.framework/net/retrocade/camel/effects/RecamelEffectFade";
import RawInput from "../../../src.tn/RawInput";
import {TWindowMessage} from "./TWindowMessage";
import {TWindowBackStory} from "./TWindowBackStory";
import {TWindowControls} from "./TWindowControls";
import {Sfx} from "../global/Sfx";
import { RecamelLang } from 'src.framework/net/retrocade/camel/RecamelLang';

export class TWindowHelp extends RecamelWindow {
	private static _instance: TWindowHelp;

	public static show() {
		if (!TWindowHelp._instance) {
			TWindowHelp._instance = new TWindowHelp();
		}
		TWindowHelp._instance.show();
	}


	private _modal: PIXI.Graphics;
	private _bg: PIXI.NineSlicePlane;
	private _text: Text;

	private _howToPlay: Button;
	private _history: Button;
	private _backstory: Button;
	private _credits: Button;
	private _close: Button;


	public constructor() {
		super();

		this._modal = new PIXI.Graphics();
		this._bg = Make.windowGrid9();
		this._text = Make.text(16);
		this._howToPlay = Make.buttonColor(() => this.onHowToPlay(), _("ui.help.buttons.how_to_play"));
		this._history = Make.buttonColor(() => this.onHistory(), _("ui.help.buttons.history"));
		this._backstory = Make.buttonColor(() => this.onBackstory(), _("ui.help.buttons.backstory"));
		this._credits = Make.buttonColor(() => this.onCredits(), _("ui.help.buttons.credits"));
		this._close = Make.buttonColor(() => this.onClose(), _("ui.common.close"));

		this._text.wordWrap = true;
		this._text.wordWrapWidth = _n("ui.help.description.width");

		this._text.text = _("ui.help.description");

		this._howToPlay.alignCenterParent(0, this._text.textWidth + 20);
		this._history.alignCenterParent(0, this._text.textWidth + 20);
		this._backstory.alignCenterParent(0, this._text.textWidth + 20);
		this._credits.alignCenterParent(0, this._text.textWidth + 20);
		this._close.alignCenterParent(0, this._text.textWidth + 20);

		this._backstory.y = this._text.textHeight + this._text.y + 40;
		this._howToPlay.y = this._backstory.bottom + 10;
		this._history.y = this._howToPlay.bottom + 10;
		this._credits.y = this._history.bottom + 10;
		this._close.y = this._credits.bottom + 10;

		this._text.x = this._text.y = 15;

		this._bg.width = this._text.textWidth + 35;
		this._bg.height = this._close.bottom + 15;

		this.addChild(this._modal);
		this.addChild(this._bg);
		this.addChild(this._text);
		this.addChild(this._history);
		this.addChild(this._howToPlay);
		this.addChild(this._backstory);
		this.addChild(this._credits);
		this.addChild(this._close);

		this.center();

		this._modal.beginFill(0, 0.6);
		this._modal.drawRect(-this.x, -this.y, S.SIZE_GAME_WIDTH, S.SIZE_GAME_HEIGHT);
	}

	public show() {
		super.show();

		this.interactiveChildren = false;

		new RecamelEffectFade(this, 0, 1, 400, () => this.onFadedIn());
	}

	public update() {
		if (this.interactiveChildren && RawInput.isKeyPressed('Escape')) {
			RawInput.flushAll();
			this.onClose();
		}
	}

	private onClose() {
		this.interactiveChildren = false;

		Sfx.buttonClick();

		new RecamelEffectFade(this, 1, 0, 400, () => this.onFadedOut());
	}

	private onHowToPlay() {
		Sfx.buttonClick();

		TWindowMessage.show(
			RecamelLang.parseRichTextCodes(_('ui.help.controls.body')),
			_n("ui.help.controls.body.width"),
			false,
			true,
			TWindowControls.show
		);
	}

	private onHistory() {
		Sfx.buttonClick();

		TWindowMessage.show(_('ui.help.history.body'), _n("ui.help.history.width"), false);
	}

	private onCredits() {
		Sfx.buttonClick();

		const creditsMessage: string = RecamelLang.parseRichTextCodes(_(
			"ui.help.credits.body",
			_("credits_Programming"),
			_("credits_ArtAndMusic"),
			_("credits_serverSide"),
			_("credits_levelDevelopment"),
			_("credits_primaryTesters"),
			_("credits_testers"),
			_("credits_translations"),
			_("credits_voiceTalents"),
			_("credits_original"),
		));
		TWindowMessage.show(creditsMessage, _n("ui.help.credits.body.width"), false, true);
	}

	private onBackstory() {
		TWindowBackStory.show();
	}

	private onFadedIn() {
		this.interactiveChildren = true;
	}

	private onFadedOut() {
		this.close();
	}
}
