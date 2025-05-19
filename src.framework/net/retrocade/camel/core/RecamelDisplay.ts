import * as PIXI from 'pixi.js';
import {RecamelTooltip} from "./RecamelTooltip";
import {RecamelLayer} from "../layers/RecamelLayer";

export class RecamelDisplay {
	private static _application: PIXI.Container;

	/**
	 * Shortcut to the instance of the main application
	 */
	public static get application(): PIXI.Container {
		return RecamelDisplay._application;
	}

	public static _windowsContainer: PIXI.Sprite;

	/**
	 * Sprite containing all layers
	 */
	public static _game: PIXI.Sprite;

	/**
	 * @private
	 * Initializes the display list
	 */
	public static initialize(main: PIXI.Container): void {
		RecamelDisplay._application = main;

		RecamelDisplay._windowsContainer = new PIXI.Sprite();
		RecamelDisplay._game = new PIXI.Sprite();

		RecamelDisplay._application.addChild(RecamelDisplay._game);
		RecamelDisplay._application.addChild(RecamelDisplay._windowsContainer);
		RecamelDisplay._application.addChild(RecamelTooltip.container);
	}

	/**
	 * Adds layer to the game display
	 * @param layer Layer to be added
	 */
	public static addLayer(layer: RecamelLayer): void {
		RecamelDisplay._game.addChild(layer.displayObject);
	}

	/**
	 * Adds layer to the game display
	 * @param layer Layer to be added
	 */
	public static addLayerAt(layer: RecamelLayer, index: number = 0): void {
		RecamelDisplay._game.addChildAt(layer.displayObject, index);
	}

	/**
	 * Removes layer from the display
	 * @param layer Layer to be removed from the game's display
	 */
	public static removeLayer(layer: RecamelLayer): void {
		RecamelDisplay._game.removeChild(layer.displayObject);
	}

	public static moveLayerToBack(layer: RecamelLayer) {
		RecamelDisplay._game.setChildIndex(layer.displayObject, 0);
	}

	public static moveLayerToFront(layer: RecamelLayer) {
		RecamelDisplay._game.setChildIndex(layer.displayObject, RecamelDisplay._game.children.length - 1);
	}

	/**
	 * Blocks all input on the game layers, primarily used by RecamelWindowManager
	 */
	public static block(): void {
		RecamelDisplay._game.interactive = false;
		RecamelDisplay._game.interactiveChildren = false;
	}

	/**
	 * Enables the input on the game layers, primarily used by RecamelWindowManager
	 */
	public static unblock(): void {
		RecamelDisplay._game.interactive = true;
		RecamelDisplay._game.interactiveChildren = true;
	}
}
