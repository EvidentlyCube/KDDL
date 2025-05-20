import { DROD } from "../global/DROD";


export class TWidgetVolumeMuter {
    public static init() {
        document.addEventListener('blur', () => TWidgetVolumeMuter.update());
        document.addEventListener('focus', () => TWidgetVolumeMuter.update());
        document.addEventListener('visibilitychange', () => TWidgetVolumeMuter.update());

        setInterval(() => this.update(), 50);
    }

    private static update() {
        DROD.nutkaLayerAll.volume = document.hidden || document.visibilityState === 'hidden'
            ? 0 : 1
    }
}