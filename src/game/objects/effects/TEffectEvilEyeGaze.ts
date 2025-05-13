import {F} from "../../../F";
import {Gfx} from "../../global/Gfx";
import {TEffect} from "./TEffect";
import {VOCoord} from "../../managers/VOCoord";
import {C, CanvasImageSourceFragment} from "../../../C";
import {TStateGame} from "../../states/TStateGame";
import {S} from "../../../S";

const _frames: CanvasImageSourceFragment[] = [];
const DURATION = 30;

export class TEffectEvilEyeGaze extends TEffect {
	public static initialize() {
		_frames.push(
			F.newFragment(Gfx.EFFECTS, 44, 22, 22, 22),
			F.newFragment(Gfx.EFFECTS, 66, 22, 22, 22),
			F.newFragment(Gfx.EFFECTS, 88, 22, 22, 22),
			F.newFragment(Gfx.EFFECTS, 110, 22, 22, 22),
		);
	}

	private gazes: number[];
	private type: number = 0;

	private duration: number = 0;

	public constructor(origin: VOCoord) {
		super();
		this.gazes = [];

		switch (origin.o) {
			case(C.E):
			case(C.W):
				this.type = 0;
				break;
			case(C.NW):
			case(C.SE):
				this.type = 1;
				break;
			case(C.N):
			case(C.S):
				this.type = 2;
				break;
			case(C.NE):
			case(C.SW):
				this.type = 3;
				break;
		}

		this.populateGazes(origin);

		TStateGame.effectsAbove.add(this);
	}

	public update() {
		if (this.duration++ == DURATION) {
			TStateGame.effectsAbove.nullify(this);
			return;
		}

		for (const i of this.gazes) {
			this.room.layerActive.drawFragment(
				_frames[this.type],
				i % S.RoomWidth,
				i / S.RoomWidth | 0,
				(DURATION - this.duration) / DURATION,
			);
		}
	}

	private populateGazes(origin: VOCoord) {
		let ox: number = F.getOX(origin.o);
		let oy: number = F.getOY(origin.o);
		let tx: number = origin.x;
		let ty: number = origin.y;

		let index: number;

		let reflected: boolean = false;

		// @todo Extract to not be function created on each run
		const getNextGaze = (): boolean => {
			tx += ox;
			ty += oy;

			if (!F.isValidColRow(tx, ty)) {
				return false;
			}

			const arrayIndex: number = tx + ty * S.RoomWidth;

			switch (this.room.tilesOpaque[arrayIndex]) {
				case C.T_BRIDGE:
				case C.T_BRIDGE_H:
				case C.T_BRIDGE_V:
				case C.T_FLOOR:
				case C.T_FLOOR_MOSAIC:
				case C.T_FLOOR_ROAD:
				case C.T_FLOOR_GRASS:
				case C.T_FLOOR_DIRT:
				case C.T_FLOOR_ALT:
				case C.T_FLOOR_IMAGE:
				case C.T_TUNNEL_E:
				case C.T_TUNNEL_W:
				case C.T_TUNNEL_N:
				case C.T_TUNNEL_S:
				case C.T_PIT:
				case C.T_PIT_IMAGE:
				case C.T_WATER:
				case C.T_HOT:
				case C.T_GOO:
				case C.T_DOOR_YO:
				case C.T_DOOR_GO:
				case C.T_DOOR_CO:
				case C.T_DOOR_RO:
				case C.T_DOOR_BO:
				case C.T_PLATFORM_P:
				case C.T_PLATFORM_W:
				case C.T_TRAPDOOR:
				case C.T_TRAPDOOR_WATER:
				case C.T_PRESSPLATE:
					break;  //these do not block gaze -- examine next layer
				default:
					return false;
			}

			//Nothing on f-layer blocks gaze.

			switch (this.room.tilesTransparent[arrayIndex]) {
				case C.T_ORB:
				case C.T_OBSTACLE:
					return false;  //these block gaze
				case C.T_MIRROR:
					//Look in opposite direction.
					if (reflected) {
						return false;
					} //closed loop
					ox = -ox;
					oy = -oy;

					tx = origin.x;
					ty = origin.y;

					reflected = true; //only reflect one time
					return true;
				default:
					break;
			}

			return true;
		};

		while (getNextGaze()) {
			index = tx + ty * S.RoomWidth;

			this.gazes.push(tx + ty * S.RoomWidth);
		}
	}
}
