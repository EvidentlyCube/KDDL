/// <reference path='../index.d.ts'/>
import {ResourcesQueue} from "../resources/mainGame/ResourcesQueue";
import {C} from "../C";
import {RecamelCore} from "../../src.framework/net/retrocade/camel/core/RecamelCore";
import {TStatePreloader} from "../game/states/TStatePreloader";
import {DROD} from "../game/global/DROD";
import {RecamelLang, ValidLanguage} from "../../src.framework/net/retrocade/camel/RecamelLang";
import {Core} from "../game/global/Core";
import {Gfx} from "../game/global/Gfx";
import {S} from "../S";
import {ResourcesCommon} from "../resources/mainGame/ResourcesCommon";
import {Kddl1HoldOptions} from "../platform/InitKDDL1";
import {HoldOptions} from "../platform/PlatformSpecific";
import {HoldBootstrap} from "./HoldBootstrap";
import {Kddl2HoldOptions} from "../platform/InitKDDL2";
import {Kddl3HoldOptions} from "../platform/InitKDDL3";
import {Kddl4HoldOptions} from "../platform/InitKDDL4";
import {Kddl5HoldOptions} from "../platform/InitKDDL5";
import {TAPHoldOptions} from "../platform/InitTAP";
import {PlatformOptions} from "../platform/PlatformOptions";
import { Kddl6HoldOptions } from "src/platform/InitKDDL6";
import { PermanentStoreSlot } from "src/game/global/store/PermanentStoreSlot";
import { DebugConsole } from "src/game/DebugConsole";

require('../../src.assets/font/toms-new-roman.css');

export class Bootstrap {
	public static async bootstrap() {
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

		await Promise.all([
			Bootstrap.loadPreloaderResources(),
			Bootstrap.loadLocale(),
			Bootstrap.waitForFontsToLoad(),
			PermanentStoreSlot.waitForAllSlotsInit(),
		]);
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

	private static async loadLocale() {
		// @FIXME Happens automatically during resource loading
		return;
		/*
		const languageMap = new Map<ValidLanguage, string>([
			['en', C.RES_LANG_COMMON_EN],
			['nl', C.RES_LANG_COMMON_NL],
			['de', C.RES_LANG_COMMON_DE],
			['fi', C.RES_LANG_COMMON_FI],
			['es', C.RES_LANG_COMMON_ES],
			['pt', C.RES_LANG_COMMON_PT],
			['fr', C.RES_LANG_COMMON_FR],
			['ru', C.RES_LANG_COMMON_RU],
			['pl', C.RES_LANG_COMMON_PL],
		]);

		const loadResources = () => {
			const promises = [];

			for (const languageCode of S.BASE_LANGUAGES) {
				const res = languageMap.get(languageCode)!;
				promises.push(ResourcesQueue.loadResource(res));
			}

			return promises;
		};

		await Promise.all([
			ResourcesQueue.loadResource(C.RES_LANG_CREDITS),
			...loadResources(),
		]);

		const credits = ResourcesQueue.getText(C.RES_LANG_CREDITS);
		for (const languageCode of S.BASE_LANGUAGES) {
			const res = languageMap.get(languageCode)!;
			RecamelLang.loadLanguageFile(credits, languageCode);
			RecamelLang.loadLanguageFile(ResourcesQueue.getText(res), languageCode);
		}
		*/
	}

	private static async waitForFontsToLoad() {
		if ((document as any).fonts) {
			await (document as any).fonts.ready;
		} else {
			// @todo add some other detection in the future or hope for the best
		}

		document.getElementById('tomloader')!.remove();
	}

	private static async initRecamel() {
		RecamelCore.init(DROD.app, DROD.app.stage);
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
}