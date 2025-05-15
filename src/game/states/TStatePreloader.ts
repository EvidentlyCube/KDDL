import * as PIXI from 'pixi.js';
import { RecamelState } from "../../../src.framework/net/retrocade/camel/core/RecamelState";
import { ResourcesQueue } from "../../resources/mainGame/ResourcesQueue";
import { C } from "../../C";
import { RecamelEffectFadeScreen } from "../../../src.framework/net/retrocade/camel/effects/RecamelEffectFadeScreen";
import { RecamelLayerSprite } from "../../../src.framework/net/retrocade/camel/layers/RecamelLayerSprite";
import { Text } from "../../../src.framework/net/retrocade/standalone/Text";
import { _ } from "../../../src.framework/_";
import { Make } from "../global/Make";
import { Button } from "../../../src.framework/net/retrocade/standalone/Button";
import { TWindowLanguage } from "../windows/TWindowLanguage";
import { S } from "../../S";
import { HoldOptions } from "../../platform/PlatformSpecific";
import { GlobalHoldScore } from "../global/GlobalHoldScore";
import { printf } from "../../../src.framework/printf";
import { PermanentStoreSlot } from '../global/store/PermanentStoreSlot';
import { RecamelCore } from 'src.framework/net/retrocade/camel/core/RecamelCore';

const LOGO_HEIGHT = 100;

export class TStatePreloader extends RecamelState {
	private _loadingText: Text = null!;

	private _versionText: Text = null!;

	private _bgTexture: PIXI.Texture = null!;
	private _logoTexture: PIXI.Texture = null!;
	private _bg: PIXI.Sprite = null!;
	private _logo: PIXI.Sprite = null!;

	private _layer: RecamelLayerSprite = null!;

	private _holdScreens: HoldsScreen[] = [];
	private _nextScreenButton: Button = null!;
	private _prevScreenButton: Button = null!;

	private _exportButton: Button = null!;
	private _importButton: Button = null!;
	private _languageButton: Button = null!;

	private _onStartGame: (holdOptions: HoldOptions) => void;
	private _lastHoldOptions?: HoldOptions;

	constructor(lastHoldOptions: HoldOptions | undefined, onStartGame: (holdOptions: HoldOptions) => void) {
		super();

		this._onStartGame = onStartGame;
		this._lastHoldOptions = lastHoldOptions;
	}

	public create() {
		this._layer = RecamelLayerSprite.create();
		this._bgTexture = new PIXI.Texture(new PIXI.BaseTexture(ResourcesQueue.getImg(C.RES_PRELOADER_BG)));
		this._logoTexture = new PIXI.Texture(new PIXI.BaseTexture(ResourcesQueue.getImg(C.RES_LOGO_GAME)));
		this._bg = new PIXI.Sprite(this._bgTexture);
		this._logo = new PIXI.Sprite(this._logoTexture);
		this._loadingText = Make.shadowText("");
		this._versionText = Make.shadowText(S.version, 12);
		this._prevScreenButton = getShadowTextButton("<<", () => this.changePage(-1));
		this._nextScreenButton = getShadowTextButton(">>", () => this.changePage(1));
		this._exportButton = getShadowTextButton("Export Save", () => this.exportSave(), 20);
		this._importButton = getShadowTextButton("Import Save", () => this.importSave(), 20);
		this._languageButton = getShadowTextButton("English", () => this.changeLanguage(), 20);

		this._layer.add2(this._bg);
		this._layer.add2(this._logo);
		this._layer.add2(this._loadingText);
		this._layer.add2(this._versionText);
		this._layer.add2(this._prevScreenButton);
		this._layer.add2(this._nextScreenButton);
		this._layer.add2(this._exportButton);
		this._layer.add2(this._importButton);
		// this._layer.add2(this._languageButton);
		this._logoTexture.baseTexture.update();
		this._logo.updateTransform();
		this._logo.x = (S.SIZE_GAME_WIDTH - this._logo.width) / 2 | 0;
		this._logo.y = (180 - this._logo.height) / 2 | 0;

		this._versionText.x = 5;
		this._versionText.y = S.SIZE_GAME_HEIGHT - this._versionText.textHeight - 5;

		GlobalHoldScore.loadHoldScores();

		new RecamelEffectFadeScreen(0, 1, 0, 800);

		for (const holdsPage of S.pagedHoldOptions) {
			const page = new HoldsScreen(holdsPage, hold => this.onGameStart(hold));
			page.y = LOGO_HEIGHT + (S.SIZE_GAME_HEIGHT - LOGO_HEIGHT - page.height) / 2 | 0;
			page.visible = false;

			this._layer.add2(page);
			this._holdScreens.push(page);
		}

		this._nextScreenButton.x = S.SIZE_GAME_WIDTH - this._prevScreenButton.width - 5;
		this._prevScreenButton.x = 5;

		this._nextScreenButton.y = LOGO_HEIGHT + (S.SIZE_GAME_HEIGHT - LOGO_HEIGHT - this._nextScreenButton.height) / 2 | 0;
		this._prevScreenButton.y = LOGO_HEIGHT + (S.SIZE_GAME_HEIGHT - LOGO_HEIGHT - this._prevScreenButton.height) / 2 | 0;

		this._languageButton.y = S.SIZE_GAME_HEIGHT - 20 - this._languageButton.height;
		this._exportButton.y = this._languageButton.y
		this._importButton.y = this._languageButton.y

		this._languageButton.alignCenter();
		this._exportButton.center = S.SIZE_GAME_WIDTH / 3;
		this._importButton.center = S.SIZE_GAME_WIDTH * 2 / 3;
	}

	public destroy() {
		this._layer.removeLayer();
		this._bg.destroy(true);
		this._logo.destroy(true);
	}

	private changePage(offset: number): void {
		const currentPage = this._holdScreens.findIndex(screen => screen.visible);
		const newPage = Math.max(0, Math.min(this._holdScreens.length - 1, currentPage + offset));

		this._holdScreens.forEach(screen => screen.visible = false);
		this._holdScreens[newPage].visible = true;

		this._prevScreenButton.visible = newPage !== 0;
		this._nextScreenButton.visible = newPage !== this._holdScreens.length - 1;
	}

	public update() {
		const resourcesCount = ResourcesQueue.resourcesCount;
		const loadedResources = ResourcesQueue.resourcesLoadedCount;
		const isLoaded = resourcesCount === loadedResources;

		if (!isLoaded) {
			this._loadingText.text = `${loadedResources} / ${resourcesCount}`;

			this._loadingText.visible = true;
			this._holdScreens.forEach(screen => screen.visible = false);
			this._prevScreenButton.visible = false;
			this._nextScreenButton.visible = false;
			this._exportButton.visible = false;
			this._importButton.visible = false;

			this._loadingText.alignCenter();
			this._loadingText.alignMiddle();

			this._loadingText.y = LOGO_HEIGHT + (S.SIZE_GAME_HEIGHT - LOGO_HEIGHT - this._loadingText.textHeight) / 2 | 0;

		} else if (this._loadingText.visible) {
			this._holdScreens[0].visible = true;

			this._loadingText.visible = false;
			this._exportButton.visible = true;
			this._importButton.visible = true;

			const lastHoldOptions = this._lastHoldOptions;
			this.changePage(
				lastHoldOptions
					? S.pagedHoldOptions.findIndex(options => options.includes(lastHoldOptions))
					: 0
			);
		}
	}

	private onGameStart = (hold: HoldOptions) => {
		this._layer.displayObject.interactiveChildren = this._layer.displayObject.interactive = false;

		new RecamelEffectFadeScreen(1, 0, 0, 600, () => {
			this._layer.clear(); 0
			this._onStartGame(hold);
		});

	};

	private onSelectLanguage() {
		new TWindowLanguage();
	}

	private exportSave() {
		var element = document.createElement('a');
		element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(PermanentStoreSlot.exportAll()));
		element.setAttribute('download', `KingDugansDungeonLite.save`);

		element.style.display = 'none';
		document.body.appendChild(element);

		element.click();

		document.body.removeChild(element);
	}

	private importSave() {
		const input = document.createElement('input');
		input.style.display='none';
		input.type='file';
		input.name='file';
		input.addEventListener('change', async () => {
			if (input.files) {
				const text = await input.files[0].text();

				if (PermanentStoreSlot.importAll(text)) {
					const currentPage = this._holdScreens.findIndex(screen => screen.visible);
					RecamelCore.setState(new TStatePreloader(S.pagedHoldOptions[currentPage][0], this.onGameStart));
				}
			}
		});

		document.body.appendChild(input);
		input.click();
		document.body.removeChild(input);
	}

	private changeLanguage() {

	}
}

class HoldsScreen extends PIXI.Container {
	public constructor(holds: HoldOptions[], onGameStart: (hold: HoldOptions) => void) {
		super();

		const buttonHeight = 50;
		const startY = 0;

		let nextY = startY;
		for (const holdOptions of holds) {
			const score = GlobalHoldScore.getScore(holdOptions.id);
			const button = getShadowTextButton(printf(
				'%% (%%%)',
				holdOptions.holdDisplayName,
				(score * 100).toFixed(2)
			), () => onGameStart(holdOptions));
			button.alignCenter();
			button.y = nextY;
			this.addChild(button);

			nextY += buttonHeight;
		}
	}
}

function getShadowTextButton(content: string, onClick: () => void, size = 48) {
	const text = Make.shadowText(content, size);
	const button = new Button(onClick);
	button.addChild(text);
	button.alignCenter();

	return button;
}