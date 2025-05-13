import { _ } from "src.framework/_";

/** Location & Keyname -> New Keyname */
const keyMap = new Map<number, Map<string, string>>();
// NUMPAD
keyMap.set(3, new Map([
	['7', 'Numpad7'],
	['8', 'Numpad8'],
	['9', 'Numpad9'],
	['4', 'Numpad4'],
	['5', 'Numpad5'],
	['Numpad5', 'Numpad5'],
	['6', 'Numpad6'],
	['1', 'Numpad1'],
	['2', 'Numpad2'],
	['3', 'Numpad3'],
	['0', 'Numpad0'],
	['+', 'NumpadAdd'],
	['-', 'NumpadSub'],
	['*', 'NumpadMul'],
	['/', 'NumpadDiv'],
	['.', 'NumpadDot'],
	[',', 'NumpadDot'],
	['Home', 'Numpad7'],
	['ArrowUp', 'Numpad8'],
	['PageUp', 'Numpad9'],
	['ArrowLeft', 'Numpad4'],
	['Clear', 'Numpad5'],
	['ArrowRight', 'Numpad6'],
	['End', 'Numpad1'],
	['ArrowDown', 'Numpad2'],
	['PageDown', 'Numpad3'],
	['Insert', 'Numpad0'],
	['Delete', 'NumpadDot'],
]));

const isUppercaseLetterRegex = /^[A-Z]$/;

class RawInput
{
	private _lastMouseX: number;
	private _lastMouseY: number;
	private _currentMouseX: number;
	private _currentMouseY: number;
	private _keysDown: Set<string>;
	private _keysPressed: string[];
	private _keysReleased: string[];
	private _mouseButtonsDown: number[];
	private _mouseButtonsPressed: number[];
	private _mouseButtonsReleased: number[];
	private _isCtrlDown: boolean;
	private _isShiftDown: boolean;
	private _isAltDown: boolean;
	private _lastKeyPressed: string;

	public gameOffsetX: number = 0;
	public gameOffsetY: number = 0;
	public gameScaleX: number = 1;
	public gameScaleY: number = 1;

	get rawMouseX(): number
	{
		return this._currentMouseX;
	}

	get rawMouseY(): number
	{
		return this._currentMouseY;
	}

	get localMouseX(): number
	{
		return (this.rawMouseX - this.gameOffsetX) / this.gameScaleX;
	}

	get localMouseY(): number
	{
		return (this.rawMouseY - this.gameOffsetY) / this.gameScaleY;
	}

	get rawMouseDeltaX(): number
	{
		return this._currentMouseX - this._lastMouseX;
	}

	get rawMouseDeltaY(): number
	{
		return this._currentMouseY - this._lastMouseY;
	}

	get rawMouseDelta(): number
	{
		return Math.sqrt(this.rawMouseDeltaX * this.rawMouseDeltaX + this.rawMouseDeltaY * this.rawMouseDeltaY);
	}

	get isCtrlDown(): boolean
	{
		return this._isCtrlDown;
	}

	get isShiftDown(): boolean
	{
		return this._isShiftDown;
	}

	get isAltDown(): boolean
	{
		return this._isAltDown;
	}

	public isKeyDown = (key: string): boolean => this._keysDown.has(key);
	public isKeyPressed = (key: string): boolean => this._keysPressed.indexOf(key) !== -1;
	public isKeyReleased = (key: string): boolean => this._keysReleased.indexOf(key) !== -1;

	public isMouseDown = (button: number): boolean => this._mouseButtonsDown.indexOf(button) !== -1;
	public isMousePressed = (button: number): boolean => this._mouseButtonsPressed.indexOf(button) !== -1;
	public isMouseReleased = (button: number): boolean => this._mouseButtonsReleased.indexOf(button) !== -1;

	public get lastKey()
	{
		return this._lastKeyPressed;
	}

	constructor()
	{
		this._lastMouseX = 0;
		this._lastMouseY = 0;
		this._currentMouseX = 0;
		this._currentMouseY = 0;

		this._isCtrlDown = false;
		this._isAltDown = false;
		this._isShiftDown = false;

		this._keysReleased = [];
		this._keysPressed = [];
		this._keysDown = new Set();
		this._mouseButtonsDown = [];
		this._mouseButtonsReleased = [];
		this._mouseButtonsPressed = [];
		this._lastKeyPressed = "";

		document.addEventListener("mousemove", this.handleMouseEvent);
		document.addEventListener("mousedown", this.handleMouseEvent);
		document.addEventListener("mouseup", this.handleMouseEvent);
		document.addEventListener("pointermove", this.handleMouseEvent);
		document.addEventListener("pointerdown", this.handleMouseEvent);
		document.addEventListener("pointerup", this.handleMouseEvent);
		document.addEventListener("keydown", this.handleKeyboardEvent);
		document.addEventListener("keyup", this.handleKeyboardEvent);
		document.addEventListener("contextmenu", e => e.preventDefault());
	}

	public update = (): void =>
	{
		this._keysReleased = this._keysPressed;
		this._keysPressed = [];
		this._mouseButtonsReleased = this._mouseButtonsPressed;
		this._mouseButtonsPressed = [];

		this._lastMouseX = this._currentMouseX;
		this._lastMouseY = this._currentMouseY;
	};

	public flushAll = (): void =>
	{
		this.flushKeyboard();
		this.flushMouse();
	};

	public flushKeyboard = (): void =>
	{
		this._keysPressed.length = 0;
		this._keysReleased.length = 0;
		this._keysDown.clear()
		this._lastKeyPressed = "";
	};

	public flushMouse = (): void =>
	{
		this._mouseButtonsPressed.length = 0;
		this._mouseButtonsReleased.length = 0;
		this._mouseButtonsDown.length = 0;
	};

	private handleMouseEvent = (event: MouseEvent): void =>
	{
		event.preventDefault();

		this._isAltDown = event.altKey;
		this._isCtrlDown = event.ctrlKey;
		this._isShiftDown = event.shiftKey;

		this._currentMouseX = event.pageX;
		this._currentMouseY = event.pageY;

		if (event.type === 'mouseup' || event.type === 'pointerup') {
			this._mouseButtonsDown = this._mouseButtonsDown.filter(button => button !== event.button);

		} else if (event.type === 'mousedown' || event.type === 'pointerdown') {
			this._mouseButtonsDown.push(event.button);
			this._mouseButtonsPressed.push(event.button);
		}
	};

	public mapKey(key: string, location: number, code?: string, which?: number): string {
		if (key === 'Unidentified') {
			if (which === 12) {
				key = 'Numpad5';

			} else if (code) {
				key = code;
			}
		}

		if (keyMap.has(location) && keyMap.get(location)!.has(key)) {
			return keyMap.get(location)!.get(key)!;
		}

		if (isUppercaseLetterRegex.test(key)) {
			return key.toLowerCase();
		}

		return key;
	}

	private handleKeyboardEvent = (event: KeyboardEvent): void =>
	{
		if (event.key !== 'F11' && event.key !== 'F12') {
			event.preventDefault();
		}
		const mappedKey = this.mapKey(event.key, event.location, event.code, event.which);

		if (mappedKey === 'Tab') {
			event.preventDefault();
		}
		this._isAltDown = event.altKey;
		this._isCtrlDown = event.ctrlKey;
		this._isShiftDown = event.shiftKey;

		if (event.type === 'keydown') {
			this._keysPressed.push(mappedKey);
			this._keysDown.add(mappedKey);
			this._lastKeyPressed = mappedKey;

		} else if (event.type === 'keyup') {
			this._keysDown.delete(mappedKey);
		}
	};

	public isAnyKeyDown() {
		return this._keysDown.size > 0;
	}

	public get keyDownCount() {
		return this._keysDown.size;
	}

	public isAnyKeyPressed() {
		return this._keysPressed.length > 0;
	}

	public keyToTranslatableName(key: string) {
		if (key.startsWith('Numpad')) {
			return "numpad_" + key.substring(6).toLocaleLowerCase();
		}

		switch (key) {
			case ' ': return 'space';
			case '.': return 'period';
			case ',': return 'comma';
			case ':': return 'colon';
			case ';': return 'semicolon';
			case '!': return 'exclamation';
			case '@': return 'at';
			case '#': return 'hash';
			case '$': return 'dollar';
			case '%': return 'percent';
			case '^': return 'caret';
			case '&': return 'and';
			case '*': return 'asterisk';
			case '-': return 'dash';
			case '_': return 'underscore';
			case '+': return 'plus';
			case '=': return 'equal';
			case '"': return 'double_quote';
			case "'": return 'single_quote';
			case '~': return 'tilde';
			case '`': return 'backtick';
			case '|': return 'pipe';
			case '/': return 'slash';
			case '\\': return 'backslash';
			case '<': return 'left_chevron';
			case '>': return 'right_chevron';
			case '(': return 'left_round_bracket';
			case ')': return 'right_round_bracket';
			case '[': return 'left_square_bracket';
			case ']': return 'right_square_bracket';
			case '{': return 'left_curly_bracket';
			case '}': return 'right_curly_bracket';
			default: return key.toLocaleLowerCase();
		}
	}

	public translateKeyName(key: string) {
		return _(`key_name.${this.keyToTranslatableName(key)}`);
	}
}

export default new RawInput();