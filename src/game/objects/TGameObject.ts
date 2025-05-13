import {RecamelObject} from "../../../src.framework/net/retrocade/camel/objects/RecamelObject";
import {Room} from "../global/Room";
import {Gfx} from "../global/Gfx";
import {S} from "../../S";

export class TGameObject extends RecamelObject {
	static offset: number = 0;

	public x: number;
	public y: number;
	public o: number;

	public prevX: number;
	public prevY: number;
	public prevO: number;

	public gfx: number;

	public room: Room;

	constructor() {
		super();

		this.x = 0;
		this.y = 0;
		this.o = 0;
		this.prevX = 0;
		this.prevY = 0;
		this.prevO = 0;
		this.gfx = 0;
		this.room = undefined!;
	}

	public update() {
		this.room.layerActive.blitTileRectPrecise(
			Gfx.GENERAL_TILES,
			this.gfx,
			this.x * S.RoomTileWidth + (this.prevX - this.x) * TGameObject.offset * S.RoomTileWidth,
			this.y * S.RoomTileHeight + (this.prevY - this.y) * TGameObject.offset * S.RoomTileHeight,
		);
	}
}
