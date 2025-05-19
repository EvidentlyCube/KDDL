import { TEffectParticles } from "./TEffectParticles";
import { Gfx } from "../../global/Gfx";
import { F } from "../../../F";
import { VOCoord } from "../../managers/VOCoord";
import { TStateGame } from "../../states/TStateGame";
import { CanvasImageSourceFragment } from "../../../C";
import { Rectangle, Texture } from "pixi.js";



export class TEffectTarSplatter extends TEffectParticles {
	private static _textures: Texture[];
	public static initialize() {
		TEffectTarSplatter._textures = [
			new Texture(Gfx.EffectsTexture.baseTexture, new Rectangle(132, 44, 6, 6)),
			new Texture(Gfx.EffectsTexture.baseTexture, new Rectangle(154, 44, 8, 8)),
		]
	}

	public constructor(origin: VOCoord, duration: number, speed: number) {
		super(origin, 8, 8, TEffectTarSplatter._textures, 25, duration, speed);
	}
}
