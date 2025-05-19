import { Rectangle, Texture } from "pixi.js";
import { Gfx } from "../../global/Gfx";
import { VOCoord } from "../../managers/VOCoord";
import { TEffectParticles } from "./TEffectParticles";

export class TEffectDebris extends TEffectParticles {
	private static _textures: Texture[];
	public static initialize() {
		TEffectDebris._textures = [
			new Texture(Gfx.EffectsTexture.baseTexture, new Rectangle(49, 49, 4, 4)),
			new Texture(Gfx.EffectsTexture.baseTexture, new Rectangle(73, 49, 6, 6)),
		]
	}

	public constructor(origin: VOCoord, particles: number, duration: number, speed: number) {
		super(origin, 6, 6, TEffectDebris._textures, particles, duration, speed);
	}
}
