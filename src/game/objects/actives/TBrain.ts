import {TMonster} from "./TMonster";
import {C} from "../../../C";
import {Game} from "../../global/Game";
import {F} from "../../../F";
import {T} from "../../../T";

export class TBrain extends TMonster {
        public getType():number{ return C.M_BRAIN; }
        public isAggressive():boolean{ return false; }

        public setGfx(){
            this.gfx = T.BRAIN[this.animationFrame];
        }

        public canSensePlayer():boolean {
            return !Game.isInvisible || F.distanceInTiles(this.x, this.y, Game.player.x, Game.player.y) <= C.DEFAULT_SMELL_RANGE;
        }
    }
