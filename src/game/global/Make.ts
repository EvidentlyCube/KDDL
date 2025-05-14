import * as PIXI from 'pixi.js';
import {Gfx} from "./Gfx";
import {Text} from "../../../src.framework/net/retrocade/standalone/Text";
import {C} from "../../C";
import {Button, ButtonCallback} from "../../../src.framework/net/retrocade/standalone/Button";
import {TDrodButton} from "../interfaces/TDrodButton";
import { DebugConsole } from '../DebugConsole';

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


DebugConsole.registerAction('debug-text-dimensions', "Run some internal tests for debugging issues with text", () => {
	const { appendLine } = DebugConsole;
	const text = Make.text(26);
	try {
		text.text = "This is a test string";

		const measure = text.textCanvas.getContext('2d')!.measureText(text.text)!;

		appendLine(` ‣ **Text:** ${text.text}`);
		appendLine(`     ↳ **format.align:** ${text.textFormat.align}`);
		appendLine(`     ↳ **format.fontFamily:** ${text.textFormat.fontFamily}`);
		appendLine(`     ↳ **format.fontSize:** ${text.textFormat.fontSize}`);
		appendLine(`     ↳ **format.fontVariant:** ${text.textFormat.fontVariant}`);
		appendLine(`     ↳ **format.fontWeight:** ${text.textFormat.fontWeight}`);
		appendLine(`     ↳ **format.leading:** ${text.textFormat.leading}`);
		appendLine(`     ↳ **format.letterSpacing:** ${text.textFormat.letterSpacing}`);
		appendLine(`     ↳ **format.lineHeight:** ${text.textFormat.lineHeight}`);
		appendLine(`     ↳ **format.padding:** ${text.textFormat.padding}`);
		appendLine(`     ↳ **format.textBaseline:** ${text.textFormat.textBaseline}`);
		appendLine(`     ↳ **format.wordWrap:** ${text.textFormat.wordWrap}`);
		appendLine(`     ↳ **format.wordWrapWidth:** ${text.textFormat.wordWrapWidth}`);
		appendLine(` ‣ **Width:** ${text.width}`);
		appendLine(` ‣ **Height:** ${text.height}`);
		appendLine(` ‣ **Text Width:** ${text.textWidth}`);
		appendLine(` ‣ **Text Height:** ${text.textHeight}`);
		appendLine(` ‣ **Canvas Width:** ${text.textCanvas.width}`);
		appendLine(` ‣ **Canvas Height:** ${text.textCanvas.height}`);
		appendLine(` ‣ **Text Measure:**`);
		appendLine(`     ↳ **actualBoundingBoxAscent:** ${measure.actualBoundingBoxAscent}`);
		appendLine(`     ↳ **actualBoundingBoxDescent:** ${measure.actualBoundingBoxDescent}`);
		appendLine(`     ↳ **actualBoundingBoxLeft:** ${measure.actualBoundingBoxLeft}`);
		appendLine(`     ↳ **actualBoundingBoxRight:** ${measure.actualBoundingBoxRight}`);
		appendLine(`     ↳ **alphabeticBaseline:** ${measure.alphabeticBaseline}`);
		appendLine(`     ↳ **emHeightAscent:** ${measure.emHeightAscent}`);
		appendLine(`     ↳ **emHeightDescent:** ${measure.emHeightDescent}`);
		appendLine(`     ↳ **fontBoundingBoxAscent:** ${measure.fontBoundingBoxAscent}`);
		appendLine(`     ↳ **hangingBaseline:** ${measure.hangingBaseline}`);
		appendLine(`     ↳ **ideographicBaseline:** ${measure.ideographicBaseline}`);
		appendLine(`     ↳ **width:** ${measure.width}`);

	} finally {
		text.destroy()
	}


});