import {TEffect} from "./TEffect";
import {Gfx} from "../../global/Gfx";
import {F} from "../../../F";
import {VOCoord} from "../../managers/VOCoord";
import {S} from "../../../S";
import {VOVermin, VOVerminType} from "../../managers/effects/VOVermin";
import {TStateGame} from "../../states/TStateGame";
import {C, CanvasImageSourceFragment} from "../../../C";
import {ASSERT} from "../../../ASSERT";
import {UtilsRandom} from "../../../../src.framework/net/retrocade/utils/UtilsRandom";

const MARKOV = [
	[
		[55, 25, 5, 10, 5],
		[15, 55, 5, 15, 10],
		[0, 30, 40, 30, 0],
		[10, 15, 5, 55, 15],
		[5, 10, 5, 25, 55],
	],
	[
		[30, 40, 5, 15, 10],
		[15, 45, 5, 25, 10],
		[0, 30, 40, 30, 0],
		[10, 25, 5, 45, 15],
		[10, 15, 5, 40, 30],
	],
];
const _frames:CanvasImageSourceFragment[] = [];

export class TEffectVermin extends TEffect {
	public static initialize() {
		_frames.push(
			F.newFragment(Gfx.EFFECTS, 88, 44, 3, 3),
			F.newFragment(Gfx.EFFECTS, 110, 44, 2, 2),
		);
	}
	private isSlayer: boolean;
	private vermins: VOVermin[];

	public constructor(origin: VOCoord, particles: number = 5, isFromSlayer: boolean = false) {
		super();

		this.isSlayer = isFromSlayer;

		this.vermins = [];

		const x: number = origin.x * S.RoomTileWidth + S.RoomTileWidthHalf;
		const y: number = origin.y * S.RoomTileHeight + S.RoomTileHeightHalf;

		while (particles--) {
			const vermin = new VOVermin();

			vermin.x = x;
			vermin.y = y;
			vermin.angle = UtilsRandom.fraction() * Math.PI * 2;
			vermin.acceleration = UtilsRandom.fraction() * VOVerminType.ACC_COUNT | 0;
			vermin.type = UtilsRandom.fraction() * 2 | 0;
			vermin.size = vermin.type == 0 ? 3 : 2;
			vermin.timeLeft = Date.now() + 2000 + UtilsRandom.uint(0, 3000);

			this.vermins.push(vermin);
		}

		TStateGame.effectsUnder.add(this);
	}

	public update() {
		let anyAlive: boolean = false;

		for (let v of this.vermins) {
			if (!v.active) {
				continue;
			}

			v.x += Math.cos(v.angle);
			v.y += Math.sin(v.angle);

			if (this.hitsObstacle(v) || v.timeLeft < Date.now()) {
				v.active = false;
				continue;
			}

			this.updateDirection(v);

			this.room.layerActive.blitFragmentDirectly(_frames[v.type], v.x, v.y);

			anyAlive = true;
		}

		if (!anyAlive) {
			TStateGame.effectsUnder.nullify(this);
		}
	}

	private hitsObstacle(v: VOVermin): boolean {
		const index: number = (v.x / S.RoomTileWidth | 0) + (v.y / S.RoomTileHeight | 0) * S.RoomWidth;

		switch (this.room.tilesOpaque[index]) {
			case C.T_FLOOR:
			case C.T_FLOOR_MOSAIC:
			case C.T_FLOOR_ROAD:
			case C.T_FLOOR_GRASS:
			case C.T_FLOOR_DIRT:
			case C.T_FLOOR_ALT:
			case C.T_FLOOR_IMAGE:
			case C.T_DOOR_YO:
			case C.T_DOOR_GO:
			case C.T_DOOR_CO:
			case C.T_DOOR_RO:
			case C.T_DOOR_BO:
			case C.T_TRAPDOOR:
			case C.T_TRAPDOOR_WATER:
			case C.T_BRIDGE:
			case C.T_BRIDGE_H:
			case C.T_BRIDGE_V:
			case C.T_GOO:
			case C.T_PRESSPLATE:
			case C.T_PLATFORM_P:
			case C.T_PLATFORM_W:
				break;  //vermin can move on these things

			case C.T_HOT: //slayer particles may move on hot tiles and closed doors
			case C.T_DOOR_Y:
			case C.T_DOOR_G:
			case C.T_DOOR_C:
			case C.T_DOOR_R:
			case C.T_DOOR_B:
				if (!this.isSlayer) {
					return true;
				}
				break;
			default:
				return true;
		}

		switch (this.room.tilesTransparent[index]) {
			case C.T_OBSTACLE:
			case C.T_TAR:
			case C.T_MUD:
			case C.T_GEL:
				return true;

			default:
				return false;
		}
	}

	private updateDirection(v: VOVermin) {
		switch (v.acceleration) {
			case VOVerminType.ACC_HARD_LEFT:
				v.angle -= 0.2;
				break;
			case VOVerminType.ACC_LEFT:
				v.angle -= 0.1;
				break;
			case VOVerminType.ACC_RIGHT:
				v.angle += 0.1;
				break;
			case VOVerminType.ACC_HARD_RIGHT:
				v.angle += 0.2;
				break;
		}

		const rand: number = UtilsRandom.fraction() * 100 | 0;
		let probSum: number = MARKOV[0][v.acceleration][0];
		let probIndex: number = 0;

		while (probSum < rand) {
			probSum += MARKOV[0][v.acceleration][++probIndex];
		}

		ASSERT(probIndex < VOVerminType.ACC_COUNT);

		v.acceleration = probIndex;
	}
}
