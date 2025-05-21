import { BinaryReader } from "csharp-binary-stream";

export function set_addArray<T>(target: Set<T>, items: T[]|Set<T>) {
    items.forEach(item => target.add(item));
}

export function set_clearAndAdd<T>(source: Set<T>, target: Set<T>) {
    target.clear();
    set_addArray(target, source);
}

export function set_fromJson<T>(jsonString: string) {
    const json = JSON.parse(jsonString);

    const set = new Set<T>();
    if (Array.isArray(json)) {
        set_addArray(set, json);
    }

    return set;
}

export function set_toJson<T>(set: Set<T>) {
    return JSON.stringify(Array.from(set.values()));
}