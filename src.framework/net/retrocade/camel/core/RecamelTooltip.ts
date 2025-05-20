import {DropShadowFilter} from "@pixi/filter-drop-shadow";
import RawInput from "../../../../../src.tn/RawInput";
import {S} from "../../../../../src/S";
import { Container, DisplayObject, Graphics, InteractionEvent, NineSlicePlane, Text, TextStyle } from "pixi.js";

type TextSource = string | (() => string);

const tooltipContainer = new Container();
const hooks = new Map<any, TextSource>();

tooltipContainer.interactive = false;
tooltipContainer.interactiveChildren = false;

const tooltipStyle = new TextStyle();
const tooltipText = new Text('', tooltipStyle);

let bgGrid: NineSlicePlane | undefined;
let bgGraphics = new Graphics();
let bgColor = 0;
let isHidden = true;

let paddingTop = 0;
let paddingRight = 0;
let paddingBottom = 0;
let paddingLeft = 0;

tooltipContainer.addChild(tooltipText);

function onHookOver(event: InteractionEvent) {
	const textSource = hooks.get(event.target) ?? '';
	setText(typeof textSource === 'function' ? textSource() : textSource);
	isHidden = false;
}

function onHookOut() {
	isHidden = true;
}

function setGridBackground(bg: NineSlicePlane | undefined) {
	if (bgGrid) {
		tooltipContainer.removeChild(bgGrid);
	}

	bgGrid = bg;

	if (bgGrid) {
		tooltipContainer.addChildAt(bgGrid, 0);
	}
}

function setColorBackground(bg: number) {
	bgColor = bg;
	setGridBackground(undefined);
}

function setText(text: string) {
	tooltipText.text = text;

	tooltipText.x = paddingLeft;
	tooltipText.y = paddingTop;

	if (bgGrid) {
		bgGrid.width = tooltipText.width + paddingLeft + paddingRight;
		bgGrid.height = tooltipText.height + paddingTop + paddingBottom;
		bgGrid.x = 0;
		bgGrid.y = 0;

	} else {
		bgGraphics.clear();
		bgGraphics.beginFill(bgColor);
		bgGraphics.drawRect(
			0,
			0,
			tooltipText.width + paddingLeft + paddingRight,
			tooltipText.height + paddingTop + paddingBottom);
	}
}

export const RecamelTooltip = {
	get container() {
		return tooltipContainer;
	},
	hook(object: DisplayObject, text: TextSource): void {
		hooks.set(object, text);

		object.interactive = true;
		object.off('pointerover', onHookOver);
		object.off('pointerout', onHookOut);
		object.on('pointerover', onHookOver);
		object.on('pointerout', onHookOut);
	},

	unhook(object: DisplayObject): void {
		hooks.delete(object);

		object.off('pointerover', onHookOver);
		object.off('pointerout', onHookOut);
	},


	// ::::::::::::::::::::::::::::::::::::::::::::::
	// :: Appearance
	// ::::::::::::::::::::::::::::::::::::::::::::::

	setShadow(angle: number = NaN, blur: number = 4, distance: number = 5, strength: number = 1, alpha: number = 1, color: number = 0): void {
		if (isNaN(angle)) {
			tooltipContainer.filters = [];
		} else {
			tooltipContainer.filters = [new DropShadowFilter({
				rotation: angle,
				quality: 5,
				color, alpha, blur, distance,
			})];
		}
	},

	setPadding(top: number = 0, right: number = 0, bottom: number = 0, left: number = 0): void {
		paddingTop = top;
		paddingRight = right;
		paddingBottom = bottom;
		paddingLeft = left;
	},

	setBackground(bg: NineSlicePlane | number): void {
		if (bg instanceof NineSlicePlane) {
			setGridBackground(bg);
		} else {
			setColorBackground(bg);
		}
	},

	useFontText(fontName: string): void {
		tooltipStyle.fontFamily = fontName;
		tooltipText.style = tooltipStyle;
	},

	/**
	 * if using Text sets the fontSize to size
	 */
	setSize(size: number): void {
		tooltipStyle.fontSize = size;
		tooltipText.style = tooltipStyle;
	},

	/**
	 * if using Text sets the font color
	 */
	setColor(color: number): void {
		tooltipStyle.fill = color;
		tooltipText.style = tooltipStyle;
	},


	// ::::::::::::::::::::::::::::::::::::::::::::::
	// :: Display
	// ::::::::::::::::::::::::::::::::::::::::::::::

	/**
	 * Manually hide the Tooltip. It doesn't stop Tooltip from appearing again!
	 */
	hide(): void {
		isHidden = true;
	},


	update(): void {
		if (isHidden) {
			if (tooltipContainer.alpha > 0) {
				tooltipContainer.alpha -= 0.125;
			}

		} else if (tooltipContainer.alpha < 1) {
			tooltipContainer.alpha += 0.125;
		}

		tooltipContainer.x = RawInput.localMouseX - tooltipText.width / 2 - (paddingLeft + paddingRight) / 2 | 0;
		tooltipContainer.y = RawInput.localMouseY - tooltipText.height - paddingTop - paddingBottom - 8 | 0;

		if (tooltipContainer.x < 0) {
			tooltipContainer.x = 0;
		}
		if (tooltipContainer.x + tooltipContainer.width > S.SIZE_GAME_WIDTH) {
			tooltipContainer.x = S.SIZE_GAME_WIDTH - tooltipContainer.width;
		}

		if (tooltipContainer.y < 0) {
			tooltipContainer.y = 0;
		}
		if (tooltipContainer.y + tooltipContainer.height > S.SIZE_GAME_HEIGHT) {
			tooltipContainer.y = S.SIZE_GAME_HEIGHT - tooltipContainer.height;
		}
	}


}
