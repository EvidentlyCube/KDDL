import * as PIXI from 'pixi.js';
import {RecamelWindow} from "../../../src.framework/net/retrocade/camel/core/RecamelWindow";
import {Achievement} from "../achievements/Achievement";
import {S} from "../../S";
import {Make} from "../global/Make";
import {Text} from "../../../src.framework/net/retrocade/standalone/Text";
import {BitmapDataWritable} from "../../C";
import {F} from "../../F";
import {_} from "../../../src.framework/_";
import {DropShadowFilter} from '@pixi/filter-drop-shadow';
import {Game} from "../global/Game";
import RawInput from "../../../src.tn/RawInput";
import {RecamelEffectFade} from "../../../src.framework/net/retrocade/camel/effects/RecamelEffectFade";
import {UtilsNumber} from "../../../src.framework/net/retrocade/utils/UtilsNumber";

export class TGrowlAchievement extends RecamelWindow {
	private static _displayedGrowls: TGrowlAchievement[] = [];

	private _bg: PIXI.NineSlicePlane;

	private _header: Text;
	private _headerLine: PIXI.Graphics;

	private _icon: PIXI.Sprite;
	private _iconContext: BitmapDataWritable;
	private _iconTexture: PIXI.Texture;

	private _achievementName: Text;

	private _dismiss: Text;

	private _achievement: Achievement;

	private _timerID: number = -1;

	public constructor(achievement: Achievement) {
		super();

		this._blockUnder = false;
		this._pauseGame = false;

		this._bg = Make.windowGrid9();
		this._achievement = achievement;
		this._header = Make.text(22);
		this._headerLine = new PIXI.Graphics();
		this._achievementName = Make.text();
		this._iconContext = F.newCanvasContext(44, 44);
		this._iconTexture = new PIXI.Texture(new PIXI.BaseTexture(this._iconContext.canvas));
		this._icon = new PIXI.Sprite(this._iconTexture);
		this._dismiss = Make.text(12);

		this._achievement.drawTo(this._iconContext, 0, 0);
		this._iconTexture.baseTexture.update();

		this._header.text = _("ui.achievement_growl.header");

		while (this._header.textWidth > 140) {
			this._header.size--;
		}

		this._achievementName.text = this._achievement.name;
		this._achievementName.wordWrap = true;
		this._achievementName.wordWrapWidth = 90;

		this._dismiss.text = _("ui.achievement_growl.dismiss");


		this.addChild(this._bg);
		this.addChild(this._icon);
		this.addChild(this._header);
		this.addChild(this._achievementName);
		this.addChild(this._headerLine);
		this.addChild(this._dismiss);

		this._bg.width = 150 + 7 + 7;
		this._bg.height = this._dismiss.bottom + 7 + 7;

		this._icon.x = 10;
		this._icon.y = 34;
		this._achievementName.x = 60;
		this._achievementName.y = 34;
		this._header.y = 5;
		this._dismiss.alignCenterParent();
		this._dismiss.y = Math.max(this._achievementName.y + this._achievementName.textHeight, this._icon.y + this._icon.height) + 5;

		this._bg.height = this._dismiss.y + this._dismiss.height - 5 + 7 + 7+10;

		this._header.alignCenterParent();

		this._headerLine.beginFill(0, 0.75);
		this._headerLine.drawRect(10, this._header.y + this._header.textHeight, this._bg.width - 20, 1);

		this._icon.filters = [new DropShadowFilter({distance: 2, rotation: 45, alpha: 0.5, blur: 0, quality: 5})];

		this.on('pointerdown', () => this.onClicked());

		this.show();
	}

	public update() {
		let index: number = TGrowlAchievement._displayedGrowls.indexOf(this);
		if (index == -1) {
			index = 0;
		}


		const targetY = S.LEVEL_OFFSET_Y + 5 + (5 + this.height) * index;
		if (this.y === 0) {
			this.y = targetY;
		}
		this.y = UtilsNumber.approach(this.y, targetY, 0.5, 1, 20);

		if (Game.player.x < S.RoomWidth / 2) {
			this.x = S.LEVEL_OFFSET_X + S.RoomWidthPixels - this.width - 5;
		} else {
			this.x = S.LEVEL_OFFSET_X + 5;
		}

		if (this.interactive && RawInput.isKeyPressed(' ')) {
			this.hide();
		}
	}

	public show() {
		super.show();

		this.interactive = false;

		new RecamelEffectFade(this, 0, 1, 250, () => this.waitAndHide());

		TGrowlAchievement._displayedGrowls.push(this);
	}

	public close() {
		const index: number = TGrowlAchievement._displayedGrowls.indexOf(this);
		TGrowlAchievement._displayedGrowls.splice(index, 1);

		super.close();
	}

	private waitAndHide() {
		this.interactive = true;

		this._timerID = setTimeout(() => this.hide(), 3000 + TGrowlAchievement._displayedGrowls.length * 500) as any;
	}

	private onClicked() {
		this.hide();
	}

	private hide() {
		this.interactive = false;

		this.off('pointerdown');

		if (this._timerID != -1) {
			clearTimeout(this._timerID);
		}

		this._timerID = -1;
		new RecamelEffectFade(this, 1, 0, 250, () => this.close());
	}
}
