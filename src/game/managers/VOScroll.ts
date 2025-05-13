export class VOScroll {
	public x: number;
	public y: number;
	public text: string;
	public textId: string;

	public constructor(x: number, y: number, text: string, textId: string) {
		this.x = x;
		this.y = y;
		this.text = text;
		this.textId = textId;
	}
}
