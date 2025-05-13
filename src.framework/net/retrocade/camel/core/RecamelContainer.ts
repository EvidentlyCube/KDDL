import * as PIXI from 'pixi.js';
import {S} from "../../../../../src/S";

export class RecamelContainer extends PIXI.Container {

	/******************************************************************************************************/
	/**                                                                                           ALIGNS  */
	/******************************************************************************************************/

	// ::::::::::::::::::::::::::::::::::::::::::::::
	// :: Align Center
	// ::::::::::::::::::::::::::::::::::::::::::::::

	/**
	 * Horizontally aligns this component to the center of the screen
	 * @param offset The offset from the center at which this component should be aligned
	 */
	public alignCenter(offset: number = 0): void {
		this.x = ((S.SIZE_GAME_WIDTH - this.width) / 2 | 0) + offset;
	}

	/**
	 * Horizontally aligns this component to the center of its parent or specified width
	 * @param offset The offset from the center at which this component should be aligned
	 * @param width The width against which to center this object. If left alone, it centers
	 * against the parent.
	 */
	public alignCenterParent(offset: number = 0, width: number = NaN): void {
		if (isNaN(width)) {
			if (!this.parent) {
				return;
			} else {
				width = this.parent.getLocalBounds().width;
			}
		}

		this.x = ((width - this.width) / 2 | 0) + offset;
	}


	// ::::::::::::::::::::::::::::::::::::::::::::::
	// :: Align Middle
	// ::::::::::::::::::::::::::::::::::::::::::::::

	/**
	 * Vertically aligns this component to the middle of the screen
	 * @param offset The offset from the middle at which this component should be aligned
	 */
	public alignMiddle(offset: number = 0): void {
		this.y = ((S.SIZE_GAME_HEIGHT - this.height) / 2 | 0) + offset;
	}

	/**
	 * Vertically aligns this component to the middle of its parent or specified height
	 * @param offset The offset from the middle at which this component should be aligned
	 * @param height The width against which to center this object. If left alone, it centers
	 * against the parent.
	 */
	public alignMiddleParent(offset: number = 0, height: number = NaN): void {
		if (isNaN(height)) {
			if (!parent) {
				return;
			} else {
				height = this.parent.getLocalBounds().height;
			}
		}

		this.y = ((height - this.height) / 2 | 0) + offset;
	}


	/******************************************************************************************************/
	/**                                                                        POSTION GETTERS / SETTERS  */
	/******************************************************************************************************/

	// ::::::::::::::::::::::::::::::::::::::::::::::
	// :: Bottom
	// ::::::::::::::::::::::::::::::::::::::::::::::

	/**
	 * The bottom edge of the sprite (y + height)
	 */
	public get bottom(): number {
		return this.y + this.height;
	}

	/**
	 * @private
	 */
	public set bottom(newVal: number) {
		this.y = newVal - this.height;
	}


	// ::::::::::::::::::::::::::::::::::::::::::::::
	// :: Center
	// ::::::::::::::::::::::::::::::::::::::::::::::

	/**
	 * Horizontal center of this sprite
	 */
	public get center(): number {
		return this.x + this.width / 2;
	}

	/**
	 * @private
	 */
	public set center(value: number) {
		this.x = value - this.width / 2;
	}


	// ::::::::::::::::::::::::::::::::::::::::::::::
	// :: Middle
	// ::::::::::::::::::::::::::::::::::::::::::::::

	/**
	 * Vertical middle of this sprite
	 */
	public get middle(): number {
		return this.y + this.height / 2;
	}

	/**
	 * @private
	 */
	public set middle(value: number) {
		this.y = value - this.height / 2;
	}


	// ::::::::::::::::::::::::::::::::::::::::::::::
	// :: Right
	// ::::::::::::::::::::::::::::::::::::::::::::::

	/**
	 * The right edge of the sprite (x + width)
	 */
	public get right(): number {
		return this.x + this.width;
	}

	/**
	 * @private
	 */
	public set right(newVal: number) {
		this.x = newVal - this.width;
	}


	// ::::::::::::::::::::::::::::::::::::::::::::::
	// :: Misc Functions
	// ::::::::::::::::::::::::::::::::::::::::::::::

	/**
	 * Sets the position and the size of this sprite
	 * @param	x Target x
	 * @param	y Target y
	 * @param	width Target width
	 * @param	height Target height
	 */
	public setSizePosition(x: number, y: number, width: number, height: number): void {
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
	}

	public setPosition(x: number, y: number): void {
		this.x = x;
		this.y = y;
	}
}
