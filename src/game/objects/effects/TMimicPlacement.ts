import { Container, Sprite, Texture } from "pixi.js";
import { Game } from "src/game/global/Game";
import { S } from "src/S";
import { BoltEffect } from "./BoltEffect";
import { F } from "src/F";
import { Gfx } from "src/game/global/Gfx";
import { T } from "src/T";


export class MimicPlacement extends Container {
    private _bolt: Container;
    private _errorTile: Sprite;
    private _mimic: Sprite;
    private _mimicSword: Sprite;

    public constructor() {
        super();

        this.addChild(
            this._bolt = new Container(),
            this._errorTile = new Sprite(Texture.WHITE),
            this._mimic = new Sprite(),
            this._mimicSword = new Sprite(),
        );

        this._errorTile.width = S.RoomTileWidth;
        this._errorTile.height = S.RoomTileHeight;
        this._errorTile.tint = 0xFF0000;
        this._errorTile.alpha = 0.5;

        this.x = S.LEVEL_OFFSET_X;
        this.y = S.LEVEL_OFFSET_Y;
    }

    public update(fromX: number, fromY: number, toX: number, toY: number, o: number, isObstacle: boolean) {
        this._bolt.removeChildren();

        BoltEffect.drawBolt(
            fromX * S.RoomTileWidth + S.RoomTileWidthHalf,
            fromY * S.RoomTileHeight + S.RoomTileHeightHalf,
            toX * S.RoomTileWidth + S.RoomTileWidthHalf,
            toY * S.RoomTileHeight + S.RoomTileHeightHalf,
            this._bolt,
        );

        this._errorTile.x = toX * S.RoomTileWidth;
        this._errorTile.y = toY * S.RoomTileHeight;
        this._errorTile.visible = isObstacle;

        this._mimic.x = toX * S.RoomTileWidth;
        this._mimic.y = toY * S.RoomTileHeight;
        this._mimic.texture = Gfx.getGeneralTilesTexture(T.MIMIC[Game.player.o]);

        this._mimicSword.x = (toX + F.getOX(o)) * S.RoomTileWidth;
        this._mimicSword.y = (toY + F.getOY(o)) * S.RoomTileHeight;
        this._mimicSword.texture = Gfx.getGeneralTilesTexture(T.MIMIC_SWORD[Game.player.o]);
    }
}