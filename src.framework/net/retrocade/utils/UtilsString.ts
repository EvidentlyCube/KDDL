export const UtilsString = {
	/**
	 * Counts the number of occurences of the needle in the haystack
	 *
	 * @param	haystack string to check against
	 * @param	needle string which is looked for
	 * @return number of occurences of needle in haystack
	 */
	count: (haystack: string, needle: string) => {
		if (haystack == null) {
			return 0;
		}

		const char = UtilsString.escapeRegex(needle);
		const flags = "ig";

		const result = haystack.match(new RegExp(char, flags));

		return (result ? result.length : 0);
	},

	/**
	 * Escapes all regexp characters, so that you can make a direct regexp search with this string
	 * without worrying about breaking anything.
	 * @param	pattern string to escape
	 * @return Escaped pattern
	 */
	escapeRegex: (pattern: string) => {
		return pattern.replace(/([\]\[{}()*+?.\\])/g, '\\$1');
	},

	/**
	 * Adds characters at the beginning of a string to make it at least as long as length. Useful for making 0001 types
	 * of strings. If the string is already longer than given length, nothing happens.
	 *
	 * @param string A string to be filled with trailing character
	 * @param length A target string length
	 * @param filler A characters to be added to the beginning of the string to make it at least long as length. Note,
	 *        that using a more than one character long string may result in the target string being longer than
	 *        specified length.
	 * @return A modified string
	 */
	padLeft: (string: string, length: number, filler: string = "0") => {
		while (string.length < length) {
			string = filler + string;
		}

		return string;
	},


	/**
	 * Repeats a string.
	 *
	 * @param string The string to be repeated.
	 * @param repeats number of time the input string should be repeated. If 0 function will return an empty string
	 * @param separator A separator to be placed in between each repetition, can be of any length
	 * @return The given string repeated "repeats" times, or an empty string if repeats was set to 0
	 */
	repeat: (string: string, repeats: number, separator: string = "") => {
		if (repeats == 0) {
			return "";
		}

		let result = string;

		while (--repeats > 0) {
			result += separator + string;
		}

		return result;
	},

	/**
	 * Adds or removes characters at the end of a string to make it as long as length.
	 *
	 * @param string A string to be filled with trailing character
	 * @param length A target string length
	 * @param filler A characters to be added to the end of the string to make it as long as length. Uses only the first character specified.
	 * @param trimRight If set to true, characters from the right will be removed if necessary
	 * @return A modified string
	 */
	resizeFromRight: (string: string, length: number, filler: string = " ", trimRight: boolean = true) => {
		filler = filler.charAt(0);

		while (string.length < length) {
			string = string + filler;
		}

		return trimRight ? string.substr(0, length) : string.substr(string.length - length, length);
	},


	/**
	 * Formats time into HH:MM:SS:MILS format
	 * @param	time Time, in millisecond, to format into string
	 * @param	h   Whether to display the hours
	 * @param	m   Whether to display the minutes
	 * @param	s   Whether to display the seconds
	 * @param	mls Whether to display the milliseconds
	 * @return A formatted string
	 */
	styleTime: (time: number, h: boolean = true, m: boolean = true, s: boolean = true, mls: boolean = true) => {
		let output: string = "";
		let mil = time % 1000;
		let sec: number;
		let min: number;
		let hou: number;

		time = (time - mil) / 1000;
		sec = time % 60;

		time = (time - sec) / 60;
		min = time % 60;

		time = (time - min) / 60;
		hou = time;

		if (!h) {
			min += hou * 60;

		} else {
			if (hou < 10) {
				output += "0";
			}
			output += hou.toString() + ":";
		}

		if (!m) {
			sec += min * 60;

		} else {
			if (min < 10) {
				output += "0";
			}
			output += min.toString() + ":";
		}

		if (!s) {
			mil += sec * 1000;

		} else {
			if (sec < 10) {
				output += "0";
			}
			output += sec.toString() + ":";
		}

		if (mls) {
			if (mil < 100) {
				output += "0";
			}
			if (mil < 10) {
				output += "0";
			}
			output += mil.toString() + ":";
		}

		return output.substr(0, output.length - 1);
	},

	trim: (string: string, trimmables: (number | string)[] | null = null, left: boolean = true, right: boolean = true) => {
		let i: number;

		if (!trimmables) {
			trimmables = [32, 9, 10, 13, 0, 11];

		} else {
			i = trimmables.length;
			while (i--) {
				const trimmable = trimmables[i];
				if (typeof trimmable === 'string') {
					trimmables[i] = trimmable.charCodeAt(0);
				}
			}
		}

		//Trim Left
		if (left) {
			while (trimmables.indexOf(string.charCodeAt(0)) > -1) {
				string = string.substr(1);
			}
		}

		//Trim Right
		if (right) {
			while (trimmables.indexOf(string.charCodeAt(string.length - 1)) > -1) {
				string = string.substr(0, string.length - 1);
			}
		}

		return string;
	},

	tableToFormattedString(table: string[][]): string {
		// Calculate table widths
		const maxWidths = table[0].map(() => 0);
		for (const row of table) {
			for (let i = 0; i < row.length; i++) {
				maxWidths[i] = Math.max(maxWidths[i], row[i].length);
			}
		}

		const newTable: string[][] = [];
		// Update cells to width
		for (const oldRow of table) {
			const row = [...oldRow];
			newTable.push(row);

			for (let i = 0; i < row.length; i++) {
				row[i] = row[i].padStart(maxWidths[i], " ");
			}
		}

		return newTable.map(row => row.join(" | ")).join("\n");
	}
}
