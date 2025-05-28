import puppeteer, { Browser, Page } from 'puppeteer';
import { SpiderLogger as Log } from './SpiderLogger';
import chalk from 'chalk';
import { HoldId } from 'src/C';



let gameUrl = '';
let browser: Browser | undefined = undefined;
let page: Page | undefined = undefined;

export const SpiderKddlApi = {
    async init(_gameUrl: string) {
        Log.info("Initializing KddlApi");

        gameUrl = _gameUrl;

        await Log.withIndent(async () => {
            await initPage();

            Log.trace("KddlApi initialized");
        });
    },

    async invoke(method: string, ...args: unknown[]) {
        if (page === undefined) {
            Log.error("Cannot invoke KddlApi because it has not been initialized yet")
            process.exit(1);
        }

        try {
            Log.debug(`KddlApi.${method}()`);

            const result = await page.evaluate(async (data: any) => {
                const [method, args] = data;
                return (window as any).kddlApi[method].apply(null, args);

            }, [method, args]);

            Log.debug(`KddlApi.${method}() -> Finished`);
            return result;

        } catch (e) {
            Log.error(e)
            throw new Error(`Error when invoking kddlApi method '${method}'`);
        }
    },

    async ensureHoldIsRunning(holdId: HoldId) {
        await SpiderKddlApi.invoke('loadHold', holdId);
    }
}


async function initPage() {
    if (browser) {
        Log.trace("Restarting browser");
        await browser.close();
    }

    browser = await puppeteer.launch({ headless: true });
    Log.trace("Browser launched");

    page = await browser.newPage();
    Log.trace("Page initialized");

    page.on('console', msg => Log.trace(chalk.gray(`    [PAGE] ${msg.text()}`)));

    await page.goto(gameUrl, { waitUntil: 'networkidle0' });
    Log.trace("Api page loaded");

    Log.debug("Waiting for KddlApi init")
    await SpiderKddlApi.invoke('waitForInit');

}