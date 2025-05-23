import { Container, Sprite, Texture } from "pixi.js";
import { exposeValue, S } from "src/S";
import { C } from "../../C";
import { Game } from "../global/Game";
import { Room } from "../global/Room";

const COLORS = [0, 0xFF8800, 0x00FFFF, 0xFF0040];

export class TWidgetOrbHighlight {
	public static container: Container;

	public static init() {
		TWidgetOrbHighlight.container = new Container();
		TWidgetOrbHighlight.container.x = S.LEVEL_OFFSET_X;
		TWidgetOrbHighlight.container.y = S.LEVEL_OFFSET_Y;
		TWidgetOrbHighlight.container.alpha = 0.5;

		exposeValue('TWidgetOrbHighlight', TWidgetOrbHighlight);
	}

	private static room: Room;

	public static clear() {
		TWidgetOrbHighlight.container.removeChildren();
	}

	public static drawOrbHighlights(orbX: number, orbY: number) {
		TWidgetOrbHighlight.room = Game.room;
		TWidgetOrbHighlight.container.removeChildren();

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
		TWidgetOrbHighlight.container.removeChildren();

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

	private static drawArray(array: number[], color: number) {
		for (const pos of array) {
			this.drawOne(pos, color);
		}
	}

	private static drawOne(pos: number, color: number) {
		const x = pos % S.RoomWidth;
		const y = (pos / S.RoomWidth) | 0;

		const sprite = new Sprite(Texture.WHITE);
		sprite.x = x * S.RoomTileWidth;
		sprite.y = y * S.RoomTileHeight;
		sprite.width = S.RoomTileWidth;
		sprite.height = S.RoomTileHeight;
		sprite.tint = color;

		TWidgetOrbHighlight.container.addChild(sprite);
	}
}

