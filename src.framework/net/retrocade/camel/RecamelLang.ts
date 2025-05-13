import { parseMinimalYaml } from "src/utils/MicroYaml";
import {UtilsString} from "../utils/UtilsString";

export type ValidLanguage = "de" | 'en' | 'es' | 'fi' | 'fr' | 'nl' | 'pt' | 'ru' | 'pl';

const translations = new Map<ValidLanguage, Map<string, string>>();

export const RecamelLang = {
	initialize() {
		RecamelLang.defaultLanguage = 'en';
		translations.set('de', new Map());
		translations.set('en', new Map());
		translations.set('es', new Map());
		translations.set('fi', new Map());
		translations.set('fr', new Map());
		translations.set('nl', new Map());
		translations.set('pt', new Map());
		translations.set('ru', new Map());
		translations.set('pl', new Map());
	},
	defaultLanguage: 'en' as ValidLanguage,

	selected: 'en' as ValidLanguage,

	/**
	 * Sets a text localization
	 * @param lang Language of the localization
	 * @param key Key for this string
	 * @param text Text to be returned
	 */
	set(lang: ValidLanguage, key: string, text: string): void {
		translations.get(lang)?.set(key.toLowerCase(), text);
	},

	/**
	 * Returns a localized version of string lying under given key
	 * @param lang Language to use
	 * @param key Key of the string
	 * @param rest List of string to replace the "%%" characters
	 * @return Localized string
	 */
	get(lang: ValidLanguage | null, key: string, ...rest: (string | number)[]): string {
		if (lang == null) {
			lang = RecamelLang.defaultLanguage;
		}

		key = key.toLowerCase();

		const translation = translations.get(lang)?.get(key);
		if (translation) {
			return translation.replace(/%%/g, () => {
				return (rest.shift() ?? '%%').toString();
			});
		}

		return "";
	},

	/**
	 * Checks if a given key exists in the chosen language
	 * @param lang Language to use
	 * @param key Key of the string
	 * @return True if the key exists in the language
	 */
	has(lang: ValidLanguage | null, key: string): boolean {
		if (lang == null) {
			lang = RecamelLang.defaultLanguage;
		}

		key = key.toLowerCase();

		return translations.get(lang)?.has(key) ?? false;
	},

	/**
	 * Loads a language file
	 * @param fileString
	 * @param code Language code
	 */
	loadLanguageFile(fileString: string, code: ValidLanguage, isYaml: boolean): void {
		if (isYaml) {
			const data = parseMinimalYaml(fileString);
			for (const [key, value] of Object.entries(data)) {
				RecamelLang.set(code, key, value);
			}
			return;
		}

		fileString = fileString.replace(/(\x0D\x0A|\x0D)/gm, "\x0A");
		fileString = fileString.replace(/\/\/\/\/\x0A\x20*/gm, "\\n\\n");
		fileString = fileString.replace(/\/\/\/\x0A\x20*/gm, "\\n");
		fileString = fileString.replace(/\/\/\x0A\x20*/gm, " ");

		const lines = fileString.split("\x0A");

		let lineBreak: number;

		for (let line of lines) {
			const firstChar = line.charAt(0);
			if (firstChar == "#") {
				continue;
			}

			lineBreak = firstChar === '"'
				? line.indexOf('=', line.indexOf('"', 1))
				: line.indexOf('=');

			if (lineBreak === -1) {
				if (UtilsString.trim(line).length > 0) {
					console.error(`Language (${code}) parse error: ${line}`);
				}
				continue;
			}

			let name = line.substr(0, lineBreak);
			if (name.charAt(0) === '"' && name.charAt(name.length - 1) === '"') {
				name = name.substring(1, name.length - 1);
			}
			line = line.replace(/[\r\n]/g, '');
			line = line.replace(/\\n/g, "\n");
			line = line.replace(/\\t/g, "  ");

			RecamelLang.set(code, name, line.substr(lineBreak + 1));
		}
	},

	checkLangAgainstLang(sourceLang: ValidLanguage, checkedLang: ValidLanguage) {
		const missing: string[] = [];

		const languageRecords = translations.get(sourceLang)?.keys();
		if (languageRecords) {
			for (const key of languageRecords) {
				if (!RecamelLang.has(checkedLang, key)) {
					missing.push(key);
				}
			}
		}

		return missing;
	},

	parseRichTextCodes(text: string): string {
		return text
			.replace(/\[h\](.*?)\[\/h\]/g, '<font size="20">$1</font>')
			.replace(/\[b\](.*?)\[\/b\]/g, '<font weight="bold" size="18">$1</font>')
			.replace(/\[g\](.*?)\[\/g\]/g, '<font color="#444444">$1</font>')
	}
};
