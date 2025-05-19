import { VOBitmapSegment } from "../../managers/effects/VOBitmapSegment";
import { VOBoltSegment } from "../../managers/effects/VOBoltSegment";
import { S } from "../../../S";
import { Gfx } from "../../global/Gfx";
import { ASSERT } from "../../../ASSERT";
import { UtilsRandom } from "../../../../src.framework/net/retrocade/utils/UtilsRandom";
import { Container, Rectangle, Sprite, Texture } from "pixi.js";

const PIECE_LONG_0_180 = new VOBitmapSegment(1, 55, 30, 4);
const PIECE_LONG_22_202 = new VOBitmapSegment(40, 5, 28, 14);
const PIECE_LONG_45_225 = new VOBitmapSegment(15, 5, 24, 23);
const PIECE_LONG_67_247 = new VOBitmapSegment(1, 12, 13, 26);
const PIECE_LONG_90_270 = new VOBitmapSegment(71, 22, 4, 29);
const PIECE_LONG_112_292 = new VOBitmapSegment(57, 26, 13, 26);
const PIECE_LONG_135_315 = new VOBitmapSegment(32, 30, 24, 23);
const PIECE_LONG_157_337 = new VOBitmapSegment(3, 40, 28, 14);

const PIECE_SHORT_0_180 = new VOBitmapSegment(42, 54, 7, 3);
const PIECE_SHORT_22_202 = new VOBitmapSegment(53, 20, 7, 5);
const PIECE_SHORT_45_225 = new VOBitmapSegment(45, 20, 7, 6);
const PIECE_SHORT_67_247 = new VOBitmapSegment(40, 20, 4, 6);
const PIECE_SHORT_90_270 = new VOBitmapSegment(71, 52, 3, 7);
const PIECE_SHORT_112_292 = new VOBitmapSegment(66, 53, 4, 6);
const PIECE_SHORT_135_315 = new VOBitmapSegment(58, 53, 7, 6);
const PIECE_SHORT_157_337 = new VOBitmapSegment(50, 54, 7, 5);

const PIECE_SPARKLE_BIG = new VOBitmapSegment(61, 22, 3, 3);
const PIECE_SPARKLE_SMALL = new VOBitmapSegment(65, 23, 2, 2);

const A_0 = 0;
const A_22 = 1;
const A_45 = 2;
const A_67 = 3;
const A_90 = 4;
const A_112 = 5;
const A_135 = 6;
const A_157 = 7;
const A_180 = 8;
const A_202 = 9;
const A_225 = 10;
const A_247 = 11;
const A_270 = 12;
const A_292 = 13;
const A_315 = 14;
const A_337 = 15;

const A_COUNT = 16;

const SLOPE_11_25 = 0.19891;
const SLOPE_33_75 = 0.66818;
const SLOPE_56_25 = 1.49661;
const SLOPE_78_75 = 5.02737;

const LONG_SEGMENTS = [
	new VOBoltSegment(PIECE_LONG_0_180, 1, 1, 27, 0),
	new VOBoltSegment(PIECE_LONG_22_202, 1, 12, 26, -11),
	new VOBoltSegment(PIECE_LONG_45_225, 1, 21, 21, -20),
	new VOBoltSegment(PIECE_LONG_67_247, 1, 24, 10, -23),
	new VOBoltSegment(PIECE_LONG_90_270, 2, 27, 0, -26),
	new VOBoltSegment(PIECE_LONG_112_292, 11, 24, -10, -23),
	new VOBoltSegment(PIECE_LONG_135_315, 22, 21, -22, -21),
	new VOBoltSegment(PIECE_LONG_157_337, 26, 12, -25, -11),
	new VOBoltSegment(PIECE_LONG_0_180, 28, 1, -27, 0),
	new VOBoltSegment(PIECE_LONG_22_202, 26, 1, -25, 11),
	new VOBoltSegment(PIECE_LONG_45_225, 22, 1, -21, 20),
	new VOBoltSegment(PIECE_LONG_67_247, 11, 1, -10, 23),
	new VOBoltSegment(PIECE_LONG_90_270, 2, 1, 0, 26),
	new VOBoltSegment(PIECE_LONG_112_292, 1, 1, 10, 23),
	new VOBoltSegment(PIECE_LONG_135_315, 1, 1, 21, 20),
	new VOBoltSegment(PIECE_LONG_157_337, 1, 1, 25, 11),
];

const SHORT_SEGMENTS = [
	new VOBoltSegment(PIECE_SHORT_0_180, 0, 1, 5, 0),
	new VOBoltSegment(PIECE_SHORT_22_202, 1, 3, 5, -2),
	new VOBoltSegment(PIECE_SHORT_45_225, 1, 4, 4, -3),
	new VOBoltSegment(PIECE_SHORT_67_247, 1, 4, 1, -4),
	new VOBoltSegment(PIECE_SHORT_90_270, 1, 5, 0, -5),
	new VOBoltSegment(PIECE_SHORT_112_292, 2, 4, -1, -4),
	new VOBoltSegment(PIECE_SHORT_135_315, 5, 4, -4, -3),
	new VOBoltSegment(PIECE_SHORT_157_337, 5, 3, -4, -2),
	new VOBoltSegment(PIECE_SHORT_0_180, 5, 1, -5, 0),
	new VOBoltSegment(PIECE_SHORT_22_202, 5, 1, -4, 2),
	new VOBoltSegment(PIECE_SHORT_45_225, 5, 1, -4, 3),
	new VOBoltSegment(PIECE_SHORT_67_247, 2, 0, -1, 4),
	new VOBoltSegment(PIECE_SHORT_90_270, 1, 0, 0, 5),
	new VOBoltSegment(PIECE_SHORT_112_292, 1, 0, 1, 4),
	new VOBoltSegment(PIECE_SHORT_135_315, 1, 1, 4, 3),
	new VOBoltSegment(PIECE_SHORT_157_337, 1, 1, 4, 2),
];

const TILE_WIDTH_HALF = S.RoomTileWidth / 2;
const TILE_HEIGHT_HALF = S.RoomTileHeight / 2;

const MAX_POSSIBLE_SIZE = S.RoomWidthPixels;

export class BoltEffect {
	private static _sparkleTextures: Texture[];
	public static initialize() {
		BoltEffect._sparkleTextures = [
			new Texture(Gfx.BoltsTexture.baseTexture, new Rectangle(
				PIECE_SPARKLE_BIG.x, PIECE_SPARKLE_BIG.y,
				PIECE_SPARKLE_BIG.width, PIECE_SPARKLE_BIG.height
			)),
			new Texture(Gfx.BoltsTexture.baseTexture, new Rectangle(
				PIECE_SPARKLE_SMALL.x, PIECE_SPARKLE_SMALL.y,
				PIECE_SPARKLE_SMALL.width, PIECE_SPARKLE_SMALL.height
			)),
		];
	}
	public static drawBolt(startX: number, startY: number, endX: number, endY: number, target: Container) {
		let x: number = startX;
		let y: number = startY;

		let sparkleX: number = x + UtilsRandom.fraction() * S.RoomTileWidth - TILE_WIDTH_HALF;
		let sparkleY: number = y + UtilsRandom.fraction() * S.RoomTileHeight - TILE_HEIGHT_HALF;

		BoltEffect.addSparkle(target, sparkleX, sparkleY);

		let moveDir: number = 0;

		let distanceToEnd: number = Math.sqrt((x - endX) * (x - endX) + (y - endY) * (y - endY));
		let distanceFromBegin: number = 0;
		let distanceToClosest: number = 0;

		let moveDirectThreshold: number;
		let useLongSegment: boolean;

		let slope: number;
		let boltSegment: VOBoltSegment;

		while (distanceToEnd > TILE_WIDTH_HALF) {
			distanceFromBegin = Math.sqrt((x - startX) * (x - startX) + (y - startY) * (y - startY));
			distanceToClosest = (distanceFromBegin < distanceToEnd ? distanceFromBegin : distanceToEnd);

			if (distanceFromBegin == 0 || distanceToEnd < S.RoomTileWidth * 3) {
				moveDirectThreshold = 0;
			} else {
				moveDirectThreshold = distanceToClosest / MAX_POSSIBLE_SIZE;
			}

			if (UtilsRandom.fraction() > moveDirectThreshold) { // Move directly
				if (x - endX == 0) { // Vertical Angle
					if (y - endY > 0) {
						moveDir = A_90;
					} else {
						ASSERT(y - endY != 0, "Should not be at the end point");
						moveDir = A_270;
					}

				} else {
					slope = (y - endY) / (x - endX);
					if (slope < 0) {
						slope = -slope;
					}

					if (endY - y < 0) {
						if (endX - x <= 0) {
							if (slope < SLOPE_11_25) {
								moveDir = A_180;
							} else if (slope < SLOPE_33_75) {
								moveDir = A_157;
							} else if (slope < SLOPE_56_25) {
								moveDir = A_135;
							} else if (slope < SLOPE_78_75) {
								moveDir = A_112;
							} else {
								moveDir = A_90;
							}
						} else {
							if (slope < SLOPE_11_25) {
								moveDir = A_0;
							} else if (slope < SLOPE_33_75) {
								moveDir = A_22;
							} else if (slope < SLOPE_56_25) {
								moveDir = A_45;
							} else if (slope < SLOPE_78_75) {
								moveDir = A_67;
							} else {
								moveDir = A_90;
							}
						}
					} else {
						if (endX - x <= 0) {
							if (slope < SLOPE_11_25) {
								moveDir = A_180;
							} else if (slope < SLOPE_33_75) {
								moveDir = A_202;
							} else if (slope < SLOPE_56_25) {
								moveDir = A_225;
							} else if (slope < SLOPE_78_75) {
								moveDir = A_247;
							} else {
								moveDir = A_270;
							}
						} else {
							if (slope < SLOPE_11_25) {
								moveDir = A_0;
							} else if (slope < SLOPE_33_75) {
								moveDir = A_337;
							} else if (slope < SLOPE_56_25) {
								moveDir = A_315;
							} else if (slope < SLOPE_78_75) {
								moveDir = A_292;
							} else {
								moveDir = A_270;
							}
						}
					}
				} // end Vertical Angle Else

				if (distanceToEnd < S.RoomTileWidth * 3) {
					useLongSegment = false;
				} else {
					useLongSegment = (UtilsRandom.fraction() < 0.5);
				}
			} else { // Move Randomly
				useLongSegment = false;
				moveDir = UtilsRandom.fraction() * A_COUNT | 0;

				ASSERT(moveDir >= 0 && moveDir < A_COUNT);
			}


			boltSegment = useLongSegment ? LONG_SEGMENTS[moveDir] : SHORT_SEGMENTS[moveDir];

			BoltEffect.addBolt(target, boltSegment, x, y);

			x += boltSegment.xPosition;
			y += boltSegment.yPosition;

			sparkleX = x + UtilsRandom.fraction() * S.RoomTileWidth - TILE_WIDTH_HALF;
			sparkleY = y + UtilsRandom.fraction() * S.RoomTileHeight - TILE_HEIGHT_HALF;

			BoltEffect.addSparkle(target, sparkleX, sparkleY);

			distanceToEnd = Math.sqrt((x - endX) * (x - endX) + (y - endY) * (y - endY));
		}
	}

	private static addSparkle(target: Container, x: number, y: number) {
		const sprite = new Sprite();
		sprite.x = x;
		sprite.y = y;
		sprite.texture = UtilsRandom.from(BoltEffect._sparkleTextures);

		target.addChild(sprite);
	}

	private static addBolt(target: Container, bolt: VOBoltSegment, x: number, y: number) {
		const sprite = new Sprite();
		sprite.x = x - bolt.xSource;
		sprite.y = y - bolt.ySource;
		sprite.texture = new Texture(
			Gfx.BoltsTexture.baseTexture,
			new Rectangle(
				bolt.bitmap.x,
				bolt.bitmap.y,
				bolt.bitmap.width,
				bolt.bitmap.height,
			)
		);

		target.addChild(sprite);
	}
}
