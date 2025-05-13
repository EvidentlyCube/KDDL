import {Make} from "../global/Make";
import {_} from "../../../src.framework/_";
import {Level} from "../global/Level";
import {Text} from "../../../src.framework/net/retrocade/standalone/Text";
import {Game} from "../global/Game";
import {Gfx} from "../global/Gfx";

export class TWidgetLevelName {
	private static x: number;
	private static y: number;
	private static width: number;
	private static height: number;

	private static text: Text;

	public static init() {
		TWidgetLevelName.text = Make.text(26);
	}

	public static update(roomID: number, levelID: number) {
		const name = Level.getLevelNameTranslated(levelID);
		const offset = Level.getRoomOffsetInLevel(roomID);

		TWidgetLevelName.text.text = name + ": " + TWidgetLevelName.nameFromPosition(offset.x, offset.y);

		TWidgetLevelName.clearUnder();
		TWidgetLevelName.calculate();
		TWidgetLevelName.draw();
	}

	private static clearUnder() {
		Game.room.layerUnder.drawComplexDirect(Gfx.IN_GAME_SCREEN,
			TWidgetLevelName.x, TWidgetLevelName.y, 1, TWidgetLevelName.x, TWidgetLevelName.y, TWidgetLevelName.width, TWidgetLevelName.height);
	}

	private static calculate() {
		TWidgetLevelName.width = TWidgetLevelName.text.textWidth + 100;
		TWidgetLevelName.height = 38;

		TWidgetLevelName.x = (596 - TWidgetLevelName.width) / 2 + 158 | 0;
		TWidgetLevelName.y = 3;
	}

	private static draw() {
		Game.room.layerUnder.drawComplexDirect(Gfx.SCROLLS,
			TWidgetLevelName.x, TWidgetLevelName.y, 1, 2, 385, 65, 36);

		//65 + x + 67
		let wid = TWidgetLevelName.width - 65 - 67;
		let xNow = TWidgetLevelName.x + 65;
		let toDraw = 0;

		while (wid > 0) {
			toDraw = Math.min(wid, 48);
			wid -= toDraw;

			Game.room.layerUnder.drawComplexDirect(Gfx.SCROLLS, xNow, TWidgetLevelName.y, 1, 69, 385, toDraw, 36);

			xNow += toDraw;
		}

		Game.room.layerUnder.drawComplexDirect(Gfx.SCROLLS,
			xNow, TWidgetLevelName.y, 1, 118, 385, 67, 36);

		Game.room.layerUnder.drawDirect(TWidgetLevelName.text.textCanvas, TWidgetLevelName.x + 50, TWidgetLevelName.y + 3, 1);
	}

	public static nameFromPosition(x: number, y: number): string {
		if (x == 0 && y == 0) {
			return _("ingame.room_position.entrance");
		}

		const h: string = (x > 0 ? " " + _("ingame.room_position.east") : x < 0 ? " " + _("ingame.room_position.west") : "");
		const v: string = (y > 0 ? " " + _("ingame.room_position.south") : y < 0 ? " " + _("ingame.room_position.north") : "");

		x = x < 0 ? -x : x;
		y = y < 0 ? -y : y;

		if (x == 0) {
			return TWidgetLevelName.numberToName(y) + v;
		} else if (y == 0) {
			return TWidgetLevelName.numberToName(x) + h;
		} else {
			return TWidgetLevelName.numberToName(y) + v + ", " + TWidgetLevelName.numberToName(x) + h;
		}
	}

	public static shortNameFromPosition(x: number, y: number): string {
		if (x == 0 && y == 0) {
			return _("ingame.room_position.entrance");
		}

		const h = (x > 0 ? _("ingame.room_position.e") : x < 0 ? _("ingame.room_position.w") : "");
		const v = (y > 0 ? _("ingame.room_position.s") : y < 0 ? _("ingame.room_position.n") : "");

		x = x < 0 ? -x : x;
		y = y < 0 ? -y : y;

		if (x == 0) {
			return Math.abs(y) + v;
		} else if (y == 0) {
			return Math.abs(x) + h;
		} else {
			return Math.abs(y) + v + Math.abs(x) + h;
		}
	}

	private static numberToName(i: number): string {
		if (i >= 20) {
			return _("ingame.room_position.more", i);
		} else {
			return _(`ingame.room_position.${i}`);
		}
	}
}
