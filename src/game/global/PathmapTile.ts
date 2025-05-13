export class PathmapTile {
	public isObstacle: boolean;

	public targetDistance: number;
	public steps: number = 0;

	public destinationSquares: PathmapTile[];

	public x: number = 0;
	public y: number = 0;

	public constructor(x: number, y: number) {
		this.isObstacle = false;
		this.x = x;
		this.y = y;
		this.targetDistance = 0;
		this.destinationSquares = [];
	}
}
