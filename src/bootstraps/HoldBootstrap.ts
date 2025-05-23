/// <reference path='../index.d.ts'/>
import {DROD} from "../game/global/DROD";
import {Sfx} from "../game/global/Sfx";
import {HoldOptions} from "../platform/PlatformSpecific";
import {SharedResources} from "../resources/mainGame/ResourcesCommon";
import {ResourcesQueue} from "../resources/mainGame/ResourcesQueue";
import {C} from "../C";
import {RecamelLang, ValidLanguage} from "../../src.framework/net/retrocade/camel/RecamelLang";
import {TStateInitialize} from "../game/states/TStateInitialize";
import {DB} from "../game/global/DB";
import {Core} from "../game/global/Core";
import {TEffectBlood} from "../game/objects/effects/TEffectBlood";
import {TEffectCheckpoint} from "../game/objects/effects/TEffectCheckpoint";
import {TEffectDebris} from "../game/objects/effects/TEffectDebris";
import {TEffectEvilEyeGaze} from "../game/objects/effects/TEffectEvilEyeGaze";
import {TEffectOrbHit} from "../game/objects/effects/TEffectOrbHit";
import {TEffectSwordSwing} from "../game/objects/effects/TEffectSwordSwing";
import {TEffectTarSplatter} from "../game/objects/effects/TEffectTarSplatter";
import {TEffectVermin} from "../game/objects/effects/TEffectVermin";
import {Progress} from "../game/global/Progress";
import {once} from "../../src.framework/net/retrocade/standalone/once";
import {DrodInput} from "../game/global/DrodInput";
import {RecamelTooltip} from "../../src.framework/net/retrocade/camel/core/RecamelTooltip";
import {Make} from "../game/global/Make";
import {TWidgetScroll} from "../game/widgets/TWidgetScroll";
import {TWidgetLevelName} from "../game/widgets/TWidgetLevelName";
import {TWidgetClock} from "../game/widgets/TWidgetClock";
import {TWidgetMoveCounter} from "../game/widgets/TWidgetMoveCounter";
import {Helper} from "../game/global/Helper";
import {TStateTitle} from "../game/states/TStateTitle";
import {RecamelEffectScreenshot} from "../../src.framework/net/retrocade/camel/effects/RecamelEffectScreenshot";
import {RecamelEffectFade} from "../../src.framework/net/retrocade/camel/effects/RecamelEffectFade";
import {Achievements} from "../game/achievements/Achievements";
import { GlobalHoldScore } from "src/game/global/GlobalHoldScore";
import { TWidgetFace } from "src/game/widgets/TWidgetFace";
import { TWidgetMinimap } from "src/game/widgets/TWidgetMinimap";
import { TEffectRoomSlide } from "src/game/objects/TEffectRoomSlide";
import { BoltEffect } from "src/game/objects/effects/BoltEffect";
import { TWidgetOrbHighlight } from "src/game/widgets/TWidgetOrbHighlight";
import { MinimapRoomRenderer } from "src/game/managers/MinimapRoomRenderer";
import { TStateRestore } from "src/game/states/TStateRestore";
import { TStateGame } from "src/game/states/TStateGame";

require('../../src.assets/font/toms-new-roman.css');

export class HoldBootstrap {
	public static async bootstrap(holdOptions: HoldOptions) {
		// 1. Queue resources
		DB.resetQueue();
		SharedResources.registerMusic(holdOptions, DROD.nutkaLayerMusic);
		ResourcesQueue.queueBinary(C.holdResourceName(holdOptions), holdOptions.resources.hold);
		ResourcesQueue.queueImage(C.subtitleResourceName(holdOptions), document.createElement('img'), holdOptions.resources.subtitle);
		HoldBootstrap.queueLocale(holdOptions);
		MinimapRoomRenderer.clear();

		// 2. Show initialize screen
		(new TStateInitialize()).setState();

		// 3. Start loading resources
		await ResourcesQueue.startLoadingAll();

		// 4. Unpack hold and load its resources
		Core.unpackHold(ResourcesQueue.getBinary(C.holdResourceName(holdOptions)));
		await DB.autoAdvanceQueue();

		// 5. Initialize classes
		await Progress.loadFromDisk();
		await once(HoldBootstrap.initializeGraphics);
		Sfx.initializeHold(holdOptions);
		await once(HoldBootstrap.initializeGameClasses);
		await HoldBootstrap.loadLocale(holdOptions);
		Achievements.init(holdOptions);
		GlobalHoldScore.updateHoldScore();
		TStateRestore.clear();
		TStateGame.clear();

		// 6. Show title screen
		await this.showTitle();
	}

	private static async showTitle() {
		const screenshot = new RecamelEffectScreenshot();
		new RecamelEffectFade(screenshot.layer.displayObject, 1, 0, 500, screenshot.stop);
		screenshot.moveForward();

		await TStateTitle.show();
	}

	private static queueLocale(holdOptions: HoldOptions) {
		for (const language in holdOptions.resources.lang) {
			if (!holdOptions.resources.lang.hasOwnProperty(language)) {
				continue;
			}

			const url = holdOptions.resources.lang[language];
			ResourcesQueue.queueText(C.localeResourceName(holdOptions, language as ValidLanguage), url);
		}
	}

	private static async initializeGraphics() {
		TEffectBlood.initialize();
		TEffectCheckpoint.initialize();
		TEffectDebris.initialize();
		TEffectEvilEyeGaze.initialize();
		TEffectOrbHit.initialize();
		TEffectSwordSwing.initialize();
		TEffectTarSplatter.initialize();
		TEffectVermin.initialize();
		TEffectRoomSlide.initialize();
		BoltEffect.initialize();
	}
	private static async initializeGameClasses() {
		// Achievements.init();
		DrodInput.init();
		RecamelTooltip.setBackground(Make.tooltipGrid9());
		RecamelTooltip.setSize(14);
		RecamelTooltip.setPadding(5, 10, 5, 10);
		RecamelTooltip.setShadow(45, 4, 5, 1, 0.5, 0);
		TWidgetScroll.init();
		TWidgetLevelName.init();
		TWidgetClock.init();
		TWidgetFace.init();
		TWidgetMoveCounter.init();
		TWidgetOrbHighlight.init();
		Helper.init();
		Sfx.initialize();
	}

	private static async loadLocale(holdOptions: HoldOptions) {
		for (const language in holdOptions.resources.lang) {
			if (!holdOptions.resources.lang.hasOwnProperty(language)) {
				continue;
			}

			const resourceName = C.localeResourceName(holdOptions, language as ValidLanguage);
			const resourceUrl = ResourcesQueue.getUrl(resourceName);
			const resourceText = ResourcesQueue.getText(resourceName);

			RecamelLang.loadLanguageFile(
				resourceText,
				language as ValidLanguage,
				resourceUrl.toLocaleLowerCase().endsWith('.yml')
			);
		}
	}

}