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

	private _labelN: Text;
	private _labelS: Text;
	private _labelE: Text;
	private _labelW: Text;
	private _labelNW: Text;
	private _labelNE: Text;
	private _labelSW: Text;
	private _labelSE: Text;
	private _labelWait: Text;
	private _labelC: Text;
	private _labelCC: Text;
	private _labelUndo: Text;
	private _labelRestart: Text;
	private _labelBattle: Text;
	private _labelLock: Text;

	private _buttonN: TDrodButton;
	private _buttonS: TDrodButton;
	private _buttonE: TDrodButton;
	private _buttonW: TDrodButton;
	private _buttonNW: TDrodButton;
	private _buttonNE: TDrodButton;
	private _buttonSW: TDrodButton;
	private _buttonSE: TDrodButton;
	private _buttonWait: TDrodButton;
	private _buttonC: TDrodButton;
	private _buttonCC: TDrodButton;
	private _buttonUndo: TDrodButton;
	private _buttonRestart: TDrodButton;
	private _buttonBattle: TDrodButton;
	private _buttonLock: TDrodButton;

	private _buttons: TDrodButton[] = [];
	private _close: TDrodButton;

	public constructor() {
		super();

		this._modal = new PIXI.Graphics();
		this._bg = Make.windowGrid9();

		this.addChild(this._modal);
		this.addChild(this._bg);

		this._labelNW = this.getLabel(_("controls_move_nw"), 0);
		this._labelN = this.getLabel(_("controls_move_n"), 1);
		this._labelNE = this.getLabel(_("controls_move_ne"), 2);
		this._labelW = this.getLabel(_("controls_move_w"), 3);
		this._labelE = this.getLabel(_("controls_move_e"), 4);
		this._labelSW = this.getLabel(_("controls_move_sw"), 5);
		this._labelS = this.getLabel(_("controls_move_s"), 6);
		this._labelSE = this.getLabel(_("controls_move_se"), 7);
		this._labelWait = this.getLabel(_("controls_wait"), 8);
		this._labelCC = this.getLabel(_("controls_turn_ccw"), 10);
		this._labelC = this.getLabel(_("controls_turn_cw"), 9);
		this._labelUndo = this.getLabel(_("controls_undo"), 11);
		this._labelRestart = this.getLabel(_("controls_restart"), 12);
		this._labelBattle = this.getLabel(_("controls_battle"), 13);
		this._labelLock = this.getLabel(_("controls_lock"), 14);

		this._buttonNW = this.getButton("move_nw", 0);
		this._buttonN = this.getButton("move_n", 1);
		this._buttonNE = this.getButton("move_ne", 2);
		this._buttonW = this.getButton("move_w", 3);
		this._buttonE = this.getButton("move_e", 4);
		this._buttonSW = this.getButton("move_sw", 5);
		this._buttonS = this.getButton("move_s", 6);
		this._buttonSE = this.getButton("move_se", 7);
		this._buttonWait = this.getButton("wait", 8);
		this._buttonCC = this.getButton("turn_ccw", 10);
		this._buttonC = this.getButton("turn_cw", 9);
		this._buttonUndo = this.getButton("undo", 11);
		this._buttonRestart = this.getButton("restart", 12);
		this._buttonBattle = this.getButton("battle", 13);
		this._buttonLock = this.getButton("lock", 14);


		this._close = new TDrodButton(this.onClose, "Close");
		this.addChild(this._close);

		this._bg.width = this.width + 10;
		this._close.alignCenterParent();

		this._close.y = this._buttonLock.bottom + 10;
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
