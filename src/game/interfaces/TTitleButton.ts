import * as PIXI from 'pixi.js';
import {Button, ButtonCallback} from "../../../src.framework/net/retrocade/standalone/Button";
import {Text} from "../../../src.framework/net/retrocade/standalone/Text";
import {Make} from "../global/Make";
import {S} from "../../S";
import { OutlineFilter } from "@pixi/filter-outline";

export class TTitleButton extends Button {

	private _textField: Text;
	private _textNormal: string;
	private _textRollover: string;

	public constructor(clickCallback: ButtonCallback, label: string, highlightIndex: number) {
		super(clickCallback);

		this._textField = Make.shadowText(label, 36);
		this._textField.tint = 0x0B0B0FF;
		this._textField.wordWrapWidth = S.SIZE_GAME_WIDTH;
		this._textField.padding = 5;

		label = label.substring(0, highlightIndex)
			+ `<font color="#FFFFFF">${label.substring(highlightIndex, highlightIndex + 1)}</font>`
			+ label.substring(highlightIndex + 1);

		this._textNormal   = `<font size="36" color="#B0B0FF">${label}</font>`;
		this._textRollover = `<font size="36" color="#FFFF60">${label}</font>`;
		this._textField.filters = [new OutlineFilter(2, 0, 3)]

		this.addChild(this._textField);
		this._textField.htmlText = this._textNormal;

		// this._textField.htmlText     = textNormal;
		this._textField.interactive = false;
		this.hitArea = new PIXI.Rectangle(this.x, this.y, this.getLocalBounds().width, 35)
	}

	public refreshTextField() {
		this.onRollOut();
	}

	public enable() {
		super.enable();

		this._textField.alpha = 1;
	}

	public disable() {
		super.disable();
		this._textField.alpha = 0.5;
		this._textField.tint = 0x0B0B0FF;
	}

	protected onRollOver = () => {
		this._textField.htmlText = this._textRollover;
	};

	protected onRollOut = () => {
		this._textField.htmlText = this._textNormal;
	};
}
