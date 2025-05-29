import { SpiderLogger as Log } from "../src.spider/SpiderLogger";
import { SpiderUtils as Utils } from "../src.spider/SpiderUtils";
import { SpiderCaravelNetApi as CaravelNetApi } from "../src.spider/SpiderCaravelNetApi";
import { SpiderKddlApi } from "../src.spider/SpiderKddlApi";

start();

async function start() {
    Log.init();

    Log.info("Initializing spider");

    await Log.withIndent(async () => {
        Log.trace("Parsing .env file")
        const env = Utils.parseDotEnv();

        Log.trace("Loading .env values")

        await CaravelNetApi.init(env.SPIDER_API_URL, env.SPIDER_FETCH_DEMOS_URL, env.SPIDER_PASS);
        await SpiderKddlApi.init(env.KDDL_API_URL ?? 'http://localhost:12399')
    });

    CaravelNetApi.loop();
}
