import { Rectangle, Texture } from "pixi.js";
import { Gfx } from "../../global/Gfx";
import { VOCoord } from "../../managers/VOCoord";
import { TEffectParticles } from "./TEffectParticles";

export class TEffectBlood extends TEffectParticles {
	private static _textures: Texture[];
	public static initialize() {
		TEffectBlood._textures = [
			new Texture(Gfx.EffectsTexture.baseTexture, new Rectangle(1, 49, 4, 4)),
			new Texture(Gfx.EffectsTexture.baseTexture, new Rectangle(25, 49, 6, 6)),
		]
	}

	public constructor(origin: VOCoord, particles: number, duration: number, speed: number) {
		super(origin, 6, 6, TEffectBlood._textures, particles, duration, speed);
	}
}
