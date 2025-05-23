import { OutlineFilter } from "@pixi/filter-outline";
import { Text } from "../../../src.framework/net/retrocade/standalone/Text";
import { S } from "../../S";
import { Game } from "../global/Game";
import { Make } from "../global/Make";
import { PermanentStore } from "../global/store/PermanentStore";
import { PlatformOptions } from "src/platform/PlatformOptions";
import { Progress } from "../global/Progress";

let text: Text;
let display = false;

export class TWidgetMoveCounter {
	public static init() {
		text = Make.text(40);
		text.text = "0";
		text.color = 0xFFFF00;
		text.x = S.LEVEL_OFFSET_X + 6
		text.y = S.LEVEL_OFFSET_Y;

		text.filters = [new OutlineFilter(2, 0, 0.5)];

		display = PermanentStore.settings.showMoveCount.read();
	}

	public static toggle() {
		display = !display;
		text.visible = display;

		PermanentStore.settings.showMoveCount.write(display);

		this.draw();
	}

	public static draw() {
		if (display) {
			if (text.parent && text.parent !== Game.room.layerUI.displayObject) {
				text.parent.removeChild(text);
			}
			if (!text.parent) {
				Game.room.layerUI.add(text);
			}
			text.text = Game.playerTurn.toString();

			if (PlatformOptions.isDebug) {
				const demo = Progress.getRoomDemo(Game.room.roomPid);

				if (demo.hasScore) {
					text.text += ` (best: ${demo.score})`;
				} else {
					text.text += " (no score)";
				}
			}
		}
	}
}

