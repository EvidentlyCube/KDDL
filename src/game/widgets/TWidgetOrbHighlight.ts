import {Room} from "../global/Room";
import {F} from "../../F";
import {Game} from "../global/Game";
import {S} from "src/S";
import {UtilsBitmapData} from "../../../src.framework/net/retrocade/utils/UtilsBitmapData";
import {C} from "../../C";

const COLORS = [0, 0x88FF8800, 0x8800FFFF, 0x88FF0040];

const bitmapData = F.newCanvasContext(S.RoomWidthPixels, S.RoomHeightPixels);

export class TWidgetOrbHighlight {
	private static room: Room;
	public static isActive: boolean = false;

	public static drawOrbHighlights(orbX: number, orbY: number) {
		TWidgetOrbHighlight.room = Game.room;
		TWidgetOrbHighlight.isActive = true;
		bitmapData.clearRect(0, 0, S.RoomWidthPixels, S.RoomHeightPixels);

		const orb = TWidgetOrbHighlight.room.orbs.get(orbX + orbY * S.RoomWidth)!;

		if (!orb) {
			return;
		}

		for (const agent of orb.agents) {
			const doorTiles = TWidgetOrbHighlight.room.getConnectedTiles(agent.tX, agent.tY, [C.T_DOOR_Y, C.T_DOOR_YO]);
			TWidgetOrbHighlight.drawArray(doorTiles, COLORS[agent.type]);
		}
	}

	public static drawDoorHighlights(doorX: number, doorY: number) {
		TWidgetOrbHighlight.room = Game.room;
		TWidgetOrbHighlight.isActive = true;

		bitmapData.clearRect(0, 0, S.RoomWidthPixels, S.RoomHeightPixels);

		const doorTiles = new Set(TWidgetOrbHighlight.room.getConnectedTiles(doorX, doorY, [C.T_DOOR_Y, C.T_DOOR_YO]));

		for (const orb of TWidgetOrbHighlight.room.orbs.values()) {
			for (const agent of orb.agents) {
				const agentIndex = agent.tX + agent.tY * S.RoomWidth;

				if (doorTiles.has(agentIndex)) {
					TWidgetOrbHighlight.drawOne(orb.x + orb.y * S.RoomWidth, COLORS[agent.type]);
					break;
				}
			}
		}
	}

	public static update() {
		if (TWidgetOrbHighlight.isActive) {
			TWidgetOrbHighlight.room.layerActive.draw(bitmapData.canvas, 0, 0, 1);
		}
	}

	private static drawArray(array: number[], color: number) {
		for (const pos of array) {
			this.drawOne(pos, color);
		}
	}

	private static drawOne(pos: number, color: number) {
		const x = pos % S.RoomWidth;
		const y = (pos / S.RoomWidth) | 0;

		UtilsBitmapData.blitRectangle(bitmapData,
			x * S.RoomTileWidth,
			y * S.RoomTileHeight,
			S.RoomTileWidth,
			S.RoomTileHeight,
			color);
	}
}

