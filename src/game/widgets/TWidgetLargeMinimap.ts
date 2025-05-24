import { Container, Graphics, InteractionEvent } from "pixi.js";
import { S } from "src/S";
import { TWidgetMinimap } from "./TWidgetMinimap";
import { Game } from "../global/Game";
import RawInput from "src.tn/RawInput";
import { Level } from "../global/Level";
import { attr } from "src/XML";
import { Room } from "../global/Room";
import { CueEvents } from "../global/CueEvents";
import { Commands } from "../global/Commands";
import { Progress } from "../global/Progress";
import { TWidgetLevelName } from "./TWidgetLevelName";

const BG_WIDTH = S.RoomWidthPixels - 100;
const BG_HEIGHT = S.RoomHeightPixels - 100;

export class TWidgetLargeMinimap extends Container {
    private readonly _background: Graphics;
    private readonly _minimap: TWidgetMinimap;

    private _displayedRoom?: Room;

    public constructor() {
        super();

        this.addChild(
            this._background = new Graphics(),
            this._minimap = new TWidgetMinimap(BG_WIDTH - 8, BG_HEIGHT - 8)
        );

		this._background.beginFill(0x663333);
		this._background.drawRect(0, 0, BG_WIDTH, BG_HEIGHT);

		this._background.beginFill(0, 0.5);
		this._background.drawRect(-2, -2, BG_WIDTH + 4, 2);
		this._background.drawRect(-2, 0, 2, BG_HEIGHT + 2);

		this._background.beginFill(0xFFFFFF, 0.5);
		this._background.drawRect(BG_WIDTH, 0, 2, BG_HEIGHT + 2);
		this._background.drawRect(0, BG_HEIGHT, BG_WIDTH, 2);

        this._background.x = S.LEVEL_OFFSET_X + (S.RoomWidthPixels - this._background.width) / 2 | 0;
        this._background.y = S.LEVEL_OFFSET_Y + (S.RoomHeightPixels - this._background.height) / 2 | 0;

        this._minimap.x = this._background.x + 2;
        this._minimap.y = this._background.y + 2;

        this.visible = false;

        this.interactive = true;
    }

    public show() {
        this.visible = true;
        this._minimap.changedLevel(Game.room.levelId);
        this._minimap.update(Game.room.roomPid);
    }

    public hide() {
        this.visible = false;
    }

    public update() {
        if (this._displayedRoom) {
            if (RawInput.isMousePressed(0) || RawInput.isAnyKeyPressed()) {
                this._displayedRoom.clear();
                this._displayedRoom = undefined;
                CueEvents.unfreeze();
                Commands.unfreeze();

                this.alpha = 1;
                RawInput.flushAll();
                TWidgetLevelName.update(Game.room.roomPid);
                return;
            }
        }

        if (RawInput.isMousePressed(0)) {
            const roomXml = this._minimap.getRoomOnClick(
                RawInput.localMouseX - this._minimap.x,
                RawInput.localMouseY - this._minimap.y,
            );

            if (roomXml) {
                const roomPid = attr(roomXml, 'RoomPID');

                if (!Progress.isRoomExplored(roomPid)) {
                    return;
                }

                CueEvents.freeze();
                Commands.freeze();
                this._displayedRoom = new Room();
                this._displayedRoom.loadRoom(roomPid);
                this._displayedRoom.setRoomEntryState(
                    Progress.isLevelCompleted(this._displayedRoom.levelId),
                    Progress.isLevelCompleted(this._displayedRoom.levelId),
                    Progress.isRoomConquered(roomPid),
                    this._displayedRoom.monsterCount
                );
                this._displayedRoom.monsters.update();
                this._displayedRoom.roomSpritesRenderer.renderSwords();
                TWidgetLevelName.updateForRoomPreview(roomPid);

                this.alpha = 0;

                RawInput.flushMouse();
            } else if (
                RawInput.localMouseX < this._minimap.x
                || RawInput.localMouseY < this._minimap.y
                || RawInput.localMouseX > this._minimap.x + this._minimap.width
                || RawInput.localMouseY > this._minimap.y + this._minimap.height
            ) {
                this.visible = false;
            }
        } else if (RawInput.isAnyKeyDown()) {
            this.visible = false;
        }
    }
}