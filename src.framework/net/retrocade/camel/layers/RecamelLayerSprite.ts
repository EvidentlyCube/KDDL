import {RecamelLayer} from "./RecamelLayer";
import {RecamelDisplay} from "../core/RecamelDisplay";
import { DisplayObject, Filter, Sprite, Texture } from "pixi.js";
import { AdjustmentFilter } from "@pixi/filter-adjustment";

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
	private _layer = new Sprite();

	/**
	 * Returns the display object of this layer
	 */
	public get displayObject(): DisplayObject {
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
	 * Directly accesses the layer's Sprite instance
	 */
	public get layer(): Sprite {
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

	private _saturationFilter = new AdjustmentFilter();

	public set saturation(saturation: number) {
		if (this._saturationFilter.saturation !== saturation) {
			this._saturationFilter.saturation = saturation;
			this.updateFilters();
		}
	}

	public get saturation() {
		return this._saturationFilter.saturation;
	}

	public updateFilters() {
		this._layer.filters = [
			this._saturationFilter.saturation < 1 ? this._saturationFilter : undefined
		].filter(x => x) as Filter[];
	}


	/****************************************************************************************************************/
	/**                                                                                         DISPLAY LIST STUFF  */

	/****************************************************************************************************************/


	/**
	 * Adds a DisplayObject to this layer
	 * @param d DisplayObject to be added
	 */
	public add(d: DisplayObject) {
		this._layer.addChild(d);
	}

	/**
	 * Adds an RecamelObjectDisplay to this layer
	 * @param d RecamelObjectDisplay to be added
	 * @param index
	 */
	public addAt(d: DisplayObject, index: number) {
		this._layer.addChildAt(d, index);
	}

	/**
	 * Removes all children from this layer
	 */
	public clear() {
		this._layer.removeChildren();
	}

	/**
	 * Checks if given DisplayObject is added to this layer
	 * @param d The DisplayObject to be checked
	 * @return True if this layer contains d
	 */
	public contains(d: DisplayObject): boolean {
		return this._layer.children.indexOf(d) !== -1;
	}

	/**
	 * Removes an DisplayObject from this layer
	 * @param d The DisplayObject to be removed
	 */
	public remove(d: DisplayObject) {
		this._layer.removeChild(d);
	}

	public addMask(x: number, y: number, width: number, height: number) {
		if (this.displayObject.mask) {
			if (this.displayObject.mask instanceof DisplayObject) {
				this.displayObject.mask.parent?.removeChild(this.displayObject.mask);
			}
			this.displayObject.mask = null;
		}

		const mask = new Sprite(Texture.WHITE);
		mask.x = x;
		mask.y = y;
		mask.width = width;
		mask.height = height;
		this.add(mask);
		this.displayObject.mask = mask;
	}
}
