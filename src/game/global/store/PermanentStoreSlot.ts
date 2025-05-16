import dbStorage from "local-db-storage";
import { S } from "src/S";

export class PermanentStoreSlot<T> {
    private static _slots: PermanentStoreSlot<unknown>[] = [];

    public static async waitForAllSlotsInit() {
        return Promise.all(this._slots.map(slot => slot.waitForInit()));
    }

    public static exportAll(): string {
        return `KDDL-SAVE-V1.0\n` + PermanentStoreSlot._slots.map(slot => {
            return slot._key + ":" + JSON.stringify(slot.value)
        }).join("\n");
    }

    public static importAll(save: string): boolean {
        if (!save.startsWith("KDDL-SAVE-V1.0\n")) {
            return false;
        }

        const rows = save.split("\n");
        const saveMap = new Map<string, string>();

        for (const row of rows) {
            const colonIndex = row.indexOf(':');

            if (colonIndex === -1) {
                continue;
            }

            const key = row.substring(0, colonIndex);
            const value = row.substring(colonIndex + 1);

            saveMap.set(key, value);
        }

        for (const slot of PermanentStoreSlot._slots) {
            const savedValue = saveMap.get(slot._key);

            if (savedValue !== undefined) {
                slot.value = JSON.parse(savedValue);
            }
        }

        return true;
    }

    private _value: T;
    private readonly _key: string;
    private _isLoaded = false;

    private _isSyncing = false;
    private _isSyncQueued = false;

    public constructor(key: string, defaultValue: T) {
        this._key = key;
        this._value = defaultValue;

        this.load();

        if (PermanentStoreSlot._slots.find(slot => slot._key === key)) {
            throw new Error(`Non unique permanent store slot - ${key}`);
        }

        PermanentStoreSlot._slots.push(this);
    }

    public get value() {
        return this.read();
    }

    public set value(value: T) {
        this.write(value);
    }

    public read() {
        if (!this._isLoaded) {
            throw new Error(`Tried to access store slot '${this._key}' before it was loaded.`);
        }

        return this._value;
    }

    public write(value: T) {
        if (this._value !== value) {
            this._value = value;
            this.flush();
        }
    }

    public async waitForInit() {
        return new Promise<void>(resolve => {
            const callback = () => {
                if (this._isLoaded) {
                    resolve();
                } else {
                    setTimeout(callback, 30);
                }
            }

            callback();
        })
    }

    private async load() {
        if (!S.isSpiderMode) {
            this._value = await load(this._key, this._value);
        }
        this._isLoaded = true;
    }

    private async flush() {
        if (S.isSpiderMode) {
            return;
        }

        if (this._isSyncing) {
            this._isSyncQueued = true;
            return;
        }

        this._isSyncing = true;
        try {
            await dbStorage.setItem(this._key, JSON.stringify(this._value));
        } finally {
            this._isSyncing = false;
        }

        if (this._isSyncQueued) {
            this._isSyncQueued = false;
            this.flush();
        }

    }
}


async function load<T>(key: string, def: T): Promise<T> {
    const data = await dbStorage.getItem<string>(key);

    if (!data) {
        return def;
    }

    try {
        return JSON.parse(data);

    } catch (e) {
        return def;
    }
}

