import { _ } from "../../../src.framework/_";
import { Game } from "../global/Game";
import { Gfx } from "../global/Gfx";
import { C } from "../../C";
import { Text } from "../../../src.framework/net/retrocade/standalone/Text";
import { Make } from "../global/Make";
import { Container, Rectangle, Sprite, Texture } from "pixi.js";
import { TStateGame } from "../states/TStateGame";

let SNAKE_MOVE_NAME: string[][] = [];

const width = 132;
const height = 162;

export class TWidgetClock {
	public static container = new Container();

	private static _scrollSprite: Sprite;
	private static _textField: Text;

	public static init() {
		TWidgetClock._scrollSprite = new Sprite(new Texture(
			Gfx.ScrollsTexture.baseTexture,
			new Rectangle(164, 7, width, height)
		));

		TWidgetClock._textField = Make.text(14);

		this.container.addChild(TWidgetClock._scrollSprite);
		this.container.addChild(TWidgetClock._textField);
		this.container.x = 15;
		this.container.y = 224;

		TWidgetClock._textField.wordWrapWidth = width;
		TWidgetClock._textField.wordWrap = true;

		SNAKE_MOVE_NAME = [
			["ingame.clock.h1", "ingame.clock.h2", "ingame.clock.h3", "ingame.clock.h4"],
			["ingame.clock.v1", "ingame.clock.v2", "ingame.clock.v3", "ingame.clock.v4"],
		];
	}

	public static update(doDraw: boolean, turnNo: number = 0) {
		TWidgetClock.container.visible = doDraw;

		if (doDraw) {
			TWidgetClock.updateText(turnNo);
		}
	}

	private static updateText(turnNo: number) {
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
				+ `<span ${snakes1Style}>${_(SNAKE_MOVE_NAME[snakeMoves % 10 < 5 ? 0 : 1][0])}</span>`
				+ `<span ${snakes2Style}>${_(SNAKE_MOVE_NAME[snakeMoves % 10 < 5 ? 0 : 1][1])}</span>`
				+ `<span ${snakes3Style}>${_(SNAKE_MOVE_NAME[snakeMoves % 10 < 5 ? 0 : 1][2])}</span>`
				+ `<span ${snakes4Style}>${_(SNAKE_MOVE_NAME[snakeMoves % 10 < 5 ? 0 : 1][3])}</span><br/>`
				+ `<span ${snakesMini}>${((snakeMoves % 5) + 1).toString()}/5</span>
                </div>`;
		}
		newText += '</p>';

		TWidgetClock._textField.htmlText = newText;

		TWidgetClock._textField.x = (width - TWidgetClock._textField.textWidth) / 2 - 5.5 | 0;
		TWidgetClock._textField.y = (height - TWidgetClock._textField.textHeight) / 2 | 0;
	}
}
