type YamlValue = string;
type YamlObject = Record<string, YamlValue>;

export function parseMinimalYaml(input: string): YamlObject {
	const lines = input.split(/\r?\n/);
	const result: YamlObject = {};

	let currentKey: string | null = null;
	let blockScalarMode: false | 'spaces' | 'newlines' = false;
	let blockLines: string[] = [];

	const flushBlock = () => {
		if (currentKey !== null) {
			if (blockScalarMode === 'spaces') {
				const joined = blockLines
					.join("\n")
					.replace(/\\n/g, "\n")
					.replace(/\\t/g, "  ")
					.replace(/(\n)+/g, m => m.length === 1 ? " " : "\n".repeat(m.length - 1));

				result[currentKey] = joined.trim();
			} else if (blockScalarMode === 'newlines') {
				const joined = blockLines
					.join("\n")
					.replace(/\\n/g, "\n")
					.replace(/\\t/g, "  ")
					.replace(/\\\n/g, "");


				result[currentKey] = joined.trim();
			}
		}
		blockScalarMode = false;
		blockLines = [];
		currentKey = null;
	};

	for (let rawLine of lines) {
		const line = rawLine.trim();

		if (blockScalarMode) {
			if (/^\S/.test(rawLine) && rawLine.length > 0) {
				flushBlock();
			} else {
				blockLines.push(rawLine.trim());
				continue;
			}
		}

		if (line === '' || /^\s*#/.test(line)) {
			continue;
		}

		const match = /^([\w\-\.]+):(?:\s*(.*))?$/.exec(line);
		if (match) {
			const [, key, value] = match;
			if (value?.startsWith('>')) {
				currentKey = key;
				blockScalarMode = 'spaces';
				blockLines = [];

			} else if (value?.startsWith('|')) {
				currentKey = key;
				blockScalarMode = 'newlines';
				blockLines = [];

			} else if (value?.startsWith('"') || value?.startsWith("'")) {
				result[key] = value.substring(1, value.length - 1);

			} else {
				result[key] = value ?? '';
			}
		} else if (blockScalarMode) {
			blockLines.push(rawLine.trim());
		}
	}

	if (blockScalarMode) {
		flushBlock();
	}

	return result;
}