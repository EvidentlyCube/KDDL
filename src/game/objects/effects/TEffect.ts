import {RecamelObject} from "../../../../src.framework/net/retrocade/camel/objects/RecamelObject";
import {Room} from "../../global/Room";
import {CanvasImageSource} from "../../../C";
import {Game} from "../../global/Game";

export class TEffect extends RecamelObject {
	protected gfx: CanvasImageSource = null!;

	protected room: Room;

	public constructor() {
		super();

		this.room = Game.room;
	}

	public end() {

	}
}
