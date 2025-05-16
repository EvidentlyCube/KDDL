import * as PIXI from 'pixi.js';
import { RecamelState } from "../../../src.framework/net/retrocade/camel/core/RecamelState";
import { TTitleButton } from "../interfaces/TTitleButton";
import { Gfx } from "../global/Gfx";
import { _ } from "../../../src.framework/_";
import { Make } from "../global/Make";
import { Text } from "../../../src.framework/net/retrocade/standalone/Text";
import { S } from "../../S";
import { Core } from "../global/Core";
import { Progress } from "../global/Progress";
import { UtilsRandom } from "../../../src.framework/net/retrocade/utils/UtilsRandom";
import { UtilsNumber } from "../../../src.framework/net/retrocade/utils/UtilsNumber";
import RawInput from "../../../src.tn/RawInput";
import { RecamelEffectScreenshot } from "../../../src.framework/net/retrocade/camel/effects/RecamelEffectScreenshot";
import { RecamelEffectFade } from "../../../src.framework/net/retrocade/camel/effects/RecamelEffectFade";
import { TWindowAchievements } from "../windows/TWindowAchievements";
import { TStateGame } from "./TStateGame";
import { PlatformOptions } from "../../platform/PlatformOptions";
import { TStateRestore } from "./TStateRestore";
import { TWindowOptions } from "../windows/TWindowOptions";
import { TWindowHelp } from "../windows/TWindowHelp";
import { Sfx } from "../global/Sfx";
import { C } from "../../C";
import { ResourcesQueue } from "../../resources/mainGame/ResourcesQueue";
import { RecamelSprite } from "../../../src.framework/net/retrocade/camel/core/RecamelSprite";
import { Game } from "../global/Game";
import { _n } from 'src.framework/_n';

export class TStateTitle extends RecamelState {
	private static _instance?: TStateTitle;

	public static show() {
		if (!TStateTitle._instance) {
			return new Promise<void>(resolve => {
				TStateTitle._instance = new TStateTitle(resolve);
				TStateTitle._instance.setState();
			});
		} else {
			TStateTitle._instance.setState();
			return Promise.resolve();
		}
	}

	private _onCloseHold: () => void;

	private _logo: PIXI.Sprite;
	private _logoSub: RecamelSprite;
	private _background: PIXI.Sprite;

	private _logoRetrocade: PIXI.Sprite;
	private _logoCaravel: PIXI.Sprite;

	private _buttonNewGame: TTitleButton;
	private _buttonContinue: TTitleButton;
	private _buttonRestore: TTitleButton;
	private _buttonAchievements: TTitleButton;
	private _buttonOptions: TTitleButton;
	private _buttonHelp: TTitleButton;
	private _buttonChangeHold: TTitleButton;

	private _version: Text;
	private _betaVersion: Text;

	private _backgroundX: number = 0;
	private _backgroundY: number = 0;

	private _backgroundTargetX: number = 0;
	private _backgroundTargetY: number = 0;

	private _backgroundAccel: number = 0;
	private _backgroundWait: number = 0;

	public constructor(onCloseHold: () => void) {
		super();

		const holdOptions = S.currentHoldOptions;

		if (!holdOptions) {
			throw new Error("Hold options are not yet loaded");
		}

		this._onCloseHold = onCloseHold;

		const FIRST_BUTTON: number = 280;
		const BUTTON_SPACE: number = 40;

		this._background = new PIXI.Sprite(Gfx.TitleScreenBgTexture);
		this._logo = new PIXI.Sprite(Gfx.GameLogoTexture);
		this._logoSub = new RecamelSprite(new PIXI.Texture(new PIXI.BaseTexture(
			ResourcesQueue.getImg(C.subtitleResourceName(holdOptions))
		)));
		this._logoRetrocade = new PIXI.Sprite(Gfx.RetrocadeLogoTexture);
		this._logoCaravel = new PIXI.Sprite(Gfx.CaravelLogoTexture);

		this._buttonNewGame = new TTitleButton(
			this.onClickedNewGame,
			_("ui.title_screen.start_new_game"),
			_n("ui.title_screen.start_new_game.shortcut_highlight_index")
		);
		this._buttonContinue = new TTitleButton(
			this.onClickedContinue,
			_("ui.title_screen.continue"),
			_n("ui.title_screen.continue.shortcut_highlight_index")
		);
		this._buttonRestore = new TTitleButton(
			this.onClickedRestore,
			_("ui.title_screen.restore"),
			_n("ui.title_screen.restore.shortcut_highlight_index")
		);
		this._buttonAchievements = new TTitleButton(
			this.onClickedAchievements,
			_("ui.title_screen.achievements"),
			_n("ui.title_screen.achievements.shortcut_highlight_index")
		);
		this._buttonOptions = new TTitleButton(
			this.onClickedOptions,
			_("ui.title_screen.options"),
			_n("ui.title_screen.options.shortcut_highlight_index")
		);
		this._buttonHelp = new TTitleButton(
			this.onClickedHelp,
			_("ui.title_screen.help"),
			_n("ui.title_screen.help.shortcut_highlight_index")
		);
		this._buttonChangeHold = new TTitleButton(
			this.onClickedChangeHold,
			_("ui.title_screen.change_hold"),
			_n("ui.title_screen.change_hold.shortcut_highlight_index")
		);

		this._version = Make.shadowText('', 14);
		this._betaVersion = Make.shadowText('BETA VERSION 8 - NOT FOR REDISTRIBUTION', 22);

		this._version.text = S.version;
		this._version.interactive = false;
		this._version.color = 0xFFFFFF;
		this._version.x = S.SIZE_GAME_WIDTH - this._version.getLocalBounds().width - 10;
		this._version.y = 0;

		this._logo.x = (S.SIZE_GAME_WIDTH - this._logo.width) / 2 | 0;
		this._logo.y = 10;

		this._logoSub.y = this._logo.y + this._logo.height;

		this._logoSub.alignCenter();
		this._betaVersion.alignCenter();
		this._buttonNewGame.alignCenter();
		this._buttonContinue.alignCenter();
		this._buttonRestore.alignCenter();
		this._buttonAchievements.alignCenter();
		this._buttonOptions.alignCenter();
		this._buttonHelp.alignCenter();
		this._buttonChangeHold.alignCenter();

		this._buttonNewGame.y = FIRST_BUTTON;
		this._buttonContinue.y = this._buttonNewGame.y + BUTTON_SPACE;
		this._buttonRestore.y = this._buttonContinue.y + BUTTON_SPACE;
		this._buttonAchievements.y = this._buttonRestore.y + BUTTON_SPACE;
		this._buttonOptions.y = this._buttonAchievements.y + BUTTON_SPACE;
		this._buttonHelp.y = this._buttonOptions.y + BUTTON_SPACE;
		this._buttonChangeHold.y = this._buttonHelp.y + BUTTON_SPACE;


		this._logoCaravel.y = S.SIZE_GAME_HEIGHT - this._logoCaravel.height;

		this._logoRetrocade.x = S.SIZE_GAME_WIDTH - this._logoRetrocade.width;
		this._logoRetrocade.y = S.SIZE_GAME_HEIGHT - this._logoRetrocade.height;

		this._logoCaravel.buttonMode = true;
		this._logoRetrocade.buttonMode = true;

		this._logoCaravel.on('click', this.onLogoClicked);
		this._logoRetrocade.on('click', this.onLogoClicked);
	}

	public create() {
		this._buttonNewGame.refreshTextField();
		this._buttonContinue.refreshTextField();
		this._buttonRestore.refreshTextField();
		this._buttonAchievements.refreshTextField();
		this._buttonOptions.refreshTextField();
		this._buttonHelp.refreshTextField();
		this._buttonChangeHold.refreshTextField();

		Core.lMain.add2(this._background);
		Core.lMain.add2(this._logo);
		Core.lMain.add2(this._logoSub);
		Core.lMain.add2(this._betaVersion);
		Core.lMain.add2(this._buttonChangeHold);
		Core.lMain.add2(this._buttonHelp);
		Core.lMain.add2(this._buttonOptions);
		Core.lMain.add2(this._buttonAchievements);
		Core.lMain.add2(this._buttonRestore);
		Core.lMain.add2(this._buttonContinue);
		Core.lMain.add2(this._buttonNewGame);
		Core.lMain.add2(this._logoCaravel);
		Core.lMain.add2(this._logoRetrocade);
		Core.lMain.add2(this._version);

		this._buttonContinue.enabled = Progress.hasSaveGame();
		this._buttonRestore.enabled = Progress.hasRestoreProgress();

		this.update();

		Sfx.playMusic(C.MUSIC_TITLE);

		// new RecamelEffectFadeScreen(0, 1, 0, 600);

		this._backgroundX = this._background.x = -UtilsRandom.fraction() * (this._background.width - S.SIZE_GAME_WIDTH);
		this._backgroundY = this._background.y = -UtilsRandom.fraction() * (this._background.height - S.SIZE_GAME_HEIGHT);

		if (UtilsRandom.bool()) {
			this._backgroundTargetX = -UtilsRandom.fraction() * (this._background.width - S.SIZE_GAME_WIDTH);
			this._backgroundTargetY = this._backgroundY;
		} else {
			this._backgroundTargetY = -UtilsRandom.fraction() * (this._background.height - S.SIZE_GAME_HEIGHT);
			this._backgroundTargetX = this._backgroundX;
		}

		if (PlatformOptions.isDebug) {
			// this.onClickedRestore();
		}
	}

	public destroy() {
		Core.lMain.clear();
	}

	public update() {
		this._betaVersion.y = Math.cos(Date.now() / 500) * 5 + 15 + this._logoSub.bottom;

		if (this._backgroundWait) {
			this._backgroundWait--;
		} else {
			const backgroundDir: number = Math.atan2(this._backgroundTargetY - this._background.y, this._backgroundTargetX - this._background.x);
			let backgroundDist: number = Math.sqrt(UtilsNumber.distance(this._background.x, this._background.y, this._backgroundTargetX, this._backgroundTargetY));

			if (backgroundDist > 40) {
				backgroundDist = 40;
			}

			if (this._backgroundAccel < 1) {
				this._backgroundAccel += 0.012;
			}

			this._background.x = this._backgroundX += Math.cos(backgroundDir) * backgroundDist * this._backgroundAccel / 100;
			this._background.y = this._backgroundY += Math.sin(backgroundDir) * backgroundDist * this._backgroundAccel / 100;

			if (backgroundDist < 10) {
				if (UtilsRandom.bool()) {
					this._backgroundTargetX = -UtilsRandom.fraction() * (this._background.width - S.SIZE_GAME_WIDTH);
				} else {
					this._backgroundTargetY = -UtilsRandom.fraction() * (this._background.height - S.SIZE_GAME_HEIGHT);
				}
				this._backgroundWait = UtilsRandom.uint(20, 200);
				this._backgroundAccel = 0;
			}
		}

		if (RawInput.isKeyPressed(_("ui.title_screen.help.shortcut_key_name"))) {
			this.onClickedHelp();

		} else if (RawInput.isKeyPressed(_("ui.title_screen.start_new_game.shortcut_key_name"))) {
			this.onClickedNewGame();

		} else if (RawInput.isKeyPressed(_("ui.title_screen.continue.shortcut_key_name")) && Progress.hasSaveGame()) {
			this.onClickedContinue();

		} else if (RawInput.isKeyPressed(_("ui.title_screen.restore.shortcut_key_name")) && Progress.hasRestoreProgress()) {
			this.onClickedRestore();

		} else if (RawInput.isKeyPressed(_("ui.title_screen.options.shortcut_key_name"))) {
			this.onClickedOptions();

		} else if (RawInput.isKeyPressed(_("ui.title_screen.achievements.shortcut_key_name")) || RawInput.isKeyPressed('Tab')) {
			this.onClickedAchievements();

		} else if (
			RawInput.isKeyPressed(_("ui.title_screen.change_hold.shortcut_key_name"))
			|| RawInput.isKeyPressed('Escape')
		) {
			this.onClickedChangeHold();

		} else if (RawInput.isKeyPressed('Enter')) {
			if (Progress.hasSaveGame()) {
				this.onClickedContinue();
			} else {
				this.onClickedNewGame();
			}
		}
	}


	/****************************************************************************************************************/
	/**                                                                                            EVENT LISTENERS  */

	/****************************************************************************************************************/

	private onClickedNewGame() {
		Progress.restartHold();

		TStateGame.startHold();

		Sfx.buttonClick();
	}

	private onClickedContinue() {
		const screenshot = new RecamelEffectScreenshot();

		TStateGame.continuePlaying();
		Sfx.buttonClick();

		new RecamelEffectFade(screenshot.layer.displayObject, 1, 0, 500, screenshot.stop);
		screenshot.moveForward();
	}

	private onClickedRestore() {
		const screenshot = new RecamelEffectScreenshot();

		TStateRestore.show();
		Sfx.buttonClick();

		new RecamelEffectFade(screenshot.layer.displayObject, 1, 0, 500, screenshot.stop);
		screenshot.moveForward();
	}

	private onClickedAchievements() {
		TWindowAchievements.show();
		Sfx.buttonClick();
	}

	private onClickedOptions() {
		TWindowOptions.show();
		Sfx.buttonClick();
	}

	private onClickedHelp() {
		TWindowHelp.show();
		Sfx.buttonClick();
	}

	private onClickedChangeHold = () => {
		const screenshot = new RecamelEffectScreenshot();

		this._onCloseHold();
		this._logoSub.texture.baseTexture.destroy();
		TStateTitle._instance = undefined;
		TWindowAchievements.destroy();
		if (Game.room) {
			Game.room.clear();
			Game.room = undefined!
		}

		Sfx.crossFadeMusic("");

		new RecamelEffectFade(screenshot.layer.displayObject, 1, 0, 500, screenshot.stop);
		screenshot.moveForward();
	}

	private onLogoClicked = (e: PIXI.InteractionEvent) => {
		let target: string;
		if (e.target == this._logoCaravel) {
			target = "http://caravelgames.com";
		} else {
			target = "http://retrocade.net";
		}

		window.open(target, '_blank')!.focus();
	};

	public API_changeHold() {
		this.onClickedChangeHold();
	}
}
