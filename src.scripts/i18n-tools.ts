import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { RecamelLang } from '../src.framework/net/retrocade/camel/RecamelLang';

const rootDir = dirname(import.meta.dirname)

switch (process.argv[2]) {
    case 'export-old-locale':
        if (!process.argv[3]) {
            console.error("language_code not provided");
            process.exit(1);
        }
        console.log(generateOldTranslationsCsv(process.argv[3]));
        break;

    case 'export-new-locale':
        if (!process.argv[3]) {
            console.error("language_code not provided");
            process.exit(1);
        }
        console.log(generateNewTranslationsCsv(process.argv[3]));
        break;

    case 'import-new-locale':
        if (!process.argv[3]) {
            console.error("language_code not provided");
            process.exit(1);
        }
        if (!process.argv[4]) {
            console.error("new_locale_csv_path not provided");
            process.exit(1);
        } else if (!existsSync(process.argv[4])) {
            console.error(`new_locale_csv_path (${process.argv[4]}) does not exist`);
            process.exit(1);
        }

        importNewLocale(process.argv[3], process.argv[4], process.argv.includes('--commit'));
        break;

    default:
        console.error("No action given");
        console.log("Supported actions:")
        console.log(`    export-old-locale language_code`)
        console.log(`    export-new-locale language_code`)
        console.log(`    import-new-locale language_code new_locale_csv_path`)

}

function generateOldTranslationsCsv(language: string) {
    const languageDir = join(rootDir, `src.assets/i18n/${language}`);
    const files = readdirSync(languageDir);

    const rows = [
        ["File Name", 'Old Key', 'Translation']
    ];

    for (const file of files) {
        const text = readFileSync(join(languageDir, file), 'utf-8');

        if (!file.endsWith('.txt')) {
            continue;
        }

        const parsed = RecamelLang.parseLanguageFile(text, 'en', false);
        for (const [key, value] of Object.entries(parsed)) {
            rows.push([file, key, value]);
        }
    }

    return arrayToCsv(rows);
}

function generateNewTranslationsCsv(language: string) {
    const languageDir = join(rootDir, `src.assets/i18n/${language}`);
    const files = readdirSync(languageDir);

    const rows = [
        ["File Name", 'Old Key', 'Translation']
    ];

    for (const file of files) {
        const text = readFileSync(join(languageDir, file), 'utf-8');

        if (!file.endsWith('.yml')) {
            continue;
        }

        const parsed = RecamelLang.parseLanguageFile(text, 'en', true);
        for (const [key, value] of Object.entries(parsed)) {
            rows.push([file, key, value]);
        }
    }

    return arrayToCsv(rows);
}

function importNewLocale(language: string, newTranslationsPath: string, isCommit: boolean) {
    if (language === 'en') {
        console.error("Unable to import new translations for English");
        process.exit(1);
    }

    const newTranslations = rowsToMap(csvToRows(readFileSync(newTranslationsPath, 'utf-8')));
    const existingTranslations = rowsToMap(csvToRows(generateNewTranslationsCsv(language)));
    const englishTranslations = rowsToMap(csvToRows(generateNewTranslationsCsv('en',)));

    const missingTranslations = [];
    const identicalTranslations = [];
    const redundantTranslations = [];

    const updatedFiles = [];
    for (const file of Object.keys(englishTranslations)) {
        let yml = readFileSync(join(rootDir, `src.assets/i18n/en`, file), 'utf-8');
        yml = yml.replace(/\r/g, "");

        let isFileUpdated = false;
        for (const [key, englishTranslation] of Object.entries(englishTranslations[file])) {
            const newTranslation = newTranslations[file]?.[key] ?? existingTranslations[file]?.[key];
            const existingTranslation = existingTranslations[file]?.[key];

            if (newTranslation && newTranslation === existingTranslation) {
                continue;

            } else if (newTranslation === englishTranslation) {
                identicalTranslations.push(`${file} -> ${key}`);

            } else if (newTranslation === undefined) {
                missingTranslations.push(`${file} -> ${key}`);
            }

            if (newTranslation !== englishTranslation) {
                console.log("# " + key)
                console.log(newTranslation);
                console.log(existingTranslation);
                console.log(englishTranslation);
                console.log("");
            }

            if (
                !existingTranslation
                || (newTranslation !== existingTranslation && existingTranslation !== englishTranslation)
            ) {
                yml = replaceKeyInPlace(yml, key, newTranslation ?? englishTranslation);
                isFileUpdated = true;
            }
        }

        if (isFileUpdated) {
            if (isCommit) {
                writeFileSync(join(rootDir, `src.assets/i18n`, language, file), yml, { encoding: 'utf-8'});
            }
            updatedFiles.push(file);
        }

        for (const key of Object.keys(newTranslations[file] ?? {})) {
            if (englishTranslations[file][key] === undefined) {
                redundantTranslations.push(`${file} -> ${key}`);
            }
        }
    }

    const logIssues = (items: string[], context: string) => {
        if (items.length === 0) {
            return;
        }

        console.log(`\x1b[41m${context}:\x1b[0m`);
        console.log(" - " + items.slice(0, 10).join("\n - "));
        if (items.length > 10) {
            console.log(` - (${items.length - 10} more item${items.length > 11 ? 's' : ''})`)
        }
    }

    logIssues(missingTranslations, 'Missing Translations');
    logIssues(identicalTranslations, 'Identical Translations');
    logIssues(redundantTranslations, 'Redundant Translations');

    console.log("")
    if (updatedFiles.length > 0) {
        console.log("The following files were updated:")
        console.log(" - " + updatedFiles.join("\n - "));
    } else {
        console.log("No files to update")
    }
    console.log("")

    if (!isCommit) {
        console.log("");
        console.log(`\x1b[41mCHANGES WERE NOT COMMITTED!\x1b[0m`);
        console.log("");
        console.log("Run with `--commit` flag to save the changes");
        console.log("");
    }
}

function replaceKeyInPlace(base: string, key: string, value: string) {
    const regexp = new RegExp(`^${escapeRegExp(key)}:(?:[^\n]*\n(?: +\S.*|\s*\n)*)?`, 'm');

    return base.replace(regexp, match => {
        return `${key}: |\n    ${value.replace(/\n/g, "\n    ")}\n`;
    })
}

function escapeRegExp(fragment: string) {
    return fragment.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

function rowsToMap(rows: string[][]): Record<string, Record<string, string>> {
    const fileToLocales: Record<string, Record<string, string>> = {};

    for (const row of rows.slice(1)) {
        const [file, key, value] = row;

        const locales = fileToLocales[file] ?? {};
        if (locales[key] !== undefined) {
            console.error(`Duplicate translation key ${key} for file ${file}`);
        }
        locales[key] = value;
        fileToLocales[file] = locales;
    }

    return fileToLocales;
}

function csvToRows(csv: string): string[][] {
    const rows = [];
    let row = [];
    let value = '';
    let inQuotes = false;
    let index = 0;

    while (index < csv.length) {
        const character = csv[index];

        if (inQuotes) {
            if (character === '"') {
                if (csv[index + 1] === '"') {
                    // Escaped quote, skip
                    value += '"';
                    index++;
                } else {
                    // End of cell
                    inQuotes = false;
                }
            } else {
                value += character;
            }

        } else {
            if (character === '"') {
                inQuotes = true;

            } else if (character === ',') {
                // End of cell
                row.push(value);
                value = '';

            } else if (character === '\n') {
                row.push(value);
                rows.push(row);
                row = [];
                value = '';

            } else if (character === '\r' && csv[index + 1] === '\n') {
                row.push(value);
                rows.push(row);
                row = [];
                value = '';
                index++;

            } else {
                value += character;
            }
        }

        index++;
    }

    if (value) {
        row.push(value);
    }
    if (row.length) {
        rows.push(row);
    }

    return rows;
}

function arrayToCsv(rows: string[][]) {
    return rows.map(csvRowToString).join("\r\n");
}

function csvRowToString(row: string[]) {
    return row.map(escapeCsvCell).join(",");
}

function escapeCsvCell(cell: string) {
    if (
        cell.includes('"')
        || cell.includes("'")
        || cell.includes(",")
        || cell.includes("\n")
        || cell.includes("\r")
    ) {
        return `"${cell.replace(/"/g, '""')}"`;
    } else {
        return cell;
    }
}