	import {TEffect} from "./TEffect";
import {VOOrb} from "../../managers/VOOrb";
import {S} from "../../../S";
import {VOCoord} from "../../managers/VOCoord";
import {TStateGame} from "../../states/TStateGame";
import {BoltEffect} from "./BoltEffect";

const DURATION: number = 7;

export class TEffectOrbBolts extends TEffect {

	private endPositions: VOCoord[];

	private orbCenterX: number;
	private orbCenterY: number;

	private duration: number = 0;

	public constructor(_orbData: VOOrb) {
		super();

		this.orbCenterX = _orbData.x * S.RoomTileWidth + S.RoomTileWidthHalf;
		this.orbCenterY = _orbData.y * S.RoomTileHeight + S.RoomTileHeightHalf;

		this.endPositions = [];

		for (const i of _orbData.agents) {
			this.endPositions.push(new VOCoord(i.tX * S.RoomTileWidth + S.RoomTileWidthHalf,
				i.tY * S.RoomTileHeight + S.RoomTileHeightHalf,
				0));
		}

		TStateGame.effectsAbove.add(this);
	}

	public update() {
		if (this.duration++ == DURATION) {
			TStateGame.effectsAbove.nullify(this);
			return;
		}

		for (const coord of this.endPositions) {
			BoltEffect.drawBolt(this.orbCenterX, this.orbCenterY, coord.x, coord.y, this.room.layerActive.bitmapData);
		}
	}
}
