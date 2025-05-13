import * as PIXI from 'pixi.js';
import {RecamelObject} from "./RecamelObject";

export class RecamelObjectDisplay extends RecamelObject {

	/**
	 * X position of the object
	 */
	protected _x: number;

	/**
	 * X position of the object
	 */
	public get x(): number {
		return this._x;
	}

	public set x(value: number) {
		this._x = value;
	}

	public get xMid(): number {
		return this._x + this._width / 2;
	}

	public set xMid(value: number) {
		this._x = value - this._width / 2;
	}

	public get xRight(): number {
		return this._x + this._width - 1;
	}

	public set xRight(value: number) {
		this._x = value - this._width + 1;
	}

	/**
	 * Y position of the object
	 */
	protected _y: number;

	/**
	 * Y position of the object
	 */
	public get y(): number {
		return this._y;
	}

	/**
	 * @private
	 */
	public set y(value: number) {
		this._y = value;
	}

	public get yMid(): number {
		return this._y + this._height / 2;
	}

	public set yMid(value: number) {
		this._y = value - this._height / 2;
	}

	public get yBottom(): number {
		return this._y + this._height - 1;
	}

	public set yBottom(value: number) {
		this._y = value - this._height + 1;
	}

	/**
	 * Width of the object, always unsigned integer
	 */
	protected _width: number;

	public get width(): number {
		return this._width;
	}

	/**
	 * Height of the object, always unsigned integer
	 */
	protected _height: number;

	public get height(): number {
		return this._height;
	}


	/**
	 * Graphics of the object
	 */
	protected _gfx: PIXI.DisplayObject | undefined;

	/**
	 * Retrieves the DisplayObject representing this object, if any is set
	 */
	public get gfx(): PIXI.DisplayObject {
		if (!this._gfx) {
			throw new Error("Object has no GFX");
		}

		return this._gfx;
	}

	constructor() {
		super();

		this._x = 0;
		this._y = 0;
		this._width = 0;
		this._height = 0;
	}
}
