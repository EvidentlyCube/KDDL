import { TWindowPause } from "../windows/TWindowPause";

export const HelpRoomOpener = {
    enabled: false,
    register() {
        document.addEventListener('keydown', e => {
            if (e.key === 'F2' && HelpRoomOpener.enabled) {
                TWindowPause.clickHelpRoom();
            }
        })
    },
}