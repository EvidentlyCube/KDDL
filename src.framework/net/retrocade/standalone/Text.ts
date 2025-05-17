import * as PIXI from 'pixi.js';
import {arrangeBlock, drawArrangedText, parseHtmlString} from 'canvas-rich-text';
import {RecamelSprite} from "../camel/core/RecamelSprite";
import {DROD} from "../../../../src/game/global/DROD";
import {C} from "../../../../src/C";

export class Text extends RecamelSprite {

	private _text: string = '';
	private _htmlText: string | undefined;
	private _displayAsPassword: boolean = false;
	private _maxChars: number = 0;

	private _htmlTextContext?: CanvasRenderingContext2D;
	private _htmlTextTexture?: PIXI.Texture;
	private _checkDeleteInterval?: number;

	// ::::::::::::::::::::::::::::::::::::::::::::::::
	// :: Internals
	// ::::::::::::::::::::::::::::::::::::::::::::::::

	private _textField: PIXI.Text;

	/**
	 * Internal text format object
	 */
	private _textFormat = new PIXI.TextStyle();

	get textWidth() {
		return this.getLocalBounds().width;
	}

	get textHeight() {
		return this.getLocalBounds().height;
	}

	get textFormat(): PIXI.TextStyle {
		return this._textFormat;
	}

	get textTexture(): PIXI.Texture<PIXI.Resource> {
		return this._textField.texture;
	}

	get textCanvas(): HTMLCanvasElement {
		return (this._textField.texture.baseTexture.resource as any).source;
	}

	public updateText() {
		this._textField.updateText(true);
	}

// ::::::::::::::::::::::::::::::::::::::::::::::::
	// :: Color
	// ::::::::::::::::::::::::::::::::::::::::::::::::

	private _color: number = 0;
	/**
	 * Indicates the color of the text. A number containing three 8-bit RGB components; for example, 0xFF0000 is
	 * red, and 0x00FF00 is green.
	 */
	public set color(value: number) {
		this._color = value;
		this._textFormat.fill = value;
	}

	// ::::::::::::::::::::::::::::::::::::::::::::::
	// :: Display as Password
	// ::::::::::::::::::::::::::::::::::::::::::::::

	/**
	 * Specifies whether the text field is a password text field. If the value of this property is true, the text
	 * field is treated as a password text field and hides the input characters using asterisks instead of the
	 * actual characters. If false, the text field is not treated as a password text field. When password mode is
	 * enabled, the Cut and Copy commands and their corresponding keyboard shortcuts will not function. This
	 * security mechanism prevents an unscrupulous user from using the shortcuts to discover a password on an
	 * unattended computer.
	 *
	 * @default false
	 */
	public get displayAsPassword(): boolean {
		return this._displayAsPassword;
	}

	/**
	 * @private
	 */
	public set displayAsPassword(value: boolean) {
		if (this._displayAsPassword !== value) {
			this._displayAsPassword = value;
			this._textField.text = value ? this._text : this.text.replace(/./g, '*');
		}
	}


	// ::::::::::::::::::::::::::::::::::::::::::::::::
	// :: Font
	// ::::::::::::::::::::::::::::::::::::::::::::::::

	/**
	 * The name of the font for text in this text format, as a string.
	 *
	 * @default null, which means that Flash Player uses Times New Roman font for the text
	 */
	public get font(): string {
		return this._textFormat.fontFamily as string;
	}

	/**
	 * @private
	 */
	public set font(value: string) {
		this._textFormat.fontFamily = value;
	}


	// ::::::::::::::::::::::::::::::::::::::::::::::
	// :: HTML Text
	// ::::::::::::::::::::::::::::::::::::::::::::::

	/**
	 * Contains the HTML representation of the text field contents.
	 */
	public get htmlText(): string | undefined {
		return this._htmlText;
	}

	/**
	 * @private
	 */
	public set htmlText(value: string | undefined) {
		this._htmlText = value;
		this._text = value ?? this._text;

		this.regenerateHtmlText();
	}


	// ::::::::::::::::::::::::::::::::::::::::::::::
	// :: Length
	// ::::::::::::::::::::::::::::::::::::::::::::::

	/**
	 * The number of characters in a text field. A character such as tab (\t) counts as one character.
	 */
	public get length(): number {
		return this._text.length;
	}


	// ::::::::::::::::::::::::::::::::::::::::::::::::
	// :: Letter Spacing
	// ::::::::::::::::::::::::::::::::::::::::::::::::

	/**
	 * A number representing the amount of space that is uniformly distributed between all characters. The value
	 * specifies the number of pixels that are added to the advance after each character.
	 * You can use decimal values such as 1.75.
	 *
	 * @default null, which means that 0 pixels of letter spacing is used
	 */
	public get letterSpacing(): number {
		return this._textFormat.letterSpacing;
	}

	/**
	 * @private
	 */
	public set letterSpacing(value: number) {
		this._textFormat.letterSpacing = value;
	}


	// ::::::::::::::::::::::::::::::::::::::::::::::
	// :: Line Space
	// ::::::::::::::::::::::::::::::::::::::::::::::

	/**
	 * An integer representing the amount of vertical space (called leading) between lines.
	 *
	 * @default null, which indicates that the amount of leading used is 0
	 */
	public get lineSpacing(): number {
		return this._textFormat.leading;
	}

	/**
	 * @private
	 */
	public set lineSpacing(value: number) {
		this._textFormat.leading = value;
	}


	// ::::::::::::::::::::::::::::::::::::::::::::::
	// :: Max Characters
	// ::::::::::::::::::::::::::::::::::::::::::::::

	/**
	 * The maximum number of characters that the text field can contain, as entered by a user. A script can insert
	 * more text than maxChars allows; the maxChars property indicates only how much text a user can enter. If the
	 * value of this property is 0, a user can enter an unlimited amount of text.
	 *
	 * @default 0
	 */
	public get maxChars(): number {
		return this._maxChars;
	}

	/**
	 * @private
	 */
	public set maxChars(value: number) {
		this._maxChars = value;

		if (value > 0 && this._text.length > value) {
			this.text = this._text.substr(0, value);
		}
	}


	// ::::::::::::::::::::::::::::::::::::::::::::::::
	// :: Size
	// ::::::::::::::::::::::::::::::::::::::::::::::::

	/**
	 * The size in pixels of text in this text format.
	 *
	 * @default null, which means that a size of 12 is used
	 */
	public get size(): number {
		return this._textFormat.fontSize as number;
	}

	/**
	 * @private
	 */
	public set size(value: number) {
		this._textFormat.fontSize = value;
	}


	// ::::::::::::::::::::::::::::::::::::::::::::::
	// :: Text
	// ::::::::::::::::::::::::::::::::::::::::::::::

	/**
	 * A string that is the current text in the text field. Lines are separated by the carriage return character
	 * ('\r', ASCII 13). This property contains unformatted text in the text field, without HTML tags.
	 */
	public get text(): string {
		return this._textField.text;
	}

	/**
	 * @private
	 */
	public set text(value: string) {
		this._htmlText = undefined;
		this.regenerateHtmlText();

		this._textField.text = value;
	}


	// ::::::::::::::::::::::::::::::::::::::::::::::
	// :: Width
	// ::::::::::::::::::::::::::::::::::::::::::::::

	/**
	 * Width of the text field.
	 */
	public get wordWrapWidth(): number {
		return this._textFormat.wordWrapWidth;
	}

	/**
	 * @private
	 */
	public set wordWrapWidth(value: number) {
		this._textFormat.wordWrapWidth = value;
	}

	public padding: number = 0;

	// ::::::::::::::::::::::::::::::::::::::::::::::
	// :: Word Wrap
	// ::::::::::::::::::::::::::::::::::::::::::::::

	/**
	 * A boolean value that indicates whether the text field has word wrap. If the value of wordWrap is true, the
	 * text field has word wrap; if the value is false, the text field does not have word wrap.
	 *
	 * @default false
	 */
	public get wordWrap(): boolean {
		return this._textFormat.wordWrap;
	}

	/**
	 * @private
	 */
	public set wordWrap(value: boolean) {
		this._textFormat.breakWords = value;
		this._textFormat.wordWrap = value;
	}


	/******************************************************************************************************/
	/**                                                                                        FUNCTIONS  */
	/******************************************************************************************************/

	// ::::::::::::::::::::::::::::::::::::::::::::::::
	// :: Align
	// ::::::::::::::::::::::::::::::::::::::::::::::::

	/**
	 * Aligns the text to the left
	 */
	public textAlignLeft() {
		this._textFormat.align = 'left';
	}

	/**
	 * Aligns the text to the center
	 */
	public textAlignCenter() {
		this._textFormat.align = 'center';
	}

	/**
	 * Aligns the text to the right
	 */
	public textAlignRight() {
		this._textFormat.align = 'right';
	}

	/**
	 * Aligns the text to be justified
	 */
	public textAlignJustify() {
		this._textFormat.align = 'justify';
	}


	// ::::::::::::::::::::::::::::::::::::::::::::::::
	// :: Constructor
	// ::::::::::::::::::::::::::::::::::::::::::::::::

	public constructor(text: string = '', font: string = 'Pixelade', size: number = 13, color: number = 0xFFFFFF) {
		super();

		this._textField = new PIXI.Text('');
		this._textField.style = this._textFormat;

		this.size = size;
		this.font = font;
		this.color = color;
		this.text = text;

		this.interactive = false;

		this.addChild(this._textField);
	}

	private regenerateHtmlText() {
		this.destroyHtmlText();

		this._textField.visible = !this._htmlText;

		if (this._htmlText) {
			const canvas = this.textCanvas;
			this._htmlTextContext = canvas.getContext('2d')!;
			const r = (this._color >> 16) & 0xFF;
			const g = (this._color >> 8) & 0xFF;
			const b = this._color & 0xFF;
			const arrangedText = arrangeBlock(parseHtmlString(
				this._htmlText,
				{
					width: this.wordWrapWidth,
					fontFamily: C.FONT_FAMILY,
					fontSize: this.size,
					newLine: 'preserve',
					color: `rgb(${r}, ${g}, ${b})`,
					lineSpacing: 3,
					spaceWidth: 8,
					lineHeight: 'static'
				},
			));

			canvas.width = arrangedText.width + 2 + this.padding * 2;
			canvas.height = arrangedText.height + + 10 + this.padding * 2;

			drawArrangedText(arrangedText, this._htmlTextContext, this.padding - arrangedText.x, this.padding);
			this._htmlTextTexture = new PIXI.Texture(new PIXI.BaseTexture(canvas));
			this.texture = this._htmlTextTexture;

			this._checkDeleteInterval = setInterval(() => this.checkDelete(), 1000) as any;
		}
	}

	private checkDelete() {
		let p: PIXI.DisplayObject = this; // 'this' is an extension of a PIXI.Container
		while (p) {
			if (p.parent === DROD.app.stage) {
				return;
			}

			p = p.parent;
		}

		this.destroyHtmlText();
	}

	private destroyHtmlText() {
		if (this._checkDeleteInterval) {
			clearInterval(this._checkDeleteInterval);
		}

		this._htmlTextTexture?.destroy(true);

		this._htmlTextTexture = undefined;
		this._htmlTextContext = undefined;
		this.texture = undefined!;
	}

	public autoAdjustSize(toWidth: number, toHeight?: number) {
		while (this.size > 8) {
			const matchesWidth = this.getLocalBounds().width <= toWidth;
			const matchesHeight = toHeight === undefined || this.getLocalBounds().height <= toHeight
			if (matchesWidth && matchesHeight) {
				break;
			}

			this.textFormat.leading--;
			if (this.textFormat.leading < -3) {
				this.textFormat.leading = 0;
				this.size--;
			}
		}
	}
}
