import * as PIXI from 'pixi.js';
import { _ } from "../../../src.framework/_";
import { RecamelTooltip } from "../../../src.framework/net/retrocade/camel/core/RecamelTooltip";
import { RecamelWindow } from "../../../src.framework/net/retrocade/camel/core/RecamelWindow";
import { RecamelEffectFade } from "../../../src.framework/net/retrocade/camel/effects/RecamelEffectFade";
import { Button } from "../../../src.framework/net/retrocade/standalone/Button";
import { Text } from "../../../src.framework/net/retrocade/standalone/Text";
import RawInput from "../../../src.tn/RawInput";
import { S } from "../../S";
import { Core } from "../global/Core";
import { DROD } from "../global/DROD";
import { Make } from "../global/Make";
import { Sfx } from "../global/Sfx";
import { PermanentStore } from '../global/store/PermanentStore';
import { TDragButton } from "../interfaces/TDragButton";
import { TStateGame } from "../states/TStateGame";
import { TWindowRedefineKeys } from "./TWindowRedefineKeys";

const EFFECT_DURATION = 400;

export class TWindowOptions extends RecamelWindow {


	private static _instance: TWindowOptions;

	public static show() {
		if (!TWindowOptions._instance) {
			TWindowOptions._instance = new TWindowOptions();
		}

		TWindowOptions._instance.show();
	}


	/****************************************************************************************************************/
	/**                                                                                                   INSTANCE  */
	/****************************************************************************************************************/

	private modal: PIXI.Graphics;
	private bg: PIXI.NineSlicePlane;
	private header: Text;

	private volume: Text;
	private music: Text;
	private effects: Text;
	private voices: Text;

	private repeatRate: Text;
	private repeatDelay: Text;

	private voicesDrag: TDragButton;
	private musicDrag: TDragButton;
	private effectsDrag: TDragButton;
	private repeatRateDrag: TDragButton;
	private repeatDelayDrag: TDragButton;

	private repeatRateTextSlow: Text;
	private repeatRateTextFast: Text;
	private repeatDelayTextSlow: Text;
	private repeatDelayTextFast: Text;

	private redefineButton: Button;
	private closeButton: Button;

	// Block all input
	private _locked: boolean = false;

	public set locked(to: boolean) {
		this._locked = to;

		this.interactiveChildren = this.interactive = !to;
	}


	public constructor() {
		super();

		// Creation

		this.modal = new PIXI.Graphics();
		this.bg = Make.windowGrid9();


		this.header = Make.text(36);
		this.redefineButton = Make.buttonColor(this.onRedefine, _("ui.options.redefine.button"));
		this.closeButton = Make.buttonColor(this.onClose, _("ui.common.close"));

		this.volume = Make.text(24);
		this.music = Make.text(18);
		this.effects = Make.text(18);
		this.voices = Make.text(18);

		this.voicesDrag = new TDragButton();
		this.effectsDrag = new TDragButton();
		this.musicDrag = new TDragButton();
		this.repeatRateDrag = new TDragButton();
		this.repeatDelayDrag = new TDragButton();

		this.repeatRate = Make.text(24);
		this.repeatRateTextFast = Make.text(14);
		this.repeatRateTextSlow = Make.text(14);

		this.repeatDelay = Make.text(24);
		this.repeatDelayTextFast = Make.text(14);
		this.repeatDelayTextSlow = Make.text(14);


		// Setting initial properties

		this.header.text = _("ui.options.header");

		this.volume.text = _("ui.options.volume.header");
		this.music.text = _("ui.options.volume.music.button");
		this.effects.text = _("ui.options.volume.sfx.button");
		this.voices.text = _("ui.options.volume.voices.button");

		this.repeatRate.text = _("ui.options.key_repeat_rate.header");
		this.repeatRateTextFast.text = _("ui.options.key_repeat_rate.fast.label");
		this.repeatRateTextSlow.text = _("ui.options.key_repeat_rate.smooth.label");

		this.repeatDelay.text = _("ui.options.key_repeat_delay.header");
		this.repeatDelayTextFast.text = _("ui.options.key_repeat_delay.short.label");
		this.repeatDelayTextSlow.text = _("ui.options.key_repeat_delay.long.label");


		// Sizing and Positioning

		this.bg.width = 480;
		this.bg.height = 500 + 40;

		this.header.setPosition(15, 10);
		this.volume.setPosition(348 - 260, 68);
		this.music.setPosition(348 - 260, 111);
		this.effects.setPosition(348 - 260, 142);
		this.voices.setPosition(348 - 260, 173);
		this.musicDrag.setSizePosition(438 - 260, 101, 200, 28);
		this.effectsDrag.setSizePosition(438 - 260, 132, 200, 28);
		this.voicesDrag.setSizePosition(438 - 260, 163, 200, 28);
		this.repeatRate.setPosition(348 - 270, 208);
		this.repeatRateDrag.setSizePosition(348 - 270, 260, 317, 28);
		this.repeatDelay.setPosition(348 - 270, 310);
		this.repeatDelayDrag.setSizePosition(348 - 270, 362, 317, 28);

		this.redefineButton.setSizePosition(175, 312 + 140, 320, 33);
		this.closeButton.setSizePosition(195, 352 + 140, 280, 33);

		this.redefineButton.alignCenterParent(0, this.bg.width);
		this.closeButton.alignCenterParent(0, this.bg.width);
		this.header.alignCenterParent(0, this.bg.width);

		this.repeatRateTextFast.right = this.repeatRateDrag.right;
		this.repeatRateTextFast.bottom = this.repeatRateDrag.y - 5;

		this.repeatRateTextSlow.x = this.repeatRateDrag.x;
		this.repeatRateTextSlow.bottom = this.repeatRateDrag.y - 5;

		this.repeatDelayTextFast.right = this.repeatDelayDrag.right;
		this.repeatDelayTextFast.bottom = this.repeatDelayDrag.y - 5;

		this.repeatDelayTextSlow.x = this.repeatDelayDrag.x;
		this.repeatDelayTextSlow.bottom = this.repeatDelayDrag.y - 5;


		// Add children

		this.addChild(this.modal);
		this.addChild(this.bg);
		this.addChild(this.header);
		this.addChild(this.volume);
		this.addChild(this.music);
		this.addChild(this.effects);
		this.addChild(this.voices);
		this.addChild(this.repeatRate);
		this.addChild(this.repeatDelay);
		this.addChild(this.voicesDrag);
		this.addChild(this.musicDrag);
		this.addChild(this.effectsDrag);
		this.addChild(this.repeatRateDrag);
		this.addChild(this.repeatRateTextFast);
		this.addChild(this.repeatRateTextSlow);
		this.addChild(this.repeatDelayDrag);
		this.addChild(this.repeatDelayTextFast);
		this.addChild(this.repeatDelayTextSlow);
		this.addChild(this.redefineButton);
		this.addChild(this.closeButton);


		// Add Events

		this.voicesDrag.onChange.add(this.dragChanged);
		this.effectsDrag.onChange.add(this.dragChanged);
		this.musicDrag.onChange.add(this.dragChanged);
		this.repeatRateDrag.onChange.add(this.dragChanged);
		this.repeatDelayDrag.onChange.add(this.dragChanged);

		this.voicesDrag.onMouseUp.add(this.dragFinished);
		this.effectsDrag.onMouseUp.add(this.dragFinished);

		RecamelTooltip.hook(this.repeatRate, _("ui.options.key_repeat_rate.tooltip"));
		RecamelTooltip.hook(this.repeatDelay, _("ui.options.key_repeat_delay.tooltip"));

		this.repeatDelay.interactive = true;
		this.repeatRate.interactive = true;

		this.center();

		this.modal.beginFill(0, 0.6);
		this.modal.drawRect(-this.x, -this.y, S.SIZE_GAME_WIDTH, S.SIZE_GAME_HEIGHT);
	}

	public show() {
		super.show();

		this.repeatRateDrag.value = 1 - Core.repeatRate;
		this.repeatDelayDrag.value = 1 - (Core.repeatDelay - 150) / 300;

		this.voicesDrag.value = Core.volumeVoices;
		this.musicDrag.value = Core.volumeMusic;
		this.effectsDrag.value = Core.volumeEffects;

		this.interactiveChildren = false;
		new RecamelEffectFade(this, 0, 1, EFFECT_DURATION, this.onFadedIn);

		this.cacheAsBitmap = true;
	}

	public update() {
		if (RawInput.isKeyPressed('Escape') && this.interactiveChildren) {
			RawInput.flushAll();
			this.onClose();
		}
	}

	private dragChanged = (button: TDragButton) => {
		if (button == this.voicesDrag) {
			Core.volumeVoices = this.voicesDrag.value;
			DROD.nutkaLayerSpeech.volume = this.voicesDrag.value;
		} else if (button == this.musicDrag) {
			Core.volumeMusic = this.musicDrag.value;
			DROD.nutkaLayerMusic.volume = this.musicDrag.value;
		} else if (button == this.effectsDrag) {
			Core.volumeEffects = this.effectsDrag.value;
			DROD.nutkaLayerSfx.volume = this.effectsDrag.value;
		} else if (button == this.repeatRateDrag) {
			Core.repeatRate = 1 - this.repeatRateDrag.value;
		} else if (button == this.repeatDelayDrag) {
			Core.repeatDelay = 150 + (1 - this.repeatDelayDrag.value) * 300;
		}
	};

	private dragFinished = (button: TDragButton) => {
		if (button == this.voicesDrag) {
			Sfx.optionVoiceText();

		} else if (button == this.effectsDrag) {
			Sfx.monsterKilled();
		}
	};

	private onRedefine = () => {
		TWindowRedefineKeys.show();

		Sfx.buttonClick();
	};

	private onFadedIn = () => {
		this.cacheAsBitmap = false;
		this.interactiveChildren = true;
	};

	private onClose = () => {
		PermanentStore.settings.volumeSfx.write(this.effectsDrag.value);
		PermanentStore.settings.volumeMusic.write(this.musicDrag.value);
		PermanentStore.settings.volumeVoices.write(this.voicesDrag.value);
		PermanentStore.settings.repeatRate.write(1 - this.repeatRateDrag.value);
		PermanentStore.settings.repeatDelay.write(Core.repeatDelay);

		TStateGame.offsetSpeed = Core.repeatRate * 12;

		this.cacheAsBitmap = true;
		new RecamelEffectFade(this, 1, 0, EFFECT_DURATION, this.close.bind(this));
		this.interactiveChildren = false;

		RecamelTooltip.hide();
	}
}
