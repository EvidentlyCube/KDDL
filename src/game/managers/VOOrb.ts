import {VOOrbAgent} from "./VOOrbAgent";

export class VOOrb {
	public x: number;
	public y: number;

	public agents: VOOrbAgent[];

	public constructor(x: number, y: number) {
		this.x = x;
		this.y = y;
		this.agents = [];
	}

	public addAgent(type: number, tX: number, tY: number) {
		this.agents.push({type, tX, tY});
	}
}
