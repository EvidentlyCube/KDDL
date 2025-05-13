import { Core } from "src/game/global/Core";
import { RecamelLang } from "./net/retrocade/camel/RecamelLang";
import RawInput from "src.tn/RawInput";

export function _(key: string, ...rest: (string | number)[]): string {
    let text = RecamelLang.get(RecamelLang.selected, key, ...rest);

    if (text == null || text == "") {
        console.error(key + "=???");

        text = RecamelLang.get('en', key, ...rest);
        if (text == null || text == "") {
            return key;
        }
    }

    return _keymapping(text);
}

export function _keymapping(text: string): string {
    return text.replace(/%keymap\.(.+?)%/g, (all, match) => {
        switch (match) {
            case 'all_moves':
                return [
                    RawInput.translateKeyName(Core.getKey("move_nw")),
                    RawInput.translateKeyName(Core.getKey("move_n")),
                    RawInput.translateKeyName(Core.getKey("move_ne")),
                    ' ',
                    RawInput.translateKeyName(Core.getKey("move_w")),
                    RawInput.translateKeyName(Core.getKey("wait")),
                    RawInput.translateKeyName(Core.getKey("move_e")),
                    ' ',
                    RawInput.translateKeyName(Core.getKey("move_sw")),
                    RawInput.translateKeyName(Core.getKey("move_s")),
                    RawInput.translateKeyName(Core.getKey("move_se")),
                ].join("");
            case 'move_nw':
            case 'move_n':
            case 'move_ne':
            case 'move_w':
            case 'move_e':
            case 'move_sw':
            case 'move_s':
            case 'move_se':
            case 'wait':
            case 'turn_cw':
            case 'turn_ccw':
            case 'undo':
            case 'restart':
            case 'battle':
            case 'lock':
                return RawInput.translateKeyName(Core.getKey(match));

            default:
                return all;
        }
    })
}

export function _r(key: string, replaces: Record<string, string | number> = {}): string {
    let text = _(key);

    return text.replace(/%(.*?)%/g, (_, match) => {
        if (match in replaces) {
            return String(replaces[match]);
        } else {
            return match;
        }
    })
}

export function _def(key: string, defaultValue: string): string {
    if (RecamelLang.has(RecamelLang.selected, key)) {
        return _(key);
    } else {
        console.error(`Missing translation key: ${key}`);
        return defaultValue;
    }
}

export function _has(key: string): boolean {
    return RecamelLang.has(RecamelLang.selected, key)
}