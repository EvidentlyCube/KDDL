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
import * as TilesPath from '../../../src.assets/gfx/by_caravelgames/tiles/styleDeepSpaces/tiles.png';
import {ResourcesQueue} from "./ResourcesQueue";
import {C} from "../../C";
import {PlatformOptions} from "../../platform/PlatformOptions";

export function StyleResourceDeepSpaces() {
	ResourcesQueue.queueImage(C.RES_DEEP_SPACES_WALL, document.createElement('img'), WallPath.default);
	ResourcesQueue.queueImage(C.RES_DEEP_SPACES_FLOOR, document.createElement('img'), FloorPath.default);
	ResourcesQueue.queueImage(C.RES_DEEP_SPACES_FLOORALT, document.createElement('img'), FloorAltPath.default);
	ResourcesQueue.queueImage(C.RES_DEEP_SPACES_FLOORDIRT, document.createElement('img'), FloorDirtPath.default);
	ResourcesQueue.queueImage(C.RES_DEEP_SPACES_FLOORGRASS, document.createElement('img'), FloorGrassPath.default);
	ResourcesQueue.queueImage(C.RES_DEEP_SPACES_FLOORMOSAIC, document.createElement('img'), FloorMosaicPath.default);
	ResourcesQueue.queueImage(C.RES_DEEP_SPACES_FLOORROAD, document.createElement('img'), FloorRoadPath.default);
	ResourcesQueue.queueImage(C.RES_DEEP_SPACES_PIT, document.createElement('img'), PitPath.default);
	ResourcesQueue.queueImage(C.RES_DEEP_SPACES_PITSIDE, document.createElement('img'), PitsidePath.default);
	ResourcesQueue.queueImage(C.RES_DEEP_SPACES_PITSIDESMALL, document.createElement('img'), PitsideSmallPath.default);
	ResourcesQueue.queueImage(C.RES_DEEP_SPACES_TILES, document.createElement('img'), TilesPath.default);
}