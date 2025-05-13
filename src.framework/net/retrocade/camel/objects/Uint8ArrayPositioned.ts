import {UtilsNumber} from "../../utils/UtilsNumber";

export class Uint8ArrayPositioned {
	public readonly array: Uint8Array;
	private _position: number = 0;


	get position(): number {
		return this._position;
	}

	set position(value: number) {
		this._position = UtilsNumber.limit(value, this.array.length, 0);
	}

	constructor(array: Uint8Array) {
		this.array = array;
	}

	public advance(positions: number = 1) {
		this.position += this._position + positions;
	}
}