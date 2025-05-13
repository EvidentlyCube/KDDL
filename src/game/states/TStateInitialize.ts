import * as PIXI from 'pixi.js';
import {RecamelState} from "../../../src.framework/net/retrocade/camel/core/RecamelState";
import {Make} from "../global/Make";
import {Text} from "../../../src.framework/net/retrocade/standalone/Text";
import {Core} from "../global/Core";
import {RecamelEffectFadeScreen} from "../../../src.framework/net/retrocade/camel/effects/RecamelEffectFadeScreen";
import {Gfx} from "../global/Gfx";
import {DB} from "../global/DB";
import {_} from "../../../src.framework/_";
import {printf} from "../../../src.framework/printf";
import {ResourcesQueue} from "../../resources/mainGame/ResourcesQueue";

export class TStateInitialize extends RecamelState {
	private _text: Text;
	private _bg: PIXI.Sprite;

	public constructor() {
		super();

		this._text = Make.text(24, 0xFFFFFF);
		this._bg = new PIXI.Sprite(Gfx.LevelStartBgTexture);
	}

	create() {
		Core.lMain.add2(this._bg);
		Core.lMain.add2(this._text);
		new RecamelEffectFadeScreen(0, 1, 0, 250);
	}

	destroy() {
		Core.lMain.remove2(this._bg);
		Core.lMain.remove2(this._text);

		super.destroy();
	}

	public update() {
		this._text.text = _("ui.hold_initialize.initializing_assets", DB.queueLoaded, DB.queueTotal);
		this._text.text = printf(
			"Loading Assets: %%/%%\nDecoding Hold: %%%", // @FIXME-i18n
			ResourcesQueue.resourcesLoadedCount,
			ResourcesQueue.resourcesCount,
			DB.queueTotal > 0 ? (100 * DB.queueLoaded / DB.queueTotal).toFixed(0) : '0'
		);

		this._text.alignCenter();
		this._text.alignMiddle();
	}
}
