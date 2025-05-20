import { BaseTexture, Matrix, Rectangle, RenderTexture, Sprite, Texture } from "pixi.js"
import { StyleName, StyleTilesets } from "src/C";
import { Gfx } from "../global/Gfx";
import { PlatformOptions } from "src/platform/PlatformOptions";
import { RecamelCore } from "src.framework/net/retrocade/camel/core/RecamelCore";
import { T } from "src/T";
import { F } from "src/F";
import { exposeValue, S } from "src/S";

type AchievementIconSimple = [StyleName | 'default', number, number, number, number];
type AchievementIconBlit = [number, number, number] | [number, number, number, StyleTilesets];
export type AchievementIconSource = AchievementIconSimple
    | [StyleName | 'default', AchievementIconBlit[]];

class AchievementRenderer_Class {
    private _stagingSprite: Sprite;
    private _stagingTexture: RenderTexture;
    private _achievementsTexture: RenderTexture;
    private _achievementIdToTexture = new Map<string, Texture>()

    public constructor() {
        this._stagingTexture = RenderTexture.create({ width: S.Achievements.width, height: S.Achievements.height });
        this._achievementsTexture = RenderTexture.create({ width: 1024, height: 1024 });
        this._stagingSprite = new Sprite(this._stagingTexture);

        exposeValue('AchievementRenderer', this);
    }

    public getAchievementTexture(achievementId: string, source: AchievementIconSource): Texture {
        const texture = this._achievementIdToTexture.get(achievementId);

        if (texture) {
            return texture;
        } else if (this._achievementIdToTexture.size >= S.Achievements.allTexture.max) {
            throw new Error("Cannot add another achievement to the texture as there is not enough space left");
        }

        const newTexture = this.createNewAchievementTexture(achievementId, source);
        this._achievementIdToTexture.set(achievementId, newTexture);

        return newTexture;
    }

    private createNewAchievementTexture(achievementId: string, source: AchievementIconSource): Texture {
        this.texture(Gfx.AchievementTexture).blit(0, 0, true);

        const style = source[0] === 'default'
            ? PlatformOptions.defaultStyle
            : source[0];

        const tiles = Gfx.StyleTextures.get(style)!.get(T.TILES_STYLE)!;

        if (source.length === 5 && typeof source[1] === 'number') {
            if (source[1]) {
                this.tile(source[1], source[1] < 0 ? tiles : Gfx.GeneralTilesTexture).blit(0, 0);
            }
            if (source[2]) {
                this.tile(source[2], source[2] < 0 ? tiles : Gfx.GeneralTilesTexture).blit(22, 0);
            }
            if (source[3]) {
                this.tile(source[3], source[3] < 0 ? tiles : Gfx.GeneralTilesTexture).blit(0, 22);
            }
            if (source[4]) {
                this.tile(source[4], source[4] < 0 ? tiles : Gfx.GeneralTilesTexture).blit(22, 22);
            }

        } else if (source.length === 2 && Array.isArray(source[1])) {
            for (const [id, x, y, tilesetId] of source[1]) {
                const tileset = tilesetId !== undefined
                    ? Gfx.StyleTextures.get(style)!.get(T.TILES_STYLE)!
                    : tiles;

                this.tile(id, id < 0 ? tiles : Gfx.GeneralTilesTexture)
                    .blit(x * 22, y * 22);
            }
        }

        const achievementIndex = this._achievementIdToTexture.size;
        const textureX = 1 + (S.Achievements.width + 2) * (achievementIndex % S.Achievements.allTexture.perRow);
        const textureY = 1 + (S.Achievements.height + 2) * (achievementIndex / S.Achievements.allTexture.perRow | 0);
        this._stagingSprite.texture = this._stagingTexture;
        RecamelCore.renderer.render(this._stagingSprite, {
            renderTexture: this._achievementsTexture,
            transform: Matrix.IDENTITY.translate(textureX, textureY),
            clear: false,
        });

        return new Texture(
            this._achievementsTexture.baseTexture,
            new Rectangle(textureX, textureY, S.Achievements.width, S.Achievements.height)
        );
    }

    private texture(source: Texture) {
        this._stagingSprite.texture = source;

        return this;
    }

    private tile(tileId: number, texture: Texture|BaseTexture) {
        this._stagingSprite.texture = new Texture(
            texture instanceof BaseTexture
                ? texture
                : texture.baseTexture,
            new Rectangle(
                F.tileToX(tileId), F.tileToY(tileId),
                S.RoomTileWidth, S.RoomTileHeight
            )
        );

        return this;
    }

    private blit(x: number, y: number, clear = false) {
        RecamelCore.renderer.render(this._stagingSprite, {
            renderTexture: this._stagingTexture,
            transform: Matrix.IDENTITY.translate(x, y),
            clear
        });
    }
}

export const AchievementRenderer = new AchievementRenderer_Class