import puppeteer, { Page } from 'puppeteer';
import chalk from 'chalk';
import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';

interface ActionLevelScreenshot {
    type: 'level-screenshot';
    holdId: string;
    levelGidIndex: number;
}

interface ActionRoomScreenshot {
    type: 'room-screenshot';
    holdId: string;
    levelGidIndex: number;
    coordinates: { x: number, y: number };
}

interface ActionValidateDemo {
    type: 'validate-demo';
    holdId: string;
    serializedDemo: string;
}

type Action = ActionLevelScreenshot | ActionRoomScreenshot | ActionValidateDemo;

const actionQueue: Action[] = [];

const IS_TEST = process.argv.includes('--test');

logTestRun();
if (IS_TEST) {
    actionQueue.push({
        type: 'level-screenshot',
        holdId: 'kddl1',
        levelGidIndex: 1
    })

    actionQueue.push({
        type: 'room-screenshot',
        holdId: 'kddl2',
        levelGidIndex: 3,
        coordinates: { x: 0, y: 0 },
    })

    actionQueue.push({
        type: 'validate-demo',
        holdId: 'kddl2',
        serializedDemo: 'BTQ6Mzo0GAAAABgAAAABAAAAJQAAAC1bMjAsNDIsMzksNDMsNDEsMjEsMiwxLDMsNCw5LDgsNiwxMiwxMywxNCwxNV3OBFsiMTowOjAiLCI3OjA6MCIsIjc6MTowIiwiNzoyOjAiLCI3OjM6MSIsIjc6MzowIiwiMToxOjEiLCIxOjA6MSIsIjE6LTE6MSIsIjE6MDoyIiwiMToyOjEiLCIxOjI6MCIsIjE6MzowIiwiMToxOjAiLCIxOjA6LTEiLCIxOi0xOjAiLCIxOi0yOjAiLCIxOi0yOi0xIiwiMTotMjoxIiwiMTotMTotMSIsIjE6MDotMiIsIjE6LTE6LTIiLCIxOi0yOi0yIiwiMTotMTotMyIsIjE6MTotMSIsIjE6MToyIiwiMToyOjIiLCIyOjA6MCIsIjI6LTE6MCIsIjI6LTI6MCIsIjI6LTM6MCIsIjI6MDoxIiwiMjowOi0xIiwiMjowOi0yIiwiMjowOi0zIiwiMjoxOjAiLCIyOjI6MCIsIjI6MzowIiwiMzowOjAiLCIzOjE6MCIsIjM6MToxIiwiMzoyOjEiLCIzOjE6MiIsIjM6MTotMSIsIjM6MTotMiIsIjM6MjotMiIsIjM6MjotMSIsIjM6MTotMyIsIjM6MDotMyIsIjM6MDotMSIsIjM6MDotMiIsIjM6LTE6LTEiLCIzOi0xOi0yIiwiMzowOjEiLCIzOi0xOjAiLCI0OjA6MCIsIjQ6MDoxIiwiNDoxOjEiLCI0OjE6MCIsIjQ6MDoyIiwiNDowOjMiLCI0Oi0xOjMiLCI0OjE6MyIsIjQ6MjozIiwiNDozOjMiLCI0OjM6MiIsIjQ6MjoyIiwiNDoyOjQiLCI0OjM6NSJd1gRbIjE6MDowIiwiNzowOjAiLCI3OjE6MCIsIjc6MjowIiwiNzozOjAiLCI3OjM6MSIsIjE6MDoxIiwiMToxOjEiLCIxOi0xOjEiLCIxOjA6MiIsIjE6MjoxIiwiMToyOjIiLCIxOjI6MCIsIjE6MzowIiwiMToxOjAiLCIxOjA6LTEiLCIxOi0xOjAiLCIxOi0yOjAiLCIxOi0yOi0xIiwiMTotMjoxIiwiMTotMTotMSIsIjE6LTE6LTIiLCIxOjA6LTIiLCIxOi0yOi0yIiwiMTotMTotMyIsIjE6MTotMSIsIjE6MToyIiwiMjowOjAiLCIyOi0xOjAiLCIyOi0yOjAiLCIyOi0zOjAiLCIyOjA6LTEiLCIyOjA6MSIsIjI6MDotMiIsIjI6MDotMyIsIjI6MTowIiwiMjoyOjAiLCIyOjM6MCIsIjM6MDowIiwiMzoxOjAiLCIzOjE6LTEiLCIzOjE6MSIsIjM6MjoxIiwiMzoxOjIiLCIzOjE6LTIiLCIzOjI6LTIiLCIzOjI6LTEiLCIzOjE6LTMiLCIzOjA6LTMiLCIzOjA6LTIiLCIzOjA6LTEiLCIzOi0xOi0xIiwiMzotMTotMiIsIjM6MDoxIiwiMzotMTowIiwiNDowOjAiLCI0OjA6MSIsIjQ6MToxIiwiNDoxOjAiLCI0OjA6MiIsIjQ6MDozIiwiNDotMTozIiwiNDoxOjMiLCI0OjI6MyIsIjQ6MzozIiwiNDozOjIiLCI0OjI6MiIsIjQ6Mjo0IiwiNDozOjQiLCI0OjM6NSJdAE8AAABPWzExLDExLDYsMywxMSwxLDEsMSwxLDEsMyw4LDEsMSwzLDgsMSwxLDEsMSw5LDcsNyw3LDcsNyw3LDEwLDcsNyw3LDgsNSwyLDgsNyw3XQ=='
    })
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
        const action = actionQueue.shift();

        if (action) {
            logTestRun();
            logActionStart(action);
            await runAction(action, page);

        } else if (IS_TEST) {
            console.log(chalk.bgGreen("TEST RUN FINISHED"));
            await browser.close();
            return;
        }

        await new Promise(resolve => setTimeout(resolve, 100));
    }
}

async function runAction(action: Action, page: Page) {
    switch (action.type) {
        case 'level-screenshot':
            await ensureHoldIsRunning(action.holdId, page);
            try {
                const levelPngHex = await page.evaluate(levelGidIndex => {
                    return (window as any).kddlApi.drawLevel(levelGidIndex);
                }, action.levelGidIndex);

                if (IS_TEST) {
                    await writeFile('level.png', Buffer.from(levelPngHex, 'hex'));
                    console.log(chalk.green("    level.png written to working directory"));
                }
                console.log(chalk.green("    Done!"));

            } catch (e) {
                logError(e);
            }

            break;

        case 'room-screenshot':
            await ensureHoldIsRunning(action.holdId, page);
            try {
                const roomPngHex = await page.evaluate(({ levelGidIndex, coordinates }) => {
                    return (window as any).kddlApi.drawRoom(levelGidIndex, coordinates.x, coordinates.y);
                }, action);

                if (IS_TEST) {
                    await writeFile('room.png', Buffer.from(roomPngHex, 'hex'));
                    console.log(chalk.green("    room.png written to working directory"));
                }
                console.log(chalk.green("    Done!"));

            } catch (e) {
                logError(e);
            }

            break;

        case 'validate-demo':
            await ensureHoldIsRunning(action.holdId, page);
            try {
                const result = await page.evaluate(serializedDemo => {
                    return (window as any).kddlApi.testDemo(serializedDemo);
                }, action.serializedDemo);

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

function logActionStart(action: Action) {
    const clonedAction: any = { ...action };

    for (const key in clonedAction) {
        const value = clonedAction[key];

        if (typeof value === 'string' && value.length > 32) {
            clonedAction[key] = value.substring(0, 8) + "..." + value.substring(value.length - 8) + ` (Length=${value.length})`;
        }
    }

    const actionType = clonedAction.type;
    delete clonedAction.type;

    const actionOptions = Object.entries(clonedAction).map(([key, value]) => `${key}=${value}`);
    console.log(chalk.bold.yellow(`Starting action ${actionType}: ${actionOptions.join(", ")}`));
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