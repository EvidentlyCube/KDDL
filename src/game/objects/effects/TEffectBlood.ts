import {TEffectParticles} from "./TEffectParticles";
import {Gfx} from "../../global/Gfx";
import {CanvasImageSourceFragment} from "../../../C";
import {VOCoord} from "../../managers/VOCoord";
import {TStateGame} from "../../states/TStateGame";
import {F} from "../../../F";

const _frames:CanvasImageSourceFragment[] = [];

export class TEffectBlood extends TEffectParticles {
	public static initialize() {
		_frames.push(
			F.newFragment(Gfx.EFFECTS, 0, 44, 4, 4),
			F.newFragment(Gfx.EFFECTS, 22, 44, 6, 6),
		);
	}
	public constructor(origin: VOCoord, particles: number, duration: number, speed: number) {
		super(origin, 6, 6, 2, particles, duration, speed);

		TStateGame.effectsAbove.add(this);
	}

	public update() {
		if (!this.moveParticles()) {
			TStateGame.effectsAbove.nullify(this);
			return;
		}

		for (const p of this.particles) {
			if (p.active) {
				this.room.layerActive.blitFragmentDirectly(_frames[p.type], p.x, p.y);
			}
		}
	}
}
