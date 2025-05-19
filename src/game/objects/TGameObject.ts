import {RecamelObject} from "../../../src.framework/net/retrocade/camel/objects/RecamelObject";
import {Room} from "../global/Room";

export class TGameObject extends RecamelObject {
	static offset: number = 0;

	public x: number;
	public y: number;
	public o: number;

	public prevX: number;
	public prevY: number;
	public prevO: number;

	public tileId: number;

	public room: Room;

	constructor() {
		super();

		this.x = 0;
		this.y = 0;
		this.o = 0;
		this.prevX = 0;
		this.prevY = 0;
		this.prevO = 0;
		this.tileId = 0;
		this.room = undefined!;
	}

	public update() {
		this.room.roomSpritesRenderer.renderObject(this, this.tileId, this.prevX, this.prevY, this.x, this.y);
	}
}
