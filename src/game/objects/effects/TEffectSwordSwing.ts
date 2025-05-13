import {F} from "../../../F";
import {Gfx} from "../../global/Gfx";
import {TEffect} from "./TEffect";
import {S} from "../../../S";
import {C, CanvasImageSourceFragment} from "../../../C";
import {TStateGame} from "../../states/TStateGame";

const frames:(CanvasImageSourceFragment|null)[] = [];

const EFFECT_DURATION = 20;

export class TEffectSwordSwing extends TEffect {
	public static initialize() {
		frames.push(
			F.newFragment(Gfx.EFFECTS, 0, 0, 22, 22),
			F.newFragment(Gfx.EFFECTS, 22, 0, 22, 22),
			F.newFragment(Gfx.EFFECTS, 44, 0, 22, 22),
			F.newFragment(Gfx.EFFECTS, 66, 0, 22, 22),
			null,
			F.newFragment(Gfx.EFFECTS, 88, 0, 22, 22),
			F.newFragment(Gfx.EFFECTS, 110, 0, 22, 22),
			F.newFragment(Gfx.EFFECTS, 132, 0, 22, 22),
			F.newFragment(Gfx.EFFECTS, 154, 0, 22, 22),
		);
	}

	private x: number;
	private y: number;
	private o: number;
	private alpha: number = EFFECT_DURATION;

	public constructor(x: number, y: number, o: number) {
		super();

		this.x = x * S.RoomTileWidth;
		this.y = y * S.RoomTileHeight;
		this.o = o;

		switch (o) {
			case(C.NW):
				this.x -= S.RoomTileWidth / 2;
				this.y -= S.RoomTileHeight;
				break;
			case(C.N):
				this.x += S.RoomTileWidth / 2;
				this.y -= S.RoomTileHeight;
				break;
			case(C.NE):
				this.x += S.RoomTileWidth;
				this.y -= S.RoomTileHeight / 2;
				break;
			case(C.E):
				this.x += S.RoomTileWidth;
				this.y += S.RoomTileHeight / 2;
				break;
			case(C.SE):
				this.x += S.RoomTileWidth / 2;
				this.y += S.RoomTileHeight;
				break;
			case(C.S):
				this.x -= S.RoomTileWidth / 2;
				this.y += S.RoomTileHeight;
				break;
			case(C.SW):
				this.x -= S.RoomTileWidth;
				this.y += S.RoomTileHeight / 2;
				break;
			case(C.W):
				this.x -= S.RoomTileWidth;
				this.y -= S.RoomTileHeight / 2;
				break;
		}

		TStateGame.effectsAbove.add(this);
	}

	public update() {
		if (--this.alpha == 0) {
			TStateGame.effectsAbove.nullify(this);
			return;
		}

		this.room.layerActive.drawDirectFragment(frames[this.o]!, this.x, this.y, this.alpha / EFFECT_DURATION);
	}
}
