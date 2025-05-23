/// <reference path='../index.d.ts'/>
import { TextMetrics } from "pixi.js";
import { registerTextMetricsMonkeyPatch } from "src.pixi/TextMetricsMonkeyPatch";
import { DebugConsole } from "src/game/DebugConsole";
import { PermanentStoreSlot } from "src/game/global/store/PermanentStoreSlot";
import { Kddl6HoldOptions } from "src/platform/InitKDDL6";
import { RecamelCore } from "../../src.framework/net/retrocade/camel/core/RecamelCore";
import { RecamelLang } from "../../src.framework/net/retrocade/camel/RecamelLang";
import { C } from "../C";
import { Core } from "../game/global/Core";
import { DROD } from "../game/global/DROD";
import { Gfx } from "../game/global/Gfx";
import { TStatePreloader } from "../game/states/TStatePreloader";
import { Kddl1HoldOptions } from "../platform/InitKDDL1";
import { Kddl2HoldOptions } from "../platform/InitKDDL2";
import { Kddl3HoldOptions } from "../platform/InitKDDL3";
import { Kddl4HoldOptions } from "../platform/InitKDDL4";
import { Kddl5HoldOptions } from "../platform/InitKDDL5";
import { TAPHoldOptions } from "../platform/InitTAP";
import { PlatformOptions } from "../platform/PlatformOptions";
import { HoldOptions } from "../platform/PlatformSpecific";
import { ResourcesCommon, SharedResources } from "../resources/mainGame/ResourcesCommon";
import { ResourcesQueue } from "../resources/mainGame/ResourcesQueue";
import { exposeValue, S } from "../S";
import { HoldBootstrap } from "./HoldBootstrap";
import { KddlApi } from "./KddlApi";
import { TWidgetVolumeMuter } from "src/game/widgets/TWidgetVolumeMuter";
import { permanentStoreUpgradeToV2 } from "src/game/global/store/permanentStoreUpgradeToV2";
import { Progress } from "src/game/global/Progress";
import { PermanentStore } from "src/game/global/store/PermanentStore";

require('../../src.assets/font/toms-new-roman.css');

export class Bootstrap {
	public static async bootstrap() {
		exposeValue('Bootstrap', Bootstrap);
		exposeValue('Progress', Progress);
		exposeValue('PermanentStoreSlot', PermanentStoreSlot);
		exposeValue('PermanentStore', PermanentStore);

		Bootstrap.registerMonkeyPatches();

		(window as any).kddlApi = KddlApi;

		S.allHoldOptions = [
			Kddl1HoldOptions,
			Kddl2HoldOptions,
			Kddl3HoldOptions,
			Kddl4HoldOptions,
			Kddl5HoldOptions,
			Kddl6HoldOptions,
			TAPHoldOptions
		];
		S.pagedHoldOptions = [
			[
				Kddl1HoldOptions,
				Kddl2HoldOptions,
				Kddl3HoldOptions,
				Kddl4HoldOptions,
				Kddl5HoldOptions,
				Kddl6HoldOptions,
			],
			[
				TAPHoldOptions,
			]
		]

		DebugConsole.init();
		RecamelLang.initialize();
		ResourcesCommon();
		TWidgetVolumeMuter.init();
		SharedResources.registerHoldStyles();

		await Promise.all([
			Bootstrap.loadPreloaderResources(),
			Bootstrap.waitForFontsToLoad(),
			PermanentStoreSlot.waitForAllSlotsInit(),
		]);
		await permanentStoreUpgradeToV2();
		await Bootstrap.initRecamel();
		await Bootstrap.fadeOutPrePreloader();

		DROD.resize();

		Bootstrap.startLoadingAllResources();
		let holdOptions: HoldOptions | undefined;
		while (true) {
			holdOptions = await Bootstrap.showPreloader(holdOptions);
			S.currentHoldOptions = holdOptions;
			PlatformOptions.defaultStyle = holdOptions.defaultStyle;
			await Bootstrap.initCore();
			await HoldBootstrap.bootstrap(holdOptions);
		}
	}

	private static async loadPreloaderResources() {
		await ResourcesQueue.loadResource(C.RES_PRELOADER_BG);
		await ResourcesQueue.loadResource(C.RES_LOGO_GAME);
	}

	private static async waitForFontsToLoad() {
		if ((document as any).fonts) {
			await (document as any).fonts.ready;
		} else {
			// In the super unlikely case where `documents.fonts` is not available
			// just wait a little and hope for the best
			await new Promise(resolve => setTimeout(resolve, 2000));
		}

		document.getElementById('tomloader')!.remove();
	}

	private static async initRecamel() {
		RecamelCore.init(DROD.app, DROD.app.stage);
		exposeValue('RecamelCore', RecamelCore);
	}

	private static async startLoadingAllResources() {
		return ResourcesQueue.startLoadingAll();
	}

	private static async fadeOutPrePreloader() {
		const pre_preloader = document.getElementById('pre_preloader')!;
		pre_preloader.style.opacity = '0';
		return new Promise<void>(resolve => {
			setTimeout(() => {
				DROD.app.view.style.opacity = '1';
				pre_preloader.remove();
				resolve();
			}, 600);
		});
	}

	private static async showPreloader(holdOptions?: HoldOptions) {
		return new Promise<HoldOptions>(resolve => {
			RecamelCore.setState(new TStatePreloader(holdOptions, resolve));
		});
	}

	private static async initCore() {
		Gfx.initialize();
		Core.init();
	}

	private static registerMonkeyPatches() {
		registerTextMetricsMonkeyPatch();

		TextMetrics.clearMetrics();
	}
}