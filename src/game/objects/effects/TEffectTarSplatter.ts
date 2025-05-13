import {TEffectParticles} from "./TEffectParticles";
import {Gfx} from "../../global/Gfx";
import {F} from "../../../F";
import {VOCoord} from "../../managers/VOCoord";
import {TStateGame} from "../../states/TStateGame";
import {CanvasImageSourceFragment} from "../../../C";


const _frames:CanvasImageSourceFragment[] = [];

export class TEffectTarSplatter extends TEffectParticles {
	public static initialize() {
		_frames.push(
			F.newFragment(Gfx.EFFECTS, 132, 44, 6, 6),
			F.newFragment(Gfx.EFFECTS, 154, 44, 8, 8)
		);
	}

	public constructor(origin: VOCoord, duration: number, speed: number) {
		super(origin, 8, 8, 2, 25, duration, speed);

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
