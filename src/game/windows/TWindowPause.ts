import * as PIXI from 'pixi.js';
import {RecamelWindow} from "../../../src.framework/net/retrocade/camel/core/RecamelWindow";
import {Text} from "../../../src.framework/net/retrocade/standalone/Text";
import {Button} from "../../../src.framework/net/retrocade/standalone/Button";
import {Make} from "../global/Make";
import {_} from "../../../src.framework/_";
import {C} from "../../C";
import {RecamelTooltip} from "../../../src.framework/net/retrocade/camel/core/RecamelTooltip";
import {S} from "../../S";
import {RecamelEffectFade} from "../../../src.framework/net/retrocade/camel/effects/RecamelEffectFade";
import RawInput from "../../../src.tn/RawInput";
import {TStateGame} from "../states/TStateGame";
import {TWindowOptions} from "./TWindowOptions";
import {Level} from "../global/Level";
import {Game} from "../global/Game";
import {attr} from "../../XML";
import {TWindowHelp} from "./TWindowHelp";
import {TWindowAchievements} from "./TWindowAchievements";
import {RecamelEffectFadeScreen} from "../../../src.framework/net/retrocade/camel/effects/RecamelEffectFadeScreen";
import {TStateTitle} from "../states/TStateTitle";
import {TStateRestore} from "../states/TStateRestore";
import {Sfx} from "../global/Sfx";
import {RecamelEffectScreenshot} from "../../../src.framework/net/retrocade/camel/effects/RecamelEffectScreenshot";

const EFFECT_DURATION = 400;

export class TWindowPause extends RecamelWindow {

	private static _instance: TWindowPause;

	public static show() {
		if (!TWindowPause._instance) {
			TWindowPause._instance = new TWindowPause();
		}
		TWindowPause._instance.show();
	}


	/****************************************************************************************************************/
	/**                                                                                                  VARIABLES  */
	/****************************************************************************************************************/

	private _modal: PIXI.Graphics;
	private _background: PIXI.NineSlicePlane;
	private _header: Text;

	private _buttonContinue: Button;
	private _buttonRestart: Button;
	private _buttonRestore: Button;
	private _buttonHelpRoom: Button;
	private _buttonHelp: Button;
	private _buttonAchieves: Button;
	private _buttonOptions: Button;
	private _buttonReturn: Button;

	// Block all input
	private _locked: boolean = false;

	public set locked(to: boolean) {
		this._locked = to;

		this.interactiveChildren = this.interactive = !to;
	}


	/****************************************************************************************************************/
	/**                                                                                                  FUNCTIONS  */

	/****************************************************************************************************************/

	public constructor() {
		super();

		this._modal = new PIXI.Graphics();
		this._background = Make.windowGrid9();
		this._header = new Text(_("ui.pause.header"), C.FONT_FAMILY, 32, 0);

		this._buttonContinue = Make.buttonColor(() => this.clickContinue(), _("ui.pause.continue.button"));
		this._buttonRestart = Make.buttonColor(() => this.clickRestart(), _("ui.pause.restart.button"));
		this._buttonRestore = Make.buttonColor(() => this.clickRestore(), _("ui.pause.restore.button"));
		this._buttonHelpRoom = Make.buttonColor(() => TWindowPause.clickHelpRoom(), _("ui.pause.room_help.button"));
		this._buttonHelp = Make.buttonColor(() => this.clickHelp(), _("ui.pause.help.button"));
		this._buttonAchieves = Make.buttonColor(() => this.clickAchieves(), _("ui.pause.achievements.button"));
		this._buttonOptions = Make.buttonColor(() => this.clickOptions(), _("ui.pause.options.button"));
		this._buttonReturn = Make.buttonColor(() => this.clickReturn(), _("ui.pause.return_to_title.button"));

		this.addChild(this._modal);
		this.addChild(this._background);
		this.addChild(this._header);
		this.addChild(this._buttonContinue);
		this.addChild(this._buttonRestart);
		this.addChild(this._buttonRestore);
		this.addChild(this._buttonOptions);
		this.addChild(this._buttonHelpRoom);
		this.addChild(this._buttonHelp);
		this.addChild(this._buttonAchieves);
		this.addChild(this._buttonReturn);


		this._background.width = this.width + 20;

		this._header.x = (this._background.width - this._header.textWidth) / 2;
		this._header.y = 10;

		this._buttonContinue.alignCenterParent();
		this._buttonRestart.alignCenterParent();
		this._buttonRestore.alignCenterParent();
		this._buttonOptions.alignCenterParent();
		this._buttonHelpRoom.alignCenterParent();
		this._buttonHelp.alignCenterParent(0);
		this._buttonAchieves.alignCenterParent();
		this._buttonReturn.alignCenterParent();

		const SPACE: number = 10;

		this._buttonContinue.y = 70;
		this._buttonRestart.y = this._buttonContinue.bottom + SPACE;
		this._buttonRestore.y = this._buttonRestart.bottom + SPACE;
		this._buttonOptions.y = this._buttonRestore.bottom + SPACE;
		this._buttonHelpRoom.y = this._buttonOptions.bottom + SPACE;
		this._buttonHelp.y = this._buttonHelpRoom.bottom + SPACE;
		this._buttonAchieves.y = this._buttonHelp.bottom + SPACE;
		this._buttonReturn.y = this._buttonAchieves.bottom + SPACE;

		this._background.height = this.height + 20;


		RecamelTooltip.hook(this._buttonContinue, _("ui.pause.continue.tooltip"));
		RecamelTooltip.hook(this._buttonRestart, _("ui.pause.restart.tooltip"));
		RecamelTooltip.hook(this._buttonHelpRoom, _("ui.pause.room_help.tooltip"));
		RecamelTooltip.hook(this._buttonHelp, _("ui.pause.help.tooltip"));
		RecamelTooltip.hook(this._buttonAchieves, _("ui.pause.achievements.tooltip"));
		RecamelTooltip.hook(this._buttonReturn, _("ui.pause.return_to_title.tooltip"));

		this.center();


		this._modal.beginFill(0, 0.65);
		this._modal.drawRect(-this.x, -this.y, S.SIZE_GAME_WIDTH, S.SIZE_GAME_HEIGHT);
	}

	public show() {
		super.show();

		this.locked = true;

 		this.cacheAsBitmap = true;

		new RecamelEffectFade(this, 0, 1, EFFECT_DURATION, () => {
			this.cacheAsBitmap = false;
			this.locked = false;
		});

		Sfx.buttonClick();
	}

	public close() {
		super.close();

		this.cacheAsBitmap = true;

		RecamelTooltip.hide();
	}

	public update() {
		if (this._locked) {
			return;
		}


		if (RawInput.isKeyPressed('Escape') || RawInput.isKeyPressed('Enter')) {
			RawInput.flushAll();
			this.locked = true;
			new RecamelEffectFade(this, 1, 0, EFFECT_DURATION, () => this.close());
			Sfx.buttonClick();
		}
	}

	private clickContinue() {
		RecamelTooltip.hide();
		this.locked = true;
		Sfx.buttonClick();
		new RecamelEffectFade(this, 1, 0, EFFECT_DURATION, () => this.close());
	}

	private clickRestart() {
		RecamelTooltip.hide();
		TStateGame.instance.restartCommand(true);
		this.locked = true;
		Sfx.buttonClick();
		new RecamelEffectFade(this, 1, 0, EFFECT_DURATION, () => this.close());
	}

	private clickOptions() {
		RecamelTooltip.hide();
		TWindowOptions.show();
		Sfx.buttonClick();
	}

	public static clickHelpRoom() {
		RecamelTooltip.hide();
		const hold = Level.getHoldXml();
		const roomPos = Level.getRoomOffsetInLevel(Game.room.roomId);
		const url: string = "http://forum.caravelgames.com/gamehints.php?hc=" + attr(hold, 'GID_Created') +
			"&hu=" + attr(hold, 'LastUpdated') +
			"&l=" + (Level.getLevelIndex(Game.room.levelId)) +
			"&rx=" + roomPos.x +
			"&ry=" + roomPos.y;

		window.open(url, '_blank')?.focus();

		Sfx.buttonClick();
	}

	private clickHelp() {
		RecamelTooltip.hide();
		TWindowHelp.show();
		Sfx.buttonClick();
	}

	private clickAchieves() {
		RecamelTooltip.hide();
		TWindowAchievements.show();

		Sfx.buttonClick();
	}

	private clickReturn() {
		const screenshot = new RecamelEffectScreenshot();
		Sfx.buttonClick();

		TStateTitle.show();
		new RecamelEffectFade(screenshot.layer.displayObject, 1, 0, 500, screenshot.stop);
		screenshot.moveForward();
		RecamelTooltip.hide();

		this.close();
	}

	private clickRestore() {
		RecamelTooltip.hide();
		new RecamelEffectFade(this, 1, 0, EFFECT_DURATION);
		new RecamelEffectFadeScreen(1, 0, 0, EFFECT_DURATION, () => this.onFadeRestore());
		this.locked = true;

		Sfx.buttonClick();
	}

	private onFadeRestore() {
		this.close();
		TStateRestore.show();
	}
}
