import * as PIXI from 'pixi.js';
import {AdjustmentFilter} from '@pixi/filter-adjustment';
import {RecamelLayer} from "../../../src.framework/net/retrocade/camel/layers/RecamelLayer";
import {BitmapDataWritable, CanvasImageSource, CanvasImageSourceFragment} from "../../C";
import {PlatformOptions} from "../../platform/PlatformOptions";
import {S} from "../../S";
import {T} from "../../T";
import {UtilsNumber} from "../../../src.framework/net/retrocade/utils/UtilsNumber";
import {RecamelDisplay} from "../../../src.framework/net/retrocade/camel/core/RecamelDisplay";

export class DrodLayer extends RecamelLayer {
	public static create(width: number, height: number, positionX: number, positionY: number) {
		const layer = new DrodLayer(width, height, positionX, positionY);
		const addAt = PlatformOptions.isGame ? -1 : Number.MAX_VALUE;

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
	 * BitmapData of the layer, the draw-on thing
	 */
	public bitmapData: BitmapDataWritable;
	public texture: PIXI.Texture;
	public baseTexture: PIXI.BaseTexture;

	/**
	 * Bitmap, the layer
	 */
	private _layer: PIXI.Sprite;

	/**
	 * @inheritdoc
	 */
	public get displayObject(): PIXI.DisplayObject {
		return this._layer;
	}

	public offsetX: number = 0;
	public offsetY: number = 0;

	private _width: number;
	private _height: number;
	private _desaturateFilter?: AdjustmentFilter;

	/**
	 * Constructor
	 */
	private constructor(width: number, height: number, positionX: number, positionY: number) {
		super();

		const canvas = document.createElement('canvas');
		canvas.width = width;
		canvas.height = height;
		this.bitmapData = canvas.getContext('2d')!;
		this.baseTexture = new PIXI.BaseTexture(this.bitmapData.canvas, {width, height});
		this.texture = new PIXI.Texture(this.baseTexture);
		this._layer = new PIXI.Sprite(this.texture);

		this._width = width;
		this._height = height;

		this._layer.x = positionX;
		this._layer.y = positionY;
	}

	public set saturation(saturation: number) {

		if (saturation >= 1) {
			this._layer.filters = [];
			return;
		}

		if (!this._desaturateFilter) {
			if (saturation === 1) {
				return;
			}

			this._desaturateFilter = new AdjustmentFilter();
		}

		this._desaturateFilter.saturation = saturation;
		this._layer.filters = [this._desaturateFilter];
	}


	// ::::::::::::::::::::::::::::::::::::::::::::::::
	// :: Simple drawing functions
	// ::::::::::::::::::::::::::::::::::::::::::::::::

	/**
	 * Clears the bitmapData to transparent black
	 */
	public clear() {
		this.bitmapData.clearRect(0, 0, this._width, this._height);
	}

	/**
	 * Draws given BitmapData to the screen
	 * @param data BitmapData
	 * @param x X position of the drawing
	 * @param y Y position of the drawing
	 */
	public blit(data: CanvasImageSource, x: number, y: number) {
		this.bitmapData.drawImage(data, x * S.RoomTileWidth + this.offsetX, y * S.RoomTileHeight + this.offsetY);
	}

	public blitFragment(
		source: CanvasImageSourceFragment,
		x: number, y: number
	) {
		this.bitmapData.drawImage(
			source[0],
			source[1], source[2], source[3], source[4],
			x * S.RoomTileWidth + this.offsetX,
			y * S.RoomTileHeight + this.offsetY,
			source[3], source[4]
		);
	}

	public blitPrecise(data: CanvasImageSource, x: number, y: number) {
		this.bitmapData.drawImage(data, x + this.offsetX, y + this.offsetY);
	}

	public blitDirectly(data: CanvasImageSource, x: number, y: number) {
		this.bitmapData.drawImage(data, x, y);
	}

	public blitPartDirectly(
		source: CanvasImageSource,
		x: number, y: number,
		sourceX: number, sourceY: number,
		sourceWidth: number, sourceHeight: number,
	) {
		this.bitmapData.drawImage(source, sourceX, sourceY, sourceWidth, sourceHeight, x, y, sourceWidth, sourceHeight);
	}
	public blitFragmentDirectly(
		source: CanvasImageSourceFragment,
		x: number, y: number
	) {
		this.bitmapData.drawImage(source[0], source[1], source[2], source[3], source[4], x, y, source[3], source[4]);
	}


	public blitTileRect(gfx: CanvasImageSource, tileID: number, x: number, y: number) {
		const tile = T.TILES[tileID];
		this.bitmapData.drawImage(
			gfx,
			tile.x, tile.y,
			S.RoomTileWidth, S.RoomTileHeight,
			x * S.RoomTileWidth + this.offsetX, y * S.RoomTileHeight + this.offsetY,
			S.RoomTileWidth, S.RoomTileHeight,
		);
	}

	/**
	 * Blits a designated BitmapData's region to another BitmapData
	 * @param source Source BitmapData
	 * @param x Target draw position
	 * @param y Target draw position
	 * @param sourceX X of the top-left corner of the source rectangle
	 * @param sourceY Y of the top-left corner of the source rectangle
	 * @param sourceWidth Width of the source rectangle
	 * @param sourceHeight Height of the source rectangle
	 */
	public blitComplex(source: CanvasImageSource, x: number, y: number, sourceX: number, sourceY: number,
	                   sourceWidth: number, sourceHeight: number,
	) {
		this.bitmapData.drawImage(
			source,
			sourceX, sourceY, sourceWidth, sourceHeight,
			x, y, sourceWidth, sourceHeight,
		);
	}

	public blitTileRectPrecise(gfx: CanvasImageSource, tileID: number, x: number, y: number) {
		const tile = T.TILES[tileID];
		this.bitmapData.drawImage(
			gfx,
			tile.x, tile.y,
			S.RoomTileWidth, S.RoomTileHeight,
			x + this.offsetX, y + this.offsetY,
			S.RoomTileWidth, S.RoomTileHeight,
		);
	}

	public clearTiles() {
		this.bitmapData.clearRect(this.offsetX, this.offsetY, S.RoomWidthPixels, S.RoomHeightPixels);
	}

	public clearBlock(x: number, y: number) {
		this.bitmapData.clearRect(
			x * S.RoomTileWidth + this.offsetX,
			y * S.RoomTileHeight + this.offsetY,
			S.RoomTileWidth, S.RoomTileHeight,
		);
	}

	/**
	 * Draws a rectangle
	 * @param	x X of the top left corner
	 * @param	y Y of the top left corner
	 * @param	width Width of the rectangle
	 * @param	height Height of the rectangle
	 * @param	color Color to fill
	 */
	public blitRect(x: number, y: number, width: number, height: number, color: number) {
		const a = ((color >> 24) & 0xFF ) / 256;
		const r = (color >> 16) & 0xFF;
		const g = (color >> 8) & 0xFF;
		const b = color & 0xFF;

		this.bitmapData.fillStyle = `rgba(${r},${g},${b},${a})`;
		this.bitmapData.fillRect(x + this.offsetX, y + this.offsetY, width, height);
		this.bitmapData.fillStyle = 'transparent';
	}

	public blitRectDirect(x: number, y: number, width: number, height: number, color: number) {
		const a = ((color >> 24) & 0xFF ) / 256;
		const r = (color >> 16) & 0xFF;
		const g = (color >> 8) & 0xFF;
		const b = color & 0xFF;

		this.bitmapData.fillStyle = `rgba(${r},${g},${b},${a})`;
		this.bitmapData.fillRect(x, y, width, height);
		this.bitmapData.fillStyle = 'transparent';
	}


	// ::::::::::::::::::::::::::::::::::::::::::::::::
	// :: Advanced drawing functions
	// ::::::::::::::::::::::::::::::::::::::::::::::::

	/**
	 * Advanced draw to the layer
	 * @param data BitmapData to be drawn
	 * @param x X position
	 * @param y Y position
	 * @param alpha
	 */
	public draw(data: CanvasImageSource, x: number, y: number, alpha: number) {
		this.bitmapData.globalAlpha = alpha;
		this.bitmapData.drawImage(data, x * S.RoomTileWidth + this.offsetX, y * S.RoomTileHeight + this.offsetY);
		this.bitmapData.globalAlpha = 1;
	}
	public drawFragment(data: CanvasImageSourceFragment, x: number, y: number, alpha: number) {
		this.bitmapData.globalAlpha = alpha;
		this.bitmapData.drawImage(
			data[0],
			data[1], data[2], data[3], data[4],
			x * S.RoomTileWidth + this.offsetX,
			y * S.RoomTileHeight + this.offsetY,
			data[3], data[4],
		);
		this.bitmapData.globalAlpha = 1;
	}

	public drawPrecise(data: CanvasImageSource, x: number, y: number, alpha: number = 1) {
		this.bitmapData.globalAlpha = alpha;
		this.bitmapData.drawImage(data, x + this.offsetX, y + this.offsetY);
		this.bitmapData.globalAlpha = 1;
	}

	public drawDirect(data: CanvasImageSource, x: number, y: number, alpha: number = 1) {
		this.bitmapData.globalAlpha = alpha;
		this.bitmapData.drawImage(data, x, y);
		this.bitmapData.globalAlpha = 1;
	}

	public drawDirectFragment(data: CanvasImageSourceFragment, x: number, y: number, alpha: number = 1) {
		this.bitmapData.globalAlpha = alpha;
		this.bitmapData.drawImage(
			data[0],
			data[1], data[2], data[3], data[4],
			x, y, data[3], data[4]
		);
		this.bitmapData.globalAlpha = 1;
	}

	public drawComplexDirect(source: CanvasImageSource, x: number, y: number, alpha: number, sourceX: number,
	                         sourceY: number, sourceWidth: number, sourceHeight: number,
	) {


		this.bitmapData.globalAlpha = alpha;
		this.bitmapData.drawImage(
			source,
			sourceX, sourceY, sourceWidth, sourceHeight,
			x, y, sourceWidth, sourceHeight,
		);
		this.bitmapData.globalAlpha = 1;
	}

	public drawTileRect(gfx: CanvasImageSource, tileID: number, x: number, y: number, alpha: number) {
		this.bitmapData.globalAlpha = alpha;
		const tile = T.TILES[tileID];
		this.bitmapData.drawImage(
			gfx,
			tile.x, tile.y,
			S.RoomTileWidth, S.RoomTileHeight,
			x * S.RoomTileWidth + this.offsetX, y * S.RoomTileHeight + this.offsetY,
			S.RoomTileWidth, S.RoomTileHeight,
		);
		this.bitmapData.globalAlpha = 1;
	}

	public drawTileRectPrecise(gfx: CanvasImageSource, tileID: number, x: number, y: number, alpha: number) {
		this.bitmapData.globalAlpha = alpha;
		const tile = T.TILES[tileID];
		this.bitmapData.drawImage(
			gfx,
			tile.x, tile.y,
			S.RoomTileWidth, S.RoomTileHeight,
			x + this.offsetX, y + this.offsetY,
			S.RoomTileWidth, S.RoomTileHeight,
		);
		this.bitmapData.globalAlpha = 1;
	}

	public drawLine(x: number, y: number, toX: number, toY: number, color: number = 0xFFFFFF, alpha: number = 1, thickness: number = 1) {
		const r = (color >> 16) & 0xFF;
		const g = (color >> 8) & 0xFF;
		const b = color & 0xFF;
		const a = UtilsNumber.limit(alpha, 1, 0);

		this.bitmapData.strokeStyle = `rgba(${r},${g},${b},${a})`;
		this.bitmapData.lineWidth = thickness;

		this.bitmapData.moveTo(x, y);
		this.bitmapData.lineTo(toX, toY);

		this.bitmapData.lineWidth = 0;
		this.bitmapData.strokeStyle = 'transparent';
	}
}
