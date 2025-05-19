import { Sprite } from "pixi.js";

export class VOParticle extends Sprite{
	public deltaX: number = 0;
	public deltaY: number = 0;

	public timeLeft: number = 0;
	public active: boolean = false;
}
