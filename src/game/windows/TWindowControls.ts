import * as PIXI from 'pixi.js';
import {RecamelWindow} from "../../../src.framework/net/retrocade/camel/core/RecamelWindow";
import {Button} from "../../../src.framework/net/retrocade/standalone/Button";
import {Text} from "../../../src.framework/net/retrocade/standalone/Text";
import {Make} from "../global/Make";
import {_} from "../../../src.framework/_";
import {Gfx} from "../global/Gfx";
import {DropShadowFilter} from '@pixi/filter-drop-shadow';
import {S} from "../../S";
import {RecamelEffectFade} from "../../../src.framework/net/retrocade/camel/effects/RecamelEffectFade";
import RawInput from "../../../src.tn/RawInput";

export class TWindowControls extends RecamelWindow {
	private static _instance: TWindowControls;

	public static show() {
		if (!TWindowControls._instance) {
			TWindowControls._instance = new TWindowControls();
		}

		TWindowControls._instance.show();
	}


	private _modal: PIXI.Graphics;
	private _controls: PIXI.Sprite;
	private _bg: PIXI.NineSlicePlane;
	private _close: Button;

	private _txt1: Text;
	private _txt2: Text;
	private _txt3: Text;

	public constructor() {
		super();

		this._modal = new PIXI.Graphics();
		this._bg = Make.windowGrid9();
		this._close = Make.buttonColor(() => this.onClose(), _("ui.common.close"));
		this._controls = new PIXI.Sprite(Gfx.TutorialKeysTexture);

		this._txt1 = Make.text(36);
		this._txt2 = Make.text(24);
		this._txt3 = Make.text(24);

		this._txt1.text = _("ui.default_controls.header");
		this._txt2.text = _("ui.default_controls.numpad.header");
		this._txt3.text = _("ui.default_controls.notebook.header");

		this.addChild(this._modal);
		this.addChild(this._bg);
		this.addChild(this._controls);
		this.addChild(this._close);
		this.addChild(this._txt1);
		this.addChild(this._txt2);
		this.addChild(this._txt3);

		this._controls.filters = [new DropShadowFilter({distance: 2, rotation: 45, alpha: 0.5, blur: 0, quality: 5})];
		this._controls.x = 10;
		this._controls.y = 88;
		this._bg.width = this._controls.width + 20;
		this._bg.height = this._controls.height + this._controls.y + 68;

		this._close.alignCenterParent();
		this._close.y = this._controls.height + this._controls.y + 20;

		this._txt1.alignCenterParent();
		this._txt1.y = 10;

		this._txt2.alignCenterParent(10, 155);
		this._txt2.y = 58;

		this._txt3.alignCenterParent(216, 155);
		this._txt3.y = 58;

		this.center();

		this._modal.beginFill(0, 0.5);
		this._modal.drawRect(-this.x, -this.y, S.SIZE_GAME_WIDTH, S.SIZE_GAME_HEIGHT);
	}

	public show() {
		super.show();

		this.interactiveChildren = false;

		new RecamelEffectFade(this, 0, 1, 400, () => this.onFadedIn());
	}

	public update() {
		if (this.interactiveChildren && (RawInput.isKeyPressed('Escape') || RawInput.isKeyPressed('Enter') || RawInput.isKeyPressed(' '))) {
			RawInput.flushAll();
			this.onClose();
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
