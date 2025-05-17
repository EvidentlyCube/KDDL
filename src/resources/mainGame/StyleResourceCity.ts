/// <reference path='../../index.d.ts'/>

import * as WallPath from '../../../src.assets/gfx/by_caravelgames/tiles/styleCity/wall.png';
import * as FloorPath from '../../../src.assets/gfx/by_caravelgames/tiles/styleCity/floor.png';
import * as FloorAltPath from '../../../src.assets/gfx/by_caravelgames/tiles/styleCity/floorAlt.png';
import * as FloorDirtPath from '../../../src.assets/gfx/by_caravelgames/tiles/styleCity/floorDirt.png';
import * as FloorGrassPath from '../../../src.assets/gfx/by_caravelgames/tiles/styleCity/floorGrass.png';
import * as FloorMosaicPath from '../../../src.assets/gfx/by_caravelgames/tiles/styleCity/floorMosaic.png';
import * as FloorRoadPath from '../../../src.assets/gfx/by_caravelgames/tiles/styleCity/floorRoad.png';
import * as PitPath from '../../../src.assets/gfx/by_caravelgames/tiles/styleCity/pit.jpg';
import * as PitsidePath from '../../../src.assets/gfx/by_caravelgames/tiles/styleCity/pitside.png';
import * as PitsideSmallPath from '../../../src.assets/gfx/by_caravelgames/tiles/styleCity/pitsideSmall.png';
import * as TilesPath from '../../../src.assets/gfx/by_caravelgames/tiles/styleCity/tiles.png';
import {ResourcesQueue} from "./ResourcesQueue";
import {C} from "../../C";

export function StyleResourceCity() {
	ResourcesQueue.queueImage(C.RES_CITY_WALL, document.createElement('img'), WallPath.default);
	ResourcesQueue.queueImage(C.RES_CITY_FLOOR, document.createElement('img'), FloorPath.default);
	ResourcesQueue.queueImage(C.RES_CITY_FLOOR_ALT, document.createElement('img'), FloorAltPath.default);
	ResourcesQueue.queueImage(C.RES_CITY_FLOOR_DIRT, document.createElement('img'), FloorDirtPath.default);
	ResourcesQueue.queueImage(C.RES_CITY_FLOOR_GRASS, document.createElement('img'), FloorGrassPath.default);
	ResourcesQueue.queueImage(C.RES_CITY_FLOOR_MOSAIC, document.createElement('img'), FloorMosaicPath.default);
	ResourcesQueue.queueImage(C.RES_CITY_FLOOR_ROAD, document.createElement('img'), FloorRoadPath.default);
	ResourcesQueue.queueImage(C.RES_CITY_PIT, document.createElement('img'), PitPath.default);
	ResourcesQueue.queueImage(C.RES_CITY_PIT_SIDE, document.createElement('img'), PitsidePath.default);
	ResourcesQueue.queueImage(C.RES_CITY_PIT_SIDE_SMALL, document.createElement('img'), PitsideSmallPath.default);
	ResourcesQueue.queueImage(C.RES_CITY_TILES, document.createElement('img'), TilesPath.default);
}