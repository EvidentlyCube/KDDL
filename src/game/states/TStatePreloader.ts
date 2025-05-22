import { RecamelState } from "../../../src.framework/net/retrocade/camel/core/RecamelState";
import { ResourcesQueue } from "../../resources/mainGame/ResourcesQueue";
import { C, HoldId } from "../../C";
import { RecamelEffectFadeScreen } from "../../../src.framework/net/retrocade/camel/effects/RecamelEffectFadeScreen";
import { RecamelLayerSprite } from "../../../src.framework/net/retrocade/camel/layers/RecamelLayerSprite";
import { Text } from "../../../src.framework/net/retrocade/standalone/Text";
import { _, _r } from "../../../src.framework/_";
import { Make } from "../global/Make";
import { Button } from "../../../src.framework/net/retrocade/standalone/Button";
import { TWindowLanguage } from "../windows/TWindowLanguage";
import { S } from "../../S";
import { HoldOptions } from "../../platform/PlatformSpecific";
import { GlobalHoldScore } from "../global/GlobalHoldScore";
import { printf } from "../../../src.framework/printf";
import { PermanentStoreSlot } from '../global/store/PermanentStoreSlot';
import { RecamelCore } from 'src.framework/net/retrocade/camel/core/RecamelCore';
import { permanentStoreUpgradeToV2 } from '../global/store/permanentStoreUpgradeToV2';
import { PermanentStore } from '../global/store/PermanentStore';
import { BaseTexture, Container, Sprite, Texture } from "pixi.js";

const LOGO_HEIGHT = 100;
type TextButton = Button & { setText(value: string): void };

export class TStatePreloader extends RecamelState {
	private _loadingText: Text = null!;

	private _versionText: Text = null!;

	private _bgTexture: Texture = null!;
	private _logoTexture: Texture = null!;
	private _bg: Sprite = null!;
	private _logo: Sprite = null!;

	private _layer: RecamelLayerSprite = null!;
	private _importOverlay: ImportOverlay = null!;

	private _holdScreens: HoldsScreen[] = [];
	private _nextScreenButton: TextButton = null!;
	private _prevScreenButton: TextButton = null!;

	private _exportButton: TextButton = null!;
	private _importButton: TextButton = null!;
	private _languageButton: TextButton = null!;

	private _onStartGame: (holdOptions: HoldOptions) => void;
	private _lastHoldOptions?: HoldOptions;

	constructor(lastHoldOptions: HoldOptions | undefined, onStartGame: (holdOptions: HoldOptions) => void) {
		super();

		this._onStartGame = onStartGame;
		this._lastHoldOptions = lastHoldOptions;
	}

	public create() {
		this._layer = RecamelLayerSprite.create();
		this._bgTexture = new Texture(new BaseTexture(ResourcesQueue.getImg(C.RES_PRELOADER_BG)));
		this._logoTexture = new Texture(new BaseTexture(ResourcesQueue.getImg(C.RES_LOGO_GAME)));
		this._bg = new Sprite(this._bgTexture);
		this._logo = new Sprite(this._logoTexture);
		this._loadingText = Make.shadowText("");
		this._versionText = Make.shadowText(S.version, 12);
		this._prevScreenButton = getShadowTextButton("<<", () => this.changePage(-1));
		this._nextScreenButton = getShadowTextButton(">>", () => this.changePage(1));
		this._exportButton = getShadowTextButton(_('ui.preloader.buttons.export_save'), () => this.exportSave(), 20);
		this._importButton = getShadowTextButton(_('ui.preloader.buttons.import_save'), () => this.handleImportSave(), 20);
		this._languageButton = getShadowTextButton("English", () => this.changeLanguage(), 20);
		this._importOverlay = new ImportOverlay();

		this._layer.add(this._bg);
		this._layer.add(this._logo);
		this._layer.add(this._loadingText);
		this._layer.add(this._versionText);
		this._layer.add(this._prevScreenButton);
		this._layer.add(this._nextScreenButton);
		this._layer.add(this._exportButton);
		this._layer.add(this._importButton);
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
			const page = new HoldsScreen(holdsPage, hold => this.handleGameStart(hold));
			page.y = LOGO_HEIGHT + (S.SIZE_GAME_HEIGHT - LOGO_HEIGHT - page.height) / 2 | 0;
			page.visible = false;

			this._layer.add(page);
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

		this._layer.add(this._importOverlay);
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
			this.refreshTexts();
		}
	}

	public handleGameStart = (hold: HoldOptions) => {
		if (this._importOverlay.visible) {
			return;
		}
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
		if (this._importOverlay.visible) {
			return;
		}

		var element = document.createElement('a');
		element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(PermanentStoreSlot.exportAll()));
		element.setAttribute('download', `KingDugansDungeonLite.save`);

		element.style.display = 'none';
		document.body.appendChild(element);

		element.click();

		document.body.removeChild(element);
	}

	private handleImportSave() {
		if (this._importOverlay.visible) {
			return;
		}

		const input = document.createElement('input');
		input.style.display='none';
		input.type='file';
		input.name='file';
		input.addEventListener('change', async () => {
			if (input.files) {
				const text = await input.files[0].text();
				PermanentStore.version.value = 1;

				this._importOverlay.setImporting();
				try {
					if (await PermanentStoreSlot.importAll(text)) {
						await permanentStoreUpgradeToV2();

						const currentPage = this._holdScreens.findIndex(screen => screen.visible);
						RecamelCore.setState(new TStatePreloader(S.pagedHoldOptions[currentPage][0], this.handleGameStart));
					} else {
						this._importOverlay.showError(_('ui.preloader.import.error.invalid_file'));
					}
				} catch (e:unknown) {
					this._importOverlay.showError(_r(
						'ui.preloader.import.error.unknown_error',
						{ error: String(e) }
					));

				}
			} else {
				this._importOverlay.hide();
			}
		});

		document.body.appendChild(input);
		input.click();
		document.body.removeChild(input);
		this._importOverlay.show();
	}

	private changeLanguage() {
		if (this._importOverlay.visible) {
			return;
		}
	}

	private refreshTexts() {
		this._importButton.setText(_('ui.preloader.buttons.import_save'));
		this._exportButton.setText(_('ui.preloader.buttons.export_save'));

		for (const holdScreen of this._holdScreens) {
			for (const [ holdId, button ] of holdScreen.holdIdToButtonMap.entries()) {
				button.setText(_(`ui.preloader.hold.${holdId}`));
			}
		}
	}
}

class HoldsScreen extends Container {
	public readonly holdIdToButtonMap = new Map<HoldId, TextButton>();

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
			this.holdIdToButtonMap.set(holdOptions.id, button);

			nextY += buttonHeight;
		}
	}
}

function getShadowTextButton(content: string, onClick: () => void, size = 48) {
	const text = Make.shadowText(content, size);
	const button = new Button(onClick);
	button.addChild(text);
	button.alignCenter();

	const textButton = button as TextButton;
	textButton.setText = (value: string) => {
		const center = button.center;
		text.text = value;
		button.center = center;
	}

	return textButton;
}

class ImportOverlay extends Container {
	private _overlay: Sprite;
	private _textField: Text;
	private _allowClosing = true;

	public constructor() {
		super();

		this.addChild(
			this._overlay = new Sprite(Texture.WHITE),
			this._textField = Make.text(40),
		);

		this._overlay.tint = 0;
		this._overlay.width = S.SIZE_GAME_WIDTH;
		this._overlay.height = S.SIZE_GAME_HEIGHT;
		this._overlay.alpha = 0.85;

		this._textField.color = 0xFFFFFF;
		this._textField.text = ".";
		this._textField.textAlignCenter();
		this._textField.wordWrap = true;
		this._textField.wordWrapWidth = S.SIZE_GAME_WIDTH - 40;
		this.visible = false;

		this.addListener('click', () => this.handleClick());
		this.interactive = true;
		this.interactiveChildren = true;
	}

	public show() {
		this.visible = true;
		this._allowClosing = true;
		this._textField.text = _('ui.preloader.import.selecting_file');
		this._textField.alignCenter();
		this._textField.alignMiddle();
	}

	public hide() {
		this.visible = false;
	}

	public showError(error: string) {
		this._allowClosing = true;

		this._textField.text = _r('ui.preloader.import.error', { error });
		this._textField.alignCenter();
		this._textField.alignMiddle();
	}

	public setImporting() {
		this._allowClosing = false;
		this._textField.text = _('ui.preloader.import.importing')
		this._textField.alignCenter();
		this._textField.alignMiddle();
	}

	private handleClick() {
		if (this._allowClosing) {
			this.visible = false;
		}
	}
}