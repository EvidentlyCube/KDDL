import chalk from 'chalk';

export const SpiderLogger = {
    showInfo: true,
    showDebug: false,
    showTrace: false,
    indent: 0,

    init() {
        SpiderLogger.showDebug = process.argv.includes('-v') || process.argv.includes('-vv');
        SpiderLogger.showTrace = process.argv.includes('-vv');
    },
    error(error: unknown) {
        console.trace();

        if (error && error instanceof Error) {
            console.log(chalk.bgRed(`Error: ${error.message}`));
        } else {
            console.log(chalk.bgRed(`Error: ${String(error)}`));
        }
    },
    async catchError(callback: () => Promise<unknown>) {
        try {
            await callback();

        } catch (e) {
            SpiderLogger.error(e);
        }
    },
    async rethrowError<T>(callback: () => Promise<T>): Promise<T> {
        try {
            return await callback();

        } catch (e) {
            SpiderLogger.error(e);
            throw e;
        }
    },
    async withIndent<T>(callback: () => Promise<T>): Promise<T> {
        try {
            SpiderLogger.indent++;
            return await callback();

        } finally {
            SpiderLogger.indent--;
        }
    },
    warn(str: string) {
        SpiderLogger.info(chalk.bgYellow(str));
    },
    info(str: string) {
        console.log("    ".repeat(SpiderLogger.indent) + str);
    },
    debug(str: string) {
        if (SpiderLogger.showDebug) {
            SpiderLogger.info(str);
        }
    },
    trace(str: string) {
        if (SpiderLogger.showTrace) {
            SpiderLogger.info(str);
        }
    }
}