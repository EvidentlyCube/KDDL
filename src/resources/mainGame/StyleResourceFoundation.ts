/// <reference path='../../index.d.ts'/>

import * as WallPath from '../../../src.assets/gfx/by_caravelgames/tiles/styleFoundation/wall.png';
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
import {ResourcesQueue} from "./ResourcesQueue";
import {C} from "../../C";
import {PlatformOptions} from "../../platform/PlatformOptions";

export function StyleResourceFoundation() {
	ResourcesQueue.queueImage(C.RES_FOUNDATION_WALL, document.createElement('img'), WallPath.default);
	ResourcesQueue.queueImage(C.RES_FOUNDATION_FLOOR, document.createElement('img'), FloorPath.default);
	ResourcesQueue.queueImage(C.RES_FOUNDATION_FLOORALT, document.createElement('img'), FloorAltPath.default);
	ResourcesQueue.queueImage(C.RES_FOUNDATION_FLOORDIRT, document.createElement('img'), FloorDirtPath.default);
	ResourcesQueue.queueImage(C.RES_FOUNDATION_FLOORGRASS, document.createElement('img'), FloorGrassPath.default);
	ResourcesQueue.queueImage(C.RES_FOUNDATION_FLOORMOSAIC, document.createElement('img'), FloorMosaicPath.default);
	ResourcesQueue.queueImage(C.RES_FOUNDATION_FLOORROAD, document.createElement('img'), FloorRoadPath.default);
	ResourcesQueue.queueImage(C.RES_FOUNDATION_PIT, document.createElement('img'), PitPath.default);
	ResourcesQueue.queueImage(C.RES_FOUNDATION_PITSIDE, document.createElement('img'), PitsidePath.default);
	ResourcesQueue.queueImage(C.RES_FOUNDATION_PITSIDESMALL, document.createElement('img'), PitsideSmallPath.default);
	ResourcesQueue.queueImage(C.RES_FOUNDATION_TILES, document.createElement('img'), TilesPath.default);
}