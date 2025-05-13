/**
 * Retrieves the localization of text in the current language
 * @param key Key of the string
 * @param rest List of paramteres to supplement in the string
 */
import {RecamelLang} from "./net/retrocade/camel/RecamelLang";

export function _n(key: string, ...rest: (string | number)[]): number {
	let text = RecamelLang.get(RecamelLang.selected, key, ...rest);

	if (text == null || text == "") {
		console.error(key + "=???");

		text = RecamelLang.get('en', key, ...rest);
		if (text == null || text == "") {
			return 0;
		}
	}

	return parseFloat(text);
}
