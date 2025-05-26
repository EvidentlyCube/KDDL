import { Extract, RenderTexture } from "pixi.js";
import { RecamelCore } from "src.framework/net/retrocade/camel/core/RecamelCore";
import { C, HoldId } from "src/C";
import { F } from "src/F";
import { Commands } from "src/game/global/Commands";
import { CueEvents } from "src/game/global/CueEvents";
import { Game } from "src/game/global/Game";
import { Level } from "src/game/global/Level";
import { Progress } from "src/game/global/Progress";
import { Room } from "src/game/global/Room";
import { VODemoRecord } from "src/game/managers/VODemoRecord";
import { TStateGame } from "src/game/states/TStateGame";
import { TStateInitialize } from "src/game/states/TStateInitialize";
import { TStatePreloader } from "src/game/states/TStatePreloader";
import { TStateTitle } from "src/game/states/TStateTitle";
import { TWidgetMinimap } from "src/game/widgets/TWidgetMinimap";
import { S } from "src/S";
import { attr, intAttr } from "src/XML";

let isInterruptingDemoPlayback = false;

export const KddlApi = {
    async waitForInit() {
        await waitForState(TStatePreloader);
    },
    async loadHold(holdId: HoldId): Promise<void> {
        console.log(`kddlApi.loadHold(${holdId})`);

        const { currentState } = RecamelCore;

        if (currentState instanceof TStatePreloader) {
            console.log(`kddlApi.loadHold() -> In preloader, trying to find hold...`);
            const hold = S.allHoldOptions.find(hold => hold.id === holdId);

            if (!hold) {
                console.log(`kddlApi.loadHold() -> Hold not found`);
                return;
            }

            console.log(`kddlApi.loadHold() -> Starting game`);
            currentState.handleGameStart(hold);
            await waitForState(TStateTitle);

        } else if (currentState instanceof TStateTitle) {
            console.log(`kddlApi.loadHold() -> On Title Screen...`);
            if (S.currentHoldOptions?.id === holdId) {
                console.log(`kddlApi.loadHold() -> And the hold is already loaded.`);
                return;
            }

            console.log(`kddlApi.loadHold() -> Returning to hold selection`);
            currentState.API_changeHold();
            await waitForState(TStatePreloader);

            return this.loadHold(holdId);

        } else if (currentState instanceof TStateInitialize) {
            console.log(`kddlApi.loadHold() -> In Initialize state`);
            await waitForState(TStateTitle);

            return this.loadHold(holdId);
        }
    },

    async drawLevel(levelGidIndex: number) {
        levelGidIndex = parseInt(String(levelGidIndex));
        console.log(`kddlApi.drawLevel(${levelGidIndex})`);
        const levelId = Level.getLevelIdByGidIndex(levelGidIndex);

        if (levelId) {
            console.log(`kddlApi.drawLevel() -> levelId=${levelId}`);
            const minimap = new TWidgetMinimap(1024, 1024);
            const levelCanvas = minimap.API_drawLevel(levelId);

            return canvasToPng(levelCanvas);

        } else {
            console.log(`kddlApi.drawLevel() -> No level ID found`);
            console.log("All level GIDs are:" + Level.getAllLevels().map(level => intAttr(level, 'GID_LevelIndex')).join(", "));
            return false;
        }
    },

    async drawRoom(roomPid: string) {
        console.log(`kddlApi.drawRoom(${roomPid})`);

        if (!Level.isValidRoomPid(roomPid)) {
            console.log(typeof roomPid);
            console.log(JSON.stringify(roomPid));
            throw new Error(`Invalid RoomPID '${roomPid}'`);
        }

        const room = new Room();

        try {
            room.loadRoom(roomPid);
        } catch (e: unknown) {
            throw new Error(`Failed to load room: ${String(e)}`);
        }

        try {
            room.drawRoom();

            room.monsters.update();
            room.roomSpritesRenderer.renderSwords();

            const texture = RenderTexture.create({
                width: S.RoomWidthPixels,
                height: S.RoomHeightPixels
            });

            room.renderInto(texture);
            room.clear();

            const canvas = RecamelCore.extract.canvas(texture);
            texture.destroy(true);

            return canvasToJpg(canvas);

        } catch (e: unknown) {
            return -3;
        }
    },
    testDemo(demoData: string) {
        console.log(`kddlApi.testDemo([string ${demoData.length} chars])`);

        const { isSpiderMode } = S;
        S.isSpiderMode = true;

        let demo: VODemoRecord;
        try {
            demo = new VODemoRecord("", demoData);
        } catch (e) {
            throw new Error(`kddlApi.testDemo() -> Error when loading the demo: ${String(e)}`);
        }

        const roomPid = demo.roomPid;
        const px = demo.startX;
        const py = demo.startY;
        const po = demo.startO;

        if (!Level.isValidRoomPid(roomPid)) {
            throw new Error(`kddlApi.testDemo() -> Room ${roomPid} does not exist in current hold.`);
        }

        console.log(`kddlApi.testDemo() -> Restoring to demo`);
        try {
            Progress.restoreToDemo(demo);
        } catch (e) {
            throw new Error(`kddlApi.testDemo() -> Error when restoring: ${String(e)}`);
        }

        console.log(`kddlApi.testDemo() -> Loading game`);
        try {
            Game.loadFromRoom(roomPid, px, py, po);
        } catch (e) {
            throw new Error(`kddlApi.testDemo() -> Error when loading game: ${String(e)}`);
        }


        console.log(`kddlApi.testDemo() -> Loading commands`);
        try {
            Commands.fromString(demo.demoBuffer);
        } catch (e) {
            throw new Error(`kddlApi.testDemo() -> Error when loading commands: ${String(e)}`);
        }

        let roomConquered = false;
        let roomExited = false;

        try {
            console.log(`kddlApi.testDemo() -> Starting playback`);
            Commands.freeze();

            let nextMove = Commands.getFirst();

            do {
                if (F.isComplexCommand(nextMove))
                    Game.processCommand(nextMove, Commands.getComplexX(), Commands.getComplexY());
                else
                    Game.processCommand(nextMove);

                if (CueEvents.hasAnyOccurred(C.CIDA_PLAYER_DIED)) {
                    return 0;
                }

                roomConquered = roomConquered || CueEvents.hasOccurred(C.CID_ROOM_CONQUER_PENDING);
                roomExited = roomExited || CueEvents.hasOccurred(C.CID_EXIT_ROOM);

                if (roomExited) {
                    if (roomConquered && Game.room.monsterCount === 0) {
                        return Game.turnNo;
                    } else {
                        return 0;
                    }
                }

                nextMove = Commands.getNext();

            } while (nextMove != Number.MAX_VALUE);

            return 0;

        } catch (e: unknown) {
            console.log(`kddlApi.testDemo() -> Playback error: ${String(e)}`);
            return -3;
        } finally {
            Game.room.clear();
            Game.room = undefined!;
            S.isSpiderMode = isSpiderMode;
        }
    },
    getAllLevelGidIndexes() {
        return Level.getAllLevels().map(xml => intAttr(xml, 'GID_LevelIndex'));
    },
    getAllRoomPids() {
        return Level.getAllRoomPids();
    },
    getRoomPidsWithDemos() {
        return Progress.getRoomPidsWithDemo();
    },
    getDemo(roomPid: string) {
        return Progress.getRoomDemo(roomPid);
    },
    async roomRenderStressTest(attempts = 101) {
        const room = new Room();


        const tries = [];
        for (let i = 0; i < attempts; i++) {
            const startTime = performance.now();
            for (const roomPid of Level.getAllRoomPids()) {
                room.resetRoom();
                room.loadRoom(roomPid);
            }
            const endTime = performance.now();
            const time = endTime - startTime;
            tries.push(time);

            console.log(`#${i+1} - ${time}ms (${(100 * i / attempts).toFixed(0)}%)`)
            await new Promise(resolve => requestAnimationFrame(resolve));
        }

        tries.sort();
        console.log("Average: ", tries.reduce((l, r) => l + r) / attempts + "ms");
        console.log("Median: ", tries[50] + "ms");
        console.log("Min: ", Math.min(...tries) + "ms");
        console.log("Max: ", Math.max(...tries) + "ms");

        room.clear();
    },
    ingame: {
        get Game() {
            return Game;
        },
        get room() {
            return Game.room;
        },
        get roomPid() {
            return Game.room.roomPid;
        },
        restart() {
            const state = RecamelCore.currentState;
            if (state instanceof TStateGame) {
                state.restartCommand();
            }
        },
        inputMove(command: number) {
            const state = RecamelCore.currentState;
            if (state instanceof TStateGame) {
                state.processCommand(command);
            }
        },
        demo: {
            interrupt() {
                isInterruptingDemoPlayback = true;
            },
            async play(inputSpeed = 100) {
                const state = RecamelCore.currentState;
                if (!(state instanceof TStateGame)) {
                    return
                }
                const demo = Progress.getRoomDemo(Game.room.roomPid);

                if (!demo.hasScore) {
                    return;
                }

                console.log(`kddlApi.ingame.interruptDemo() to interrupt playback`);

                isInterruptingDemoPlayback = false;
                try {
                    const roomPid = demo.roomPid;
                    const px = demo.startX;
                    const py = demo.startY;
                    const po = demo.startO;

                    Progress.restoreToDemo(demo);
                    Game.loadFromRoom(roomPid, px, py, po);
                    Commands.fromString(demo.demoBuffer);
                    Commands.freeze();

                    let nextMove = Commands.getFirst();

                    do {
                        if (F.isComplexCommand(nextMove)) {
                            Game.processCommand(nextMove, Commands.getComplexX(), Commands.getComplexY());
                        } else {
                            Game.processCommand(nextMove);
                        }

                        TStateGame.instance.drawAll();

                        if (
                            CueEvents.hasOccurred(C.CID_EXIT_ROOM)
                            || CueEvents.hasAnyOccurred(C.CIDA_PLAYER_DIED)
                            || isInterruptingDemoPlayback
                        ) {
                            break;
                        }

                        nextMove = Commands.getNext();
                        await sleep(inputSpeed);

                    } while (nextMove != Number.MAX_VALUE);

                } finally {
                    Commands.unfreeze();
                    TStateGame.isInputLocked = false;
                }
            }
        }
    },
}

async function canvasToPng(canvas: HTMLCanvasElement) {
    const dataUrl = canvas.toDataURL('image/png');
    const binary = atob(dataUrl.split(',')[1]);
    const pngArray = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        pngArray[i] = binary.charCodeAt(i);
    }

    return Array.from(pngArray).map(i => i.toString(16).padStart(2, '0')).join('');
}

async function canvasToJpg(canvas: HTMLCanvasElement) {
    const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
    const binary = atob(dataUrl.split(',')[1]);
    const jpgArray = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        jpgArray[i] = binary.charCodeAt(i);
    }

    return Array.from(jpgArray).map(i => i.toString(16).padStart(2, '0')).join('');
}

async function waitForState(stateType: any) {
    console.log(`kddlApi.loadHold() -> Waiting for state...`);
    while (true) {
        if (RecamelCore.currentState instanceof stateType) {
            console.log(`kddlApi.loadHold() -> State loaded!`);
            return;
        }

        await sleep();
    }
}

async function sleep(duration = 100): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, duration));
}