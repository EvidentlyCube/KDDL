import { RecamelCore } from "src.framework/net/retrocade/camel/core/RecamelCore";
import { HoldId } from "src/C";
import { TStatePreloader } from "src/game/states/TStatePreloader";
import { TStateTitle } from "src/game/states/TStateTitle";
import { S } from "src/S";

export const KddlApi = {
    async loadHold(holdId: HoldId): Promise<void> {
        const { currentState } = RecamelCore;
        if (currentState instanceof TStatePreloader) {
            const hold = S.allHoldOptions.find(hold => hold.id === holdId);

            if (!hold) {
                return;
            }

            currentState.handleGameStart(hold);
            await waitForState(TStateTitle);

        } else if (currentState instanceof TStateTitle) {
            currentState.API_changeHold();
            await waitForState(TStatePreloader);

            return this.loadHold(holdId);

        } else {
            TStateTitle.show();
            await waitForState(TStateTitle);

            return this.loadHold(holdId);
        }
    },
}

async function waitForState(stateType: any) {
    while (true) {
        if (RecamelCore.currentState instanceof stateType) {
            return;
        }

        await sleep();
    }
}

async function sleep(): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, 100));
}