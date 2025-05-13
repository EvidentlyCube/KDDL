import {intAttr} from "../../XML";

export class VOStairs {
	public left: number;
	public right: number;
	public top: number;
	public bottom: number;
	public entrance: number;

	public constructor(xml: Element) {
		this.entrance = intAttr(xml, 'EntranceID');
		this.left = intAttr(xml, 'Left');
		this.right = intAttr(xml, 'Right');
		this.top = intAttr(xml, 'Top');
		this.bottom = intAttr(xml, 'Bottom');
	}
}
