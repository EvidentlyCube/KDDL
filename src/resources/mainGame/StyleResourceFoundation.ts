/// <reference path='../../index.d.ts'/>

import * as FloorPath from '../../../src.assets/gfx/by_caravelgames/tiles/styleFoundation/floor.png';
import * as FloorAltPath from '../../../src.assets/gfx/by_caravelgames/tiles/styleFoundation/floorAlt.jpg';
import * as FloorDirtPath from '../../../src.assets/gfx/by_caravelgames/tiles/styleFoundation/floorDirt.jpg';
import * as FloorGrassPath from '../../../src.assets/gfx/by_caravelgames/tiles/styleFoundation/floorGrass.jpg';
import * as FloorMosaicPath from '../../../src.assets/gfx/by_caravelgames/tiles/styleFoundation/floorMosaic.jpg';
import * as FloorRoadPath from '../../../src.assets/gfx/by_caravelgames/tiles/styleFoundation/floorRoad.jpg';
import * as PitPath from '../../../src.assets/gfx/by_caravelgames/tiles/styleFoundation/pit.png';
import * as PitsidePath from '../../../src.assets/gfx/by_caravelgames/tiles/styleFoundation/pitside.png';
import * as PitsideSmallPath from '../../../src.assets/gfx/by_caravelgames/tiles/styleFoundation/pitsideSmall.png';
import * as TilesPath from '../../../src.assets/gfx/by_caravelgames/tiles/styleFoundation/tiles.png';
import * as WallPath from '../../../src.assets/gfx/by_caravelgames/tiles/styleFoundation/wall.png';
import { C } from "../../C";
import { ResourcesQueue } from "./ResourcesQueue";

export function StyleResourceFoundation() {
	ResourcesQueue.queueImage(C.RES_FOUNDATION_WALL, document.createElement('img'), WallPath.default);
	ResourcesQueue.queueImage(C.RES_FOUNDATION_FLOOR, document.createElement('img'), FloorPath.default);
	ResourcesQueue.queueImage(C.RES_FOUNDATION_FLOOR_ALT, document.createElement('img'), FloorAltPath.default);
	ResourcesQueue.queueImage(C.RES_FOUNDATION_FLOOR_DIRT, document.createElement('img'), FloorDirtPath.default);
	ResourcesQueue.queueImage(C.RES_FOUNDATION_FLOOR_GRASS, document.createElement('img'), FloorGrassPath.default);
	ResourcesQueue.queueImage(C.RES_FOUNDATION_FLOOR_MOSAIC, document.createElement('img'), FloorMosaicPath.default);
	ResourcesQueue.queueImage(C.RES_FOUNDATION_FLOOR_ROAD, document.createElement('img'), FloorRoadPath.default);
	ResourcesQueue.queueImage(C.RES_FOUNDATION_PIT, document.createElement('img'), PitPath.default);
	ResourcesQueue.queueImage(C.RES_FOUNDATION_PIT_SIDE, document.createElement('img'), PitsidePath.default);
	ResourcesQueue.queueImage(C.RES_FOUNDATION_PIT_SIDE_SMALL, document.createElement('img'), PitsideSmallPath.default);
	ResourcesQueue.queueImage(C.RES_FOUNDATION_TILES, document.createElement('img'), TilesPath.default);
}