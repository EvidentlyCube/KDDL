import { createReadStream, createWriteStream } from 'node:fs';
import { readdir, stat } from 'node:fs/promises';
import { join } from 'node:path';
import PNG from 'pngjs';

const EDGE = 22;
const CONFIG = [
    {
        path: /by_caravelgames\/tiles\/general\.png/,
        expand: [
            rect(0, 0, 16, 10),
            rect(18, 9, 1, 1),
            rect(7, 18, 11, 3),
            rect(0, 26, 7, 1),
        ]
    },
    {
        path: /by_caravelgames\/tiles\/.*\/tiles\.png/,
        expand: true
    },
    {
        path: /by_caravelgames\/sprites\/effects.png/
    }
];
const __dirname = import.meta.dirname;

parseDirectory(join(__dirname, '..', 'src.assets/gfx/'))

function rect(x, y, width, height) {
    return { x, y, width, height };
}


async function parseDirectory(dir) {
    const files = await readdir(dir);

    for (const file of files) {
        const filePath = join(dir, file);
        const fileStat = await stat(filePath)

        if (fileStat.isDirectory()) {
            await parseDirectory(filePath);
        } else {
            const config = getConfigMatch(filePath);
            if (config) {
                await buildSheet(filePath, config);
            }
        }
    }
}

async function buildSheet(filePath, config) {
    const targetPath = filePath.replace(/\.png$/, ".built.png");
    const oldPng = await readPngFile(filePath);
    const widthTiles = Math.ceil(oldPng.width / EDGE);
    const heightTiles = Math.ceil(oldPng.height / EDGE);

    const newPng = new PNG.PNG({
        width: widthTiles * (EDGE + 2),
        height: heightTiles * (EDGE + 2),
    })

    for (let x = 0; x < widthTiles; x++) {
        for (let y = 0; y < heightTiles; y++) {
            if (positionMatchRange(x, y, config.expand)) {
                blit(oldPng, newPng, x, y, 0, 0);
                blit(oldPng, newPng, x, y, 2, 0);
                blit(oldPng, newPng, x, y, 0, 2);
                blit(oldPng, newPng, x, y, 2, 2);
                blit(oldPng, newPng, x, y, 1, 0);
                blit(oldPng, newPng, x, y, 0, 1);
                blit(oldPng, newPng, x, y, 1, 2);
                blit(oldPng, newPng, x, y, 2, 1);
            }

            blit(oldPng, newPng, x, y, 1, 1);
        }
    }

    await writePngFile(newPng, targetPath);

}

function blit(source, target, tileX, tileY, offsetX, offsetY) {
    PNG.PNG.bitblt(
        source,
        target,
        tileX * EDGE,
        tileY * EDGE,
        EDGE, EDGE,
        tileX * (EDGE + 2) + offsetX,
        tileY * (EDGE + 2) + offsetY
    );
}

function getConfigMatch(filePath) {
    for (const configItem of CONFIG) {
        if (configItem.path.test(filePath)) {
            return configItem;
        }
    }

    return null;
}

async function readPngFile(imagePath) {
    return new Promise((resolve, reject) => {
        createReadStream(imagePath)
            .pipe(new PNG.PNG())
            .on("parsed", function () {
                resolve(this);
            });
    })
}

async function writePngFile(finalPng, outPngPath) {
    return new Promise(resolve => {
        finalPng
            .pack()
            .pipe(createWriteStream(outPngPath))
            .on('finish', () => resolve());
    })
}

function positionMatchRange(x, y, range) {
    if (range === true) {
        return true;
    } else if (Array.isArray(range)) {
        for (const rect of range) {
            if (
                x >= rect.x
                && y >= rect.y
                && x < rect.x + rect.width
                && y < rect.y + rect.height
            ) {
                return true;
            }
        }
    }

    return false;
}