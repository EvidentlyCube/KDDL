import {TEffect} from "./TEffect";
import {VOParticle} from "../../managers/effects/VOParticle";
import {VOCoord} from "../../managers/VOCoord";
import {S} from "../../../S";
import {C} from "../../../C";
import {UtilsRandom} from "../../../../src.framework/net/retrocade/utils/UtilsRandom";

export class TEffectParticles extends TEffect {
	protected particles: VOParticle[];

	protected origin: VOCoord;
	protected count: number;
	protected minDuration: number;
	protected speed: number;
	protected types: number;

	protected originX: number;
	protected originY: number;

	protected offsetX: number;
	protected offsetY: number;

	protected maxWidth: number;
	protected maxHeight: number;

	protected spreadX: number;
	protected spreadY: number;

	protected continous: boolean;

	protected fromEdge: boolean;

	public constructor(_origin: VOCoord, _maxWidth: number, _maxHeight: number, _types: number, _minParticles: number = 25,
	                   _minDuration: number = 7, _speed: number = 4, _continous: boolean = false, _fromEdge: boolean = false,
	) {
		super();

		this.spreadX = 0;
		this.spreadY = 0;

		this.offsetX = 0;
		this.offsetY = 0;

		this.origin = _origin;
		this.minDuration = _minDuration;
		this.speed = _speed;
		this.fromEdge = _fromEdge;
		this.maxWidth = _maxWidth;
		this.maxHeight = _maxHeight;
		this.continous = _continous;
		this.types = _types;

		this.originX = this.origin.x * S.RoomTileWidth;
		this.originY = this.origin.y * S.RoomTileHeight;

		if (this.fromEdge) {
			switch (this.origin.o) {
				case (C.NW):
				case (C.W):
				case (C.SW):
					this.originX += (S.RoomTileWidth - this.maxWidth);
					break;

				case(C.N):
				case(C.S):
				case(C.NO_ORIENTATION):
					this.originX += (S.RoomTileWidth - this.maxWidth) / 2;
					break;
			}

			switch (this.origin.o) {
				case (C.NW):
				case (C.N):
				case (C.NE):
					this.originY += (S.RoomTileHeight - this.maxHeight);
					break;

				case(C.W):
				case(C.E):
				case(C.NO_ORIENTATION):
					this.originY += (S.RoomTileHeight - this.maxHeight) / 2;
					break;
			}
		} else {
			this.originX += (S.RoomTileWidth - this.maxWidth) / 2;
			this.originY += (S.RoomTileHeight - this.maxHeight) / 2;
		}

		switch (this.origin.o) {
			case(C.NW):
			case(C.W):
			case(C.SW):
				this.offsetX = -this.speed;
				break;
			case(C.NE):
			case(C.E):
			case(C.SE):
				this.offsetX = this.speed;
				break;
			case(C.N):
			case(C.S):
			case(C.NO_ORIENTATION):
				this.offsetX = 0;
				break;
		}

		switch (this.origin.o) {
			case(C.NW):
			case(C.N):
			case(C.NE):
				this.offsetY = -this.speed;
				break;
			case(C.SW):
			case(C.S):
			case(C.SE):
				this.offsetY = this.speed;
				break;
			case(C.W):
			case(C.E):
			case(C.NO_ORIENTATION):
				this.offsetY = 0;
				break;
		}

		switch (this.origin.o) {
			case(C.N):
			case(C.E):
			case(C.S):
			case(C.W):
				this.spreadX = this.speed * 1.414;
				this.spreadY = this.speed * 1.414;
				break;

			case(C.NO_ORIENTATION):
			case(C.NW):
			case(C.NE):
			case(C.SW):
			case(C.SE):
				this.spreadX = this.speed;
				this.spreadY = this.speed;
				break;
		}

		this.count = _minParticles + UtilsRandom.fraction() * _minParticles * 0.5;
		this.particles = [];

		for (let i: number = 0; i < this.count; i++) {
			this.resetParticle(i);
		}
	}

	protected resetParticle(index: number) {
		const particle = new VOParticle();

		particle.x = this.originX;
		particle.y = this.originY;
		particle.mx = this.offsetX + UtilsRandom.fmid(this.spreadX * 0.5);
		particle.my = this.offsetY + UtilsRandom.fmid(this.spreadY * 0.5);
		particle.timeLeft = this.minDuration;
		particle.type = UtilsRandom.fraction() * this.types | 0;
		particle.active = true;

		this.particles[index] = particle;
	}

	/**
	 * Returns false if there are no more active particles
	 */
	protected moveParticles(): boolean {
		let anyActive: boolean = false;

		for (const p of this.particles) {
			if (!p.active) {
				continue;
			}

			p.x += p.mx;
			p.y += p.my;

			if (UtilsRandom.fraction() * 2 | 0) {
				if (!--p.timeLeft) {
					p.active = false;
					continue;
				}
			}

			if (this.hitsObstacle(p)) {
				this.reflectParticle(p);
			}

			anyActive = true;
		}

		return anyActive;
	}

	protected hitsObstacle(particle: VOParticle): boolean {
		const index: number = (particle.x / S.RoomTileWidth | 0) +
			(particle.y / S.RoomTileHeight | 0) * S.RoomWidth;
		const oldIndex: number = ((particle.x - particle.mx) / S.RoomTileWidth | 0) +
			((particle.y - particle.my) / S.RoomTileHeight | 0) * S.RoomWidth;

		if (index == oldIndex) {
			return false;
		}

		switch (this.room.tilesOpaque[index]) {
			case(C.T_BRIDGE):
			case(C.T_BRIDGE_H):
			case(C.T_BRIDGE_V):
			case(C.T_FLOOR):
			case(C.T_FLOOR_ALT):
			case(C.T_FLOOR_DIRT):
			case(C.T_FLOOR_GRASS):
			case(C.T_FLOOR_IMAGE):
			case(C.T_FLOOR_MOSAIC):
			case(C.T_FLOOR_ROAD):
			case(C.T_PLATFORM_P):
			case(C.T_PLATFORM_W):
			case(C.T_PIT):
			case(C.T_PIT_IMAGE):
			case(C.T_WATER):
			case(C.T_GOO):
			case(C.T_DOOR_BO):
			case(C.T_DOOR_CO):
			case(C.T_DOOR_GO):
			case(C.T_DOOR_RO):
			case(C.T_DOOR_YO):
			case(C.T_TRAPDOOR):
			case(C.T_TRAPDOOR_WATER):
			case(C.T_STAIRS):
			case(C.T_STAIRS_UP):
			case(C.T_HOT):
			case(C.T_PRESSPLATE):
				return false;
			default:
				return true;
		}
	}

	protected reflectParticle(particle: VOParticle) {
		particle.x -= particle.mx;
		particle.y -= particle.my;

		if (UtilsRandom.fraction() * 2 | 0) {
			particle.mx = -particle.mx;
			particle.x += particle.mx;
		} else {
			particle.my = -particle.my;
			particle.y += particle.my;
		}
	}
}
