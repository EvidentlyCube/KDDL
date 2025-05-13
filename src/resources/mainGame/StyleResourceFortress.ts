/// <reference path='../../index.d.ts'/>

import * as WallPath from '../../../src.assets/gfx/by_caravelgames/tiles/styleFortress/wall.png';
import * as FloorPath from '../../../src.assets/gfx/by_caravelgames/tiles/styleFortress/floor.png';
import * as FloorAltPath from '../../../src.assets/gfx/by_caravelgames/tiles/styleFortress/floorAlt.png';
import * as FloorDirtPath from '../../../src.assets/gfx/by_caravelgames/tiles/styleFortress/floorDirt.png';
import * as FloorGrassPath from '../../../src.assets/gfx/by_caravelgames/tiles/styleFortress/floorGrass.png';
import * as FloorMosaicPath from '../../../src.assets/gfx/by_caravelgames/tiles/styleFortress/floorMosaic.png';
import * as FloorRoadPath from '../../../src.assets/gfx/by_caravelgames/tiles/styleFortress/floorRoad.png';
import * as PitPath from '../../../src.assets/gfx/by_caravelgames/tiles/styleFortress/pit.png';
import * as PitsidePath from '../../../src.assets/gfx/by_caravelgames/tiles/styleFortress/pitside.png';
import * as PitsideSmallPath from '../../../src.assets/gfx/by_caravelgames/tiles/styleFortress/pitsideSmall.png';
import * as TilesPath from '../../../src.assets/gfx/by_caravelgames/tiles/styleFortress/tiles.png';
import {ResourcesQueue} from "./ResourcesQueue";
import {C} from "../../C";
import {PlatformOptions} from "../../platform/PlatformOptions";

export function StyleResourceFortress() {
	ResourcesQueue.queueImage(C.RES_FORTRESS_WALL, document.createElement('img'), WallPath.default);
	ResourcesQueue.queueImage(C.RES_FORTRESS_FLOOR, document.createElement('img'), FloorPath.default);
	ResourcesQueue.queueImage(C.RES_FORTRESS_FLOORALT, document.createElement('img'), FloorAltPath.default);
	ResourcesQueue.queueImage(C.RES_FORTRESS_FLOORDIRT, document.createElement('img'), FloorDirtPath.default);
	ResourcesQueue.queueImage(C.RES_FORTRESS_FLOORGRASS, document.createElement('img'), FloorGrassPath.default);
	ResourcesQueue.queueImage(C.RES_FORTRESS_FLOORMOSAIC, document.createElement('img'), FloorMosaicPath.default);
	ResourcesQueue.queueImage(C.RES_FORTRESS_FLOORROAD, document.createElement('img'), FloorRoadPath.default);
	ResourcesQueue.queueImage(C.RES_FORTRESS_PIT, document.createElement('img'), PitPath.default);
	ResourcesQueue.queueImage(C.RES_FORTRESS_PITSIDE, document.createElement('img'), PitsidePath.default);
	ResourcesQueue.queueImage(C.RES_FORTRESS_PITSIDESMALL, document.createElement('img'), PitsideSmallPath.default);
	ResourcesQueue.queueImage(C.RES_FORTRESS_TILES, document.createElement('img'), TilesPath.default);
}