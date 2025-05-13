import {F} from "../../../F";
import {Gfx} from "../../global/Gfx";
import {TEffect} from "./TEffect";
import {VOOrb} from "../../managers/VOOrb";
import {TEffectOrbBolts} from "./TEffectOrbBolts";
import {TStateGame} from "../../states/TStateGame";
import {CanvasImageSourceFragment} from "../../../C";

const Frames:CanvasImageSourceFragment[] = [];

const DURATION: number = 7;


export class TEffectOrbHit extends TEffect {
	public static initialize() {
		Frames.push(F.newFragment(Gfx.EFFECTS, 22, 22, 22, 22));
	}

	private x: number;
	private y: number;

	private duration: number = 0;

	public constructor(_orbData: { x: number, y: number }, _drawOrb: boolean) {
		super();

		this.x = _orbData.x;
		this.y = _orbData.y;

		if (_orbData instanceof VOOrb && _orbData.agents.length) {
			new TEffectOrbBolts(_orbData);
		}

		if (_drawOrb) {
			TStateGame.effectsUnder.add(this);
		}
	}

	public update() {
		if (this.duration++ == DURATION) {
			TStateGame.effectsUnder.nullify(this);
			return;
		}

		this.room.layerActive.blitFragment(Frames[0], this.x, this.y);
	}
}
