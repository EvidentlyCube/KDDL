	import {TEffect} from "./TEffect";
import {VOOrb} from "../../managers/VOOrb";
import {S} from "../../../S";
import {VOCoord} from "../../managers/VOCoord";
import {TStateGame} from "../../states/TStateGame";
import {BoltEffect} from "./BoltEffect";
import { Container } from "pixi.js";
import { Game } from "src/game/global/Game";

const DURATION: number = 7;

export class TEffectOrbBolts extends TEffect {

	private _container: Container;
	private endPositions: VOCoord[];

	private orbCenterX: number;
	private orbCenterY: number;

	private duration: number = 0;

	public constructor(_orbData: VOOrb) {
		super();

		this._container = new Container();
		this._container.x = S.LEVEL_OFFSET_X;
		this._container.y = S.LEVEL_OFFSET_Y;
		this.orbCenterX = _orbData.x * S.RoomTileWidth + S.RoomTileWidthHalf;
		this.orbCenterY = _orbData.y * S.RoomTileHeight + S.RoomTileHeightHalf;

		this.endPositions = [];

		for (const i of _orbData.agents) {
			this.endPositions.push(new VOCoord(i.tX * S.RoomTileWidth + S.RoomTileWidthHalf,
				i.tY * S.RoomTileHeight + S.RoomTileHeightHalf,
				0));
		}

		TStateGame.effectsAbove.add(this);
		Game.room.layerSprites.add(this._container);
	}

	public update() {
		if (this.duration++ == DURATION) {
			this.end();
			return;
		}

		this._container.removeChildren();
		for (const coord of this.endPositions) {
			BoltEffect.drawBolt(this.orbCenterX, this.orbCenterY, coord.x, coord.y, this._container);
		}
	}


	public end(): void {
		super.end();

		TStateGame.effectsAbove.nullify(this);
		this._container.parent?.removeChild(this._container);
	}
}
