import {TEffect} from "./TEffect";
import {F} from "../../../F";
import {Gfx} from "../../global/Gfx";
import {TStateGame} from "../../states/TStateGame";
import {VOCoord} from "../../managers/VOCoord";
import {CanvasImageSourceFragment} from "../../../C";

const Frames: CanvasImageSourceFragment[] =[];
const DURATION = 120;

export class TEffectCheckpoint extends TEffect {
	public static initialize() {
		Frames.push(F.newFragment(Gfx.EFFECTS, 0, 22, 22, 22));
	}
	private x: number;
	private y: number;

	private duration: number = 0;

	public constructor(position: VOCoord) {
		super();

		this.x = position.x;
		this.y = position.y;

		TStateGame.effectsUnder.add(this);
	}

	public update() {
		if (this.duration++ == DURATION) {
			TStateGame.effectsUnder.nullify(this);
			return;
		}

		this.room.layerActive.drawFragment(Frames[0], this.x, this.y, (DURATION - this.duration) / DURATION);
	}
}
