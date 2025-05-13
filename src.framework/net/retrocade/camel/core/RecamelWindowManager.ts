import {RecamelWindow} from "./RecamelWindow";
import {RecamelDisplay} from "./RecamelDisplay";
import {RecamelTooltip} from "./RecamelTooltip";

const windows: RecamelWindow[] = [];
let isPausingGame = false;


/**
 * Updates windows related stuff to
 */
function validateWindowsNow(): void {
	let blockWindows: boolean = false;
	isPausingGame = false;

	for (const window of windows.concat().reverse()) {
		if (blockWindows) {
			window.block();

		} else {
			window.unblock();
		}

		isPausingGame = window.pauseGame || isPausingGame;
		blockWindows = window.blockUnder || blockWindows;
	}

	if (blockWindows || isPausingGame) {
		RecamelDisplay.block();
	} else {
		RecamelDisplay.unblock();
	}
}

export const RecamelWindowManager = {
	get pauseGame() {
		return isPausingGame;
	},

	/**
	 * @private
	 * Adds given window to the display
	 * @param window Window to be added
	 */
	addWindow(window: RecamelWindow): void {
		RecamelTooltip.hide();
		windows.push(window);
		RecamelDisplay._windowsContainer.addChild(window);
		validateWindowsNow();
	},

	/**
	 * @private
	 * Removes given window from the display
	 * @param window Window to be removed
	 */
	removeWindow(window: RecamelWindow): void {
		RecamelTooltip.hide();
		const index: number = windows.indexOf(window);
		if (index == -1) {
			return;
		}

		RecamelDisplay._windowsContainer.removeChild(window);

		windows.splice(index, 1);
		validateWindowsNow();
	},


	/**
	 * Removes last added window
	 */
	removeLastWindow(): void {
		RecamelTooltip.hide();
		const l: number = windows.length;
		if (l == 0) {
			return;
		}

		windows[l - 1].close();
	},

	/**
	 * Removes all windows
	 */
	clearWindows(): void {
		RecamelTooltip.hide();
		while (windows.length) {
			RecamelWindowManager.removeLastWindow();
		}
	},


	update(): void {
		for (const window of windows) {
			if (!window.isBlocked) {
				window.update();
			}
		}
	}
}
