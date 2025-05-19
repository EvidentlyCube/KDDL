import { Sprite } from "pixi.js";

export enum VOVerminType {
	ACC_HARD_LEFT = 0,
	ACC_LEFT = 1,
	ACC_FORWARD = 2,
	ACC_RIGHT = 3,
	ACC_HARD_RIGHT = 4,
	ACC_COUNT = 5
}

export class VOVermin extends Sprite{
	public moveAngle: number = 0;
	public acceleration: VOVerminType = 0;
	public size: number = 0;
	public active: boolean = true;
	public timeLeft: number = 0;
}
