// Fix missing null characters in data name strings

import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { deflateSync, inflateSync } from 'node:zlib';

(async () => {
    const __dirname = import.meta.dirname;
    const holdsPath = join(__dirname, '../src/../src.assets/level/');
    const files = readdirSync(holdsPath)
        .filter(path => path.toLocaleLowerCase().endsWith('.tss.hold'));

    for (const hold of files) {
        const absolutePath = join(holdsPath, hold);
        const targetAbsolutePath = join(holdsPath, hold.replace(/.tss.hold$/, '.tss.hold'));

        let holdText = await getHoldXmlAsText(absolutePath);
        holdText = fixDataNames(holdText);
        holdText = updateLastDate(holdText);

        console.log("###### " + hold);

        const encodedHoldXml = await holdToBuffer(holdText);
        writeFileSync(
            targetAbsolutePath,
            encodedHoldXml
        )
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

function fixDataNames(holdText) {
    return holdText.replace(/(<Data.+?DataNameText=')(.+?)'/g, (_, data, name) => {
        return data
            + btoa(atob(name).replace(/\x00/g, '').replace(/\.og$/, ".ogg").split("").map(x => x + "\x00").join(""))
            + "'";
    })
}

function updateLastDate(holdText) {
    return holdText.replace(/(<Holds.+?LastUpdated=)'(.+?)'/, `$1'${(Date.now() / 1000).toFixed(0)}'`);
}
