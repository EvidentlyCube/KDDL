import {F} from "../../../F";
import {Gfx} from "../../global/Gfx";
import {TEffectParticles} from "./TEffectParticles";
import {VOCoord} from "../../managers/VOCoord";
import {TStateGame} from "../../states/TStateGame";
import {CanvasImageSourceFragment} from "../../../C";

const Frames:CanvasImageSourceFragment[] = [];

export class TEffectDebris extends TEffectParticles {
	public static initialize() {
		Frames.push(
			F.newFragment(Gfx.EFFECTS, 44, 44, 4, 4),
			F.newFragment(Gfx.EFFECTS, 66, 44, 6, 6),
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
				this.room.layerActive.blitFragmentDirectly(Frames[p.type], p.x, p.y);
			}
		}
	}
}
