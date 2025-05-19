import * as PIXI from 'pixi.js';
import {RecamelSprite} from "../../../src.framework/net/retrocade/camel/core/RecamelSprite";
import {TDrodButton} from "./TDrodButton";
import {Signal} from "signals";
import RawInput from "../../../src.tn/RawInput";

export class TDragButton extends RecamelSprite {
	private _itemWidth = 100;
	private _itemHeight = 20;
	private _button: TDrodButton;
	private _clickArea: PIXI.Graphics;
	private _middleLine: PIXI.Graphics;

	public onChange: Signal<TDragButton>;
	public onMouseUp: Signal<TDragButton>;

	// ::::::::::::::::::::::::::::::::::::::::::::::
	// :: Slider's value
	// ::::::::::::::::::::::::::::::::::::::::::::::

	private _value: number = 0;

	public get value(): number {
		return this._value;
	}

	public set value(value: number) {
		this._value = Math.max(0, Math.min(1, value));

		this._button.x = (this._itemWidth - this._button.width) * this._value;

		this.onChange.dispatch(this);
	}


	public constructor() {
		super();

		this.onChange = new Signal();
		this.onMouseUp = new Signal();

		this._button = new TDrodButton(() => {
		}, "");

		this._clickArea = new PIXI.Graphics();
		this._middleLine = new PIXI.Graphics();

		this._clickArea.alpha = 0;

		this.addChild(this._clickArea);
		this.addChild(this._middleLine);
		this.addChild(this._button);

		this._button.muteSounds = true;
		this._button.releaseOnRollOut = false;

		this.cursor = 'pointer';

		this.on('pointerdown', this.onClicked.bind(this));
		this._button.on('pointerdown', this.onButtonDown.bind(this));
	}

	private onButtonDown(e: PIXI.InteractionEvent) {
		document.addEventListener('pointerup', this.onStageUp);
		document.addEventListener('pointermove', this.onDragStep);
	}

	private onClicked() {
		if (RawInput.localMouseX > this._button.center) {
			this.value += 0.1;

		} else {
			this.value -= 0.1;
		}
	}

	private onStageUp = () => {
		document.removeEventListener('pointerup', this.onStageUp);
		document.removeEventListener('pointermove', this.onDragStep);

		this.onMouseUp.dispatch(this);
	};

	private onDragStep = () => {
		const position = RawInput.localMouseX - this.getGlobalPosition().x / RawInput.gameScaleX;

		this.value = (position - this._button.getLocalBounds().width / 2) / (this._itemWidth - this._button.getLocalBounds().width);
	};

	public set itemWidth(value: number) {
		this._itemWidth = value;

		this._clickArea.clear();
		this._clickArea.beginFill(0, 1);
		this._clickArea.drawRect(0, 0, value, this._itemHeight);


		this.drawLine();
	}

	public set itemHeight(value: number) {
		this._itemHeight = value;

		this._clickArea.clear();
		this._clickArea.beginFill(0, 1);
		this._clickArea.drawRect(0, 0, this._itemWidth, value);

		this._button.width = this._itemHeight * 0.70 | 0;
		this._button.height = value;

		this.drawLine();
	}

	private drawLine() {
		this._middleLine.clear();
		this._middleLine.lineStyle(1, 0, 0.5);

		// Middle line
		this._middleLine.moveTo(0, this._itemHeight / 2);
		this._middleLine.lineTo(this._itemWidth + 1, this._itemHeight / 2);

		// Left column
		this._middleLine.moveTo(0, 0);
		this._middleLine.lineTo(0, this._itemHeight);

		// Right column
		this._middleLine.moveTo(this._itemWidth, 0);
		this._middleLine.lineTo(this._itemWidth, this._itemHeight);
	}


	setSizePosition(x: number, y: number, width: number, height: number) {
		this.x = x;
		this.y = y;
		this.itemWidth = width;
		this.itemHeight = height;
	}
}
