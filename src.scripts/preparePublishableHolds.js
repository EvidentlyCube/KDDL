/**
 * Generate versions of holds where the root `<drod>` XML tag is replaced
 * with `<flashdrod>`
 */

import chalk from 'chalk';
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, join } from 'node:path';
import { deflateSync, inflateSync } from 'node:zlib';

(async () => {
    const __dirname = import.meta.dirname;
    const holdsPath = join(__dirname, '../src/../src.assets/level/');
    const files = readdirSync(holdsPath)
        .filter(path => path.toLocaleLowerCase().endsWith('.tss.hold'));

    for (const hold of files) {
        console.log(chalk.yellow("###### " + hold));

        const absolutePath = join(holdsPath, hold);
        const targetAbsolutePath = join(holdsPath, hold.replace(/.hold$/, '.kddl-publish.hold'));

        console.log(" - Loaded");
        let holdText = await getHoldXmlAsText(absolutePath);
        holdText = holdText.replace(/<drod/g, '<flashdrod');
        holdText = holdText.replace(/<\/drod/g, '</flashdrod');
        console.log(" - Updated");


        const encodedHoldXml = await holdToBuffer(holdText);
        writeFileSync(
            targetAbsolutePath,
            encodedHoldXml
        );
        console.log(` - Saved as ${basename(targetAbsolutePath)}`);

    }
})();


async function getHoldXmlAsText(holdPath) {
    // 1: READ FILE
    const holdBuffer = readFileSync(holdPath);
    const holdData = new Uint8Array(holdBuffer);

    // 2: DECODE FILE
    for (let i = 0; i < holdData.length; i++) {
        holdData[i] = holdData[i] ^ 0xFF;
    }

    // 3: DEFLATE FILE
    const holdDecoded = await inflate(holdData);

    // 4: Read binary to text
    return new TextDecoder().decode(holdDecoded);
}

async function holdToBuffer(holdXml) {
    const holdBytes = new TextEncoder('utf-8').encode(holdXml);
    const deflatedHold = deflateSync(holdBytes);
    const deflatedHoldArray = new Uint8Array(deflatedHold);

    // ENCODE FILE
    for (let i = 0; i < deflatedHoldArray.length; i++) {
        deflatedHoldArray[i] = deflatedHoldArray[i] ^ 0xFF;
    }

    return deflatedHoldArray;
}

async function inflate(holdData) {
    return inflateSync(holdData);
}