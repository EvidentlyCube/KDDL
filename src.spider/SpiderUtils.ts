import { readFileSync } from 'node:fs';
import { HoldId } from "src/C";
import { SpiderLogger as Log } from "./SpiderLogger";
import { join } from 'node:path';
import chalk from 'chalk';

const __dirname: string = (import.meta as any).dirname;

export const SpiderUtils = {
    ForumHoldIdToHoldIdMap: new Map<string, HoldId>([
        ['819', HoldId.KDDL1],
    ]),

    getHoldId(forumHoldId: string) {
        const holdId = SpiderUtils.ForumHoldIdToHoldIdMap.get(forumHoldId);

        if (!holdId) {
            Log.error(`Cannot identify hold with ID ${forumHoldId}`);
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

    arrayGroupBy<TItem, TKey extends keyof TItem>(array: TItem, prop: TKey): Record<string, TItem[]> {
        const result: Record<string, TItem[]> = {};

        for (const item of array as unknown as TItem[]) {
            const key = String(item[prop]);
            if (!result[key]) {
                result[key] = [];
            }
            result[key].push(item);
        }

        return result;
    }
}
