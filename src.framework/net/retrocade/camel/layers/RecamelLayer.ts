import * as PIXI from 'pixi.js';
import {RecamelDisplay} from "../core/RecamelDisplay";

export class RecamelLayer {
	/**
	 * Returns the display object of this layer
	 */
	get displayObject(): PIXI.DisplayObject {
		throw new Error("invalid call");
	}

	set visible(value: boolean) {
		this.displayObject.visible = value;
	}

	public constructor() {
	}

	/**
	 * Removes all graphics from the layer
	 */
	public clear(): void {
	}

	/**
	 * Removes this layer from the display list
	 */
	public removeLayer(): void {
		RecamelDisplay.removeLayer(this);
	}

	public moveToFront(): void {
		if (this.displayObject.parent) {
			RecamelDisplay.moveLayerToFront(this);
		}
	}
}
