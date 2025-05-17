import * as PIXI from 'pixi.js';
import {RecamelState} from "../../../src.framework/net/retrocade/camel/core/RecamelState";
import {Text} from "../../../src.framework/net/retrocade/standalone/Text";
import {RecamelEffectScreenshot} from "../../../src.framework/net/retrocade/camel/effects/RecamelEffectScreenshot";
import {Gfx} from "../global/Gfx";
import {Make} from "../global/Make";
import {S} from "../../S";
import {_} from "../../../src.framework/_";
import {Core} from "../global/Core";
import {RecamelEffectFade} from "../../../src.framework/net/retrocade/camel/effects/RecamelEffectFade";
import RawInput from "../../../src.tn/RawInput";
import {Sfx} from "../global/Sfx";
import {C} from "../../C";
import {Game} from "../global/Game";
import { TStateTitle } from './TStateTitle';

export class TStateOutro extends RecamelState {
	private _bg: PIXI.Sprite;
	private _text: Text;

	private _lastStepTime: number = 0;

	private _screenshot: RecamelEffectScreenshot;

	public constructor() {
		super();

		this._screenshot = new RecamelEffectScreenshot();

		this._bg = new PIXI.Sprite(Gfx.LevelStartBgTexture);

		this._text = Make.text(21, 0xFFFFFF);

		this._text.color = 0xFFFFFF;
		this._text.x = 20;
		this._text.y = S.SIZE_GAME_HEIGHT + 25;
		this._text.wordWrap = true;
		this._text.wordWrapWidth = S.SIZE_GAME_WIDTH - 40;
		this._text.textAlignCenter();
		this._text.htmlText = _('outro') + "\n" + _(
			'ui.outro_common',
			_("credits_Programming"),
			_("credits_ArtAndMusic"),
			_("credits_serverSide"),
			_("credits_levelDevelopment"),
			_("credits_primaryTesters"),
			_("credits_testers"),
			_("credits_translations"),
			_("credits_voiceTalents"),
			_("credits_original"),
		);

		this.setState();

		Core.lMain.add(this._bg);
		Core.lMain.add(this._text);

		new RecamelEffectFade(this._screenshot.layer.displayObject, 1, 0, 1000, () => {
			if (this._screenshot) {
				this._screenshot.stop();
			}
		});

		Sfx.crossFadeMusic(C.MUSIC_OUTRO);
	}

	public destroy() {
		Core.lMain.remove(this._bg);
		Core.lMain.remove(this._text);

		super.destroy();
	}

	public update() {
		if (Game.room) {
			Game.room.clear();
			Game.room = undefined!
		}

		if (this._lastStepTime == 0) {
			this._lastStepTime = Date.now();
		}

		if (RawInput.isKeyDown('ArrowUp') || RawInput.isKeyDown(Core.getKey('move_n')) || RawInput.isKeyDown('8')) {
			this._text.y = Math.min(S.SIZE_GAME_HEIGHT + 25, this._text.y + 10);
		}

		if (RawInput.isKeyDown('ArrowDown') || RawInput.isKeyDown(Core.getKey('move_s')) || RawInput.isKeyDown('2')) {
			this._text.y -= 10;
		}


		if (!RawInput.isKeyDown(' ') && !RawInput.isKeyDown(Core.getKey('wait')) && !RawInput.isKeyDown('5')) {
			this._text.y -= (Date.now() - this._lastStepTime) / (RawInput.isMouseDown(0) ? 5 : 70);
		}

		this._lastStepTime = Date.now();

		if (this._text.y + this._text.textHeight < -20 || RawInput.isKeyPressed('Escape') || RawInput.isKeyPressed('Enter')) {
			RawInput.flushAll();
			this.onFinish();
		}
	}

	private onFinish() {
		const screenshot = new RecamelEffectScreenshot();

		TStateTitle.show();

		new RecamelEffectFade(screenshot.layer.displayObject, 1, 0, 500, screenshot.stop);
		screenshot.moveForward();
	}

}
