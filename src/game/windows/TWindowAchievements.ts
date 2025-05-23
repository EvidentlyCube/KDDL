import * as PIXI from 'pixi.js';
import {RecamelWindow} from "../../../src.framework/net/retrocade/camel/core/RecamelWindow";
import {Button} from "../../../src.framework/net/retrocade/standalone/Button";
import {Text} from "../../../src.framework/net/retrocade/standalone/Text";
import {Make} from "../global/Make";
import {_} from "../../../src.framework/_";
import {Achievements} from "../achievements/Achievements";
import {VOAchievementBitmap} from "../managers/VOAchievementBitmap";
import {S} from "../../S";
import {RecamelEffectFade} from "../../../src.framework/net/retrocade/camel/effects/RecamelEffectFade";
import RawInput from "../../../src.tn/RawInput";
import {Sfx} from "../global/Sfx";
import {RecamelTooltip} from "../../../src.framework/net/retrocade/camel/core/RecamelTooltip";

export class TWindowAchievements extends RecamelWindow {
	private static _instance?: TWindowAchievements;

	public static show() {
		if (!TWindowAchievements._instance) {
			TWindowAchievements._instance = new TWindowAchievements();
		}

		TWindowAchievements._instance.show();
	}

	public static destroy() {
		TWindowAchievements._instance = undefined;
	}

	private _header: Text;

	private _achievements: VOAchievementBitmap[] = [];
	private _achievementRows: VOAchievementBitmap[][] = [];
	private _background: PIXI.NineSlicePlane;
	private _close: Button;
	private _info: Text;
	private _modal: PIXI.Graphics;

	public constructor() {
		super();

		const holdOptions = S.currentHoldOptions;

		if (!holdOptions) {
			throw new Error("Hold options are not yet loaded");
		}

		this._header = Make.text(24);
		this._background = Make.windowGrid9();
		this._close = Make.buttonColor(this.closeClicked, _("ui.common.close"));
		this._info = Make.text(16);
		this._modal = new PIXI.Graphics();

		this._header.text = _("ui.achievement_list.header");
		this._header.y = 15;

		this._info.text = _("ui.achievement_list.info");
		this._info.textAlignCenter();
		this._info.wordWrap = true;
		this._info.wordWrapWidth = holdOptions.achievementsInRow * 50;
		this._info.x = 10;

		this._blockUnder = true;
		this._pauseGame = true;

		this.addChild(this._modal);
		this.addChild(this._background);
		this.addChild(this._header);

		let previous: VOAchievementBitmap | undefined;

		let row:VOAchievementBitmap[] = [];
		for (const achievement of Achievements.getAll()) {
			const achievementBitmap = new VOAchievementBitmap(achievement);

			this._achievements.push(achievementBitmap);
			this.addChild(achievementBitmap);

			if (previous) {
				achievementBitmap.x = previous.x + 50;
				achievementBitmap.y = previous.y;
			} else {
				achievementBitmap.x = 20;
				achievementBitmap.y = 50;
			}

			if (achievementBitmap.x > holdOptions.achievementsInRow * 50) {
				achievementBitmap.x -= holdOptions.achievementsInRow * 50;
				achievementBitmap.y += 50;

				this._achievementRows.push(row);
				row = [];
			}

			row.push(achievementBitmap);

			previous = achievementBitmap;
		}

		this._achievementRows.push(row);

		this.centerLastRow();

		this.addChild(this._close);
		this.addChild(this._info);

		if (previous) {
			this._info.y = previous.bottom + 15;
		}


		this._header.alignCenterParent(10);

		this._background.width = this.getLocalBounds().width + 20;
		this._background.height = this.getLocalBounds().height + 70;

		this._info.alignCenterParent()
		this._close.alignCenterParent();
		this._close.y = this.getLocalBounds().height - this._close.getLocalBounds().height - 20;
	}
	centerLastRow() {
		const rowFirst = this._achievementRows[0];
		const rowLast = this._achievementRows[this._achievementRows.length - 1];

		const rightFirst = rowFirst[rowFirst.length - 1].right;
		const rightLast = rowLast[rowLast.length - 1].right;

		const diff = rightFirst - rightLast;
		const offset = (diff / 2) | 0;

		rowLast.forEach(ach => ach.x += offset);
	}

	public show() {
		this._modal.clear();

		for (const achievement of this._achievements) {
			achievement.updateCompletion();
		}

		this.center();

		this._modal.beginFill(0, 0.6);
		this._modal.drawRect(-this.x, -this.y, S.SIZE_GAME_WIDTH, S.SIZE_GAME_HEIGHT);

		super.show();

		this.interactiveChildren = false;
		new RecamelEffectFade(this, 0, 1, 400, this.shown);
	}

	public update() {
		this._achievements.forEach(ach => ach.update());

		if ((RawInput.isKeyPressed('Escape') || RawInput.isKeyPressed('Tab') || RawInput.isKeyPressed('Enter')) && this.interactiveChildren) {
			RawInput.flushAll();
			this.closeClicked();
		}
	}

	private shown = () => {
		this.interactiveChildren = true;
	}

	private closeClicked = () => {
		if (!this.interactiveChildren) {
			return;
		}

		RecamelTooltip.hide();

		this.interactiveChildren = false;

		new RecamelEffectFade(this, 1, 0, 400, this.close.bind(this));

		Sfx.buttonClick();
	}
}
