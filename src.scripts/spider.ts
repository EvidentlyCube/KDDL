import puppeteer, { Page } from 'puppeteer';
import chalk from 'chalk';
import { writeFile } from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { HoldId } from '../src/C';

const __dirname: string = (import.meta as any).dirname;

interface JobLevelScreenshot {
    type: 'level-screenshot';
    holdId: HoldId;
    forumHoldId: string;
    levelGidIndex: number;
}

interface JobRoomScreenshot {
    type: 'room-screenshot';
    holdId: HoldId;
    forumHoldId: string;
    roomPid: string;
}

interface JobValidateDemo {
    type: 'validate-demo';
    holdId: HoldId;
    forumHoldId: string;
    forumDemoId: string;
    serializedDemo: string;
}

type Job = JobLevelScreenshot | JobRoomScreenshot | JobValidateDemo;

const KddlApi = {
    gameUrl: 'http://localhost:12399',
    page: undefined as Page | undefined,

    async init() {
        Log.info("Initializing KddlApi");
        Log.indent++
        const browser = await puppeteer.launch({ headless: true });
        Log.trace("Browser launched");
        KddlApi.page = await browser.newPage();
        Log.trace("Page initialized");
        KddlApi.page.on('console', msg => Log.trace(chalk.gray(`    [PAGE] ${msg.text()}`)));

        await KddlApi.page.goto(KddlApi.gameUrl, { waitUntil: 'networkidle0' });
        Log.trace("Api page loaded");

        Log.debug("Waiting for KddlApi init")
        await KddlApi.invoke('waitForInit');
        Log.trace("KddlApi initialized");
        Log.indent--
    },

    async invoke(method: string, ...args: unknown[]) {
        const { page } = KddlApi;
        if (page === undefined) {
            Log.error("Cannot invoke KddlApi because it has not been initialized yet")
            process.exit(1);
        }

        try {
            Log.info(`KddlApi.${method}()`);

            const result = await page.evaluate((data: any) => {
                const [method, args] = data;
                return (window as any).kddlApi[method].apply(null, args);
            }, [method, args]);

            Log.info(`KddlApi.${method}() -> Finished`);
            return result;

        } catch (e) {
            Log.error(e)
            throw new Error(`Error when invoking kddlApi method '${method}'`);
        }
    },

    async ensureHoldIsRunning(holdId: HoldId) {
        await KddlApi.invoke('loadHold', holdId);
    }
}

const CaravelNetApi = {
    ApiUrl: "",
    ApiSecret: "",
    async invoke(action: string, args: Record<string, string>) {
        Log.info(`CaravelNetApi.${action}()`);
        Log.indent++;
        for (const [key, value] of Object.entries(args)) {
            Log.trace(`${key} = ${value}`)
        }

        try {
            Log.trace("Sending request")
            return await fetch(CaravelNetApi.ApiUrl, {
                method: 'POST',
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: new URLSearchParams({
                    action,
                    secret: CaravelNetApi.ApiSecret,
                    ...args
                }),
            });
        } catch (e) {
            Log.error(e);
            throw e;

        } finally {
            Log.indent--;
        }
    },

    async pollHoldNeeded() {
        const data = await CaravelNetApi.invoke('holdneeded', { gameId: '3'});
        Log.indent++;
        const forumHoldId = await data.text();

        if (forumHoldId) {
            const holdId = Utils.getHoldId(forumHoldId);

            Log.info(`Received request for hold #${forumHoldId} (${holdId})`);
            await KddlApi.ensureHoldIsRunning(holdId);

            const levelGidIndexes = await KddlApi.invoke('getAllLevelGidIndexes');
            const roomPids = await KddlApi.invoke('getAllRoomPids');

            Log.info(`Queuing ${levelGidIndexes.length} level draw jobs`);
            Log.indent++;
            for (const levelGidIndex of levelGidIndexes) {
                JobManager.addLevelScreenshot(forumHoldId, holdId, levelGidIndex);
            }
            Log.indent--;
            Log.info(`Queuing ${roomPids.length} room draw jobs`);
            Log.indent++;
            for (const roomPid of roomPids) {
                JobManager.addRoomScreenshot(forumHoldId, holdId, roomPid);
            }
            Log.indent--;
        }
        Log.indent--;
    },

    async pollValidateDemos() {
        // @FIXME implement
    },

    async uploadLevelImage(forumHoldId: string, levelPng: Buffer) {
        // @FIXME Implement
    },

    async uploadRoomImage(forumHoldId: string, roomJpg: Buffer) {
        // @FIXME Implement
    },

    async uploadDemoStatus(demoId: string, isValid: boolean, numMoves: number) {
        // @FIXME Implement
        // @FIXME - Throttle those so that they are sent in batch
    },

}

const Utils = {
    isTest: false,
    ForumHoldIdToHoldIdMap: new Map<string, HoldId>([
        ['551', HoldId.KDDL1],
    ]),
    getHoldId(forumHoldId: string) {
        const holdId = Utils.ForumHoldIdToHoldIdMap.get(forumHoldId);

        if (!holdId) {
            Log.error(`Cannot identify hold with ID ${holdId}`);
            process.exit(1);
        }

        return holdId;
    },
    async sleep(duration = 100) {
        await new Promise(resolve => setTimeout(resolve, duration));
    },
    parseDotEnv() {
        const dotEnv = readFileSync(join(__dirname, '..', '.env'), 'utf-8').replace(/\r/g, '');

        const env: Record<string, string> = {};

        for (const line of dotEnv.split("\n")) {
            const [key, ...value] = line.split("=");

            env[key] = value.join("=");
        }

        return env;
    },

    assert(condition: unknown, context: string) {
        if (!condition) {
            console.log(chalk.bgGray("#".repeat(40)));
            console.trace();
            console.log(chalk.bgRed(`ASSERTION FAILED: ${context}`));
            console.log(chalk.bgGray("#".repeat(40)));
            process.exit(1);
        }
    },

    async inTest(callback: () => Promise<void>) {
        if (Utils.isTest) {
            await callback();
        }
    },

    async inReal(callback: () => Promise<void>) {
        if (!Utils.isTest) {
            await callback();
        }
    }
}

const JobManager = {
    jobQueue: [] as Job[],

    addLevelScreenshot(forumHoldId:string, holdId: HoldId, levelGidIndex: number) {
        JobManager.jobQueue.push({
            type: 'level-screenshot',
            holdId, forumHoldId,
            levelGidIndex: parseInt(String(levelGidIndex)),
        });
    },

    addRoomScreenshot(forumHoldId:string, holdId: HoldId, roomPid: string) {
        JobManager.jobQueue.push({
            type: 'room-screenshot',
            forumHoldId, holdId,
            roomPid: String(roomPid),
        });
    },

    addValidateDemo(forumHoldId:string, holdId: HoldId, forumDemoId: string, serializedDemo: string) {
        JobManager.jobQueue.push({
            type: 'validate-demo',
            forumHoldId, holdId, forumDemoId,
            serializedDemo: String(serializedDemo),
        });
    },

    async main() {
        while (true) {
            if (this.jobQueue.length === 0) {
                Utils.inTest(() => {
                    Log.info(chalk.green("Test finished!"));
                    process.exit(0);
                })
            }

            const job = JobManager.jobQueue.shift();

            if (job) {
                JobManager.logJobStart(job);
                await JobManager.runJob(job);
            } else {
                await Utils.inReal(async () => CaravelNetApi.pollHoldNeeded());
                await Utils.inReal(async () => CaravelNetApi.pollValidateDemos());

                await Utils.sleep(60000);
            }

        }
    },

    logJobStart(job: Job) {
        Log.info(chalk.yellow(`Starting job ${job.type}`));
        Log.indent += 1;
        Log.debug('(');
        Log.indent += 1;
        Log.debug(`${chalk.bold('Hold ID')} = ${job.holdId}`);

        for (const key in job) {
            if (key === 'type' || key === 'holdId') {
                continue;
            }

            let value = (job as any)[key];

            if (typeof value === 'string' && value.length > 32) {
                value = value.substring(0, 8) + "..." + value.substring(value.length - 8) + ` (Length=${value.length})`;
            }

            Log.trace(`${chalk.bold(key)} = ${job.holdId}`);
        }
        Log.indent--;
        Log.debug(')');
        Log.indent--;
    },

    async runJob(job: Job) {
        try {
            Log.indent++;
            switch (job.type) {
                case 'level-screenshot': return await JobManager.runJobLevelScreenshot(job);
                case 'room-screenshot': return await JobManager.runJobRoomScreenshot(job);
                case 'validate-demo': return await JobManager.runJobValidateDemo(job);
                default: Log.error(`Unknown job: ${JSON.stringify(job)}`);
            }
        } finally {
            Log.indent--;
        }
    },

    async runJobLevelScreenshot(job: JobLevelScreenshot) {
        await KddlApi.ensureHoldIsRunning(job.holdId);
        try {
            const levelPngHex = await KddlApi.invoke('drawLevel', job.levelGidIndex);
            const levelPng = Buffer.from(levelPngHex, 'hex');

            await Utils.inTest(async () => {
                await writeFile('level.png', levelPng);
                Log.info(chalk.green("level.png written to working directory"));
            });

            Log.debug(`Received ${levelPngHex.length} bytes`);
            await Utils.inReal(async () => {
                CaravelNetApi.uploadLevelImage(job.forumHoldId, levelPng);
            });
            Log.info(chalk.green("Done!"));

        } catch (e) {
            Log.error(e);
        }
    },

    async runJobRoomScreenshot(job: JobRoomScreenshot) {
        await KddlApi.ensureHoldIsRunning(job.holdId);
        try {
            const roomJpgHex = await KddlApi.invoke('drawRoom', job.roomPid);
            const roomJpg = Buffer.from(roomJpgHex, 'hex');

            await Utils.inTest(async () => {
                await writeFile('room.jpg', roomJpg);
                Log.info(chalk.green("room.jpg written to working directory"));
            });

            Log.debug(`Received ${roomJpgHex.length} bytes`);
            await Utils.inReal(async () => {
                CaravelNetApi.uploadRoomImage(job.forumHoldId, roomJpg);
            });
            Log.info(chalk.green("Done!"));

        } catch (e) {
            Log.error(e);
        }
    },

    async runJobValidateDemo(job: JobValidateDemo) {
        await KddlApi.ensureHoldIsRunning(job.holdId);
        try {
            const result = await KddlApi.invoke('testDemo', job.serializedDemo);

            CaravelNetApi.uploadDemoStatus(job.forumDemoId, result > 0, result > 0 ? result : 4294967295);

            Log.info(chalk.green(`Demos is valid, result=${result}`));

        } catch (e: unknown) {
            Log.error(e);
        }
    }

}

const Log = {
    showInfo: true,
    showDebug: false,
    showTrace: false,
    indent: 0,

    init() {
        Log.showDebug = process.argv.includes('-v') || process.argv.includes('-vv');
        Log.showTrace = process.argv.includes('-vv');
    },
    error(error: unknown) {
        console.trace();

        if (error && error instanceof Error) {
            console.log(chalk.bgRed(`Error: ${error.message}`));
        } else {
            console.log(chalk.bgRed(`Error: ${String(error)}`));
        }
    },
    info(str: string) {
        console.log("    ".repeat(Log.indent) + str);
    },
    debug(str: string) {
        if (Log.showDebug) {
            Log.info(str);
        }
    },
    trace(str: string) {
        if (Log.showTrace) {
            Log.info(str);
        }
    }
}

start();

async function start() {
    Log.init();

    Log.info("Initializing spider");
    Log.indent++;

    Utils.isTest = process.argv.includes('--test');

    Log.trace("Parsing .env file")
    const env = Utils.parseDotEnv();

    Log.trace("Loading .env values")
    CaravelNetApi.ApiUrl = env.SPIDER_URL;
    CaravelNetApi.ApiSecret = env.SPIDER_PASS;
    KddlApi.gameUrl = env.KDDL_API_URL ?? KddlApi.gameUrl;

    Log.trace("Asserts")
    Utils.inReal(async () => Utils.assert(CaravelNetApi.ApiUrl, "Api URL is not set"));
    Utils.inReal(async () => Utils.assert(CaravelNetApi.ApiSecret, "Api Secret is not set"));

    Utils.inTest(addTestJobs);

    await KddlApi.init();
    Log.indent--;
    await JobManager.main();
}

async function addTestJobs() {
    Log.info("Adding test jobs");
    JobManager.addLevelScreenshot('551', HoldId.KDDL1, 1);
    JobManager.addRoomScreenshot('552', HoldId.KDDL2, '3:1:0');
    JobManager.addValidateDemo(
        '552',
        HoldId.KDDL2,
        '-1',
        'BTQ6Mzo0GAAAABgAAAABAAAAJQAAAC1bMjAsNDIsMzksNDMsNDEsMjEsMiwxLDMsNCw5LDgsNiwxMiwxMywxNCwxNV3OBFsiMTowOjAiLCI3OjA6MCIsIjc6MTowIiwiNzoyOjAiLCI3OjM6MSIsIjc6MzowIiwiMToxOjEiLCIxOjA6MSIsIjE6LTE6MSIsIjE6MDoyIiwiMToyOjEiLCIxOjI6MCIsIjE6MzowIiwiMToxOjAiLCIxOjA6LTEiLCIxOi0xOjAiLCIxOi0yOjAiLCIxOi0yOi0xIiwiMTotMjoxIiwiMTotMTotMSIsIjE6MDotMiIsIjE6LTE6LTIiLCIxOi0yOi0yIiwiMTotMTotMyIsIjE6MTotMSIsIjE6MToyIiwiMToyOjIiLCIyOjA6MCIsIjI6LTE6MCIsIjI6LTI6MCIsIjI6LTM6MCIsIjI6MDoxIiwiMjowOi0xIiwiMjowOi0yIiwiMjowOi0zIiwiMjoxOjAiLCIyOjI6MCIsIjI6MzowIiwiMzowOjAiLCIzOjE6MCIsIjM6MToxIiwiMzoyOjEiLCIzOjE6MiIsIjM6MTotMSIsIjM6MTotMiIsIjM6MjotMiIsIjM6MjotMSIsIjM6MTotMyIsIjM6MDotMyIsIjM6MDotMSIsIjM6MDotMiIsIjM6LTE6LTEiLCIzOi0xOi0yIiwiMzowOjEiLCIzOi0xOjAiLCI0OjA6MCIsIjQ6MDoxIiwiNDoxOjEiLCI0OjE6MCIsIjQ6MDoyIiwiNDowOjMiLCI0Oi0xOjMiLCI0OjE6MyIsIjQ6MjozIiwiNDozOjMiLCI0OjM6MiIsIjQ6MjoyIiwiNDoyOjQiLCI0OjM6NSJd1gRbIjE6MDowIiwiNzowOjAiLCI3OjE6MCIsIjc6MjowIiwiNzozOjAiLCI3OjM6MSIsIjE6MDoxIiwiMToxOjEiLCIxOi0xOjEiLCIxOjA6MiIsIjE6MjoxIiwiMToyOjIiLCIxOjI6MCIsIjE6MzowIiwiMToxOjAiLCIxOjA6LTEiLCIxOi0xOjAiLCIxOi0yOjAiLCIxOi0yOi0xIiwiMTotMjoxIiwiMTotMTotMSIsIjE6LTE6LTIiLCIxOjA6LTIiLCIxOi0yOi0yIiwiMTotMTotMyIsIjE6MTotMSIsIjE6MToyIiwiMjowOjAiLCIyOi0xOjAiLCIyOi0yOjAiLCIyOi0zOjAiLCIyOjA6LTEiLCIyOjA6MSIsIjI6MDotMiIsIjI6MDotMyIsIjI6MTowIiwiMjoyOjAiLCIyOjM6MCIsIjM6MDowIiwiMzoxOjAiLCIzOjE6LTEiLCIzOjE6MSIsIjM6MjoxIiwiMzoxOjIiLCIzOjE6LTIiLCIzOjI6LTIiLCIzOjI6LTEiLCIzOjE6LTMiLCIzOjA6LTMiLCIzOjA6LTIiLCIzOjA6LTEiLCIzOi0xOi0xIiwiMzotMTotMiIsIjM6MDoxIiwiMzotMTowIiwiNDowOjAiLCI0OjA6MSIsIjQ6MToxIiwiNDoxOjAiLCI0OjA6MiIsIjQ6MDozIiwiNDotMTozIiwiNDoxOjMiLCI0OjI6MyIsIjQ6MzozIiwiNDozOjIiLCI0OjI6MiIsIjQ6Mjo0IiwiNDozOjQiLCI0OjM6NSJdAE8AAABPWzExLDExLDYsMywxMSwxLDEsMSwxLDEsMyw4LDEsMSwzLDgsMSwxLDEsMSw5LDcsNyw3LDcsNyw3LDEwLDcsNyw3LDgsNSwyLDgsNyw3XQ=='
    );
}

