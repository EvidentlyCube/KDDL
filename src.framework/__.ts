import {RecamelLang} from "./net/retrocade/camel/RecamelLang";
import {UtilsString} from "./net/retrocade/utils/UtilsString";

const reportedKeys = new Set<string>();

export function __(text: string, ...rest: (string | number)[]): string {
	const trimmedText: string = UtilsString.trim(text);

	const key: string = trimmedText.charAt(0) +
		trimmedText.charAt(trimmedText.length / 2 | 0) +
		trimmedText.charAt(Math.max(trimmedText.length - 2, 0)) +
		trimmedText.charAt(Math.max(trimmedText.length - 1, 0)) +
		trimmedText.charCodeAt(trimmedText.length / 3) +
		trimmedText.length;

	let translation = RecamelLang.get(RecamelLang.selected, key, ...rest);

	if (translation == null || translation == "") {
		if (!reportedKeys.has(key)) {
			reportedKeys.add(key);
			console.error(key + "=" + text);
		}

		translation = RecamelLang.get('en', key, ...rest);
		if (translation == null || translation == "") {
			return text;
		}
	}

	return translation;
}


