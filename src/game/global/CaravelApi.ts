import { attr } from "src/XML";
import { VODemoRecord } from "../managers/VODemoRecord";
import { Level } from "./Level";
import { Progress } from "./Progress";
import { S } from "src/S";
import { DebugConsole } from "../DebugConsole";
import { RecamelCore } from "src.framework/net/retrocade/camel/core/RecamelCore";
import { TStateGame } from "../states/TStateGame";
import { Game } from "./Game";

const ApiUrl = "https://forum.caravelgames.com/flash/gameflash.php";

class CaravelApi_ {
    private _isLoggedIn = false;
    private _caravelNetName = "";
    private _caravelNetKey = "";

    public async init() {
        this._caravelNetName = window.localStorage.getItem('_caravel_net_name') ?? "";
        this._caravelNetKey = window.localStorage.getItem('_caravel_net_key') ?? "";

        if (this._caravelNetName && this._caravelNetKey) {
            try {
                await this.login(this._caravelNetName, this._caravelNetKey);
            } catch (e: unknown) {
                // Ignore
            }
        }
    }

    public async login(name: string, key: string) {
        try {
            const result = await fetch(ApiUrl, {
                method: 'POST',
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: new URLSearchParams({
                    action: 'Login',
                    UserName: name,
                    Key: key,
                }),
            })

            const responseText = await result.text();
            DebugConsole.appendLine("Got response, logging it into browser's console");
            console.log(responseText);

            const response = JSON.parse(responseText);

            if (response.success) {
                if (!response.newKey) {
                    throw new Error("Response is missing 'newKey' despite reporting success");
                }

                DebugConsole.appendLine('**Logged in!**')

                this._isLoggedIn = true;
                this._caravelNetName = name;
                this._caravelNetKey = String(response.newKey);
                window.localStorage.setItem('_caravel_net_name', this._caravelNetName);
                window.localStorage.setItem('_caravel_net_key', this._caravelNetKey);

            } else {
                DebugConsole.appendLine('Login failed.')
                throw new Error(response.error);
            }
        } catch (e: unknown) {
            this.forgetLogin();
            throw e;
        }
    }

    public forgetLogin() {
        this._isLoggedIn = false;
        this._caravelNetName = "";
        this._caravelNetKey = "";

        window.localStorage.removeItem('_caravel_net_name');
        window.localStorage.removeItem('_caravel_net_key');
    }

    public async submitScore(roomPid: null | string) {
        if (!roomPid) {
            return;
        }

        const POST: Record<string, string> = {};

        if (!this._isLoggedIn) {
            POST.action = "CheckScore";

        } else {
            POST.action = "UploadDemo";
            POST.UserName = this._caravelNetName;
            POST.Key = this._caravelNetKey;
        }

        const roomPos = Level.getRoomOffsetInLevel(roomPid);
        const levelId = Level.getLevelIdByRoomPid(roomPid);
        const demo = Progress.getRoomDemo(roomPid);
        const serializedDemo = demo.serialize();

        if (!demo.hasScore) {
            return;
        }

        POST.demo = serializedDemo;
        POST.moveCount = demo.score.toString();
        POST.roomX = roomPos.x.toString();
        POST.roomY = roomPos.y.toString();
        POST.levelIndex = Level.getLevelGidIndex(levelId).toString();

        // if (enteredRoomPid) {
        //     const roomPos = Level.getRoomOffsetInLevel(enteredRoomPid);
        //     const levelId = Level.getLevelIdByRoomPid(enteredRoomPid);

        //     submissions.push({
        //         roomX: roomPos.x,
        //         roomY: roomPos.y,
        //         levelIndex: Level.getLevelGidIndex(levelId)
        //     })
        // }

        POST.holdCreated = attr(Level.getHoldXml(), 'GID_Created');
        POST.holdUpdated = attr(Level.getHoldXml(), 'LastUpdated');
        POST.holdPlayerID = attr(Level.getHoldXml(), 'GID_PlayerID');
        POST.Version = S.EngineVersion;

        const result = await fetch(ApiUrl, {
            method: 'POST',
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams(POST),
        });

        console.log(await result.text());

        // Log.var_dump(allData, false, 2);
        // _submitScoreLoader = new QuickURLLoader(API_URL, allData, submitScoreSuccess, submitScoreFailure);
        // _submitScoreLoader.metaData = roomID;
    }
}

let instance: CaravelApi_;

export function CaravelApi() {
    if (!instance) {
        instance = new CaravelApi_();
    }

    return instance;
}

DebugConsole.registerAction('cnet-login', "Call with Username and Key to login, call with no arguments to log out. Login details are stored in local storage", async args => {
    if (args.length === 0) {
        CaravelApi().forgetLogin();
        DebugConsole.appendLine("CaravelNet login details have been removed.");

    } else if (args.length === 2) {
        await CaravelApi().login(args[0], args[1]);

    } else {
        throw new Error(`Expected exactly 0 or 2 arguments but got ${args.length} instead`);
    }
});

DebugConsole.registerAction('cnet-submit-current-room', "Submit current room's demo to CNet", async () => {
    const state = RecamelCore.currentState;

    if (!(state instanceof TStateGame)) {
        throw new Error("Not in-game right now");
    }

    const roomPid = Game.room.roomPid;

    await CaravelApi().submitScore(roomPid);
})