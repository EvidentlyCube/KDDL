import { Container, Rectangle, Sprite, Texture } from "pixi.js";
import { Text } from "../../../src.framework/net/retrocade/standalone/Text";
import { Gfx } from "../global/Gfx";
import { Make } from "../global/Make";

const WIDTH = 120;
const HEIGHT = 188;

export class TWidgetScroll {
	public static container: Container
	private static textField: Text;

	private static width: number = 145;
	private static height: number = 249;

	public static init() {
		TWidgetScroll.container = new Container();
		TWidgetScroll.container.addChild(
			new Sprite(new Texture(
				Gfx.ScrollsTexture.baseTexture,
				new Rectangle(8, 3, TWidgetScroll.width, TWidgetScroll.height)
			)),
			TWidgetScroll.textField = Make.text(16),
		);

		TWidgetScroll.container.x = 5;
		TWidgetScroll.container.y = 189;

		TWidgetScroll.textField.wordWrap = true;
		TWidgetScroll.textField.wordWrapWidth = WIDTH;
		TWidgetScroll.textField.textFormat.leading = -5;
		TWidgetScroll.textField.x = 8;
		TWidgetScroll.textField.y = 30;

		TWidgetScroll.setText("");
	}

	public static update(doDraw: boolean, text: string = "") {
		if (doDraw) {
			this.container.visible = true;
			TWidgetScroll.setText(text);

		} else {
			this.container.visible = false;
		}
	}

	private static setText(txt: string) {
		TWidgetScroll.textField.text = txt;
		TWidgetScroll.textField.autoAdjustSize(WIDTH, HEIGHT, 16, -5);
	}
}
