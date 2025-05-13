import {_} from "../../../src.framework/_";
import {Make} from "../global/Make";
import {Text} from "../../../src.framework/net/retrocade/standalone/Text";
import {PlatformOptions} from "../../platform/PlatformOptions";
import {Level} from "../global/Level";
import {UtilsXPath} from "../../../src.framework/net/retrocade/utils/UtilsXPath";
import {attr} from "../../XML";
import {UtilsBase64} from "../../../src.framework/net/retrocade/utils/UtilsBase64";
import {Game} from "../global/Game";
import {Gfx} from "../global/Gfx";

const WIDTH = 120;
const HEIGHT = 188;
const LEADINGS = [
	{fontSize: 16, leading: 0},
	{fontSize: 16, leading: -1},
	{fontSize: 16, leading: -2},
	{fontSize: 15, leading: 0},
	{fontSize: 15, leading: -1},
	{fontSize: 15, leading: -2},
	{fontSize: 15, leading: -3},
	{fontSize: 14, leading: 0},
	{fontSize: 14, leading: -1},
	{fontSize: 14, leading: -2},
	{fontSize: 14, leading: -3},
	{fontSize: 14, leading: -4},
	{fontSize: 13, leading: 0},
	{fontSize: 13, leading: -1},
	{fontSize: 13, leading: -2},
	{fontSize: 13, leading: -3},
	{fontSize: 13, leading: -4},
	{fontSize: 13, leading: -5},
	{fontSize: 12, leading: 0},
	{fontSize: 12, leading: -1},
	{fontSize: 12, leading: -2},
	{fontSize: 12, leading: -3},
	{fontSize: 12, leading: -4},
	{fontSize: 12, leading: -5},
	{fontSize: 12, leading: -6},
];

export class TWidgetScroll {
	private static x: number = 5;
	private static y: number = 189;
	private static width: number = 145;
	private static height: number = 249;

	private static text: Text;

	private static wasDrawn: boolean = false;

	private static _debugScrolls: string[];
	private static _debugScrollEnumerator: number = 0;

	private static f6ted(e: KeyboardEvent) {
		if (e.key != 'F6') {
			return;
		}

		TWidgetScroll._debugScrollEnumerator = (TWidgetScroll._debugScrollEnumerator + 1) % TWidgetScroll._debugScrolls.length;
		const text = TWidgetScroll._debugScrolls[TWidgetScroll._debugScrollEnumerator];

		TWidgetScroll.update(true, _(text));
	}

	public static init() {
		TWidgetScroll.text = Make.text(16);
		TWidgetScroll.text.wordWrap = true;
		TWidgetScroll.text.wordWrapWidth = WIDTH;
		TWidgetScroll.text.textFormat.leading = -5;

		TWidgetScroll.setText("");

		if (PlatformOptions.isDebug) {
			document.addEventListener('keypress', TWidgetScroll.f6ted);
			TWidgetScroll._debugScrolls = [];
			for (const scroll of UtilsXPath.getAllElements('//Scrolls', Level.getHold())) {
				TWidgetScroll._debugScrolls.push(UtilsBase64.decodeWChar(attr(scroll, 'Message')));
			}
		}
	}


	public static update(doDraw: boolean, text: string = "") {
		if (doDraw) {
			TWidgetScroll.setText(text);
			TWidgetScroll.draw();

		} else if (TWidgetScroll.wasDrawn) {
			TWidgetScroll.clearUnder();
		}
	}

	private static setText(txt: string) {
		TWidgetScroll.text.text = txt;

		for (const {fontSize, leading} of LEADINGS){
			TWidgetScroll.text.size = fontSize;
			TWidgetScroll.text.textFormat.leading = leading;

			if (TWidgetScroll.text.getLocalBounds().height <= HEIGHT) {
				break
			}
		}
	}

	private static clearUnder() {
		Game.room.layerUnder.drawComplexDirect(Gfx.IN_GAME_SCREEN,
			TWidgetScroll.x, TWidgetScroll.y, 1, TWidgetScroll.x, TWidgetScroll.y, TWidgetScroll.width, TWidgetScroll.height);

		TWidgetScroll.wasDrawn = false;
	}

	private static draw() {
		Game.room.layerUnder.drawComplexDirect(Gfx.SCROLLS,
			TWidgetScroll.x, TWidgetScroll.y, 1, 8, 3, TWidgetScroll.width, TWidgetScroll.height);

		Game.room.layerUnder.drawDirect(TWidgetScroll.text.textCanvas, TWidgetScroll.x + 8, TWidgetScroll.y + 30);

		TWidgetScroll.wasDrawn = true;
	}
}
