/// <reference path='../../index.d.ts'/>

import * as WallPath from '../../../src.assets/gfx/by_caravelgames/tiles/styleAboveground/wall.png';
import * as FloorPath from '../../../src.assets/gfx/by_caravelgames/tiles/styleAboveground/floor.png';
import * as FloorAltPath from '../../../src.assets/gfx/by_caravelgames/tiles/styleAboveground/floorAlt.png';
import * as FloorDirtPath from '../../../src.assets/gfx/by_caravelgames/tiles/styleAboveground/floorDirt.png';
import * as FloorGrassPath from '../../../src.assets/gfx/by_caravelgames/tiles/styleAboveground/floorGrass.png';
import * as FloorMosaicPath from '../../../src.assets/gfx/by_caravelgames/tiles/styleAboveground/floorMosaic.png';
import * as FloorRoadPath from '../../../src.assets/gfx/by_caravelgames/tiles/styleAboveground/floorRoad.png';
import * as PitPath from '../../../src.assets/gfx/by_caravelgames/tiles/styleAboveground/pit.png';
import * as PitsidePath from '../../../src.assets/gfx/by_caravelgames/tiles/styleAboveground/pitside.png';
import * as PitsideSmallPath from '../../../src.assets/gfx/by_caravelgames/tiles/styleAboveground/pitsideSmall.png';
import * as TilesPath from '../../../src.assets/gfx/by_caravelgames/tiles/styleAboveground/tiles.built.png';
import {ResourcesQueue} from "./ResourcesQueue";
import {C} from "../../C";

export function StyleResourceAboveground() {
	ResourcesQueue.queueImage(C.RES_ABOVEGROUND_WALL, document.createElement('img'), WallPath.default);
	ResourcesQueue.queueImage(C.RES_ABOVEGROUND_FLOOR, document.createElement('img'), FloorPath.default);
	ResourcesQueue.queueImage(C.RES_ABOVEGROUND_FLOOR_ALT, document.createElement('img'), FloorAltPath.default);
	ResourcesQueue.queueImage(C.RES_ABOVEGROUND_FLOOR_DIRT, document.createElement('img'), FloorDirtPath.default);
	ResourcesQueue.queueImage(C.RES_ABOVEGROUND_FLOOR_GRASS, document.createElement('img'), FloorGrassPath.default);
	ResourcesQueue.queueImage(C.RES_ABOVEGROUND_FLOOR_MOSAIC, document.createElement('img'), FloorMosaicPath.default);
	ResourcesQueue.queueImage(C.RES_ABOVEGROUND_FLOOR_ROAD, document.createElement('img'), FloorRoadPath.default);
	ResourcesQueue.queueImage(C.RES_ABOVEGROUND_PIT, document.createElement('img'), PitPath.default);
	ResourcesQueue.queueImage(C.RES_ABOVEGROUND_PIT_SIDE, document.createElement('img'), PitsidePath.default);
	ResourcesQueue.queueImage(C.RES_ABOVEGROUND_PIT_SIDE_SMALL, document.createElement('img'), PitsideSmallPath.default);
	ResourcesQueue.queueImage(C.RES_ABOVEGROUND_TILES, document.createElement('img'), TilesPath.default);
}