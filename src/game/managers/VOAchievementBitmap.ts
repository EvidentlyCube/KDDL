import {Achievement} from "../achievements/Achievement";
import {RecamelSprite} from "../../../src.framework/net/retrocade/camel/core/RecamelSprite";
import * as PIXI from "pixi.js";
import {DropShadowFilter} from "@pixi/filter-drop-shadow";
import {AdjustmentFilter} from "@pixi/filter-adjustment";
import {PlatformOptions} from "../../platform/PlatformOptions";
import {RecamelTooltip} from "../../../src.framework/net/retrocade/camel/core/RecamelTooltip";
import {F} from "../../F";
import {BitmapDataWritable} from "../../C";
import {TGrowlAchievement} from "../windows/TGrowlAchievement";
import RawInput from "src.tn/RawInput";
import { Achievements } from "../achievements/Achievements";

export class VOAchievementBitmap extends RecamelSprite {
	public achievement: Achievement;

	private _adjustFilter: AdjustmentFilter;

	public constructor(achievement: Achievement) {
		super(achievement.texture);

		this.achievement = achievement;
		this._adjustFilter = new AdjustmentFilter();

		this.filters = [this._adjustFilter, new DropShadowFilter({distance: 2, rotation: 45, alpha: 0.5, blur: 0})];

		this.registerTooltip();

		if (PlatformOptions.isDebug) {
			this.on('click', this.onClick);
		}
	}

	private onClick() {
		if (RawInput.isCtrlDown) {
			Achievements.markAchievementCompleted(this.achievement);
		} else if (RawInput.isShiftDown) {
			this.achievement.clear();
		} else {
			new TGrowlAchievement(this.achievement);
		}
	}

	public update() {
	}

	public updateCompletion() {
		this._adjustFilter.red = 1;
		this._adjustFilter.green = 1;
		this._adjustFilter.blue = 1;

		if (this.achievement.acquired) {
			this._adjustFilter.saturation = 1;
			this.alpha = 1;
		} else if (this.achievement._data.failed) {
			this._adjustFilter.red = 1;
			this._adjustFilter.green = 0.3;
			this._adjustFilter.blue = 0.3;
			this._adjustFilter.saturation = 0.5;
			this.alpha = 0.75;
		} else if (this.achievement.isRunning) {
			this._adjustFilter.saturation = 0.1;
			this.alpha = 0.5;
		} else {
			this._adjustFilter.saturation = 0;
			this.alpha = 0.15;
		}

		this.registerTooltip();
	}

	public registerTooltip() {
		const desc: string = typeof this.achievement.desc === 'function'
			? this.achievement.desc(this.achievement)
			: this.achievement.desc;

		// Hook is never removed because the object is never garbage collected
		RecamelTooltip.hook(this, "== " + this.achievement.name + " ==\n" + desc);
	}
}
