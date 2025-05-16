import { DisplayObject } from "pixi.js";
import { DROD } from "src/game/global/DROD";

interface DeathTracker {
    displayObject: DisplayObject;
    callback: () => void;
}


const trackedDeaths: DeathTracker[] = [];

export function deathCallback(displayObject: DisplayObject, callback: () => void) {
    trackedDeaths.push({ displayObject, callback });
}

setInterval(() => {
    for (let i = trackedDeaths.length - 1; i >= 0; i--) {
        const track = trackedDeaths[i];

        if (!isInStage(track.displayObject)) {
            track.callback();
            trackedDeaths[i] = trackedDeaths[trackedDeaths.length - 1];
            trackedDeaths.length--;
        }
    }
}, 1000);

function isInStage(displayObject: DisplayObject) {
    let parent = displayObject.parent;

    while (parent && parent !== DROD.app.stage) {
        parent = parent.parent;
    }

    return !!parent;
}