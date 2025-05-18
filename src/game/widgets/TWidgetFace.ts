import { Container, Rectangle, Sprite, Texture } from "pixi.js";
import { UtilsNumber } from "src.framework/net/retrocade/utils/UtilsNumber";
import { S } from "src/S";
import { UtilsRandom } from "../../../src.framework/net/retrocade/utils/UtilsRandom";
import { C } from "../../C";
import { F } from "../../F";
import { DROD } from "../global/DROD";
import { Gfx } from "../global/Gfx";

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

const LEFT_PUPIL_OFFSET_X = 9 + 46;
const LEFT_PUPIL_OFFSET_Y = 10 + 35;

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

const PUPIL_WIDTH: number = 6;
const PUPIL_HEIGHT: number = 6;

const PUPIL_WIDTH_HALF: number = 3;
const PUPIL_HEIGHT_HALF: number = 3;

type FaceLayer = 'player' | 'speaker' | 'dying';

export class TWidgetFace {
	public static MOOD_NORMAL = 0;
	public static MOOD_AGGRESSIVE = 1;
	public static MOOD_NERVOUS = 2;
	public static MOOD_STRIKE = 3;
	public static MOOD_HAPPY = 4;
	public static MOOD_DYING = 5;
	public static MOOD_TALKING = 6;

	private static _playerFace: Face;
	private static _speakerFace: Face;
	private static _dyingFace: Face;

	public static readonly container = new Container();
	private static readonly leftPupil = new Sprite();
	private static readonly rightPupil = new Sprite();
	private static readonly face = new Sprite();
	private static readonly faceEyes = new Sprite();

	private static _pupilX = 0;
	private static _pupilY = 0;

	public static isMoodDrawn: boolean = false;

	private static speaker: number = C.SPEAK_Beethro;

	public static get activeFace() {
		if (TWidgetFace._dyingFace.isActive) {
			return TWidgetFace._dyingFace;

		} else if (TWidgetFace._speakerFace.isActive) {
			return TWidgetFace._speakerFace;

		} else {
			return TWidgetFace._playerFace
		}
	}

	public static init() {
		TWidgetFace._playerFace = new Face(C.SPEAK_Beethro, TWidgetFace.MOOD_NORMAL, S.animations.face.faceUpdate);
		TWidgetFace._speakerFace = new Face(C.SPEAK_Beethro, TWidgetFace.MOOD_NORMAL, S.animations.face.faceUpdate);
		TWidgetFace._dyingFace = new Face(C.SPEAK_Beethro, TWidgetFace.MOOD_DYING, 1);

		TWidgetFace.container.addChild(TWidgetFace.faceEyes);
		TWidgetFace.container.addChild(TWidgetFace.leftPupil);
		TWidgetFace.container.addChild(TWidgetFace.rightPupil);
		TWidgetFace.container.addChild(TWidgetFace.face);

		TWidgetFace.container.x = FACE_X;
		TWidgetFace.container.y = FACE_Y;

		TWidgetFace.leftPupil.texture = new Texture(Gfx.FacesTexture.baseTexture, new Rectangle(266, 662, 6, 6));
		TWidgetFace.rightPupil.texture = TWidgetFace.leftPupil.texture;
	}

	private static getFace(layer: FaceLayer) {
		switch (layer) {
			case 'dying': return TWidgetFace._dyingFace;
			case 'speaker': return TWidgetFace._speakerFace;
			case 'player':
			default:
				return TWidgetFace._playerFace;
		}
	}

	public static setMood(layer: FaceLayer, newMood: number, moodDuration = 0) {
		const face = TWidgetFace.getFace(layer);

		if (moodDuration) {
			face.temporaryMood = newMood;
			face.temporaryMoodUntil = Date.now() + moodDuration;
		} else {
			face.mood = newMood;
		}
	}

	public static setCharacter(layer: FaceLayer, newSpeaker: number) {
		const face = TWidgetFace.getFace(layer);

		face.speaker = newSpeaker;
	}

	public static setSpeaker(isSpeaking: boolean, speaker: number, mood: number) {
		this._speakerFace.isActive = isSpeaking;

		if (isSpeaking) {
			this._speakerFace.speaker = speaker;
			this._speakerFace.mood = mood;
		}
	}

	public static getSpeaker(): number {
		return TWidgetFace.speaker;
	}

	public static setDying(isDying: boolean) {
		this._dyingFace.mood = TWidgetFace.MOOD_DYING;
		this._dyingFace.speaker = this._playerFace.speaker;
		this._dyingFace.isActive = isDying;
	}

	public static setReading(reading: boolean) {
		TWidgetFace._playerFace.isReading = reading;
	}

	public static setSleeping(value: boolean) {
		TWidgetFace._playerFace.isSleeping = value;
	}


	public static update() {
		const timeNow: number = Date.now();

		this.activeFace.update(this.face, this.faceEyes, this.leftPupil, this.rightPupil);;
	}
}


class Face {
	private _speaker = 0;
	private _mood = 0;
	private _temporaryMood = -1;
	private _temporaryMoodUntil = -1;
	private _isDirty = false;

	private _pupilX = 0;
	private _pupilY = 0;
	private _pupilTargetX = 0;
	private _pupilTargetY = 0;

	private _eyesTexture: Texture;
	private _faceTexture: Texture;
	private _currentFace = 0;

	public get speaker() {
		return this._speaker;
	}

	public set speaker(value: number) {
		if (this._speaker !== value) {
			this._speaker = value;
			this._isDirty = true;
		}
	}

	public get mood() {
		return this._mood;
	}

	public set mood(value: number) {
		if (this._mood !== value) {
			this._mood = value;
			this._isDirty = true;
		}
	}

	public get temporaryMood() {
		return this._temporaryMood;
	}

	public set temporaryMood(value: number) {
		if (this._temporaryMood !== value) {
			this._temporaryMood = value;
			this._isDirty = true;
		}
	}

	public get temporaryMoodUntil() {
		return this._temporaryMoodUntil;
	}

	public set temporaryMoodUntil(value: number) {
		if (this._temporaryMoodUntil !== value) {
			this._temporaryMoodUntil = value;
			this._isDirty = true;
		}
	}

	private get pupilsAtTarget() {
		return this._pupilX === this._pupilTargetX && this._pupilY === this._pupilTargetY;
	}

	public isActive = false;
	public isReading = false;
	public isSleeping = false;
	public isBlinking = false;
	public _updateSpeed: number;

	private _lastPupilMove = 0;
	private _lastFaceUpdate = 0;

	public get activeMood() {
		if (this.temporaryMood !== -1) {
			if (this.temporaryMoodUntil > Date.now()) {
				return this.temporaryMood;
			} else {
				this.temporaryMood = -1;
			}
		}

		return this.mood;
	}

	public constructor(speaker: number, mood: number, updateSpeed: number) {
		this._speaker = speaker;
		this._mood = mood;
		this._temporaryMood = -1;
		this._temporaryMoodUntil = -1;
		this._updateSpeed = updateSpeed;

		this._faceTexture = new Texture(Gfx.FacesTexture.baseTexture, new Rectangle(0, 0, FACE_WIDTH, FACE_HEIGHT));
		this._eyesTexture = new Texture(Gfx.FaceEyesTexture.baseTexture, new Rectangle(0, 0, FACE_WIDTH, FACE_HEIGHT));
	}

	public update(face: Sprite, faceEyes: Sprite, leftPupil: Sprite, rightPupil: Sprite) {
		if (!this.isSleeping) {
			if (this.activeMood === TWidgetFace.MOOD_STRIKE || this.activeMood === TWidgetFace.MOOD_DYING) {
				this.isBlinking = false;
			} else {
				this.isBlinking = UtilsRandom.uint(0, 20) === 0;
			}
		}

		if (this._lastFaceUpdate + this._updateSpeed < DROD.app.ticker.lastTime) {
			this.updateFace();
			this._lastFaceUpdate = DROD.app.ticker.lastTime;
		}

		if (this._lastPupilMove + S.animations.face.pupilMovement < DROD.app.ticker.lastTime) {
			this.movePupils();
			this._lastPupilMove = DROD.app.ticker.lastTime;
		}

		face.texture = this._faceTexture;
		faceEyes.texture = this._eyesTexture;

		leftPupil.x = LEFT_PUPIL_OFFSET_X - PUPIL_WIDTH_HALF + this._pupilX;
		rightPupil.x = leftPupil.x + X_BETWEEN_PUPILS;

		leftPupil.y = LEFT_PUPIL_OFFSET_Y - PUPIL_HEIGHT_HALF + this._pupilY;
		rightPupil.y = leftPupil.y;
	}

	public movePupils() {
		const rightBound: number = PUPIL_WIDTH - 1;
		const leftBound: number = -rightBound;
		const bottomBound = (19 - 2 * PUPIL_HEIGHT) / 2;
		let topBound = -bottomBound;

		if (this.activeMood === TWidgetFace.MOOD_NERVOUS) {
			topBound += 2;
		} else if (this.activeMood === TWidgetFace.MOOD_HAPPY) {
			topBound += 1;
		}

		if (this.isReading) {
			this._pupilX = UtilsNumber.wrap(this._pupilX - 1, leftBound, rightBound)
			this._pupilY = bottomBound;
		} else {
			switch (this.activeMood) {
				case (TWidgetFace.MOOD_DYING):
				case (TWidgetFace.MOOD_STRIKE):
					this._pupilX = 0;
					this._pupilY = 0;
					break;

				default:
					let relaxationLevel: number = 4;
					switch (this.activeMood) {
						case (TWidgetFace.MOOD_HAPPY):
						case (TWidgetFace.MOOD_TALKING):
							relaxationLevel = 6;
							break;
						case (TWidgetFace.MOOD_AGGRESSIVE):
						case (TWidgetFace.MOOD_NERVOUS):
							relaxationLevel = 0;
							break;
					}

					this._pupilTargetX = UtilsNumber.limit(this._pupilTargetX, leftBound, rightBound);
					this._pupilTargetY = UtilsNumber.limit(this._pupilTargetY, topBound, bottomBound);

					if (this.pupilsAtTarget) {
						if (!relaxationLevel || UtilsRandom.uint(0, relaxationLevel + 1) == 0) {
							this._pupilTargetX = UtilsRandom.uint(leftBound, rightBound + 1);
							this._pupilTargetY = UtilsRandom.uint(topBound, bottomBound + 1);
						}
					} else {
						const xDelta = this._pupilTargetX - this._pupilX;
						const yDelta = this._pupilTargetY - this._pupilY;

						const xSpeed = 1 + (Math.abs(xDelta) > 2 ? 1 : 0) + (Math.abs(xDelta) > 4 ? 1 : 0);
						this._pupilX = Math.abs(xDelta) <= 1
							? this._pupilTargetX
							: this._pupilX + xSpeed * Math.sign(xDelta);
						this._pupilY = Math.abs(yDelta) <= 1
							? this._pupilTargetX
							: this._pupilX + Math.sign(yDelta);
					}
					break;
			}
		}

		this._pupilX = UtilsNumber.limit(this._pupilX, leftBound, rightBound);
		this._pupilY = UtilsNumber.limit(this._pupilY, topBound, bottomBound);
	}

	private updateFace() {
		let face = FACE_BEETHRO_NORMAL;
		const hasClosedEyes = this.isBlinking || this.isSleeping;

		switch (this._speaker) {
			case (C.SPEAK_Beethro):
				switch (this.activeMood) {
					case (TWidgetFace.MOOD_NORMAL):
						face = (hasClosedEyes ? FACE_BEETHRO_NORMAL_BLINK : FACE_BEETHRO_NORMAL);
						break;
					case (TWidgetFace.MOOD_AGGRESSIVE):
						face = (hasClosedEyes ? FACE_BEETHRO_AGGRESSIVE_BLINK : FACE_BEETHRO_AGGRESSIVE);
						break;
					case (TWidgetFace.MOOD_HAPPY):
						face = (hasClosedEyes ? FACE_BEETHRO_HAPPY_BLINK : FACE_BEETHRO_HAPPY);
						break;
					case (TWidgetFace.MOOD_NERVOUS):
						face = (hasClosedEyes ? FACE_BEETHRO_NERVOUS_BLINK : FACE_BEETHRO_NERVOUS);
						break;
					case (TWidgetFace.MOOD_STRIKE):
						face = FACE_BEETHRO_STRIKE;
						break;
					case (TWidgetFace.MOOD_TALKING):
						face = (hasClosedEyes ? FACE_BEETHRO_TALKING_BLINK : FACE_BEETHRO_TALKING);
						break;
					case (TWidgetFace.MOOD_DYING):
						switch ((DROD.app.ticker.lastTime / S.animations.face.deathSpeed | 0) % 4) {
							case (0):
								face = FACE_BEETHRO_DYING_1;
								break;
							case (1):
							case (3):
								face = FACE_BEETHRO_DYING_2;
								break;
							case (2):
								face = FACE_BEETHRO_DYING_3;
								break;
						}
						break;
				}
				break;

			case (C.SPEAK_Citizen1):
				face = FACE_CITIZEN1;
				break;
			case (C.SPEAK_Citizen2):
				face = FACE_CITIZEN2;
				break;
			case (C.SPEAK_Citizen3):
				face = FACE_CITIZEN3;
				break;
			case (C.SPEAK_Citizen4):
				face = FACE_CITIZEN4;
				break;

			case (C.SPEAK_Goblin):
				face = FACE_GOBLIN;
				break;
			case (C.SPEAK_TarTechnician):
				face = FACE_TAR_TECHNICIAN;
				break;
			case (C.SPEAK_MudCoordinator):
				face = FACE_MUD_COORDINATOR;
				break;
			case (C.SPEAK_Negotiator):
				face = FACE_NEGOTIATOR;
				break;
		}

		if (this._currentFace === face) {
			return;
		}

		this._currentFace = face;
		const newCurrentFaceX: number = FACE_POSITIONS[face][0];
		const newCurrentFaceY: number = FACE_POSITIONS[face][1];

		// @FIXME - Use pool
		this._faceTexture = new Texture(
			Gfx.FacesTexture.baseTexture,
			new Rectangle(newCurrentFaceX, newCurrentFaceY, FACE_WIDTH, FACE_HEIGHT)
		);
		this._eyesTexture = new Texture(
			Gfx.FaceEyesTexture.baseTexture,
			new Rectangle(newCurrentFaceX, newCurrentFaceY, FACE_WIDTH, FACE_HEIGHT)
		);
	}
}