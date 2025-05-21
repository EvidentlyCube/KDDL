import dbStorage from "local-db-storage";
import { S } from "src/S";

export class PermanentStoreSlot<T> {
    private static _slots = new Map<string, PermanentStoreSlot<unknown>>;

    public static async waitForAllSlotsInit() {
        return Promise.all(Object.values(this._slots.values()).map(slot => slot.waitForInit()));
    }

    public static exportAll(): string {
        return `KDDL-SAVE-V1.0\n` + Object.values(this._slots.values()).map(slot => {
            return slot.key + ":" + JSON.stringify(slot.value)
        }).join("\n");
    }

    public static async deleteKey(key: string) {
        return dbStorage.removeItem(key);
    }

    public static async importAll(save: string): Promise<boolean> {
        if (!save.startsWith("KDDL-SAVE-V1.0\n")) {
            return false;
        }

        const promises: Promise<unknown>[] = [];
        const rows = save.split("\n");

        for (const row of rows) {
            const colonIndex = row.indexOf(':');

            if (colonIndex === -1) {
                continue;
            }

            const key = row.substring(0, colonIndex);
            const value = row.substring(colonIndex + 1);

            const existingSlot = PermanentStoreSlot._slots.get(key) ?? new PermanentStoreSlot<any>(key, null);
            await existingSlot.waitForInit();
            existingSlot.write(value, false);
            promises.push(existingSlot.flush());
        }

        await Promise.all(promises);

        return true;
    }

    public readonly key: string;

    private _value: T;
    private _isLoaded = false;
    private _isReadOnly = false

    private _isSyncing = false;
    private _isSyncQueued = false;

    public constructor(key: string, defaultValue: T, isReadOnly = false) {
        this.key = key;
        this._value = defaultValue;
        this._isReadOnly = isReadOnly;

        this.load();

        if (PermanentStoreSlot._slots.has(key)) {
            throw new Error(`Non unique permanent store slot - ${key}`);
        }

        if (!this._isReadOnly) {
            PermanentStoreSlot._slots.set(key, this);
        }
    }

    public get value() {
        return this.read();
    }

    public set value(value: T) {
        this.write(value);
    }

    public read() {
        if (!this._isLoaded) {
            throw new Error(`Tried to access store slot '${this.key}' before it was loaded.`);
        }

        return this._value;
    }

    public write(value: T, flush = true) {
        if (this._value !== value) {
            this._value = value;

            if (flush) {
                this.flush();
            }
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
            this._value = await load(this.key, this._value);
        }
        this._isLoaded = true;
    }

    private async flush(): Promise<void> {
        if (S.isSpiderMode || this._isReadOnly) {
            return;
        }

        if (this._isSyncing) {
            this._isSyncQueued = true;
            return this.createFlushedPromise();
        }

        this._isSyncing = true;
        try {
            await dbStorage.setItem(this.key, JSON.stringify(this._value));
        } finally {
            this._isSyncing = false;
        }

        if (this._isSyncQueued) {
            this._isSyncQueued = false;
            return this.flush();
        }
    }

    private createFlushedPromise() {
        return new Promise<void>(resolve => {
            const interval = setInterval(() => {
                if (this._isSyncing || this._isSyncQueued) {
                    return;
                }

                clearInterval(interval);
                resolve();
            }, 10);
        })
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

