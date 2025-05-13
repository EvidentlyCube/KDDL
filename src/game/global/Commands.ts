import {BinaryReader, BinaryWriter, Encoding} from "csharp-binary-stream";
import {C} from "../../C";

export interface Command {
	command: number;
	wx?: number;
	wy?: number;
}

export class Commands {
	private static _list: Command[] = [];
	private static _frozen: boolean = false;

	/** Position of the internal pointer **/
	private static _index: number = 0;

	public static add(command: number) {
		Commands._list.push({command});
	}

	public static addWithData(command: number, wx: number, wy: number) {
		Commands._list.push({command: command, wx: wx, wy: wy});
	}

	public static clear() {
		Commands._list.length = 0;
		Commands._frozen = false;
	}

	public static count(): number {
		return Commands._list.length;
	}

	public static freeze() {
		Commands._frozen = true;
	}

	public static unfreeze() {
		Commands._frozen = false;
	}

	public static isFrozen(): boolean {
		return Commands._frozen;
	}

	public static removeLast() {
		Commands._list.length--;
	}

	/** Truncates the list to contain only Count commands **/
	public static truncate(count: number) {
		Commands._list.length = count;
	}

	public static getCommand(index: number): number {
		return Commands._list[Commands._index = index].command;
	}

	public static getComplexX(): number {
		return Commands._list[Commands._index].wx ?? 0;
	}

	public static getComplexY(): number {
		return Commands._list[Commands._index].wy ?? 0;
	}

	public static getFirst(): number {
		Commands._index = 0;
		return Commands._list[Commands._index].command;
	}

	public static getLast(): number {
		return Commands._list.length ? Commands._list[Commands._list.length - 1].command : C.CMD_UNSPECIFIED;
	}

	public static getNext(): number {
		if (++Commands._index >= Commands._list.length) {
			return Number.MAX_VALUE;
		}

		return Commands._list[Commands._index].command;
	}

	public static getPrev(): number {
		if (Commands._index-- < 0) {
			return Number.MAX_VALUE;
		}

		return Commands._list[Commands._index].command;
	}

	public static toString(): string {
		return JSON.stringify(this._list);
	}

	public static fromString(buffer: string) {
		try {
			Commands._list = JSON.parse(buffer);
			if (!Array.isArray(Commands._list)) {
				Commands._list = [];
			}

		} catch (e) {
			Commands._list = [];
		}
	}
}
