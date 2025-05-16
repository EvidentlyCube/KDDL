import { RecamelCore } from "src.framework/net/retrocade/camel/core/RecamelCore";
import { UtilsBitmapData } from "src.framework/net/retrocade/utils/UtilsBitmapData";
import { C, HoldId } from "src/C";
import { F } from "src/F";
import { Commands } from "src/game/global/Commands";
import { CueEvents } from "src/game/global/CueEvents";
import { Game } from "src/game/global/Game";
import { Progress } from "src/game/global/Progress";
import { Room } from "src/game/global/Room";
import { VODemoRecord } from "src/game/managers/VODemoRecord";
import { TStatePreloader } from "src/game/states/TStatePreloader";
import { TStateTitle } from "src/game/states/TStateTitle";
import { TWidgetMinimap } from "src/game/widgets/TWidgetMinimap";
import { S } from "src/S";

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

    async drawRoom(roomId: number) {
        const room = new Room();

        try {
            room.loadRoom(roomId);
        } catch (e: unknown) {
            return -1;
        }

        try {
            room.drawRoom();

            room.monsters.update();

            const roomBitmapData = F.newCanvasContext(S.RoomWidthPixels, S.RoomHeightPixels);
            UtilsBitmapData.blitPart(
                room.layerUnder.bitmapData.canvas,
                roomBitmapData,
                0, 0,
                S.LEVEL_OFFSET_X, S.LEVEL_OFFSET_Y,
                S.RoomWidthPixels, S.RoomHeightPixels
            );
            UtilsBitmapData.blitPart(
                room.layerActive.bitmapData.canvas,
                roomBitmapData,
                0, 0,
                0, 0,
                S.RoomWidthPixels, S.RoomHeightPixels
            );

            room.clear();

            return canvasToPng(roomBitmapData.canvas);

        } catch (e: unknown) {
            return -3;
        }
    },
    testDemo(demoData: string) {
        const { isSpiderMode } = S;
        S.isSpiderMode = true;

        const demo = new VODemoRecord(0, demoData);

        var roomID = demo.roomId;
        var px = demo.startX;
        var py = demo.startY;
        var po = demo.startO;

        Progress.restoreToDemo(demo);
        Game.loadFromRoom(roomID, px, py, po);
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
    getRoomIdsWithDemos() {
        return Progress.getRoomIdsWithDemo();
    },
    getDemo(roomId: number) {
        return Progress.getRoomDemo(roomId);
    }
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

async function sleep(): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, 100));
}