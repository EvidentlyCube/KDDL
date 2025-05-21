import {Make} from "../global/Make";
import {_} from "../../../src.framework/_";
import {Level} from "../global/Level";
import {Text} from "../../../src.framework/net/retrocade/standalone/Text";
import {Game} from "../global/Game";
import {Gfx} from "../global/Gfx";
import { Container, Rectangle, Sprite, Texture } from "pixi.js";

export class TWidgetLevelName {
	public static container: Container;

	private static _scrollStart: Sprite;
	private static _scrollMiddles: Sprite[];
	private static _scrollEnd: Sprite;

	private static _textField: Text;

	public static init() {
		TWidgetLevelName.container = new Container();
		TWidgetLevelName._textField = Make.text(26);
		TWidgetLevelName._scrollStart = new Sprite(new Texture(
			Gfx.ScrollsTexture.baseTexture,
			new Rectangle(2, 385, 65, 36),
		));
		TWidgetLevelName._scrollMiddles = []
		TWidgetLevelName._scrollEnd = new Sprite(new Texture(
			Gfx.ScrollsTexture.baseTexture,
			new Rectangle(115, 385, 67, 36),
		));

		this.container.y = 3;

		this._textField.x = 50;
		this._textField.y = 3;

		this.container.addChild(this._scrollStart);
		this.container.addChild(this._scrollEnd);
		this.container.addChild(this._textField);
	}

	public static update(roomPid: string, levelID: number) {
		const name = Level.getLevelNameTranslated(levelID);
		const offset = Level.getRoomOffsetInLevel(roomPid);

		TWidgetLevelName._textField.text = name + ": " + TWidgetLevelName.nameFromPosition(offset.x, offset.y);

		TWidgetLevelName.draw();
	}

	private static draw() {
		if (TWidgetLevelName._scrollMiddles.length) {
			TWidgetLevelName.container.removeChild(...TWidgetLevelName._scrollMiddles);
		}

		const scrollWidth = TWidgetLevelName._textField.textWidth + 100;

		TWidgetLevelName.container.x = (596 - scrollWidth) / 2 + 158 | 0;

		//65 + x + 67
		let wid = scrollWidth - 65 - 67;
		let xNow = 65;
		let toDraw = 0;

		while (wid > 0) {
			toDraw = Math.min(wid, 48);
			wid -= toDraw;

			const sprite = new Sprite(new Texture(
				Gfx.ScrollsTexture.baseTexture,
				new Rectangle(67, 385, toDraw, 36)
			));
			sprite.x = xNow;
			TWidgetLevelName.container.addChildAt(sprite, 0);
			TWidgetLevelName._scrollMiddles.push(sprite);

			xNow += toDraw;
		}

		TWidgetLevelName._scrollEnd.x = xNow;
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
