import * as PIXI from 'pixi.js';
import { Button, ButtonCallback } from "../../../src.framework/net/retrocade/standalone/Button";
import { Text } from "../../../src.framework/net/retrocade/standalone/Text";
import { intAttr } from "../../XML";
import { Level } from '../global/Level';
import { Make } from "../global/Make";

const WIDTH = 200;

export class TRestoreLevelButton extends Button {
	public static readonly HEIGHT = 30;

	private text: Text;
	private isSet: boolean = false;
	private graphics: PIXI.Graphics;

	public levelId: number;

	public constructor(onClick: ButtonCallback, level: Element) {
		super(onClick);

		this.levelId = intAttr(level, 'LevelID');

		this.text = Make.text(20);
		this.text.text = Level.getLevelNameTranslated(this.levelId);
		this.text.autoAdjustSize(WIDTH);

		this.graphics = new PIXI.Graphics();
		this.addChild(this.graphics);
		this.addChild(this.text);

		this.unset();
		this.text.alignMiddleParent(0, TRestoreLevelButton.HEIGHT);

		this.data = level;
	}

	public unset() {
		this.isSet = false;
		this.graphics.clear();
		this.graphics.beginFill(0, 0.1);
		this.graphics.drawRect(0, 0, WIDTH, TRestoreLevelButton.HEIGHT);
		this.graphics.alpha = 0;
	}

	public set() {
		this.isSet = true;
		this.drawBackground(0x443300, 0.2);
	}

	private drawBackground(color: number, alpha: number) {
		this.graphics.alpha = 1;
		this.graphics.clear();
		this.graphics.beginFill(color, alpha);
		this.graphics.drawRect(0, 0, WIDTH, TRestoreLevelButton.HEIGHT);
	}

	protected onClick() {
		super.onClick();

		this.set();
	}

	protected onRollOver() {
		if (!this.isSet) {
			this.drawBackground(0, 0.08);
		}
	}

	protected onRollOut() {
		if (!this.isSet) {
			this.graphics.clear();
		}
	}
}
