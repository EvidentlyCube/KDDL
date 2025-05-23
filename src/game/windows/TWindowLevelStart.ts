import * as PIXI from 'pixi.js';
import {RecamelWindow} from "../../../src.framework/net/retrocade/camel/core/RecamelWindow";
import {RecamelEffectScreenshot} from "../../../src.framework/net/retrocade/camel/effects/RecamelEffectScreenshot";
import {TStateGame} from "../states/TStateGame";
import {RecamelEffectFade} from "../../../src.framework/net/retrocade/camel/effects/RecamelEffectFade";
import {S} from "../../S";
import {Text} from "../../../src.framework/net/retrocade/standalone/Text";
import {Make} from "../global/Make";
import {Gfx} from "../global/Gfx";
import {PlatformOptions} from "../../platform/PlatformOptions";
import {Level} from "../global/Level";
import {UtilsXPath} from "../../../src.framework/net/retrocade/utils/UtilsXPath";
import {attr, intAttr} from "../../XML";
import RawInput from "../../../src.tn/RawInput";
import {_, _r} from "../../../src.framework/_";
import { TWidgetSpeech } from '../widgets/TWidgetSpeech';


const MARGIN = 20;
const SCREEN = S.SIZE_GAME_WIDTH - MARGIN * 2;
const OFFSET_HOLD_NAME = 70;
const OFFSET_LEVEL_NAME = 70;
const OFFSET_DIVIDER = 15;
const OFFSET_CREATED = 40;


export class TWindowLevelStart extends RecamelWindow {
	private static _instance: TWindowLevelStart;

	public static screenshot?: RecamelEffectScreenshot;

	public static show(entranceID: number, fadeIn: boolean, skipEntranceWindow: boolean = false) {
		if (!TWindowLevelStart._instance) {
			TWindowLevelStart._instance = new TWindowLevelStart();
		}
		TWindowLevelStart.screenshot = new RecamelEffectScreenshot();

		TStateGame.updateMusicState();

		if (skipEntranceWindow) {
			return;
		}

		TWindowLevelStart._instance.show();
		TWindowLevelStart._instance.setEntrance(entranceID);

		if (fadeIn) {
			new RecamelEffectFade(TWindowLevelStart._instance, 0, 1, 850, TWindowLevelStart._instance.onFadedIn.bind(TWindowLevelStart._instance));
		} else {
			TWindowLevelStart._instance.alpha = 1;
		}
	}

	public static doCrossFade() {
		const {screenshot} = TWindowLevelStart;
		if (!screenshot) {
			return;
		}

		new RecamelEffectFade(screenshot.layer.displayObject, 1, 0, 800, function () {
			screenshot.stop();
			TWindowLevelStart.screenshot = undefined;
		});
	}

	private wrapper: PIXI.Sprite;

	private background: PIXI.Sprite;
	private holdTitle: Text;
	private levelTitle: Text;
	private creationDate: Text;
	private topDivider: PIXI.Graphics;
	private entranceBody: Text;
	private bottomDivider: PIXI.Graphics;

	private fading: boolean = false;
	private appearTime: number = 0;

	private keyReleased: boolean = false;


	private static _debugEntrances: number[];
	private static _debugEntrancesEnumerator: number = 0;

	public constructor() {
		super();

		this.wrapper = new PIXI.Sprite();
		this.background = new PIXI.Sprite(Gfx.LevelStartBgTexture);
		this.holdTitle = Make.text(51, 0xFFFF00);
		this.levelTitle = Make.text(51);
		this.creationDate = Make.text(26);
		this.topDivider = new PIXI.Graphics();
		this.entranceBody = Make.text(22);
		this.bottomDivider = new PIXI.Graphics();

		this.holdTitle.color = 0xFFFF00;
		this.levelTitle.color = 0xFFFF00;
		this.creationDate.color = 0xE3AB04;
		this.entranceBody.color = 0xFFFFFF;

		this.levelTitle.y = OFFSET_HOLD_NAME;
		this.creationDate.y = OFFSET_HOLD_NAME + OFFSET_LEVEL_NAME;
		this.topDivider.y = OFFSET_HOLD_NAME + OFFSET_LEVEL_NAME + OFFSET_CREATED + OFFSET_DIVIDER;
		this.entranceBody.y = OFFSET_HOLD_NAME + OFFSET_LEVEL_NAME + OFFSET_CREATED + OFFSET_DIVIDER * 2;

		this.holdTitle.wordWrap = false;
		this.levelTitle.wordWrap = false;
		this.creationDate.wordWrap = false;
		this.entranceBody.wordWrapWidth = SCREEN;
		this.entranceBody.wordWrap = true;

		this.entranceBody.lineSpacing = -1;

		this.entranceBody.alignCenter();
		this.entranceBody.x = MARGIN;

		this.topDivider.beginFill(0x666666);
		this.topDivider.drawRect(20, 0, S.SIZE_GAME_WIDTH - 40, 1);
		this.bottomDivider.beginFill(0x666666);
		this.bottomDivider.drawRect(20, 0, S.SIZE_GAME_WIDTH - 40, 1);


		this.addChild(this.background);
		this.addChild(this.wrapper);

		this.wrapper.addChild(this.holdTitle);
		this.wrapper.addChild(this.levelTitle);
		this.wrapper.addChild(this.creationDate);
		this.wrapper.addChild(this.topDivider);
		this.wrapper.addChild(this.entranceBody);
		this.wrapper.addChild(this.bottomDivider);

		if (PlatformOptions.isDebug) {
			TWindowLevelStart._debugEntrances = [];
			for (const entrance of UtilsXPath.getAllElements('//Entrances', Level.getHold())) {
				TWindowLevelStart._debugEntrances.push(intAttr(entrance, 'EntranceID'));
			}
		}
	}

	public show() {
		super.show();

		this.fading = true;
		this.visible = true;
		this.appearTime = Date.now();
		this.keyReleased = false;
	}

	public close() {
		super.close();

		TStateGame.instance.addFlashEvents();
	}

	public update() {
		if (!this.keyReleased && RawInput.isAnyKeyDown() && this.appearTime + 2000 < Date.now()) {
			return;
		}
		TWindowLevelStart.screenshot?.moveForward();

		if (PlatformOptions.isDebug) {
			if (RawInput.isKeyPressed('F6')) {
				TWindowLevelStart._debugEntrancesEnumerator = (TWindowLevelStart._debugEntrancesEnumerator + 1) % TWindowLevelStart._debugEntrances.length;
				const id: number = TWindowLevelStart._debugEntrances[TWindowLevelStart._debugEntrancesEnumerator];

				this.setEntrance(id);
				return;
			}
		}

		this.keyReleased = true;

		if (!this.fading && (RawInput.isMousePressed(0) || RawInput.isAnyKeyPressed())) {
			this.fading = true;

			RawInput.flushAll();

			new RecamelEffectFade(this, 1, 0, 500, () => {
				this.close();
				TStateGame.updateMusicState();
				TWidgetSpeech.isPaused = false;
			});

			TWindowLevelStart.screenshot?.stop();
			TWindowLevelStart.screenshot = undefined;
		}
	}

	private setEntrance(entranceID: number) {
		const date: Date = new Date(Level.getHoldTimestamp() * 1000);
		const roomPid = attr(Level.getEntrance(entranceID), 'RoomPID');

		this.holdTitle.text = Level.getHoldName();
		this.levelTitle.text = Level.getLevelNameTranslated(Level.getLevelIdByRoomPid(roomPid));
		this.creationDate.text = _r("ingame.level_start.creation_date", {
			day: date.getDate().toString().padStart(2, '0'),
			month: (date.getMonth() + 1).toString().padStart(2, '0'),
			year: date.getFullYear(),
		});
		this.entranceBody.text = Level.getEntranceDescriptionTranslated(entranceID);

		while (this.entranceBody.textHeight > 300) {
			this.entranceBody.size--;
		}

		this.holdTitle.autoAdjustSize(SCREEN);
		this.levelTitle.autoAdjustSize(SCREEN);

		this.holdTitle.alignCenter();
		this.levelTitle.alignCenter();
		this.creationDate.alignCenter();
		this.entranceBody.textAlignCenter();
		this.entranceBody.alignCenter();

		this.bottomDivider.y = this.entranceBody.y + this.entranceBody.textHeight + OFFSET_DIVIDER;

		this.wrapper.y = (S.SIZE_GAME_HEIGHT - this.wrapper.getLocalBounds().height) / 3;
	}

	private onFadedIn() {
		this.fading = false;
	}
}
