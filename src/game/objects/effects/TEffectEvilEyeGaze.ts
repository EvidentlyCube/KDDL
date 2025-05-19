import { Container, Rectangle, Sprite, Texture } from "pixi.js";
import { Game } from "src/game/global/Game";
import { C } from "../../../C";
import { F } from "../../../F";
import { S } from "../../../S";
import { Gfx } from "../../global/Gfx";
import { VOCoord } from "../../managers/VOCoord";
import { TStateGame } from "../../states/TStateGame";
import { TEffect } from "./TEffect";

const DURATION = 30;

export class TEffectEvilEyeGaze extends TEffect {
	private static _textures: Texture[];
	public static initialize() {
		TEffectEvilEyeGaze._textures = [
			new Texture(Gfx.EffectsTexture.baseTexture, new Rectangle(49, 25, 22, 22)),
			new Texture(Gfx.EffectsTexture.baseTexture, new Rectangle(73, 25, 22, 22)),
			new Texture(Gfx.EffectsTexture.baseTexture, new Rectangle(97, 25, 22, 22)),
			new Texture(Gfx.EffectsTexture.baseTexture, new Rectangle(121, 25, 22, 22)),
		];
	}

	private _container: Container;

	private duration: number = 0;

	public constructor(origin: VOCoord) {
		super();

		this._container = new Container();
		this._container.x = S.LEVEL_OFFSET_X;
		this._container.y = S.LEVEL_OFFSET_Y;

		switch (origin.o) {
			case (C.E):
			case (C.W):
				this.populateGazes(origin, 0);
				break;
			case (C.NW):
			case (C.SE):
				this.populateGazes(origin, 1);
				break;
			case (C.N):
			case (C.S):
				this.populateGazes(origin, 2);
				break;
			case (C.NE):
			case (C.SW):
				this.populateGazes(origin, 3);
				break;
		}


		TStateGame.effectsAbove.add(this);
		Game.room.layerSprites.add(this._container);
	}

	public update() {
		this._container.alpha = (DURATION - this.duration) / DURATION;

		if (this.duration++ >= DURATION) {
			this.end();
		}
	}

	public end() {
		super.end();

		TStateGame.effectsAbove.remove(this);
		this._container.parent?.removeChild(this._container);
	}

	private populateGazes(origin: VOCoord, type: number) {
		let ox: number = F.getOX(origin.o);
		let oy: number = F.getOY(origin.o);
		let tx: number = origin.x;
		let ty: number = origin.y;

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
			const sprite = new Sprite(TEffectEvilEyeGaze._textures[type]);
			sprite.x = tx * S.RoomTileWidth;
			sprite.y = ty * S.RoomTileHeight;
			this._container.addChild(sprite);
		}
	}
}
