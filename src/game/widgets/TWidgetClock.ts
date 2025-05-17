import {_} from "../../../src.framework/_";
import {Game} from "../global/Game";
import {Gfx} from "../global/Gfx";
import {C} from "../../C";
import {Text} from "../../../src.framework/net/retrocade/standalone/Text";
import {Make} from "../global/Make";

let SNAKE_MOVE_NAME:string[][] = [];

const x = 15;
const y = 224;
const width = 132;
const height = 162;

let text: Text;
let wasDrawn = true;

export class TWidgetClock {
	public static init() {
		text = Make.text(14);

		text.wordWrapWidth = width;
		text.wordWrap = true;

		SNAKE_MOVE_NAME = [
				[_("ingame.clock.h1"), _("ingame.clock.h2"), _("ingame.clock.h3"), _("ingame.clock.h4")],
				[_("ingame.clock.v1"), _("ingame.clock.v2"), _("ingame.clock.v3"), _("ingame.clock.v4")],
		];
	}

	public static update(doDraw: boolean, turnNo: number = 0) {
		if (doDraw) {
			TWidgetClock.setText(turnNo);
			TWidgetClock.draw();

		} else if (wasDrawn) {
			TWidgetClock.clearUnder();
		}
	}

	private static setText(turnNo: number) {
		const snakeMoves: number = turnNo + 1;

		turnNo %= 30;

		turnNo = 30 - turnNo;

		let newText: string;

		const turn: string = (turnNo.toString());


		const descStyle = `fontSize="15px"`;
		const snakeStyle = `fontSize="16px"`;
		const timerStyle = `fontSize="28px" color="${turnNo == 1 ? "#BB0000" : "#000000"}"`;

		const snakes1Style = `color="${snakeMoves % 5 == 0 ? "#000000" : "#BB0000"}"`;
		const snakes2Style = `color="${snakeMoves % 5 < 2 ? "#000000" : "#BB0000"}"`;
		const snakes3Style = `color="${snakeMoves % 5 < 3 ? "#000000" : "#BB0000"}"`;
		const snakes4Style = `color="${snakeMoves % 5 < 4 ? "#000000" : "#BB0000"}"`;
		const snakesMini = `fontSize="12px"`;

		newText = `<div align="center" lineHeight="static">
                <p fontSize="15px">${_("ingame.clock.spawn_cycle")}</p>
                <p ${timerStyle}>${turn}</p>`;

		if (Game.room.getMonsterOfType(C.M_SERPENT_R)) {
			newText += `
                <span ${descStyle}>${_("ingame.clock.snakes_prefer")}</span>
                <div ${snakeStyle}>`
                + `<span ${snakes1Style}>${SNAKE_MOVE_NAME[snakeMoves % 10 < 5 ? 0 : 1][0]}</span>`
                + `<span ${snakes2Style}>${SNAKE_MOVE_NAME[snakeMoves % 10 < 5 ? 0 : 1][1]}</span>`
                + `<span ${snakes3Style}>${SNAKE_MOVE_NAME[snakeMoves % 10 < 5 ? 0 : 1][2]}</span>`
                + `<span ${snakes4Style}>${SNAKE_MOVE_NAME[snakeMoves % 10 < 5 ? 0 : 1][3]}</span><br/>`
                + `<span ${snakesMini}>${((snakeMoves % 5) + 1).toString()}/5</span>
                </div>`;
		}
		newText += '</p>';

		text.htmlText = newText;
		wasDrawn = false;
	}

	private static clearUnder() {
		Game.room.layerUnder.drawComplexDirect(Gfx.IN_GAME_SCREEN,
			x, y, 1, x, y, width, height);

		wasDrawn = false;
	}

	private static draw() {
		TWidgetClock.internalDraw();
	}

	private static internalDraw() {
		if (wasDrawn) {
			return;
		}

		Game.room.layerUnder.drawComplexDirect(Gfx.SCROLLS,
			x, y, 1, 164, 7, width, height);

		const textCanvas = text.textCanvas;
		Game.room.layerUnder.drawDirect(
			text.textCanvas,
			Math.floor(x + (width - textCanvas.width) / 2 - 5.5),
			y + (height - textCanvas.height) / 2 | 0
		);
		wasDrawn = true;
	}
}
