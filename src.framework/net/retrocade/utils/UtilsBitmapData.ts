import {BitmapDataWritable, CanvasImageSource} from "../../../../src/C";
import {UtilsNumber} from "./UtilsNumber";

export class UtilsBitmapData {

	public static blit(source: CanvasImageSource, target: BitmapDataWritable, x: number, y: number) {
		target.drawImage(source, x, y);
	}

	/**
	 * Blits a designated BitmapData's region to another BitmapData
	 * @param source Source BitmapData
	 * @param target Target BitmapData
	 * @param x Target draw position
	 * @param y Target draw position
	 * @param sourceX X of the top-left corner of the source rectangle
	 * @param sourceY Y of the top-left corner of the source rectangle
	 * @param sourceWidth Width of the source rectangle
	 * @param sourceHeight Height of the source rectangle
	 */
	public static blitPart(
		source: CanvasImageSource, target: BitmapDataWritable,
		x: number, y: number,
		sourceX: number, sourceY: number,
		sourceWidth: number, sourceHeight: number,
	) {
		target.drawImage(source, sourceX, sourceY, sourceWidth, sourceHeight, x, y, sourceWidth, sourceHeight);
	}

	/**
	 * Blits a rectangle on a given BitmapData
	 * @param target BitmapData on which you want to draw the rectangle
	 * @param x X position of the desired rectangle
	 * @param y Y position of the desired rectangle
	 * @param width Width of the desired rectangle
	 * @param height Height of the desired rectangle
	 * @param color RGBA color
	 */
	public static blitRectangle(
		target: BitmapDataWritable,
		x: number, y: number, width: number, height: number,
		color: number = 0xFFFFFFFF,
	) {
		const a = ((color >> 24) & 0xFF) / 256;
		const r = (color >> 16) & 0xFF;
		const g = (color >> 8) & 0xFF;
		const b = color & 0xFF;

		target.fillStyle = `rgba(${r},${g},${b},${a})`;
		target.fillRect(x, y, width, height);
		target.fillStyle = 'transparent';
	}

	public static draw(source: CanvasImageSource, target: BitmapDataWritable, x: number, y: number) {
		target.drawImage(source, x, y);
	}

	public static drawPart(
		source: CanvasImageSource, target: BitmapDataWritable,
		x: number, y: number,
		sourceX: number, sourceY: number,
		sourceWidth: number, sourceHeight: number,
	) {
		target.drawImage(source, sourceX, sourceY, sourceWidth, sourceHeight, x, y, sourceWidth, sourceHeight);
	}

	public static shapeRectangle(target: BitmapDataWritable, x: number, y: number, w: number, h: number, color: number, alpha: number) {
		alpha = UtilsNumber.limit(alpha, 1, 0) * 255 | 0;

		const r = (color >> 16) & 0xFF;
		const g = (color >> 8) & 0xFF;
		const b = color & 0xFF;
		target.fillStyle = `rgba(${r},${g},${b},${alpha})`;
		target.fillRect(x, y, w, h);
		target.fillStyle = 'transparent';
	}
}
