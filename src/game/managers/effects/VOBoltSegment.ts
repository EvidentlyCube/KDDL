import {VOBitmapSegment} from "./VOBitmapSegment";

export class VOBoltSegment {
	public bitmap: VOBitmapSegment;

	public xSource: number;
	public ySource: number;

	public xPosition: number;
	public yPosition: number;

	public constructor(bitmap: VOBitmapSegment, x1: number, y1: number, x2: number, y2: number) {
		this.bitmap = bitmap;
		this.xSource = x1;
		this.ySource = y1;
		this.xPosition = x2;
		this.yPosition = y2;
	}
}
