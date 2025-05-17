import {C} from "../../C";
import {UtilsRandom} from "../../../src.framework/net/retrocade/utils/UtilsRandom";
import {Game} from "../global/Game";
import {Gfx} from "../global/Gfx";
import {ASSERT} from "../../ASSERT";
import {F} from "../../F";
import {UtilsBitmapData} from "../../../src.framework/net/retrocade/utils/UtilsBitmapData";

const FACE_BEETHRO_NORMAL: number = 0;
const FACE_BEETHRO_NORMAL_BLINK: number = 1;
const FACE_BEETHRO_STRIKE: number = 2;
const FACE_NEGOTIATOR: number = 3;
const FACE_CITIZEN1: number = 4;

const FACE_BEETHRO_AGGRESSIVE: number = 5;
const FACE_BEETHRO_AGGRESSIVE_BLINK: number = 6;
const FACE_BEETHRO_DYING_1: number = 7;
const FACE_TAR_TECHNICIAN: number = 8;
const FACE_CITIZEN2: number = 9;

const FACE_BEETHRO_NERVOUS: number = 10;
const FACE_BEETHRO_NERVOUS_BLINK: number = 11;
const FACE_BEETHRO_DYING_2: number = 12;
const FACE_MUD_COORDINATOR: number = 13;
const FACE_CITIZEN3: number = 14;

const FACE_BEETHRO_HAPPY: number = 15;
const FACE_BEETHRO_HAPPY_BLINK: number = 16;
const FACE_BEETHRO_DYING_3: number = 17;
const FACE_GOBLIN: number = 18;
const FACE_CITIZEN4: number = 19;

const FACE_BEETHRO_TALKING: number = 20;
const FACE_BEETHRO_TALKING_BLINK: number = 21;

const EYE_MASKS = [
	[0, 6, 55, 19],  //Normal
	[0, 24, 55, 19],  //Aggressive
	[0, 43, 55, 19],  //Nervous
	[0, 100, 55, 19],  //Strike
	[0, 62, 55, 19],  //Happy
	[0, 120, 55, 19],  //Dying
	[0, 82, 55, 19],   //Talking
];

const EYE_MASK_OFFSET = [
	[46, 35],           //Normal
	[46, 35],           //Aggressive
	[46, 35],           //Nervous
	[46, 35],           //Strike
	[46, 35],           //Happy
	[46, 35],           //Dying
	[46, 35],            //Talking
];

const LEFT_PUPIL_OFFSET = [
	[9, 10], //Normal
	[9, 10], //Aggressive
	[9, 10], //Nervous
	[9, 10], //Strike
	[9, 10], //Happy
	[9, 10], //Dying
	[9, 10],  //Talking
];

const FACE_POSITIONS = [
	[1, 1],
	[132, 1],
	[263, 1],
	[394, 1],
	[525, 1],

	[1, 166],
	[132, 166],
	[263, 166],
	[394, 166],
	[525, 166],

	[1, 331],
	[132, 331],
	[263, 331],
	[394, 331],
	[525, 331],

	[1, 496],
	[132, 496],
	[263, 496],
	[394, 496],
	[525, 496],

	[1, 661],
	[132, 661],
];

const FACE_X: number = 14;
const FACE_Y: number = 14;
const FACE_WIDTH: number = 130;
const FACE_HEIGHT: number = 164;

const X_BETWEEN_PUPILS: number = 36;

const PUPIL_X: number = 0;
const PUPIL_Y: number = 0;

const PUPIL_WIDTH: number = 6;
const PUPIL_HEIGHT: number = 6;

const PUPIL_WIDTH_HALF: number = 3;
const PUPIL_HEIGHT_HALF: number = 3;

const Eyes = F.newCanvasContext(55,19);

export class TWidgetFace {
	public static MOOD_NORMAL = 0;
	public static MOOD_AGGRESSIVE = 1;
	public static MOOD_NERVOUS = 2;
	public static MOOD_STRIKE = 3;
	public static MOOD_HAPPY = 4;
	public static MOOD_DYING = 5;
	public static MOOD_TALKING = 6;

	private static currentMood: number = TWidgetFace.MOOD_NORMAL;
	private static previousMood: number = TWidgetFace.MOOD_NORMAL;

	private static isReading: boolean = false;
	private static isBlinking: boolean = false;
	private static isSleeping: boolean = false;

	private static pupilX: number = 0;
	private static pupilY: number = 0;

	private static pupilTargetX: number = 0;
	private static pupilTargetY: number = 0;

	private static lastFramePaint: number = 0;
	private static lastFramePupil: number = 0;

	private static delayMood: number = 0;
	private static startDelayMood: number = 0;

	public static isMoodDrawn: boolean = false;
	private static doBlinkNextTime: boolean = false;
	private static isMoodLocked: boolean = false;

	private static speaker: number = C.SPEAK_Beethro;

	private static currentFaceX: number = 1;
	private static currentFaceY: number = 1;

	private static dyingFaceFrame: number = 0;

	public static setMood(newMood: number, moodDelay: number = 0, overrideLock: boolean = false) {
		if (TWidgetFace.isMoodLocked && !overrideLock) {
			return;
		}

		if (TWidgetFace.previousMood != newMood && !moodDelay) {
			TWidgetFace.previousMood = newMood;
		}

		if (TWidgetFace.currentMood != newMood) {
			TWidgetFace.currentMood = newMood;
			TWidgetFace.isMoodDrawn = false;
		}

		TWidgetFace.delayMood = moodDelay;
		TWidgetFace.startDelayMood = Date.now();

		TWidgetFace.isSleeping = false;
	}

	public static setSpeaker(newSpeaker: number, lockMood: boolean) {
		TWidgetFace.speaker = newSpeaker;
		TWidgetFace.isMoodLocked = lockMood;
		TWidgetFace.isMoodDrawn = false;
	}

	public static getSpeaker(): number {
		return TWidgetFace.speaker;
	}

	public static isLocked(): boolean {
		return TWidgetFace.isMoodLocked;
	}

	private static paint() {
		const wasBlinking: boolean = TWidgetFace.isBlinking;

		if (!TWidgetFace.isSleeping) {
			if (TWidgetFace.isBlinking) {
				TWidgetFace.isBlinking = false;
			} else {
				if (TWidgetFace.currentMood == TWidgetFace.MOOD_STRIKE || TWidgetFace.currentMood == TWidgetFace.MOOD_DYING) {
					TWidgetFace.isBlinking = false;
				} else {
					TWidgetFace.isBlinking = TWidgetFace.doBlinkNextTime || ((UtilsRandom.fraction() * 20 | 0) == 0);
				}
			}
		}

		TWidgetFace.doBlinkNextTime = false;

		TWidgetFace.setFace();

		const doDrawPupils: boolean = (TWidgetFace.speaker == C.SPEAK_Beethro && !TWidgetFace.isBlinking);

		if (!TWidgetFace.isMoodDrawn || TWidgetFace.isBlinking != wasBlinking || TWidgetFace.currentMood == TWidgetFace.MOOD_DYING) {
			Game.room.layerUnder.blitRectDirect(FACE_X, FACE_Y, FACE_WIDTH, FACE_HEIGHT, 0xFFFF0000);
			Game.room.layerUnder.drawComplexDirect(Gfx.FACES, FACE_X, FACE_Y, 1,
				TWidgetFace.currentFaceX, TWidgetFace.currentFaceY, FACE_WIDTH, FACE_HEIGHT);

			TWidgetFace.isMoodDrawn = true;

		} else if (doDrawPupils) {
			TWidgetFace.clearPupils();
			ASSERT(!TWidgetFace.isBlinking);
		}

		if (doDrawPupils) {
			if (Date.now() - TWidgetFace.lastFramePupil > 200) {
				TWidgetFace.movePupils();
				TWidgetFace.lastFramePupil = Date.now();
			}

			TWidgetFace.clearPupils();
			TWidgetFace.drawPupils();

			ASSERT(!TWidgetFace.isBlinking);
		}
	}

	public static setReading(reading: boolean) {
		TWidgetFace.isReading = reading;
	}

	public static setSleeping() {
		TWidgetFace.setMood(TWidgetFace.MOOD_TALKING);
		TWidgetFace.isSleeping = true;
		TWidgetFace.isBlinking = true;
		TWidgetFace.isMoodDrawn = false;
	}

	private static drawPupils() {
		ASSERT(!TWidgetFace.isSleeping);
		ASSERT(!TWidgetFace.isBlinking);
		ASSERT(TWidgetFace.isMoodDrawn);

		Eyes.clearRect(0, 0, Eyes.canvas.width, Eyes.canvas.height);

		const pupilLeftX: number = LEFT_PUPIL_OFFSET[TWidgetFace.currentMood][0] - PUPIL_WIDTH_HALF + TWidgetFace.pupilX;
		const pupilY: number = LEFT_PUPIL_OFFSET[TWidgetFace.currentMood][1] - PUPIL_HEIGHT_HALF + TWidgetFace.pupilY;

		TWidgetFace.drawPupils_drawOnePupil(
			pupilLeftX,
			pupilY);

		const pupilRightX: number = pupilLeftX + X_BETWEEN_PUPILS;

		TWidgetFace.drawPupils_drawOnePupil(
			pupilRightX,
			pupilY);

		Eyes.globalCompositeOperation = 'destination-in';
		UtilsBitmapData.drawPart(
			Gfx.EYES,
			Eyes,
			0, 0,
			EYE_MASKS[TWidgetFace.currentMood][0],
			EYE_MASKS[TWidgetFace.currentMood][1],
			EYE_MASKS[TWidgetFace.currentMood][2],
			EYE_MASKS[TWidgetFace.currentMood][3]
		);
		Eyes.globalCompositeOperation = 'source-over';

		Game.room.layerUnder.bitmapData.drawImage(
			Eyes.canvas,
			FACE_X + EYE_MASK_OFFSET[TWidgetFace.currentMood][0],
			FACE_Y + EYE_MASK_OFFSET[TWidgetFace.currentMood][1]
		)
	}

	private static drawPupils_drawOnePupil(x: number, y: number) {
		UtilsBitmapData.drawPart(
			Gfx.EYES,
			Eyes,
		    x, y,
			PUPIL_X, PUPIL_Y,
			PUPIL_WIDTH, PUPIL_HEIGHT
		);
	}

	private static clearPupils() {
		Game.room.layerUnder.drawComplexDirect(Gfx.FACES,
			FACE_X + EYE_MASK_OFFSET[TWidgetFace.currentMood][0],
			FACE_Y + EYE_MASK_OFFSET[TWidgetFace.currentMood][1],
			1,
			TWidgetFace.currentFaceX + EYE_MASK_OFFSET[TWidgetFace.currentMood][0],
			TWidgetFace.currentFaceY + EYE_MASK_OFFSET[TWidgetFace.currentMood][1],
			EYE_MASKS[TWidgetFace.currentMood][2],
			EYE_MASKS[TWidgetFace.currentMood][3]);
	}

	private static movePupils() {
		const rightBound: number = PUPIL_WIDTH - 1;
		const leftBound: number = -rightBound;

		const bottomBound: number = (EYE_MASKS[TWidgetFace.currentMood][3] - PUPIL_HEIGHT - PUPIL_HEIGHT) / 2;
		let topBound: number = -bottomBound;

		if (TWidgetFace.currentMood == TWidgetFace.MOOD_NERVOUS) {
			topBound += 2;
		} else if (TWidgetFace.currentMood == TWidgetFace.MOOD_HAPPY) {
			topBound += 1;
		}

		if (TWidgetFace.isReading) {
			if (--TWidgetFace.pupilX < leftBound) {
				TWidgetFace.pupilX = rightBound;
			}
			TWidgetFace.pupilY = bottomBound;
		} else {
			switch (TWidgetFace.currentMood) {
				case(TWidgetFace.MOOD_DYING):
				case(TWidgetFace.MOOD_STRIKE):
					TWidgetFace.pupilX = TWidgetFace.pupilY = 0;
					break;

				default:
					let relaxationLevel: number = 4;
					switch (TWidgetFace.currentMood) {
						case(TWidgetFace.MOOD_HAPPY):
						case(TWidgetFace.MOOD_TALKING):
							relaxationLevel = 6;
							break;
						case(TWidgetFace.MOOD_AGGRESSIVE):
						case(TWidgetFace.MOOD_NERVOUS):
							relaxationLevel = 0;
							break;
					}

					if (TWidgetFace.pupilTargetX < leftBound) {
						TWidgetFace.pupilTargetX = leftBound;
					} else if (TWidgetFace.pupilTargetX > rightBound) {
						TWidgetFace.pupilTargetX = rightBound;
					}

					if (TWidgetFace.pupilTargetY < topBound) {
						TWidgetFace.pupilTargetY = topBound;
					} else if (TWidgetFace.pupilTargetY > bottomBound) {
						TWidgetFace.pupilTargetY = bottomBound;
					}

					if (TWidgetFace.pupilX == TWidgetFace.pupilTargetX && TWidgetFace.pupilY == TWidgetFace.pupilTargetY) {
						if (!relaxationLevel || UtilsRandom.uint(0, relaxationLevel) == 0) {
							TWidgetFace.pupilTargetX = UtilsRandom.uint(0, rightBound - leftBound + 1) + leftBound;
							TWidgetFace.pupilTargetY = UtilsRandom.uint(0, bottomBound - topBound + 1) + topBound;
						}
					} else {
						let xDist: number = TWidgetFace.pupilTargetX - TWidgetFace.pupilX;
						const xSpeed: number = 1 + (Math.abs(xDist) > 2 ? 1 : 0) + (Math.abs(xDist) > 4 ? 1 : 0);
						TWidgetFace.pupilX += (xDist > 0 ? xSpeed : xDist < 0 ? -xSpeed : 0);

						xDist = TWidgetFace.pupilTargetY - TWidgetFace.pupilY;
						TWidgetFace.pupilY += (xDist > 0 ? 1 : xDist < 0 ? -1 : 0);
					}
					break;
			} // End of Switch
		} // End of elseif

		if (TWidgetFace.pupilX < leftBound) {
			TWidgetFace.pupilX = leftBound;
		} else if (TWidgetFace.pupilX > rightBound) {
			TWidgetFace.pupilX = rightBound;
		}

		if (TWidgetFace.pupilY < topBound) {
			TWidgetFace.pupilY = topBound;
		} else if (TWidgetFace.pupilY > bottomBound) {
			TWidgetFace.pupilY = bottomBound;
		}
	}

	public static setFace() {
		let face: number = Number.MAX_VALUE;

		switch (TWidgetFace.speaker) {
			case(C.SPEAK_Beethro):
				switch (TWidgetFace.currentMood) {
					case(TWidgetFace.MOOD_NORMAL):
						face = (TWidgetFace.isBlinking ? FACE_BEETHRO_NORMAL_BLINK : FACE_BEETHRO_NORMAL);
						break;
					case(TWidgetFace.MOOD_AGGRESSIVE):
						face = (TWidgetFace.isBlinking ? FACE_BEETHRO_AGGRESSIVE_BLINK : FACE_BEETHRO_AGGRESSIVE);
						break;
					case(TWidgetFace.MOOD_HAPPY):
						face = (TWidgetFace.isBlinking ? FACE_BEETHRO_HAPPY_BLINK : FACE_BEETHRO_HAPPY);
						break;
					case(TWidgetFace.MOOD_NERVOUS):
						face = (TWidgetFace.isBlinking ? FACE_BEETHRO_NERVOUS_BLINK : FACE_BEETHRO_NERVOUS);
						break;
					case(TWidgetFace.MOOD_STRIKE):
						face = FACE_BEETHRO_STRIKE;
						break;
					case(TWidgetFace.MOOD_TALKING):
						face = (TWidgetFace.isBlinking ? FACE_BEETHRO_TALKING_BLINK : FACE_BEETHRO_TALKING);
						break;
					case(TWidgetFace.MOOD_DYING):
						TWidgetFace.dyingFaceFrame++;

						TWidgetFace.isMoodDrawn = false;

						switch (TWidgetFace.dyingFaceFrame & 0x03) {
							case(0):
								face = FACE_BEETHRO_DYING_1;
								break;
							case(1):
							case(3):
								face = FACE_BEETHRO_DYING_2;
								break;
							case(2):
								face = FACE_BEETHRO_DYING_3;
								break;
						}
						break;
				}
				break;

			case(C.SPEAK_Citizen1):
				face = FACE_CITIZEN1;
				break;
			case(C.SPEAK_Citizen2):
				face = FACE_CITIZEN2;
				break;
			case(C.SPEAK_Citizen3):
				face = FACE_CITIZEN3;
				break;
			case(C.SPEAK_Citizen4):
				face = FACE_CITIZEN4;
				break;

			case(C.SPEAK_Goblin):
				face = FACE_GOBLIN;
				break;
			case(C.SPEAK_TarTechnician):
				face = FACE_TAR_TECHNICIAN;
				break;
			case(C.SPEAK_MudCoordinator):
				face = FACE_MUD_COORDINATOR;
				break;
			case(C.SPEAK_Negotiator):
				face = FACE_NEGOTIATOR;
				break;
		}

		if (face == Number.MAX_VALUE) {
			return;
		}

		const newCurrentFaceX: number = FACE_POSITIONS[face][0];
		const newCurrentFaceY: number = FACE_POSITIONS[face][1];

		if (newCurrentFaceX != TWidgetFace.currentFaceX || newCurrentFaceY != TWidgetFace.currentFaceY) {
			TWidgetFace.isMoodDrawn = false;

			TWidgetFace.currentFaceX = newCurrentFaceX;
			TWidgetFace.currentFaceY = newCurrentFaceY;
		}
	}

	public static animate() {
		const timeNow: number = Date.now();

		if (TWidgetFace.currentMood != TWidgetFace.previousMood && (TWidgetFace.delayMood > 0 && timeNow - TWidgetFace.startDelayMood > TWidgetFace.delayMood)) {
			TWidgetFace.currentMood = TWidgetFace.previousMood;
			TWidgetFace.isMoodDrawn = false;
			TWidgetFace.delayMood = 0;
		}

		if (!TWidgetFace.isMoodDrawn
			|| timeNow - TWidgetFace.lastFramePaint > 200
			|| (
				TWidgetFace.currentMood == TWidgetFace.MOOD_DYING
				&& timeNow - TWidgetFace.lastFramePaint > 50
			)
		) {
			TWidgetFace.paint();
			TWidgetFace.lastFramePaint = timeNow;
		}
	}
}
