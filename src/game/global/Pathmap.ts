import {PathmapTile} from "./PathmapTile";
import {Room} from "./Room";
import {S} from "../../S";
import {C} from "../../C";
import {F} from "../../F";

export class Pathmap {
	public static dxDir = [-1, 0, 1, -1, 1, -1, 0, 1];
	public static dyDir = [-1, -1, -1, 0, 0, 1, 1, 1];

	public queue: (PathmapTile | null)[] = [];
	public queueTop: number = 0;
	public queueBottom: number = 0;

	public tiles: PathmapTile[] = [];

	public lastCalcTurn: number = 0;

	public targetX: number = Number.MAX_VALUE;
	public targetY: number = Number.MAX_VALUE;

	public movementType: number = 0;
	public supportPartialObstacles: boolean = false;

	public room: Room;

	/*
	 * TODO: Update tile
	 * TODO: Smart recalculate (if possible?)
	 */

	public constructor(movementType: number, supportPartialObstacles: boolean) {
		this.movementType = movementType;
		this.supportPartialObstacles = supportPartialObstacles;
		this.room = undefined!;

		for (let i: number = 0; i < S.RoomWidth; i++) {
			for (let j: number = 0; j < S.RoomHeight; j++) {
				this.tiles[i + j * S.RoomWidth] = new PathmapTile(i, j);
			}
		}

		for (let i = 0; i < 256; i++) {
			this.queue[i] = null;
		}
	}

	public clear() {
		this.queue = undefined!;
		this.tiles = undefined!;
	}

	public setTarget(targetX: number, targetY: number) {
		if (this.targetX == targetX && this.targetY == targetY) {
			return;
		}

		this.targetX = targetX;
		this.targetY = targetY;
		this.reset();
	}

	public squareChanged(x: number, y: number) {
		const square: PathmapTile = this.tiles[x + y * S.RoomWidth];
		const oldIsObstacle: boolean = square.isObstacle;

		this.setSquareObstacle(x, y);
		if (square.isObstacle == oldIsObstacle) {
			return;
		}

		this.setSquareNeighboursPaths(x, y);

		this.reset();
	}

	public calculate() {
		let currentSquare: PathmapTile;
		let newScore: number;

		// this.room.layerDebug.clear();

		while (this.queueBottom < this.queueTop) {
			currentSquare = this.queue[this.queueBottom++]!;

			// for (const newSquare of currentSquare.destinationSquares) {
			for (let i = 0; i < currentSquare.destinationSquares.length; i++) {
				const newSquare = currentSquare.destinationSquares[i];
				newScore = currentSquare.steps + 1;

				if (newScore < newSquare.targetDistance) {
					newSquare.targetDistance = newScore;
					newSquare.steps = currentSquare.targetDistance + 1;
					this.queue[this.queueTop++] = newSquare;

					//room.layerDebug.drawLine(currentSquare.x * 22 + 11, currentSquare.y * 22 + 11, newSquare.x * 22 + 11, newSquare.y * 22 + 11)
				}
			}
		}

		//debug(Game.room.layerDebug.bitmapData, BitextFont.defaultFont);
		/*
		 TD ST
		 0  0
		 1
		*/
	}

	public resetDeep() {
		for (let i: number = 0; i < S.RoomWidth; i++) {
			for (let j: number = 0; j < S.RoomHeight; j++) {
				this.tiles[i + j * S.RoomWidth] = new PathmapTile(i, j);
				this.setSquareObstacle(i, j);
			}
		}

		for (let i = 0; i < S.RoomWidth; i++) {
			for (let j = 0; j < S.RoomHeight; j++) {
				this.setSquarePaths(i, j);
			}
		}

		this.reset();
	}

	public reset() {
		let i: number = 0;
		const k: number = S.RoomTotalTiles;
		for (; i < k; i++) {
			this.tiles[i].targetDistance = this.tiles[i].steps = Number.MAX_VALUE;
		}

		this.queueBottom = 0;
		this.queueTop = 0;

		if (this.targetX < 0 || this.targetY < 0 || this.targetX >= S.RoomWidth || this.targetY >= S.RoomHeight) {
			return;
		}

		const firstSquare = this.tiles[this.targetX + this.targetY * S.RoomWidth];
		firstSquare.steps = firstSquare.targetDistance = 0;
		this.queue[this.queueTop++] = firstSquare;

	}

	// @todo BITMAPS
	// public  debug(layer:BitmapData){
	// 	for(var i:number = 0; i < S.LEVEL_WIDTH; i++){
	// 		for (var j:number = 0; j < S.LEVEL_HEIGHT; j++){
	// 			var pos :number = i + j * S.LEVEL_WIDTH;
	//
	// 			@todo Somehow handle this
	// font.drawSimpleLine(layer, (tiles[pos].targetDistance < 999 ? tiles[pos].targetDistance : ""),
	// 	i * S.LEVEL_TILE_WIDTH, j * S.LEVEL_TILE_HEIGHT);
	// }
	// }
	// }

	public deepResetTile(x: number, y: number) {
		this.setSquareObstacle(x, y);
		this.setSquareNeighboursPaths(x, y);

		this.reset();
	}

	private setSquareObstacle(x: number, y: number) {
		const index: number = x + y * S.RoomWidth;

		const square: PathmapTile = this.tiles[index];

		const tileO: number = this.room.tilesOpaque[index];
		switch (this.movementType) {
			case(C.MOVEMENT_GROUND):
				if (!(F.isFloor(tileO) || F.isOpenDoor(tileO) || F.isPlatform(tileO))) {
					square.isObstacle = true;
					return;
				}
				break;

			case(C.MOVEMENT_AIR):
				if (!(F.isFloor(tileO) || F.isOpenDoor(tileO) || F.isPlatform(tileO) || tileO == C.T_PIT)) {
					switch (tileO) {
						default:
							square.isObstacle = true;
							return;
					}
				}
				break;
		}

		const tileA = this.room.tilesActive[index];
		if (tileA && tileA.isPiece()) {
			square.isObstacle = true;
			return;
		}

		if (!this.supportPartialObstacles) {
			const tileT: number = this.room.tilesTransparent[index];
			if (!(tileT == C.T_EMPTY || tileT == C.T_FUSE || tileT == C.T_TOKEN) ||
				F.isArrow(this.room.tilesFloor[x + y * S.RoomWidth])) {
				square.isObstacle = true;
				return;
			}
		}

		square.isObstacle = false;
	}

	private setSquarePaths(x: number, y: number) {
		if (x < 0 || y < 0 || x >= S.RoomWidth || y >= S.RoomHeight) {
			return;
		}

		const thisSquare: PathmapTile = this.tiles[x + y * S.RoomWidth];
		let otherSquare: PathmapTile | undefined;

		thisSquare.destinationSquares.length = 0;

		for (let i: number = 0; i < 8; i++) {
			otherSquare = this.getSquareIfNotObstacle(x + Pathmap.dxDir[i], y + Pathmap.dyDir[i]);

			if (otherSquare) {
				thisSquare.destinationSquares.push(otherSquare);
			}
		}
	}

	private setSquareNeighboursPaths(x: number, y: number) {
		for (let i: number = 0; i < 8; i++) {
			this.setSquarePaths(x + Pathmap.dxDir[i], y + Pathmap.dyDir[i]);
		}
	}

	private getSquareIfNotObstacle(x: number, y: number): PathmapTile | undefined {
		if (x >= S.RoomWidth || y >= S.RoomHeight || x < 0 || y < 0) {
			return undefined;
		}

		const square: PathmapTile = this.tiles[x + y * S.RoomWidth];
		return (square.isObstacle ? undefined : square);
	}
}
