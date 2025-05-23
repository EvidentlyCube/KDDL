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
import { TStatePreloader } from "src/game/states/TStatePreloader";
import { TStateTitle } from "src/game/states/TStateTitle";
import { TWidgetMinimap } from "src/game/widgets/TWidgetMinimap";
import { S } from "src/S";

let isInterruptingDemoPlayback = false;

export const KddlApi = {
    async loadHold(holdId: HoldId): Promise<void> {
        const { currentState } = RecamelCore;
        if (currentState instanceof TStatePreloader) {
            const hold = S.allHoldOptions.find(hold => hold.id === holdId);

            if (!hold) {
                return;
            }

            currentState.handleGameStart(hold);
            await waitForState(TStateTitle);

        } else if (currentState instanceof TStateTitle) {
            currentState.API_changeHold();
            await waitForState(TStatePreloader);

            return this.loadHold(holdId);

        } else {
            TStateTitle.show();
            await waitForState(TStateTitle);

            return this.loadHold(holdId);
        }
    },

    async drawLevel(levelId: number) {
        const levelBitmapData = TWidgetMinimap.API_drawLevel(levelId);

        return canvasToPng(levelBitmapData.canvas);
    },

    async drawRoom(roomPid: string) {
        const room = new Room();

        try {
            room.loadRoom(roomPid);
        } catch (e: unknown) {
            return -1;
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
            const extract = RecamelCore.renderer.plugins.extract as Extract;
            const canvas = extract.canvas(texture);

            room.clear();

            return canvasToPng(canvas);

        } catch (e: unknown) {
            return -3;
        }
    },
    testDemo(demoData: string) {
        const { isSpiderMode } = S;
        S.isSpiderMode = true;

        const demo = new VODemoRecord("", demoData);

        const roomPid = demo.roomPid;
        const px = demo.startX;
        const py = demo.startY;
        const po = demo.startO;

        Progress.restoreToDemo(demo);
        Game.loadFromRoom(roomPid, px, py, po);
        Commands.fromString(demo.demoBuffer);


        let roomConquered = false;
        let roomExited = false;

        try {
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
            return -3;
        } finally {
            S.isSpiderMode = isSpiderMode;
        }
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

    return pngArray;
}

async function waitForState(stateType: any) {
    while (true) {
        if (RecamelCore.currentState instanceof stateType) {
            return;
        }

        await sleep();
    }
}

async function sleep(duration = 100): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, duration));
}