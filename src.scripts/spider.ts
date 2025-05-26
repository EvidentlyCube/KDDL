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
    levelGidIndex: number;
}

interface JobRoomScreenshot {
    type: 'room-screenshot';
    holdId: HoldId;
    roomPid: string;
}

interface JobValidateDemo {
    type: 'validate-demo';
    holdId: HoldId;
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
                JobManager.addLevelScreenshot(holdId, levelGidIndex);
            }
            Log.indent--;
            Log.info(`Queuing ${roomPids.length} room draw jobs`);
            Log.indent++;
            for (const roomPid of roomPids) {
                JobManager.addRoomScreenshot(holdId, roomPid);
            }
            Log.indent--;
        }
    }

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
    add(job: Job) {
        JobManager.jobQueue.push(job);
    },

    addLevelScreenshot(holdId: HoldId, levelGidIndex: number) {
        JobManager.jobQueue.push({
            type: 'level-screenshot',
            holdId: holdId,
            levelGidIndex: parseInt(String(levelGidIndex)),
        });
    },

    addRoomScreenshot(holdId: HoldId, roomPid: number) {
        JobManager.jobQueue.push({
            type: 'room-screenshot',
            holdId: holdId,
            roomPid: String(roomPid),
        });
    },

    addValidateDemo(holdId: HoldId, serializedDemo: string) {

        JobManager.jobQueue.push({
            type: 'validate-demo',
            holdId: holdId,
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

            await Utils.inReal(async () => CaravelNetApi.pollHoldNeeded())

            const job = JobManager.jobQueue.shift();

            if (job) {
                JobManager.logJobStart(job);
                await JobManager.runJob(job);
            } else {
                await Utils.sleep(1000);
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

            await Utils.inTest(async () => {
                await writeFile('level.png', Buffer.from(levelPngHex, 'hex'));
                Log.info(chalk.green("level.png written to working directory"));
            });

            Log.debug(`Received ${levelPngHex.length} bytes`);
            Log.info(chalk.green("Done!"));

        } catch (e) {
            Log.error(e);
        }
    },

    async runJobRoomScreenshot(job: JobRoomScreenshot) {
        await KddlApi.ensureHoldIsRunning(job.holdId);
        try {
            const roomJpgHex = await KddlApi.invoke('drawRoom', job.roomPid);

            await Utils.inTest(async () => {
                await writeFile('room.jpg', Buffer.from(roomJpgHex, 'hex'));
                Log.info(chalk.green("room.jpg written to working directory"));
            });

            Log.debug(`Received ${roomJpgHex.length} bytes`);
            Log.info(chalk.green("Done!"));

        } catch (e) {
            Log.error(e);
        }
    },

    async runJobValidateDemo(job: JobValidateDemo) {
        await KddlApi.ensureHoldIsRunning(job.holdId);
        try {
            const result = await KddlApi.invoke('testDemo', job.serializedDemo);

            Log.info(chalk.green(`Demos is valid, moves=${result}`));

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
    JobManager.add({
        type: 'level-screenshot',
        holdId: HoldId.KDDL1,
        levelGidIndex: 1
    })

    JobManager.add({
        type: 'room-screenshot',
        holdId: HoldId.KDDL2,
        roomPid: '3:0:0',
    })

    JobManager.add({
        type: 'validate-demo',
        holdId: HoldId.KDDL2,
        serializedDemo: 'BTQ6Mzo0GAAAABgAAAABAAAAJQAAAC1bMjAsNDIsMzksNDMsNDEsMjEsMiwxLDMsNCw5LDgsNiwxMiwxMywxNCwxNV3OBFsiMTowOjAiLCI3OjA6MCIsIjc6MTowIiwiNzoyOjAiLCI3OjM6MSIsIjc6MzowIiwiMToxOjEiLCIxOjA6MSIsIjE6LTE6MSIsIjE6MDoyIiwiMToyOjEiLCIxOjI6MCIsIjE6MzowIiwiMToxOjAiLCIxOjA6LTEiLCIxOi0xOjAiLCIxOi0yOjAiLCIxOi0yOi0xIiwiMTotMjoxIiwiMTotMTotMSIsIjE6MDotMiIsIjE6LTE6LTIiLCIxOi0yOi0yIiwiMTotMTotMyIsIjE6MTotMSIsIjE6MToyIiwiMToyOjIiLCIyOjA6MCIsIjI6LTE6MCIsIjI6LTI6MCIsIjI6LTM6MCIsIjI6MDoxIiwiMjowOi0xIiwiMjowOi0yIiwiMjowOi0zIiwiMjoxOjAiLCIyOjI6MCIsIjI6MzowIiwiMzowOjAiLCIzOjE6MCIsIjM6MToxIiwiMzoyOjEiLCIzOjE6MiIsIjM6MTotMSIsIjM6MTotMiIsIjM6MjotMiIsIjM6MjotMSIsIjM6MTotMyIsIjM6MDotMyIsIjM6MDotMSIsIjM6MDotMiIsIjM6LTE6LTEiLCIzOi0xOi0yIiwiMzowOjEiLCIzOi0xOjAiLCI0OjA6MCIsIjQ6MDoxIiwiNDoxOjEiLCI0OjE6MCIsIjQ6MDoyIiwiNDowOjMiLCI0Oi0xOjMiLCI0OjE6MyIsIjQ6MjozIiwiNDozOjMiLCI0OjM6MiIsIjQ6MjoyIiwiNDoyOjQiLCI0OjM6NSJd1gRbIjE6MDowIiwiNzowOjAiLCI3OjE6MCIsIjc6MjowIiwiNzozOjAiLCI3OjM6MSIsIjE6MDoxIiwiMToxOjEiLCIxOi0xOjEiLCIxOjA6MiIsIjE6MjoxIiwiMToyOjIiLCIxOjI6MCIsIjE6MzowIiwiMToxOjAiLCIxOjA6LTEiLCIxOi0xOjAiLCIxOi0yOjAiLCIxOi0yOi0xIiwiMTotMjoxIiwiMTotMTotMSIsIjE6LTE6LTIiLCIxOjA6LTIiLCIxOi0yOi0yIiwiMTotMTotMyIsIjE6MTotMSIsIjE6MToyIiwiMjowOjAiLCIyOi0xOjAiLCIyOi0yOjAiLCIyOi0zOjAiLCIyOjA6LTEiLCIyOjA6MSIsIjI6MDotMiIsIjI6MDotMyIsIjI6MTowIiwiMjoyOjAiLCIyOjM6MCIsIjM6MDowIiwiMzoxOjAiLCIzOjE6LTEiLCIzOjE6MSIsIjM6MjoxIiwiMzoxOjIiLCIzOjE6LTIiLCIzOjI6LTIiLCIzOjI6LTEiLCIzOjE6LTMiLCIzOjA6LTMiLCIzOjA6LTIiLCIzOjA6LTEiLCIzOi0xOi0xIiwiMzotMTotMiIsIjM6MDoxIiwiMzotMTowIiwiNDowOjAiLCI0OjA6MSIsIjQ6MToxIiwiNDoxOjAiLCI0OjA6MiIsIjQ6MDozIiwiNDotMTozIiwiNDoxOjMiLCI0OjI6MyIsIjQ6MzozIiwiNDozOjIiLCI0OjI6MiIsIjQ6Mjo0IiwiNDozOjQiLCI0OjM6NSJdAE8AAABPWzExLDExLDYsMywxMSwxLDEsMSwxLDEsMyw4LDEsMSwzLDgsMSwxLDEsMSw5LDcsNyw3LDcsNyw3LDEwLDcsNyw3LDgsNSwyLDgsNyw3XQ=='
    })
}

