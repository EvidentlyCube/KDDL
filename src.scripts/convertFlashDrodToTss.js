// Convert all holds from the reduced-room-size TCB-esque format to normal TCB hold that can be imported into DROD

import { readdirSync, readFileSync, writeFileSync, unlinkSync } from 'node:fs';
import { join } from 'node:path';
import { deflateSync, Inflate, inflateRawSync, inflateSync } from 'node:zlib';
import { BinaryReader, BinaryWriter } from "csharp-binary-stream";
import { execFile, execFileSync } from 'node:child_process';

(async () => {
    const __dirname = import.meta.dirname;
    const holdsPath = join(__dirname, '../src/../src.assets/level/');
    const files = readdirSync(holdsPath)
        .filter(path => path.toLocaleLowerCase().endsWith('.hold'))
        .filter(path => !path.toLocaleLowerCase().endsWith('.new.hold'))
        .filter(path => !path.toLocaleLowerCase().endsWith('.tss.hold'));

    for (const hold of files) {
        const absolutePath = join(holdsPath, hold);
        const targetAbsolutePath = join(holdsPath, hold.replace(/.hold$/, '.new.hold'));

        let holdText = await getHoldXmlAsText(absolutePath);
        holdText = holdText.replace(/flashdrod/g, 'drod');
        holdText = fixColsAndRows(holdText);
        holdText = fixSquares(holdText);
        holdText = fixTileLights(holdText);
        holdText = fixVersion(holdText);
        holdText = fixPlayer(holdText);
        holdText = await fixMp3Files(holdText);
        // shortLog(holdText);

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

function decodeString(str) {
    const buffer = Buffer.from(str, 'base64');
    const arr = new Uint8Array(buffer);

    return Array.from(arr).filter(x => x).map(x => String.fromCharCode(x)).join("");
}

function decodeBuffer(str) {
    const buffer = Buffer.from(str, 'base64');
    return new Uint8Array(buffer);
}

function fixColsAndRows(holdText) {
    return holdText
        .replace(/RoomCols='.*?'/g, "RoomCols='38'")
        .replace(/RoomRows='.*?'/g, "RoomRows='32'");
}

function fixMp3Files(holdText) {
    return replaceAsync(holdText, /<Data.+?>/g, async (dataString) => {
        const attributesMatches = dataString.match(/\s([a-zA-Z]+)='(.+?)'/g);
        const attrs = {};
        for (const attribute of attributesMatches) {
            const [, name, value] = attribute.trim().match(/([a-zA-Z]+)='(.+?)'/);
            attrs[name] = value;
        }

        if (decodeString(attrs.DataNameText).toLowerCase().endsWith('.mp3')) {
            const data = decodeBuffer(attrs.RawData);
            const fileName = decodeString(attrs.DataNameText);
            const tempMp3Path = `/tmp/${fileName}`;
            const tempOggPath = `/tmp/${fileName.replace('.mp3', '.ogg')}`;

            // Write MP3 to temp file
            writeFileSync(tempMp3Path, data);

            try {
                // Convert to OGG using ffmpeg
                execFileSync('ffmpeg', [
                    '-i', tempMp3Path,
                    '-c:a', 'libvorbis',
                    '-q:a', '4',
                    tempOggPath
                ], { stdio: 'ignore' });

                // Read the OGG file and update attributes
                const oggData = readFileSync(tempOggPath);
                attrs.RawData = oggData.toString('base64');
                attrs.DataNameText = Buffer.from(fileName.replace('.mp3', '.ogg').split('').map(x => x + "\x00").join("")).toString('base64');
            } finally {
                // Cleanup temp files
                try {
                    unlinkSync(tempMp3Path);
                    unlinkSync(tempOggPath);
                } catch (e) {
                    console.error('Failed to cleanup temp files:', e);
                }
            }
        }

        const out = '<Data '
            + Object.entries(attrs).map(([name, value]) => `${name}='${value}'`).join(' ')
            + '/>';

        return out;
    });
}

function fixTileLights(holdText) {
    return holdText.replace(/TileLights='.+?'/g, `TileLights='Bf8AAP8AAP8AAP8AAMQAAA=='`);
}

function fixPlayer(holdText) {
    return holdText.replace(
        /<Players.+?>/,
        `<Players GID_OriginalNameMessage='QwBhAHIAYQB2AGUAbAAgAEcAYQBtAGUAcwAgAEMAbwBtAG0AdQBuAGkAdAB5ACAAKABLAEQARAAgAEwAaQB0AGUAKQA=' GID_Created='1745425357' LastUpdated='0' NameMessage='QwBhAHIAYQB2AGUAbAAgAEcAYQBtAGUAcwAgAEMAbwBtAG0AdQBuAGkAdAB5ACAAKABLAEQARAAgAEwAaQB0AGUAKQA=' ForumName='0' ForumPassword='0' IsLocal='0' PlayerID='10001'/>`
    );
}

function fixVersion(holdText) {
    return holdText.replace(/Version='.+?'/g, "Version='304'");
}

function fixSquares(holdText) {
    return holdText.replace(/Squares='(.+?)'/g, (match, squares) => {
        const W = 27;
        // const W = 38;
        const H = 25;
        // const H = 32;
        const LAYER_O = getArr(59);
        const LAYER_F = getArr(0);
        const LAYER_T = getArr(0);
        const LAYER_T_PARAM = getArr(0);

        const reader = new BinaryReader(decodeBuffer(squares));
        reader.readByte(); // Read and ignore version

        { // READ SQUARES
            let tile = 0;
            let count = 0;
            for (let i = 0; i < W * H; i++) {
                if (!count) {
                    count = reader.readByte();
                    tile = reader.readByte();
                }

                LAYER_O[i / W | 0][i % W] = tile;
                count--;
            }

            tile = 0;
            count = 0;
            for (let i = 0; i < W * H; i++) {
                if (!count) {
                    count = reader.readByte();
                    tile = reader.readByte();
                }

                LAYER_F[i / W | 0][i % W] = tile;
                count--;
            }

            tile = 0;
            count = 0;
            let tileParam = 0;
            for (let i = 0; i < W * H; i++) {
                if (!count) {
                    count = reader.readByte();
                    tile = reader.readByte();
                    tileParam = reader.readByte(); // Ignored param
                }

                LAYER_T[i / W | 0][i % W] = tile;
                LAYER_T_PARAM[i / W | 0][i % W] = tileParam;
                count--;
            }
        }

        // console.log("");
        // console.log(LAYER_T.map(x => x.map(x => x.toString(16).padStart(2, '0')).join(' ')).join("\n"));

        const writer = new BinaryWriter();
        writer.writeByte(5);

        {	// WRITE NEW SQUARES
            let count = 0;
            let square = 0;
            let lastSquare = LAYER_O[0][0];
            for (let y = 0; y < 32; y++) {
                for (let x = 0; x < 38; x++) {
                    square = LAYER_O[y][x];
                    ASSERT(square > 0);
                    ASSERT(square < 89);

                    if (lastSquare === square && count < 255) {
                        count++;
                    } else {
                        ASSERT(count > 0);
                        writer.writeByte(count);
                        writer.writeByte(lastSquare);

                        lastSquare = square;
                        count = 1;
                    }
                }
            }
            ASSERT(count > 0);
            writer.writeByte(count);
            writer.writeByte(square);

            count = 0;
            lastSquare = LAYER_F[0][0];
            for (let y = 0; y < 32; y++) {
                for (let x = 0; x < 38; x++) {
                    square = LAYER_F[y][x];
                    ASSERT(square >= 0);
                    ASSERT(square < 89);

                    if (lastSquare === square && count < 255) {
                        count++;
                    } else {
                        ASSERT(count > 0);
                        writer.writeByte(count);
                        writer.writeByte(lastSquare);

                        lastSquare = square;
                        count = 1;
                    }
                }
            }
            ASSERT(count > 0);
            writer.writeByte(count);
            writer.writeByte(square);

            count = 0;
            lastSquare = LAYER_T[0][0];
            let tileParam = 0;
            let lastTileParam = LAYER_T_PARAM[0][0]
            for (let y = 0; y < 32; y++) {
                for (let x = 0; x < 38; x++) {
                    square = LAYER_T[y][x];
                    tileParam = LAYER_T_PARAM[y][x];
                    ASSERT(square >= 0);

                    if (lastSquare === square && lastTileParam === tileParam && count < 255) {
                        count++;
                    } else {
                        ASSERT(count > 0);
                        writer.writeByte(count);
                        writer.writeByte(lastSquare);
                        writer.writeByte(lastTileParam);

                        lastSquare = square;
                        lastTileParam = tileParam
                        count = 1;
                    }
                }
            }
            ASSERT(count > 0);
            writer.writeByte(count);
            writer.writeByte(square);
            writer.writeByte(tileParam);
        }

        // console.log(writer.length);
        return `Squares='${Buffer.from(writer.toUint8Array()).toString('base64')}'`
    })
}

function getArr(value) {
    const arr = [];
    for (let y = 0; y < 32; y++) {
        arr[y] = [];
        for (let x = 0; x < 38; x++) {
            arr[y][x] = value;
        }
    }

    return arr;
}

function shortLog(holdText) {
    holdText = holdText.replace(/(RawData|Squares|ExtraVars)='(.*?)'/g, (_, attribute, value) => {
        return `${attribute}='[${value.length} bytes]'`;
    });
    holdText = holdText.replace(/<Orbs[\s\S]+?<\/Orbs>/g, '');
    holdText = holdText.replace(/<Monsters[\s\S]+?<\/Monsters>/g, '');
    holdText = holdText.replace(/<(Monsters|Checkpoints|Exits|Speech|Data|Vars|Entrances|Scrolls).+?>/g, '');
    holdText = holdText.replace(/\n\s+/g, "\n");

    console.log(holdText);
}

function ASSERT(x) {
    if (!x) {
        console.trace();
        process.exit(1);
    }
}

async function replaceAsync(str, regex, asyncFn) {
    const promises = [];
    str.replace(regex, (full, ...args) => {
        promises.push(asyncFn(full, ...args));
        return full;
    });
    const data = await Promise.all(promises);
    return str.replace(regex, () => data.shift());
}
/*
<?xml
     version="1.0"
     encoding="ISO-8859-1"
     ?>
<drod
     Version='304'>
<Players
     GID_OriginalNameMessage='UwBrAGUAbABsAA=='
     GID_Created='1745401270'
     LastUpdated='0'
     NameMessage='UwBrAGUAbABsAA=='
     ForumName='0'
     ForumPassword='0'
     IsLocal='0'
     PlayerID='10001'/>
<Holds
     GID_Created='1745401275'
     GID_PlayerID='10001'
     LastUpdated='1745401278'
     Status='0'
     NameMessage='VABlAHMAdAAgAEgAbwBsAGQA'
     DescriptionMessage='QgB5ACAAUwBrAGUAbABsAA=='
     LevelID='10001'
     GID_NewLevelIndex='1'
     EditingPrivileges='0'
     EndHoldMessage=''
     ScriptID='0'
     VarID='0'
     CharID='0'
     HoldID='10001'>
<Entrances
     EntranceID='1'
     DescriptionMessage='RQBuAHQAcgBhAG4AYwBlACAAMQA='
     RoomID='10001'
     X='19'
     Y='16'
     O='8'
     IsMainEntrance='1'
     ShowDescription='1'/>
</Holds>
<Levels
     HoldID='10001'
     GID_LevelIndex='1'
     OrderIndex='1'
     PlayerID='10001'
     NameMessage='VABlAHMAdAAgAEwAZQB2AGUAbAA='
     Created='1745401278'
     LastUpdated='1745401278'
     IsRequired='1'
     LevelID='10001'/>
<Rooms
     Squares='BScEJAECBCQBAgQkAQIEJAECBCQBAgQkAQIEJAECBCQBAgQkAQIEJAECBCQBAgQkAQIEJAECBCQBAgQkAQIEJAECBCQBAgQkAQIEJAECBCQBAgQkAQIEJAECBCQBAgQkAQIEJAECBCQBAgQkAScE/wD/AP8A/wDEAP8AAP8AAP8AAP8AAMQAAA=='
     TileLights='Bf8AAP8AAP8AAP8AAMQAAA=='
     ExtraVars='BwAAAGNsb3VkcwAIAAAAAQAAAAAEAAAAZm9nAAUAAAAEAAAAAAAAAAMAAABsZgAIAAAAAQAAAAAGAAAAbGlnaHQABQAAAAQAAAAAAAAACgAAAGxpZ2h0bmluZwAIAAAAAQAAAAAIAAAAb3V0c2lkZQAIAAAAAQAAAAAEAAAAc2t5AAYAAAACAAAAAAAFAAAAc25vdwAFAAAABAAAAAAAAAAJAAAAc3Vuc2hpbmUACAAAAAEAAAAA'>
</Rooms>
</drod>
*/
