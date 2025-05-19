import { Rectangle, Texture } from "pixi.js";
import { Gfx } from "../../global/Gfx";
import { VOCoord } from "../../managers/VOCoord";
import { TEffectParticles } from "./TEffectParticles";



export class TEffectTarSplatter extends TEffectParticles {
	private static _textures: Texture[];
	public static initialize() {
		TEffectTarSplatter._textures = [
			new Texture(Gfx.EffectsTexture.baseTexture, new Rectangle(145, 49, 6, 6)),
			new Texture(Gfx.EffectsTexture.baseTexture, new Rectangle(179, 49, 8, 8)),
		]
	}

	public constructor(origin: VOCoord, duration: number, speed: number) {
		super(origin, 8, 8, TEffectTarSplatter._textures, 25, duration, speed);
	}
}
