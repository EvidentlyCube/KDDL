import * as PIXI from 'pixi.js';
import {Button, ButtonCallback} from "../../../src.framework/net/retrocade/standalone/Button";
import {Text} from "../../../src.framework/net/retrocade/standalone/Text";
import {Make} from "../global/Make";
import {C} from "../../C";
import {DropShadowFilter} from '@pixi/filter-drop-shadow';
import {Sfx} from "../global/Sfx";


const buttonFilterUp = [new DropShadowFilter({distance: 2, alpha: 0.4, blur: 1})];
const buttonFilterDown = [new DropShadowFilter({distance: 2, alpha: 0.2, blur: 1})];

export class TDrodButton extends Button {

	public textField: Text;

	private _isDown: boolean = false;

	public get isDown(): boolean {
		return this._isDown;
	}

	private _bgUp: PIXI.NineSlicePlane;
	private _bgDown: PIXI.NineSlicePlane;

	public muteSounds: boolean = false;

	public releaseOnRollOut: boolean = true;

	public constructor(onClick: ButtonCallback, text: string) {
		super(onClick);

		this._bgUp = Make.buttonGrid9();
		this._bgDown = Make.buttonDownGrid9();

		this.textField = new Text(text, C.FONT_FAMILY, 18, 0);

		this.textField.x = 12;
		this._bgDown.height = this._bgUp.height = 32;
		this._bgDown.width = this._bgUp.width = this.textField.getLocalBounds().width + 30;
		this._bgDown.visible = false;

		this.ignoreHighlight = true;

		this.addChild(this._bgUp);
		this.addChild(this._bgDown);
		this.addChild(this.textField);

		this.textField.alignCenterParent();
		this.textField.alignMiddleParent();

		this.filters = buttonFilterUp;
	}

	public get width(): number {
		return this._bgDown.width;
	}

	public set width(value: number) {
		this._bgDown.width = this._bgUp.width = value;
		this.textField.x = (this.getLocalBounds().width - 30 - this.textField.getLocalBounds().width) / 2 + 12;
	}

	public get height(): number {
		return this._bgDown.height;
	}

	public set height(value: number) {
		this._bgDown.height = this._bgUp.height = value;
	}

	protected onRollOver(){
		super.onRollOver();

		if (this._isDown) {
			this._bgUp.visible = false;
			this._bgDown.visible = true;
			this.filters = buttonFilterDown;
		}
	};

	protected onRollOut(){
		super.onRollOut();

		if (this._isDown && this.releaseOnRollOut) {
			this._bgUp.visible = true;
			this._bgDown.visible = false;
			this.filters = buttonFilterUp;
		}
	};

	protected onClick() {
		super.onClick();

		if (!this.muteSounds)
		{
			Sfx.buttonClick();
			this.filters = buttonFilterUp;
		}
	};

	protected onMouseDown(){
		super.onMouseDown();

		this._isDown = true;
		this._bgUp.visible = false;
		this._bgDown.visible = true;
		this.filters = buttonFilterDown;
	};

	protected onMouseUp(){
		super.onMouseUp();

		this._isDown = false;
		this._bgUp.visible = true;
		this._bgDown.visible = false;
		this.filters = buttonFilterUp;
	};

	protected onStageMouseUp(){
		super.onStageMouseUp();

		this._isDown = false;

		this._bgUp.visible = true;
		this._bgDown.visible = false;
		this.filters = buttonFilterUp;
	}
}

