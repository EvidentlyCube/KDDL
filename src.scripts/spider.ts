import puppeteer, { Page } from 'puppeteer';
import chalk from 'chalk';
import { writeFile } from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { HoldId } from '../src/C';

const __dirname: string = (import.meta as any).dirname;
parseDotEnv();

const SPIDER_URL = process.env.SPIDER_URL;
const SPIDER_PASS = process.env.SPIDER_PASS;
const holdForumIdToHoldIdMap = new Map<string, HoldId>([
    ['551', HoldId.KDDL1],
]);

interface JobLevelScreenshot {
    type: 'level-screenshot';
    holdId: string;
    levelGidIndex: number;
}

interface JobRoomScreenshot {
    type: 'room-screenshot';
    holdId: string;
    roomPid: string;
}

interface JobValidateDemo {
    type: 'validate-demo';
    holdId: string;
    serializedDemo: string;
}

type Job = JobLevelScreenshot | JobRoomScreenshot | JobValidateDemo;

const jobQueue: Job[] = [];

const IS_TEST = process.argv.includes('--test');

logTestRun();
if (IS_TEST) {
    jobQueue.push({
        type: 'level-screenshot',
        holdId: 'kddl1',
        levelGidIndex: 1
    })

    jobQueue.push({
        type: 'room-screenshot',
        holdId: 'kddl2',
        roomPid: '3:0:0',
    })

    jobQueue.push({
        type: 'validate-demo',
        holdId: 'kddl2',
        serializedDemo: 'BTQ6Mzo0GAAAABgAAAABAAAAJQAAAC1bMjAsNDIsMzksNDMsNDEsMjEsMiwxLDMsNCw5LDgsNiwxMiwxMywxNCwxNV3OBFsiMTowOjAiLCI3OjA6MCIsIjc6MTowIiwiNzoyOjAiLCI3OjM6MSIsIjc6MzowIiwiMToxOjEiLCIxOjA6MSIsIjE6LTE6MSIsIjE6MDoyIiwiMToyOjEiLCIxOjI6MCIsIjE6MzowIiwiMToxOjAiLCIxOjA6LTEiLCIxOi0xOjAiLCIxOi0yOjAiLCIxOi0yOi0xIiwiMTotMjoxIiwiMTotMTotMSIsIjE6MDotMiIsIjE6LTE6LTIiLCIxOi0yOi0yIiwiMTotMTotMyIsIjE6MTotMSIsIjE6MToyIiwiMToyOjIiLCIyOjA6MCIsIjI6LTE6MCIsIjI6LTI6MCIsIjI6LTM6MCIsIjI6MDoxIiwiMjowOi0xIiwiMjowOi0yIiwiMjowOi0zIiwiMjoxOjAiLCIyOjI6MCIsIjI6MzowIiwiMzowOjAiLCIzOjE6MCIsIjM6MToxIiwiMzoyOjEiLCIzOjE6MiIsIjM6MTotMSIsIjM6MTotMiIsIjM6MjotMiIsIjM6MjotMSIsIjM6MTotMyIsIjM6MDotMyIsIjM6MDotMSIsIjM6MDotMiIsIjM6LTE6LTEiLCIzOi0xOi0yIiwiMzowOjEiLCIzOi0xOjAiLCI0OjA6MCIsIjQ6MDoxIiwiNDoxOjEiLCI0OjE6MCIsIjQ6MDoyIiwiNDowOjMiLCI0Oi0xOjMiLCI0OjE6MyIsIjQ6MjozIiwiNDozOjMiLCI0OjM6MiIsIjQ6MjoyIiwiNDoyOjQiLCI0OjM6NSJd1gRbIjE6MDowIiwiNzowOjAiLCI3OjE6MCIsIjc6MjowIiwiNzozOjAiLCI3OjM6MSIsIjE6MDoxIiwiMToxOjEiLCIxOi0xOjEiLCIxOjA6MiIsIjE6MjoxIiwiMToyOjIiLCIxOjI6MCIsIjE6MzowIiwiMToxOjAiLCIxOjA6LTEiLCIxOi0xOjAiLCIxOi0yOjAiLCIxOi0yOi0xIiwiMTotMjoxIiwiMTotMTotMSIsIjE6LTE6LTIiLCIxOjA6LTIiLCIxOi0yOi0yIiwiMTotMTotMyIsIjE6MTotMSIsIjE6MToyIiwiMjowOjAiLCIyOi0xOjAiLCIyOi0yOjAiLCIyOi0zOjAiLCIyOjA6LTEiLCIyOjA6MSIsIjI6MDotMiIsIjI6MDotMyIsIjI6MTowIiwiMjoyOjAiLCIyOjM6MCIsIjM6MDowIiwiMzoxOjAiLCIzOjE6LTEiLCIzOjE6MSIsIjM6MjoxIiwiMzoxOjIiLCIzOjE6LTIiLCIzOjI6LTIiLCIzOjI6LTEiLCIzOjE6LTMiLCIzOjA6LTMiLCIzOjA6LTIiLCIzOjA6LTEiLCIzOi0xOi0xIiwiMzotMTotMiIsIjM6MDoxIiwiMzotMTowIiwiNDowOjAiLCI0OjA6MSIsIjQ6MToxIiwiNDoxOjAiLCI0OjA6MiIsIjQ6MDozIiwiNDotMTozIiwiNDoxOjMiLCI0OjI6MyIsIjQ6MzozIiwiNDozOjIiLCI0OjI6MiIsIjQ6Mjo0IiwiNDozOjQiLCI0OjM6NSJdAE8AAABPWzExLDExLDYsMywxMSwxLDEsMSwxLDEsMyw4LDEsMSwzLDgsMSwxLDEsMSw5LDcsNyw3LDcsNyw3LDEwLDcsNyw3LDgsNSwyLDgsNyw3XQ=='
    })
} else if (!SPIDER_URL) {
    console.log(chalk.bgRed("Spider URL not present in .env"));
    process.exit(1);

} else if (!SPIDER_PASS) {
    console.log(chalk.bgRed("Spider PASS not present in .env"));
    process.exit(1);
}

async function spider(): Promise<void> {
    const browser = await puppeteer.launch({
        headless: true
    });
    const page = await browser.newPage();
    page.on('console', msg => console.log(chalk.gray(`    [PAGE] ${msg.text()}`)));

    await page.goto('http://localhost:12399', { waitUntil: 'networkidle0' });

    console.log("Wait for init");
    await page.evaluate(() => {
        return (window as any).kddlApi.waitForInit();
    });
    console.log("Initialized");

    while (true) {
        if (!IS_TEST && jobQueue.length === 0) {
            await pollHoldNeeded(page);
        }

        const job = jobQueue.shift();

        if (job) {
            logTestRun();
            logJobStart(job);
            await runJob(job, page);

        } else if (IS_TEST) {
            console.log(chalk.bgGreen("TEST RUN FINISHED"));
            await browser.close();
            return;
        }

        await new Promise(resolve => setTimeout(resolve, 100));
    }
}

async function runJob(job: Job, page: Page) {
    switch (job.type) {
        case 'level-screenshot':
            await ensureHoldIsRunning(job.holdId, page);
            try {
                const levelPngHex = await invokeKddlApi(page, 'drawLevel', job.levelGidIndex);

                if (IS_TEST) {
                    await writeFile('level.png', Buffer.from(levelPngHex, 'hex'));
                    console.log(chalk.green("    level.png written to working directory"));
                }
                console.log(`    Received ${levelPngHex.length} bytes`);
                console.log(chalk.green("    Done!"));

            } catch (e) {
                logError(e);
            }

            break;

        case 'room-screenshot':
            await ensureHoldIsRunning(job.holdId, page);
            try {
                const roomPngHex = await invokeKddlApi(page, 'drawRoom', job.roomPid);

                if (IS_TEST) {
                    await writeFile('room.jpg', Buffer.from(roomPngHex, 'hex'));
                    console.log(chalk.green("    room.jpg written to working directory"));
                }
                console.log(`    Received ${roomPngHex.length} bytes`);
                console.log(chalk.green("    Done!"));

            } catch (e) {
                logError(e);
            }

            break;

        case 'validate-demo':
            await ensureHoldIsRunning(job.holdId, page);
            try {
                const result = await invokeKddlApi(page, 'testDemo', job.serializedDemo);

                console.log(chalk.green(`    Demos is valid, moves=${result}`));

            } catch (e: unknown) {
                logError(e);
            }

            break;
    }
}

async function ensureHoldIsRunning(holdId: string, page: Page) {
    await page.evaluate(holdId => {
        return (window as any).kddlApi.loadHold(holdId);
    }, holdId)
}

spider();

function logJobStart(job: Job) {
    const clonedJob: any = { ...job };

    for (const key in clonedJob) {
        const value = clonedJob[key];

        if (typeof value === 'string' && value.length > 32) {
            clonedJob[key] = value.substring(0, 8) + "..." + value.substring(value.length - 8) + ` (Length=${value.length})`;
        }
    }

    const jobType = clonedJob.type;
    delete clonedJob.type;

    const jobOptions = Object.entries(clonedJob).map(([key, value]) => `${key}=${value}`);
    console.log(chalk.bold.yellow(`Starting job ${jobType}: ${jobOptions.join(", ")}`));
}

function logError(error: unknown) {
    let message = String(error);
    if (error && typeof error === 'object' && 'message' in error) {
        message = String(error.message);
    }

    console.log(chalk.red(message));
}

function logTestRun() {
    if (IS_TEST) {
        console.log(chalk.bgYellowBright("#### THIS IS A TEST RUN ####"))
    }
}

function parseDotEnv() {
    const dotEnv = readFileSync(join(__dirname, '..', '.env'), 'utf-8').replace(/\r/g, '');

    for (const line of dotEnv.split("\n")) {
        const [key, value] = line.split("=");

        process.env[key] = value;
    }
}

async function pollHoldNeeded(page: Page) {
    console.log("Polling 'holdneeded'...");

    const data = await fetch(SPIDER_URL!, {
        method: 'POST',
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
            action: 'holdneeded',
            secret: SPIDER_PASS!,
            gameId: '3'
        }),
    })

    const forumHoldId = await data.text();
    console.log(`    Got: ${forumHoldId}`);
    if (forumHoldId) {
        const holdId = await getHoldId(forumHoldId);

        await ensureHoldIsRunning(holdId, page);

        const levelGidIndexes = await invokeKddlApi(page, 'getAllLevelGidIndexes');
        const roomPids = await invokeKddlApi(page, 'getAllRoomPids');

        console.log(roomPids);

        console.log(`    Queuing ${levelGidIndexes.length} level draw jobs`);
        console.log(`    Queuing ${roomPids.length} room draw jobs`);

        for (const levelGidIndex of levelGidIndexes) {
            jobQueue.push({ type: 'level-screenshot', holdId, levelGidIndex })
        }
        for (const roomPid of roomPids) {
            jobQueue.push({ type: 'room-screenshot', holdId, roomPid })
        }
        console.log(`    Jobs queued!`);
    }
}

async function getHoldId(forumHoldId: string) {
    const holdId = holdForumIdToHoldIdMap.get(forumHoldId);

    if (!holdId) {
        console.log(chalk.bgRed(`Fatal error: cannot identify hold with ID ${holdId}`));
        process.exit(1);
    }

    return holdId;
}

async function invokeKddlApi(page: Page, method: string, ...args:unknown[]) {
    try {
        return await page.evaluate((data: any) => {
            const [method, args] = data;
            return (window as any).kddlApi[method].apply(null, args);
        }, [method, args]);
    } catch (e) {
        logError(e);
        throw new Error(`Error when invoking kddlApi method '${method}'`);
    }
}