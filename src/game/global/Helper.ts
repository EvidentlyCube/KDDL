import {RecamelCore} from "../../../src.framework/net/retrocade/camel/core/RecamelCore";
import {TPlayer} from "../objects/actives/TPlayer";
import {Game} from "./Game";
import {Level} from "./Level";
import {RecamelObject} from "../../../src.framework/net/retrocade/camel/objects/RecamelObject";
import {TWindowControls} from "../windows/TWindowControls";
import {S} from "../../S";
import { HoldId } from "src/C";

export class Helper extends RecamelObject {
	private static _instance: Helper;

	public static init() {
		Helper._instance = new Helper();
		RecamelCore.groupAfter.add(Helper._instance);
	}

	private static _flagShown: boolean = false;

	public static update() {
		const holdOptions = S.currentHoldOptions;

		if (!holdOptions) {
			throw new Error("Hold options are not yet loaded");
		}

		if (holdOptions.id === HoldId.KDDL1) {
			if (levPos(1) && roomPos(0, -1)) {
				if (!Helper._flagShown && player().x >= 8 && player().x <= 13 && player().y >= 15 && player().y <= 20) {
					Helper._flagShown = true;
					TWindowControls.show();
				}
			} else {
				Helper._flagShown = false;
			}
		}
		if (holdOptions.id === HoldId.KDDL2) {
			if (levPos(6) && roomPos(0, 0)) {
				if (!Helper._flagShown && player().x >= 5 && player().x <= 6 && player().y >= 9 && player().y <= 10) {
					Helper._flagShown = true;
					TWindowControls.show();
				}
			} else {
				Helper._flagShown = false;
			}
		}
		if (holdOptions.id === HoldId.KDDL3) {
			if (levPos(6) && roomPos(0, 0)) {
				if (!Helper._flagShown && player().x >= 5 && player().x <= 6 && player().y >= 9 && player().y <= 10) {
					Helper._flagShown = true;
					TWindowControls.show();
				}
			} else {
				Helper._flagShown = false;
			}
		}
	}
}

function levPos(order: number): boolean {
	return getLevID(order) == levelID();
}

function roomPos(x: number, y: number): boolean {
	const position = roomOffset();

	return position.x == x && position.y == y;
}


function player(): TPlayer {
	return Game.player;
}


function levelID(): number {
	return (room() ? room().levelId : 0);
}


function roomOffset() {
	return Level.getRoomOffsetInLevel(roomID());
}


function room() {
	return Game.room;
}


function roomID(): number {
	return room().roomId;
}


function getLevID(order: number): number {
	return Level.getLevelIdByOrderIndex(order);
}
