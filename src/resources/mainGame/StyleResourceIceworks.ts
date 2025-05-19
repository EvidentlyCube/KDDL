/// <reference path='../../index.d.ts'/>

import * as WallPath from '../../../src.assets/gfx/by_caravelgames/tiles/styleIceworks/wall.jpg';
import * as FloorPath from '../../../src.assets/gfx/by_caravelgames/tiles/styleIceworks/floor.jpg';
import * as FloorAltPath from '../../../src.assets/gfx/by_caravelgames/tiles/styleIceworks/floorAlt.jpg';
import * as FloorDirtPath from '../../../src.assets/gfx/by_caravelgames/tiles/styleIceworks/floorDirt.jpg';
import * as FloorGrassPath from '../../../src.assets/gfx/by_caravelgames/tiles/styleIceworks/floorGrass.jpg';
import * as FloorMosaicPath from '../../../src.assets/gfx/by_caravelgames/tiles/styleIceworks/floorMosaic.jpg';
import * as FloorRoadPath from '../../../src.assets/gfx/by_caravelgames/tiles/styleIceworks/floorRoad.jpg';
import * as PitPath from '../../../src.assets/gfx/by_caravelgames/tiles/styleIceworks/pit.png';
import * as PitsidePath from '../../../src.assets/gfx/by_caravelgames/tiles/styleIceworks/pitside.png';
import * as PitsideSmallPath from '../../../src.assets/gfx/by_caravelgames/tiles/styleIceworks/pitsideSmall.png';
import * as TilesPath from '../../../src.assets/gfx/by_caravelgames/tiles/styleIceworks/tiles.built.png';
import {ResourcesQueue} from "./ResourcesQueue";
import {C} from "../../C";

export function StyleResourceIceworks() {
	ResourcesQueue.queueImage(C.RES_ICEWORKS_WALL, document.createElement('img'), WallPath.default);
	ResourcesQueue.queueImage(C.RES_ICEWORKS_FLOOR, document.createElement('img'), FloorPath.default);
	ResourcesQueue.queueImage(C.RES_ICEWORKS_FLOOR_ALT, document.createElement('img'), FloorAltPath.default);
	ResourcesQueue.queueImage(C.RES_ICEWORKS_FLOOR_DIRT, document.createElement('img'), FloorDirtPath.default);
	ResourcesQueue.queueImage(C.RES_ICEWORKS_FLOOR_GRASS, document.createElement('img'), FloorGrassPath.default);
	ResourcesQueue.queueImage(C.RES_ICEWORKS_FLOOR_MOSAIC, document.createElement('img'), FloorMosaicPath.default);
	ResourcesQueue.queueImage(C.RES_ICEWORKS_FLOOR_ROAD, document.createElement('img'), FloorRoadPath.default);
	ResourcesQueue.queueImage(C.RES_ICEWORKS_PIT, document.createElement('img'), PitPath.default);
	ResourcesQueue.queueImage(C.RES_ICEWORKS_PIT_SIDE, document.createElement('img'), PitsidePath.default);
	ResourcesQueue.queueImage(C.RES_ICEWORKS_PIT_SIDE_SMALL, document.createElement('img'), PitsideSmallPath.default);
	ResourcesQueue.queueImage(C.RES_ICEWORKS_TILES, document.createElement('img'), TilesPath.default);
}