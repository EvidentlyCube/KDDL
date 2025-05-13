import * as PIXI from 'pixi.js';

export const UtilsDisplay = {
	/**
	 * Wraps a given DisplayObject with a Sprite. If the object is already in the display tree it is removed, added to the sprite,
	 * and then the sprite is placed where the object was previously standing.
	 * @param displayObject Display object to be wrapped.
	 * @return Sprite wrapping the displayObject
	 */
	wrapInSprite: (displayObject: PIXI.DisplayObject) => {
		const parent = displayObject.parent as PIXI.Container;
		const sprite = new PIXI.Sprite();

		if (parent) {
			const index = parent.getChildIndex(displayObject);

			parent.removeChild(displayObject);
			sprite.addChild(displayObject);
			parent.addChildAt(sprite, index);

		} else {
			sprite.addChild(displayObject);
		}

		return sprite;
	},
};
