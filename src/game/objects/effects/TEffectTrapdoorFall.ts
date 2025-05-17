import {TEffect} from "./TEffect";
import {S} from "../../../S";
import {TStateGame} from "../../states/TStateGame";
import {C} from "../../../C";

const DURATION = S.RoomTileHeight;

export class TEffectTrapdoorFall extends TEffect {

	private x: number;
	private y: number;

	private tileX: number;
	private tileY: number;

	private fall: number = 0;

	public constructor(x: number, y: number) {
		super();

		this.tileX = x;
		this.tileY = y;

		this.x = x * S.RoomTileWidth;
		this.y = y * S.RoomTileHeight;

		TStateGame.effectsUnder.add(this);
	}

	public update() {
		if (this.fall++ == DURATION) {
			TStateGame.effectsUnder.nullify(this);
			return;
		}

		this.y += 1.5;
		this.tileY = (this.y / S.RoomTileHeight | 0);

		if (this.room.tilesOpaque[this.tileX + this.tileY * S.RoomWidth] != C.T_PIT) {
			TStateGame.effectsUnder.nullify(this);
			return;
		}

		this.tileY++;

		this.draw(this.room.tilesOpaque[this.tileX + this.tileY * S.RoomWidth] != C.T_PIT);

	}

	private draw(cutAway: boolean = false) {
		if (cutAway) {
			const height: number = (this.y / S.RoomTileHeight + 1 | 0) * S.RoomTileHeight - this.y;

			this.room.layerActive.drawComplexDirect(this.room.roomTileRenderer.tilesBitmapData,
				this.x, this.y, (DURATION - this.fall) / DURATION, 176, 242, S.RoomTileWidth, height);

		} else {
			this.room.layerActive.drawComplexDirect(this.room.roomTileRenderer.tilesBitmapData,
				this.x, this.y, (DURATION - this.fall) / DURATION, 176, 242, S.RoomTileWidth, S.RoomTileHeight);
		}
	}
}
