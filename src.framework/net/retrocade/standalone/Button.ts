import {AdjustmentFilter} from "@pixi/filter-adjustment";
import {RecamelContainer} from "../camel/core/RecamelContainer";

export type ButtonCallback = (button: Button) => void;

export class Button<T = any> extends RecamelContainer {
	// ::::::::::::::::::::::::::::::::::::::::::::::
	// :: Enabled
	// ::::::::::::::::::::::::::::::::::::::::::::::

	protected _enabled: boolean = true;

	public get enabled(): boolean {
		return this._enabled;
	}

	public set enabled(value: boolean) {
		if (value) {
			this.enable();
		} else {
			this.disable();
		}
	}


	// ::::::::::::::::::::::::::::::::::::::::::::::
	// :: Misc
	// ::::::::::::::::::::::::::::::::::::::::::::::


	public mouseDownCallback: ButtonCallback | undefined;
	public mouseUpCallback: ButtonCallback | undefined;
	public clickCallback: ButtonCallback | undefined;
	public rollOverCallback: ButtonCallback | undefined;
	public rollOutCallback: ButtonCallback | undefined;

	public ignoreHighlight: boolean = false;

	public data: T|undefined;

	protected clickRegister: boolean = false;

	private colorizer: AdjustmentFilter;
	private _onStageUpBound: any;

	/****************************************************************************************************************/
	/**                                                                                                  FUNCTIONS  */
	/****************************************************************************************************************/

	// ::::::::::::::::::::::::::::::::::::::::::::::
	// :: Constructor
	// ::::::::::::::::::::::::::::::::::::::::::::::

	public constructor(clickCallback: ButtonCallback, rollOverCallback: ButtonCallback | undefined = undefined, rollOutCallback: ButtonCallback | undefined = undefined, enabled: boolean = true) {
		super();

		this.colorizer = new AdjustmentFilter();

		this.filters = [this.colorizer];

		this.clickCallback = clickCallback;
		this.rollOverCallback = rollOverCallback;
		this.rollOutCallback = rollOutCallback;

		this._enabled = enabled;
		this.interactive = true;
		this.interactiveChildren = true;

		this._onStageUpBound = this.onStageMouseUp.bind(this);
		this.addEventListeners();
	}

	protected addEventListeners() {
		this.addListener("pointerover", this.onRollOver.bind(this));
		this.addListener("pointerout", this.onRollOut.bind(this));
		this.addListener("pointerdown", this.onMouseDown.bind(this));
		this.addListener("pointerup", this.onMouseUp.bind(this));

		document.addEventListener('pointerup', this._onStageUpBound);
	}

	// @todo ensure it's called
	public destroy() {
		document.removeEventListener('pointerup', this._onStageUpBound);
	}

	// ::::::::::::::::::::::::::::::::::::::::::::::
	// :: Enabling
	// ::::::::::::::::::::::::::::::::::::::::::::::

	public enable() {
		this._enabled = true;

		this.interactiveChildren = true;
		this.interactive = true;

		this.colorizer.saturation = 1;
		this.colorizer.gamma = 1;
	}

	public disable() {
		this.interactiveChildren = false;
		this.interactive = false;

		this.colorizer.saturation = 0;
		this.colorizer.gamma = 0.75;
		this.colorizer.brightness = 1;
	}


	// ::::::::::::::::::::::::::::::::::::::::::::::
	// :: Roll Effect
	// ::::::::::::::::::::::::::::::::::::::::::::::

	protected rollOverEffect() {
		this.colorizer.brightness = 2;
	}

	protected rollOutEffect() {
		this.colorizer.brightness = 1;
	}


	/****************************************************************************************************************/
	/**                                                                                            EVENT LISTENERS  */

	/****************************************************************************************************************/

	protected onRollOver(){
		if (!this.ignoreHighlight) {
			this.rollOverEffect();
		}

		this.rollOverCallback?.(this);
	}

	protected onRollOut(){
		if (!this.ignoreHighlight) {
			this.rollOutEffect();
		}

		this.rollOutCallback?.(this);
	}

	protected onClick(){
		this.clickRegister = false;

		this.clickCallback?.(this);
	}

	protected onMouseDown(){
		this.clickRegister = true;

		this.mouseDownCallback?.(this);
	}

	protected onMouseUp(){
		this.mouseUpCallback?.(this);

		if (this.clickRegister) {
			this.onClick();
		}
	}

	protected onStageMouseUp(){
		this.clickRegister = false;
	}
}
