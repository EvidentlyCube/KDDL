import * as PIXI from 'pixi.js';
import {RecamelLayer} from "./RecamelLayer";
import {RecamelObjectDisplay} from "../objects/RecamelObjectDisplay";
import {RecamelDisplay} from "../core/RecamelDisplay";

/**
 * A Layer which consists of Sprite object, classical display list
 */
export class RecamelLayerSprite extends RecamelLayer {
	public static create(addAt = -1) {
		const layer = new RecamelLayerSprite();

		if (addAt != Number.MAX_VALUE) {
			if (addAt == -1) {
				RecamelDisplay.addLayer(layer);
			} else {
				RecamelDisplay.addLayerAt(layer, addAt);
			}
		}

		return layer;
	}
	/**
	 * The Sprite which makes this layer
	 */
	private _layer: PIXI.Sprite = new PIXI.Sprite();
	private _graphics: PIXI.Graphics | undefined;

	/**
	 * Returns the display object of this layer
	 */
	public get displayObject(): PIXI.DisplayObject {
		return this._layer;
	}

	/**
	 * Accesses the alpha of this layer
	 */
	public get alpha(): number {
		return this._layer.alpha;
	}

	/**
	 * @private
	 */
	public set alpha(value: number) {
		this._layer.alpha = value;
	}

	/**
	 * Returns the Graphics object of this Layer's Sprite
	 */
	public get graphics(): PIXI.Graphics {
		if (!this._graphics) {
			this._graphics = new PIXI.Graphics();
			this._layer.addChildAt(this._graphics, 0);
		}

		return this._graphics;
	}

	/**
	 * Directly accesses the layer's Sprite instance
	 */
	public get layer(): PIXI.Sprite {
		return this._layer;
	}


	// ::::::::::::::::::::::::::::::::::::::::::::::
	// :: Mouse Children
	// ::::::::::::::::::::::::::::::::::::::::::::::

	/**
	 * Accesses this.interactiveChildren property of this layer
	 */
	public set interactiveChildren(value: boolean) {
		this._layer.interactiveChildren = value;
	}

	/**
	 * @private
	 */
	public get interactiveChildren(): boolean {
		return this._layer.interactiveChildren ?? false;
	}


	/****************************************************************************************************************/
	/**                                                                                         DISPLAY LIST STUFF  */

	/****************************************************************************************************************/

	/**
	 * Adds an RecamelObjectDisplay to this layer
	 * @param d RecamelObjectDisplay to be added
	 */
	public add(d: RecamelObjectDisplay) {
		this._layer.addChild(d.gfx);
	}

	/**
	 * Adds an RecamelObjectDisplay to this layer
	 * @param d RecamelObjectDisplay to be added
	 * @param index
	 */
	public addAt(d: RecamelObjectDisplay, index: number) {
		this._layer.addChildAt(d.gfx, index);
	}

	/**
	 * Adds a DisplayObject to this layer
	 * @param d DisplayObject to be added
	 */
	public add2(d: PIXI.DisplayObject) {
		this._layer.addChild(d);
	}

	/**
	 * Adds an RecamelObjectDisplay to this layer
	 * @param d RecamelObjectDisplay to be added
	 * @param index
	 */
	public addAt2(d: PIXI.DisplayObject, index: number) {
		this._layer.addChildAt(d, index);
	}

	/**
	 * Removes all children from this layer
	 */
	public clear() {
		this._layer.removeChildren();

		if (this._graphics) {
			this._graphics.clear();
			this._layer.addChild(this._graphics);
		}
	}

	/**
	 * Checks if given RecamelObjectDisplay is added to this layer
	 * @param d The RecamelObjectDisplay to be checked
	 * @return True if this layer contains d
	 */
	public contains(d: RecamelObjectDisplay): boolean {
		return this._layer.children.indexOf(d.gfx) !== -1;
	}

	/**
	 * Checks if given DisplayObject is added to this layer
	 * @param d The DisplayObject to be checked
	 * @return True if this layer contains d
	 */
	public contains2(d: PIXI.DisplayObject): boolean {
		return this._layer.children.indexOf(d) !== -1;
	}

	/**
	 * Removes an RecamelObjectDisplay from this layer
	 * @param d The RecamelObjectDisplay to be removed
	 */
	public remove(d: RecamelObjectDisplay) {
		this._layer.removeChild(d.gfx);
	}

	/**
	 * Removes an DisplayObject from this layer
	 * @param d The DisplayObject to be removed
	 */
	public remove2(d: PIXI.DisplayObject) {
		this._layer.removeChild(d);
	}
}
