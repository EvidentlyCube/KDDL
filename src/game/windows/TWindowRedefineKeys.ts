import * as PIXI from 'pixi.js';
import {RecamelWindow} from "../../../src.framework/net/retrocade/camel/core/RecamelWindow";
import {TDrodButton} from "../interfaces/TDrodButton";
import {Text} from "../../../src.framework/net/retrocade/standalone/Text";
import {Make} from "../global/Make";
import {_} from "../../../src.framework/_";
import {S} from "../../S";
import {Core} from "../global/Core";
import RawInput from "../../../src.tn/RawInput";
import {TWindowRedefineWait} from "./TWindowRedefineWait";
import {AdjustmentFilter} from '@pixi/filter-adjustment';
import {Button} from "../../../src.framework/net/retrocade/standalone/Button";
import {RecamelEffectFade} from "../../../src.framework/net/retrocade/camel/effects/RecamelEffectFade";
import { PlayerAction } from '../global/DrodInput';

const DuplicateFilter = new AdjustmentFilter({red: 1.5, green: 0.5, blue: 0.5});


export class TWindowRedefineKeys extends RecamelWindow {
	private static _instance: TWindowRedefineKeys;

	public static show() {
		if (!TWindowRedefineKeys._instance) {
			TWindowRedefineKeys._instance = new TWindowRedefineKeys();
		}
		TWindowRedefineKeys._instance.show();
	}


	private _modal: PIXI.Graphics;
	private _bg: PIXI.NineSlicePlane;

	private _buttons: TDrodButton[] = [];
	private _close: TDrodButton;

	public constructor() {
		super();

		this._modal = new PIXI.Graphics();
		this._bg = Make.windowGrid9();

		this.addChild(this._modal);
		this.addChild(this._bg);

		this.getLabel(_("controls_move_nw"), 0);
		this.getLabel(_("controls_move_n"), 1);
		this.getLabel(_("controls_move_ne"), 2);
		this.getLabel(_("controls_move_w"), 3);
		this.getLabel(_("controls_move_e"), 4);
		this.getLabel(_("controls_move_sw"), 5);
		this.getLabel(_("controls_move_s"), 6);
		this.getLabel(_("controls_move_se"), 7);
		this.getLabel(_("controls_wait"), 8);
		this.getLabel(_("controls_turn_ccw"), 10);
		this.getLabel(_("controls_turn_cw"), 9);
		this.getLabel(_("controls_undo"), 11);
		this.getLabel(_("controls_restart"), 12);
		this.getLabel(_("controls_battle"), 13);
		this.getLabel(_("controls_lock"), 14);

		this.getButton("move_nw", 0);
		this.getButton("move_n", 1);
		this.getButton("move_ne", 2);
		this.getButton("move_w", 3);
		this.getButton("move_e", 4);
		this.getButton("move_sw", 5);
		this.getButton("move_s", 6);
		this.getButton("move_se", 7);
		this.getButton("wait", 8);
		this.getButton("turn_ccw", 10);
		this.getButton("turn_cw", 9);
		this.getButton("undo", 11);
		this.getButton("restart", 12);
		this.getButton("battle", 13);
		this.getButton("lock", 14);


		this._close = new TDrodButton(this.onClose, "Close");
		this.addChild(this._close);

		this._bg.width = this.width + 10;
		this._close.alignCenterParent();

		this._close.y = this._buttons[this._buttons.length - 1].bottom + 10;
		this._bg.height = this.height + 10;

		this.center();

		this._modal.beginFill(0, 0.6);
		this._modal.drawRect(-this.x, -this.y, S.SIZE_GAME_WIDTH, S.SIZE_GAME_HEIGHT);
	}

	private getLabel(text: string, index: number): Text {
		const V_SPACE: number = 34;

		const label: Text = Make.text(18);

		label.x = 5;
		label.y = index * V_SPACE + 5;
		label.text = text;

		this.addChild(label);

		return label;
	}

	private getButton(keyName: PlayerAction, index: number): TDrodButton {
		const H_OFFSET: number = 350;
		const V_SPACE: number = 34;

		const button: TDrodButton = new TDrodButton(this.onRedefineClick, RawInput.translateKeyName(Core.getKey(keyName)));

		button.data = keyName;

		button.x = H_OFFSET;
		button.y = index * V_SPACE + 7;

		button.width = 200;
		button.height = V_SPACE - 4;

		this.addChild(button);

		this._buttons.push(button);

		return button;
	}

	public update() {
		if (!this.interactiveChildren && RawInput.isKeyPressed('Escape')) {
			RawInput.flushAll();
			this.onClose();
		}
	}

	private onRedefineClick = (button: Button) => {
		TWindowRedefineWait.show(button.data as PlayerAction, this.handleRedefined);
	};

	private handleRedefined = (keyName: PlayerAction, newValue: string) => {
		Core.setKey(keyName, newValue);

		for (let i of this._buttons) {
			i.textField.text = RawInput.translateKeyName(Core.getKey(i.data));
			i.width = i.width;


			i.filters = [];
		}

		this.markDuplicates();
	};

	private markDuplicates() {
		let buttonLeft: TDrodButton;
		let buttonRight: TDrodButton;

		let i: number = 0;
		const l: number = this._buttons.length;
		for (; i < l; i++) {
			buttonLeft = this._buttons[i];
			for (let j: number = i + 1; j < l; j++) {
				buttonRight = this._buttons[j];

				if (Core.getKey(buttonLeft.data) == Core.getKey(buttonRight.data)) {
					buttonLeft.filters = [DuplicateFilter];
					buttonRight.filters = [DuplicateFilter];
				}
			}
		}
	}

	private onClose = () => {
		this.interactiveChildren = false;
		Core.saveKeyMappings();
		new RecamelEffectFade(this, 1, 0, 500, this.onFadedOut);
	};

	public show() {
		super.show();
		this.interactiveChildren = false;

		new RecamelEffectFade(this, 0, 1, 500, this.onFadedIn);

		this.markDuplicates();
	}

	public onFadedIn = () => {
		this.interactiveChildren = true;
	};

	public onFadedOut = () => {
		this.close();
	}
}
