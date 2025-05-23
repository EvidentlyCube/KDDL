import { Container, Matrix, Rectangle, RenderTexture, Sprite, Texture } from "pixi.js";
import { RecamelCore } from "src.framework/net/retrocade/camel/core/RecamelCore";
import { exposeValue, S } from "src/S";
import { VOMinimapRoomState } from "./VOMinimapRoom";

const WIDTH = 1024;
const HEIGHT = 1024;

const RENDER_OFFSETS = [
    { dx: -1, dy: -1 },
    { dx: -1, dy: 1 },
    { dx: 1, dy: -1 },
    { dx: 1, dy: 1 },
    { dx: 0, dy: -1 },
    { dx: -1, dy: 0 },
    { dx: 1, dy: 0 },
    { dx: 0, dy: 1 },
    { dx: 0, dy: 0 },
]

class MinimapRoomRenderer_Class {
    private _minimapTexture: RenderTexture;
    private _roomPidAndStateToTexture = new Map<string, Texture>();

    public constructor() {
        this._minimapTexture = RenderTexture.create({ width: WIDTH, height: HEIGHT });

        exposeValue('MinimapRoomRenderer', this);
    }

    public clear() {
        const sprite = new Sprite(Texture.EMPTY);
        sprite.alpha = 0;

        RecamelCore.renderer.render(sprite, {
            renderTexture: this._minimapTexture,
            clear: true
        });
    }


    public hasMinimapTexture(roomPid: string, state: VOMinimapRoomState) {
        return this._roomPidAndStateToTexture.has(this.getMapIndex(roomPid, state));
    }

    public getCachedMinimapTexture(roomPid: string, state: VOMinimapRoomState): Texture | undefined {
        return this._roomPidAndStateToTexture.get(this.getMapIndex(roomPid, state));
    }

    public updateMinimapTexture(roomPid: string, state: VOMinimapRoomState, container: Container): Texture {
        const roomIndex = this.getMapIndex(roomPid, state);
        const existingTexture = this._roomPidAndStateToTexture.get(roomIndex);

        if (existingTexture) {
            this.renderTo(container, existingTexture.frame.x, existingTexture.frame.y);
            return existingTexture;

        } else {
            const i = this._roomPidAndStateToTexture.size;
            const maxInX = WIDTH / (S.RoomWidth + 2) | 0;
            const newX = (i % maxInX) * (S.RoomWidth + 2) + 1;
            const newY = (i / maxInX | 0) * (S.RoomHeight + 2) + 1;

            this.renderTo(container, newX, newY);
            const newTexture = new Texture(
                this._minimapTexture.baseTexture,
                new Rectangle(newX, newY, S.RoomWidth, S.RoomHeight)
            );
            this._roomPidAndStateToTexture.set(roomIndex, newTexture);
            return newTexture;
        }
    }

    private renderTo(container: Container, x: number, y: number) {
        for (const { dx, dy } of RENDER_OFFSETS) {
            RecamelCore.renderer.render(container, {
                renderTexture: this._minimapTexture,
                transform: Matrix.IDENTITY.translate(x + dx, y + dy),
                clear: false,
            });
        }
    }

    private getMapIndex(roomPid: string, state: VOMinimapRoomState) {
        return `${roomPid},${state}`;
    }
}

export const MinimapRoomRenderer = new MinimapRoomRenderer_Class