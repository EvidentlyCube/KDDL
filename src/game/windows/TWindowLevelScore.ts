import * as PIXI from 'pixi.js';
import { UtilsString } from 'src.framework/net/retrocade/utils/UtilsString';
import { boolAttr } from 'src/XML';
import { _ } from "../../../src.framework/_";
import { RecamelTooltip } from "../../../src.framework/net/retrocade/camel/core/RecamelTooltip";
import { RecamelWindow } from "../../../src.framework/net/retrocade/camel/core/RecamelWindow";
import { RecamelEffectFade } from "../../../src.framework/net/retrocade/camel/effects/RecamelEffectFade";
import { Button } from "../../../src.framework/net/retrocade/standalone/Button";
import { Text } from "../../../src.framework/net/retrocade/standalone/Text";
import RawInput from "../../../src.tn/RawInput";
import { S } from "../../S";
import { Game } from '../global/Game';
import { Level } from '../global/Level';
import { Make } from "../global/Make";
import { Progress } from '../global/Progress';

const EFFECT_DURATION = 400;

const WIDTH = 300;
const PAD = 10;
const PAD2 = 30;

export class TWindowLevelScore extends RecamelWindow {


	private static _instance: TWindowLevelScore;

	public static show() {
		if (!TWindowLevelScore._instance) {
			TWindowLevelScore._instance = new TWindowLevelScore();
		}

		TWindowLevelScore._instance.show();
	}


	/****************************************************************************************************************/
	/**                                                                                                   INSTANCE  */
	/****************************************************************************************************************/

	private modal: PIXI.Graphics;

	private bg: PIXI.NineSlicePlane;
	private header: Text;
	private stats: Text;
	private bestScoreHeader: Text;
	private bestScoreValue: Text;

	private closeButton: Button;

	public constructor() {
		super();

		// Creation

		this.modal = new PIXI.Graphics();
		this.bg = Make.windowGrid9();


		this.header = Make.text(36);
		this.stats = Make.text(18);
		this.bestScoreHeader = Make.text(36);
		this.bestScoreValue = Make.text(24);
		this.closeButton = Make.buttonColor(this.onClose, _("ui.common.close"));

		// Setting initial properties

		this.header.text = _("ui.score_window.header");
		this.bestScoreHeader.text = _("ui.score_window.best_score");
		this.bestScoreValue.text = _("ui.score_window.best_score.none");


		// Sizing and Positioning

		this.bg.width = WIDTH;
		this.bg.height = 500 + 40;

		// Add children

		this.addChild(this.modal);
		this.addChild(this.bg);
		this.addChild(this.header);
		this.addChild(this.stats);
		this.addChild(this.bestScoreHeader);
		this.addChild(this.bestScoreValue);
		this.addChild(this.closeButton);

		this.center();

		this.modal.beginFill(0, 0.6);
		this.modal.drawRect(-this.x, -this.y, S.SIZE_GAME_WIDTH, S.SIZE_GAME_HEIGHT);
	}

	public show() {
		super.show();

		this.removeChild(this.modal)

		const demo = Progress.getRoomDemo(Game.room.roomPid);
		this.stats.wordWrapWidth = WIDTH - PAD;
		this.stats.htmlText = this.generateStatsString();
		if (!boolAttr(Level.getRoom(Game.room.roomPid), 'IsRequired', false)) {
			this.bestScoreValue.text = _('ui.score_window.best_score.unrequired');

		} else {
			this.bestScoreValue.text = demo.hasScore
				? demo.score.toString()
				: _("ui.score_window.best_score.none");
		}
		this.interactiveChildren = false;
		this.cacheAsBitmap = true;
		new RecamelEffectFade(this, 0, 1, EFFECT_DURATION, this.onFadedIn);

		this.header.alignCenterParent();
		this.stats.alignCenterParent();
		this.bestScoreHeader.alignCenterParent()
		this.bestScoreValue.alignCenterParent()
		this.closeButton.alignCenterParent()

		this.header.y = PAD;
		this.stats.y = this.header.bottom + PAD;
		this.bestScoreHeader.y = this.stats.bottom + PAD2;
		this.bestScoreValue.y = this.bestScoreHeader.bottom + PAD;

		this.closeButton.y = this.bestScoreValue.bottom + PAD2;

		this.bg.height = this.closeButton.bottom + PAD;

		this.center();

		this.addChildAt(this.modal, 0);
		this.modal.clear();
		this.modal.beginFill(0, 0.6);
		this.modal.drawRect(-this.x, -this.y, S.SIZE_GAME_WIDTH, S.SIZE_GAME_HEIGHT);
	}

	private generateStatsString(): string {
		const levelID = Game.room.levelId;

		const deaths = Progress.levelStats.getUint(levelID + "d", 0);
		const moves = Progress.levelStats.getUint(levelID + "m", 0);
		const kills = Progress.levelStats.getUint(levelID + "k", 0);
		const time = Progress.levelStats.getUint(levelID + "t", 0);

		return '<strong size="24">' + _("ui.score_window.stats.moves_room") + "</strong> " + Game.playerTurn + "\n"
			+ '<strong size="24">' + _("ui.score_window.stats.moves_level") + "</strong> " + moves + "\n"
			+ '<strong size="24">' + _("ui.score_window.stats.deaths") + "</strong> " + deaths + "\n"
			+ '<strong size="24">' + _("ui.score_window.stats.kills") + "</strong> " + kills + "\n"
			+ '<strong size="24">' + _("ui.score_window.stats.time") + "</strong> " + UtilsString.styleTime(time * 1000, true, true, true, false);
	}

	public update() {
		const requestingClose = RawInput.isKeyPressed('Escape') || RawInput.isKeyPressed('Enter');
		if (requestingClose && this.interactiveChildren) {
			RawInput.flushAll();
			this.onClose();
		}
	}

	private onFadedIn = () => {
		this.cacheAsBitmap = false;
		this.interactiveChildren = true;
	};

	private onClose = () => {
		this.cacheAsBitmap = true;
		new RecamelEffectFade(this, 1, 0, EFFECT_DURATION, this.close.bind(this));
		this.interactiveChildren = false;

		RecamelTooltip.hide();
	}
}
