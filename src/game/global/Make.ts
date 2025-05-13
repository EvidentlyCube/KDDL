import * as PIXI from 'pixi.js';
import {Gfx} from "./Gfx";
import {Text} from "../../../src.framework/net/retrocade/standalone/Text";
import {C} from "../../C";
import {Button, ButtonCallback} from "../../../src.framework/net/retrocade/standalone/Button";
import {TDrodButton} from "../interfaces/TDrodButton";

export const Make = {
	buttonGrid9() {
		return new PIXI.NineSlicePlane(Gfx.ButtonSystemTexture, 2, 2, 2, 2);
	},
	buttonDownGrid9() {
		return new PIXI.NineSlicePlane(Gfx.ButtonDownSystemTexture, 2, 2, 2, 2);
	},
	windowGrid9() {
		return new PIXI.NineSlicePlane(Gfx.WindowSystemTexture, 7, 7, 7, 7);
	},
	tooltipGrid9() {
		return new PIXI.NineSlicePlane(Gfx.TooltipSystemTexture, 8, 8, 8, 8);
	},
	inputGrid9() {
		return new PIXI.NineSlicePlane(Gfx.InputSystemTexture, 2, 2, 2, 2);
	},

	buttonColor(onClick:ButtonCallback, text:string):Button {
	    return new TDrodButton(onClick, text);
	},

	text(fontSize: number = 14, color: number = 0): Text {
		return new Text("", C.FONT_FAMILY, fontSize, color);
	},

	shadowText(text: string = "", size: number = 48, color: number = 0xFFFFFF) {
		const textElement = new Text(text, C.FONT_FAMILY, size, color);
		textElement.textFormat.dropShadow = true;
		textElement.textFormat.dropShadowBlur = 3;
		textElement.textFormat.dropShadowAlpha = 1;
		textElement.textFormat.dropShadowDistance = 2;

		return textElement;
	},
};
