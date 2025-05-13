import * as PIXI from 'pixi.js';
import {Make} from "../global/Make";
import {Text} from "../../../src.framework/net/retrocade/standalone/Text";
import {Button, ButtonCallback} from "../../../src.framework/net/retrocade/standalone/Button";
import {_, _def} from "../../../src.framework/_";
import {UtilsBase64} from "../../../src.framework/net/retrocade/utils/UtilsBase64";
import {attr, intAttr, textAttr} from "../../XML";
import { Level } from '../global/Level';

const WIDTH = 200;

export class TRestoreLevel extends Button {
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
		this.text.alignMiddleParent(0, TRestoreLevel.HEIGHT);

		this.data = level;
	}

	private adaptTextSize() {
		let fontSize = 20;
		let leading = 0;

		while (true) {
			if (this.text.getLocalBounds().width <= WIDTH) {
				break;
			}

			leading--;
			if (leading < -3) {
				leading = 0;
				fontSize--;
			}

			this.text.size = fontSize;
			this.text.textFormat.leading = leading;
		}
	}

	public unset() {
		this.isSet = false;
		this.graphics.clear();
		this.graphics.beginFill(0, 0.1);
		this.graphics.drawRect(0, 0, WIDTH, TRestoreLevel.HEIGHT);
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
		this.graphics.drawRect(0, 0, WIDTH, TRestoreLevel.HEIGHT);
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
