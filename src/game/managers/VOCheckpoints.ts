import { S } from "../../S";

export class VOCheckpoints {
	public checkpoints: number[] = [];

	public addCheckpoint(xml: Element) {
		this.checkpoints.push(parseInt(xml.getAttribute('X')!) + parseInt(xml.getAttribute('Y')!) * S.RoomWidth);
	}

	public contains(x: number, y: number): boolean {
		return this.checkpoints.indexOf(x + y * S.RoomWidth) != -1;
	}

	public clear() {
		this.checkpoints.length = 0;
	}
}
