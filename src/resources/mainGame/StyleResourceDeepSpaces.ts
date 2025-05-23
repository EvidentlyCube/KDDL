/// <reference path='../../index.d.ts'/>

import * as WallPath from '../../../src.assets/gfx/by_caravelgames/tiles/styleDeepSpaces/wall.jpg';
import * as FloorPath from '../../../src.assets/gfx/by_caravelgames/tiles/styleDeepSpaces/floor.png';
import * as FloorAltPath from '../../../src.assets/gfx/by_caravelgames/tiles/styleDeepSpaces/floorAlt.jpg';
import * as FloorDirtPath from '../../../src.assets/gfx/by_caravelgames/tiles/styleDeepSpaces/floorDirt.png';
import * as FloorGrassPath from '../../../src.assets/gfx/by_caravelgames/tiles/styleDeepSpaces/floorGrass.jpg';
import * as FloorMosaicPath from '../../../src.assets/gfx/by_caravelgames/tiles/styleDeepSpaces/floorMosaic.jpg';
import * as FloorRoadPath from '../../../src.assets/gfx/by_caravelgames/tiles/styleDeepSpaces/floorRoad.jpg';
import * as PitPath from '../../../src.assets/gfx/by_caravelgames/tiles/styleDeepSpaces/pit.jpg';
import * as PitsidePath from '../../../src.assets/gfx/by_caravelgames/tiles/styleDeepSpaces/pitside.png';
import * as PitsideSmallPath from '../../../src.assets/gfx/by_caravelgames/tiles/styleDeepSpaces/pitsideSmall.png';
import * as TilesPath from '../../../src.assets/gfx/by_caravelgames/tiles/styleDeepSpaces/tiles.built.png';
import {ResourcesQueue} from "./ResourcesQueue";
import {C} from "../../C";

export function StyleResourceDeepSpaces() {
	ResourcesQueue.queueImage(C.RES_DEEP_SPACES_WALL, document.createElement('img'), WallPath.default);
	ResourcesQueue.queueImage(C.RES_DEEP_SPACES_FLOOR, document.createElement('img'), FloorPath.default);
	ResourcesQueue.queueImage(C.RES_DEEP_SPACES_FLOOR_ALT, document.createElement('img'), FloorAltPath.default);
	ResourcesQueue.queueImage(C.RES_DEEP_SPACES_FLOOR_DIRT, document.createElement('img'), FloorDirtPath.default);
	ResourcesQueue.queueImage(C.RES_DEEP_SPACES_FLOOR_GRASS, document.createElement('img'), FloorGrassPath.default);
	ResourcesQueue.queueImage(C.RES_DEEP_SPACES_FLOOR_MOSAIC, document.createElement('img'), FloorMosaicPath.default);
	ResourcesQueue.queueImage(C.RES_DEEP_SPACES_FLOOR_ROAD, document.createElement('img'), FloorRoadPath.default);
	ResourcesQueue.queueImage(C.RES_DEEP_SPACES_PIT, document.createElement('img'), PitPath.default);
	ResourcesQueue.queueImage(C.RES_DEEP_SPACES_PIT_SIDE, document.createElement('img'), PitsidePath.default);
	ResourcesQueue.queueImage(C.RES_DEEP_SPACES_PIT_SIDE_SMALL, document.createElement('img'), PitsideSmallPath.default);
	ResourcesQueue.queueImage(C.RES_DEEP_SPACES_TILES, document.createElement('img'), TilesPath.default);
}