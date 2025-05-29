import chalk from "chalk";
import { SpiderLogger as Log } from "./SpiderLogger";
import { SpiderUtils as Utils } from "./SpiderUtils";
import { HoldId } from "src/C";
import { SpiderKddlApi as KddlApi } from "./SpiderKddlApi";

const SKIP_ROOM_UPLOADS = process.argv.includes('--skip-rooms');
const SKIP_LEVEL_UPLOADS = process.argv.includes('--skip-levels');

let apiSpiderUrl = "";
let apiFetchDemosUrl = "";
let apiSecret = "";

export const SpiderCaravelNetApi = {
    async init(_apiSpiderUrl: string, _apiFetchDemosUrl: string, _apiSecret: string) {
        apiSpiderUrl = _apiSpiderUrl;
        apiFetchDemosUrl = _apiFetchDemosUrl;
        apiSecret = _apiSecret;

        Utils.assert(apiSpiderUrl, "SPIDER_API_URL is not set");
        Utils.assert(apiFetchDemosUrl, "SPIDER_FETCH_DEMOS_URL is not set");
        Utils.assert(apiSecret, "SPIDER_PASS is not set");

    },
    async loop() {
        Log.info(chalk.green("CaravelNetApi.loop()"));

        while (true) {
            const polledHold = await pollHoldNeeded();
            const polledDemos = await pollValidateDemos();

            if (polledHold || polledDemos) {
                // Quickly poll again for more data
                await Utils.sleep(1000);

            } else {
                await Utils.sleep(1000 * 60);
            }
        }
    },
}

async function pollHoldNeeded() {
    const data = await invoke('holdneeded', { gameId: '3' });

    if (!data) {
        await Log.withIndent(async () => {
            Log.info("No response!");
        });
        return;
    }

    return await Log.withIndent(async () => {
        const forumHoldId = await data.text();

        if (!forumHoldId || forumHoldId === '0') {
            Log.info(chalk.green('No hold needed'));
            return false;
        }

        const holdId = Utils.getHoldId(forumHoldId);

        Log.info(`Received request for hold #${forumHoldId} (${holdId})`);

        const levelGidIndexes = await KddlApi.invoke('getAllLevelGidIndexes');
        const roomPids = await KddlApi.invoke('getAllRoomPids');

        Log.info(`Queuing ${levelGidIndexes.length} level draw jobs`);
        await Log.withIndent(async () => {
            for (const levelGidIndex of levelGidIndexes) {
                await handleLevelScreenshot(holdId, forumHoldId, levelGidIndex);
            }
        });

        Log.info(`Queuing ${roomPids.length} room draw jobs`);
        await Log.withIndent(async () => {
            for (const roomPid of roomPids) {
                const [levelGidIndex, x, y] = roomPid.split(':');

                await handleRoomScreenshot(
                    holdId,
                    forumHoldId,
                    roomPid,
                    parseInt(levelGidIndex),
                    parseInt(x),
                    parseInt(y)
                );
            }
        });

        await Log.withIndent(async () => {
            await handleMarkAsDone(forumHoldId, holdId);
        });

        return true;
    });
}

async function pollValidateDemos() {
    const data = await invoke('getflashdemos', { gameId: '3' }, apiFetchDemosUrl);

    if (data) {
        console.log(data.url);
        console.log(await data.text());
        console.log(data.status);
    }
    process.exit(1);
}

async function invoke(action: string, args: Record<string, string>, url: string | undefined = undefined) {
    Log.info(`CaravelNetApi.${action}()`);

    await Log.withIndent(async () => {
        for (const [key, value] of Object.entries(args)) {
            if (value.length > 32) {
                Log.trace(`${key} = ${value.substring(0, 16)}... (Length=${value.length})`)
            } else {
                Log.trace(`${key} = ${value}`)
            }
        }
    });

    return await Log.withIndent(async () => {
        Log.trace("Sending request")

        if (action === 'uploadflashdata') {
            Log.info(chalk.bgYellow('skipping action'));
            return;
        }

        return await Log.rethrowError(async () => {
            return await fetch(url ?? apiSpiderUrl, {
                method: 'POST',
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: new URLSearchParams({
                    action,
                    secret: apiSecret,
                    ...args
                }),
            });
        });
    });
}

async function handleRoomScreenshot(
    holdId: HoldId,
    forumHoldId: string,
    roomPid: string,
    levelGidIndex: number,
    roomOffsetX: number,
    roomOffsetY: number
) {
    if (SKIP_ROOM_UPLOADS) {
        Log.warn("Skipping room screenshot upload");
        return;
    }

    Log.info(chalk.yellow(`Handling room screenshot for ${holdId} (ID=${forumHoldId}) -> ${roomPid}`));

    await Log.withIndent(async () => {
        await KddlApi.ensureHoldIsRunning(holdId);

        await Log.catchError(async () => {
            // -- DRAW ROOM
            const jpgDataHex = await KddlApi.invoke('drawRoom', roomPid);
            const jpgData = Buffer.from(jpgDataHex, 'hex');

            Log.debug(`Received ${jpgData.length} bytes`);

            // -- UPLOAD DRAWN ROOM
            const roomUploadResult = await invoke('uploadroom', {
                json: JSON.stringify({
                    secret: apiSecret,
                    holdId: forumHoldId,
                    roomId: `${levelGidIndex}:${roomOffsetX}:${roomOffsetY}`,
                    image: jpgData.toString('base64'),
                })
            });

            // -- LOG
            if (roomUploadResult) {
                Log.trace(`STATUS CODE = ${roomUploadResult.status}`);
                Log.trace(`BODY = ${await roomUploadResult.text()}`);
            }
            Log.info(chalk.green("Done!"));
        });
    });
}


async function handleLevelScreenshot(
    holdId: HoldId,
    forumHoldId: string,
    levelGidIndex: number,
) {
    if (SKIP_LEVEL_UPLOADS) {
        Log.warn("Skipping level screenshot upload");
        return;
    }

    Log.info(chalk.yellow(`Handling level screenshot for ${holdId} (ID=${forumHoldId}) -> ${levelGidIndex}`));

    await Log.withIndent(async () => {
        await KddlApi.ensureHoldIsRunning(holdId);

        await Log.catchError(async () => {
            // -- DRAW LEVEL
            const pngDataHex = await KddlApi.invoke('drawLevel', levelGidIndex);
            const pngData = Buffer.from(pngDataHex, 'hex');

            Log.debug(`Received ${pngData.length} bytes`);

            // -- UPLOAD DRAWN LEVEL
            const levelUploadResult = await invoke('uploadlevel', {
                json: JSON.stringify({
                    secret: apiSecret,
                    holdId: forumHoldId,
                    levelId: levelGidIndex.toString(),
                    image: pngData.toString('base64'),
                })
            });

            if (levelUploadResult) {
                Log.trace(`STATUS CODE = ${levelUploadResult.status}`);
                Log.trace(`BODY = ${await levelUploadResult.text()}`);
            }

            Log.info(chalk.green("Done!"));
        });
    });
}

async function handleValidateDemos(demosOrSomething: unknown[]) {

}

async function handleValidateDemo(holdId: HoldId, serializedDemo: string) {
    await KddlApi.ensureHoldIsRunning(holdId);
    try {
        const result = await KddlApi.invoke('testDemo', serializedDemo);

        // @FIXME
        // CaravelNetApi.uploadDemoStatus(job.forumDemoId, result > 0, result > 0 ? result : 4294967295);

        Log.info(chalk.green(`Demos is valid, result=${result}`));

    } catch (e: unknown) {
        Log.error(e);
    }
}

async function handleMarkAsDone(forumHoldId: string, holdId: string) {
    if (SKIP_LEVEL_UPLOADS || SKIP_ROOM_UPLOADS) {
        Log.warn("Skipping marking as done because either room or level image uploads are skipped");
        return;
    }

    Log.info(chalk.yellow(`Handling marking as done for ${holdId} (ID=${forumHoldId})`));

    await Log.withIndent(async () => {
        const response = await invoke('markasdone', {
            json: JSON.stringify({
                secret: apiSecret,
                holdId: forumHoldId
            })
        });

        if (response) {
            Log.trace(`STATUS CODE = ${response.status}`);
            Log.trace(`BODY = ${await response.text()}`);
        }

        Log.info(chalk.green(`Marked as done.`));
    })

}