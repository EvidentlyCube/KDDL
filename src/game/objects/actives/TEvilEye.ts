import {TMonster} from "./TMonster";
import {C} from "../../../C";
import {Game} from "../../global/Game";
import {F} from "../../../F";
import {CueEvents} from "../../global/CueEvents";
import {VOCoord} from "../../managers/VOCoord";
import {S} from "../../../S";
import {T} from "../../../T";

export class TEvilEye extends TMonster {
	public getType(): number {
		return C.M_EYE;
	}

	public isAggressive(): boolean {
		return this.isAwake;
	}

	public isAwake: boolean = false;

	public process(lastCommand: number) {
		if (!(this.isAwake || this.wakeupCheck())) {
			return;
		}

		if (Game.doesBrainSensePlayer && this.getBrainMovement(this.room.pathmapGround)) {

		} else if (!Game.isInvisible || F.distanceInTiles(this.x, this.y, Game.player.x, Game.player.y) <= C.DEFAULT_SMELL_RANGE || Game.doesBrainSensePlayer) {
			this.getBeelineMovement(Game.player.x, Game.player.y);

		} else {
			return;
		}

		this.makeStandardMove();
		this.setOrientation(this.dxFirst, this.dyFirst);
	}

	/** Returns true if the eye wakes up during call **/
	public wakeupCheck(): boolean {
		const playerX: number = Game.player.x;
		const playerY: number = Game.player.y;

		if ((Game.isInvisible && F.distanceInTiles(this.x, this.y, playerX, playerY) > 5) ||
			!((this.o == C.N && playerY < this.y && playerX == this.x) ||
				(this.o == C.E && playerY == this.y && playerX > this.x) ||
				(this.o == C.W && playerY == this.y && playerX < this.x) ||
				(this.o == C.S && playerY > this.y && playerX == this.x) ||
				(this.o == C.NE && playerX - this.x + playerY - this.y == 0) ||
				(this.o == C.SE && playerX - this.x + playerY - this.y > 0) ||
				(this.o == C.NW && playerX - this.x + playerY - this.y < 0) ||
				(this.o == C.SW && playerX - this.x + playerY - this.y == 0))) {
			return false;
		}
		let ox: number = F.getOX(this.o);
		let oy: number = F.getOY(this.o);
		let tx: number = this.x;
		let ty: number = this.y;

		let reflected: boolean = false;

		let isPlayer: boolean = false;
		let isTarget: boolean = false;

		let continueGaze: boolean = false;

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

					tx = this.x;
					ty = this.y;

					reflected = true; //only reflect one time
					return true;
				default:
					break;
			}

			return true;
		};

		do {
			continueGaze = getNextGaze();
			isPlayer = tx == playerX && ty == playerY;
			if (isPlayer) {
				isTarget = true;
			}

			if (isTarget) {
				this.isAwake = true;
				CueEvents.add(C.CID_EVIL_EYE_WOKE, new VOCoord(this.x, this.y, this.o));
				return true;
			}

		} while (continueGaze);

		return false;


	}

	public setGfx() {
		this.tileId = T.EEYE[this.isAwake ? 2 : this.animationFrame][this.o];
	}
}

