import * as PIXI from 'pixi.js';
import { RecamelLang } from "../../../src.framework/net/retrocade/camel/RecamelLang";
import { RecamelWindow } from "../../../src.framework/net/retrocade/camel/core/RecamelWindow";
import { Button } from "../../../src.framework/net/retrocade/standalone/Button";
import { S } from "../../S";
import { Make } from "../global/Make";
import { PermanentStore } from '../global/store/PermanentStore';

export class TWindowLanguage extends RecamelWindow {
	private buttons: Button[] = [];

	public constructor() {
		super();

		let lastY = 0;

		for (let i = 0; i < S.LANGUAGES.length; i++) {
			const languageCode = S.LANGUAGES[i];
			const txt = Make.shadowText(S.LANGUAGE_NAMES[languageCode]);

			const button = new Button(this.onSelectLanguage);
			button.addChild(txt);
			button.data = S.LANGUAGES[i];

			this.buttons.push(button);

			this.addChild(button);

			button.y = lastY;

			lastY += button.getLocalBounds().height;
		}

		for (const button of this.buttons) {
			button.alignCenterParent(0, this.width);
		}

		this.center();

		const bg = new PIXI.Graphics();
		bg.beginFill(0, 0.75);
		bg.drawRect(-this.x, -this.y, S.SIZE_GAME_WIDTH, S.SIZE_GAME_HEIGHT);
		this.addChildAt(bg, 0);

		this.show();
	}

	private onSelectLanguage = (data: Button) => {
		RecamelLang.selected = data.data.toString();

		PermanentStore.settings.language.write(RecamelLang.selected);

		this.close();
	}
}
