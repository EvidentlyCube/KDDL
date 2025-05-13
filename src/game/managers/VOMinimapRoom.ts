import {S} from "../../S";
import {F} from "../../F";
import {UtilsBitmapData} from "../../../src.framework/net/retrocade/utils/UtilsBitmapData";

export class VOMinimapRoom {
	public data: Element;
	public bitmapData: CanvasRenderingContext2D;

	public wasVisited: boolean = true;
	public completed: boolean = false;

	public constructor(data: Element) {
		this.data = data;

		this.bitmapData = F.newCanvasContext(S.RoomWidth, S.RoomHeight);
	}

	plot(index: number, color: number) {
		UtilsBitmapData.blitRectangle(
			this.bitmapData,
			index % S.RoomWidth,
			index / S.RoomWidth | 0,
			1, 1,
			color | 0xFF000000,
		);
	}
}
