export enum VOVerminType {
	ACC_HARD_LEFT = 0,
	ACC_LEFT = 1,
	ACC_FORWARD = 2,
	ACC_RIGHT = 3,
	ACC_HARD_RIGHT = 4,
	ACC_COUNT = 5
}

export class VOVermin {
	public x: number = 0;
	public y: number = 0;
	public angle: number = 0;
	public acceleration: number = 0;
	public size: number = 0;
	public type: VOVerminType = 0;
	public active: boolean = false;
	public timeLeft: number = 0;
}
