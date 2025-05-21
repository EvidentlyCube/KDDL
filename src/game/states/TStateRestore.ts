import { Graphics, NineSlicePlane, RenderTexture, Sprite } from "pixi.js";
import { RecamelLayerSprite } from "src.framework/net/retrocade/camel/layers/RecamelLayerSprite";
import { _ } from "../../../src.framework/_";
import { RecamelState } from "../../../src.framework/net/retrocade/camel/core/RecamelState";
import { RecamelTooltip } from "../../../src.framework/net/retrocade/camel/core/RecamelTooltip";
import { RecamelEffectFade } from "../../../src.framework/net/retrocade/camel/effects/RecamelEffectFade";
import { RecamelEffectScreenshot } from "../../../src.framework/net/retrocade/camel/effects/RecamelEffectScreenshot";
import { Button } from "../../../src.framework/net/retrocade/standalone/Button";
import { Text } from "../../../src.framework/net/retrocade/standalone/Text";
import RawInput from "../../../src.tn/RawInput";
import { S } from "../../S";
import { attr, intAttr } from "../../XML";
import { Commands } from "../global/Commands";
import { Gfx } from "../global/Gfx";
import { Level } from "../global/Level";
import { Make } from "../global/Make";
import { Progress } from "../global/Progress";
import { Room } from "../global/Room";
import { Sfx } from "../global/Sfx";
import { TRestoreLevelButton } from "../interfaces/TRestoreLevelButton";
import { TWidgetLevelName } from "../widgets/TWidgetLevelName";
import { TWidgetMinimap } from "../widgets/TWidgetMinimap";
import { TWindowMessage } from "../windows/TWindowMessage";
import { TStateGame } from "./TStateGame";
import { TStateTitle } from "./TStateTitle";
import { TPlayer } from "../objects/actives/TPlayer";

export class TStateRestore extends RecamelState {
	private static _instance: TStateRestore;

	public static show() {
		if (!TStateRestore._instance) {
			TStateRestore._instance = new TStateRestore();
		}
		TStateRestore._instance.setState();
	}

	private _layer: RecamelLayerSprite;

	private header: Text;
	private background: Sprite;
	private minimapBackground: Graphics;
	private levelsBackground: NineSlicePlane;
	private levelPreview: Sprite;
	private _levelPreviewTexture: RenderTexture;
	private buttonRestore: Button;
	private buttonCancel: Button;

	private secretsCount: Text;
	private roomPosition: Text;

	private restoreFarthest: Button;
	private helpIcon: Button;

	private _levelButtons: TRestoreLevelButton[] = [];
	private _currentRoomPid = "";

	public constructor() {
		super();

		this._layer = RecamelLayerSprite.create();
		this._layer.visible = false;

		this.background = new Sprite(Gfx.MenuBgTexture);

		this.header = Make.text(36);

		this.minimapBackground = new Graphics();
		this._levelPreviewTexture = RenderTexture.create({
			width: S.RoomWidthPixels,
			height: S.RoomHeightPixels,
		});
		this.levelPreview = new Sprite(this._levelPreviewTexture);
		this.levelsBackground = Make.inputGrid9();
		this.buttonRestore = Make.buttonColor(() => this.onClickRestore(), _("ui.restore.buttons.restore"));
		this.buttonCancel = Make.buttonColor(() => this.onClickReturnToTitle(), _("ui.common.close"));
		this.secretsCount = Make.text(20);
		this.roomPosition = Make.text(16);
		this.restoreFarthest = Make.buttonColor(() => this.onClickRestoreFarthest(), _("ui.restore.buttons.farthest"));
		this.helpIcon = Make.buttonColor(() => this.onClickHelp(), "?");

		this.header.text = _("ui.restore.header");
		this.header.x = (S.SIZE_GAME_WIDTH - this.header.textWidth - 10) / 2;
		this.header.y = 10;

		this.minimapBackground.beginFill(0x663333);
		this.minimapBackground.drawRect(0, 0, 200, 200);

		this.minimapBackground.beginFill(0, 0.5);
		this.minimapBackground.drawRect(-2, -2, 204, 2);
		this.minimapBackground.drawRect(-2, 0, 2, 202);

		this.minimapBackground.beginFill(0xFFFFFF, 0.5);
		this.minimapBackground.drawRect(200, 0, 2, 202);
		this.minimapBackground.drawRect(0, 200, 200, 2);

		this.minimapBackground.x = 10;
		this.minimapBackground.y = S.SIZE_GAME_HEIGHT - 210;

		this.levelsBackground.x = 8;
		this.levelsBackground.y = 60;
		this.levelsBackground.width = 204;
		this.levelsBackground.height = 280;

		this.secretsCount.x = 5;
		this.secretsCount.y = this.levelsBackground.x + this.levelsBackground.height - 6;

		this.roomPosition.x = 5;
		this.roomPosition.y = this.levelsBackground.x + this.levelsBackground.height + 22;

		this.levelPreview.x = 246;
		this.levelPreview.y = 60;
		this.levelPreview.scale.set(17.8 / 22, 17.8 / 22);

		this.buttonRestore.x = 220;
		this.buttonCancel.x = S.SIZE_GAME_WIDTH - this.buttonCancel.getLocalBounds().width - 10;

		this.buttonRestore.y = S.SIZE_GAME_HEIGHT - this.buttonRestore.getLocalBounds().height - 10;
		this.buttonCancel.y = S.SIZE_GAME_HEIGHT - this.buttonCancel.getLocalBounds().height - 10;

		this.restoreFarthest.bottom = this.buttonRestore.y - 10;
		this.restoreFarthest.x = 220;

		this.helpIcon.right = this.buttonCancel.right;
		this.helpIcon.y = this.restoreFarthest.y;

		RecamelTooltip.hook(this.helpIcon, _('ui.restore.buttons.help.tooltip'));

		this._layer.add(this.background);
		this._layer.add(this.header);
		this._layer.add(this.minimapBackground);
		this._layer.add(this.levelsBackground);
		this._layer.add(this.levelPreview);
		this._layer.add(this.buttonRestore);
		this._layer.add(this.buttonCancel);
		this._layer.add(this.roomPosition);
		this._layer.add(this.restoreFarthest);
		this._layer.add(this.helpIcon);

	}


	/****************************************************************************************************************/
	/**                                                                                           rSTATE OVERRIDES  */

	/****************************************************************************************************************/

	public create() {
		Commands.freeze();

		if (Progress.isGameCompleted) {
			this._layer.add(this.secretsCount);
		}

		this._currentRoomPid = "";
		this.createLevels();

		this.selectRoom(Progress.playerRoomPid);

		this._layer.visible = true;
		this._layer.moveToFront();
	}

	public destroy() {
		this._layer.remove(TWidgetMinimap.container);
		this._layer.visible = false;

		Commands.unfreeze();
	}

	public update() {
		if (RawInput.isKeyDown('Escape')) {
			RawInput.flushAll();
			this.onClickReturnToTitle();
			return;
		}

		if (RawInput.isMousePressed(0)) {
			const room = TWidgetMinimap.getRoomOnClick(
				RawInput.localMouseX - this.minimapBackground.x,
				RawInput.localMouseY - this.minimapBackground.y,
				TWidgetMinimap.MODE_RESTORE);

			if (room && Progress.wasRoomEverVisited(attr(room, 'RoomPID'))) {
				this.selectRoom(attr(room, 'RoomPID'));
			}
		}
	}


	/****************************************************************************************************************/
	/**                                                                                            EVENT LISTENERS  */

	/****************************************************************************************************************/

	private onClickReturnToTitle() {
		const screenshot = new RecamelEffectScreenshot();

		TStateTitle.show();
		Sfx.buttonClick();

		new RecamelEffectFade(screenshot.layer.displayObject, 1, 0, 500, screenshot.stop);
		screenshot.moveForward();
	}

	private onClickRestore() {
		const newConquered = Progress.getRoomEntranceState(this._currentRoomPid)!.conqueredRoomPids.size;
		const nowConquered = Progress.countRoomsConquered();

		if (newConquered < nowConquered) {
			TWindowMessage.show(_("ui.restore.warning"), 400, false, false, () => this.doRestore());
		} else {
			this.doRestore();
		}
	}

	private onClickRestoreFarthest() {
		const { roomPid } = Progress.getBestRoomEntranceState();
		for (const level of this._levelButtons) {
			level.unset();
		}

		this.selectRoom(roomPid);
	}

	private onClickHelp() {
		RecamelTooltip.hide();
		TWindowMessage.show(_("ui.restore.help.body"), 550);
	}

	private doRestore() {
		Progress.clearStoredCommands();

		const screenshot = new RecamelEffectScreenshot();

		Commands.unfreeze();
		Commands.clear();
		Progress.restoreToRoom(this._currentRoomPid);
		TStateGame.restoreGame();

		new RecamelEffectFade(screenshot.layer.displayObject, 1, 0, 500, screenshot.stop);
		screenshot.moveForward();
	}


	/****************************************************************************************************************/
	/**                                                                                               MAP CONTROLS  */

	/****************************************************************************************************************/

	private createLevels() {
		for (const levelButton of this._levelButtons) {
			this._layer.remove(levelButton);
		}

		this._levelButtons = [];

		const allLevels = Level.getAllLevels();
		let level: TRestoreLevelButton;

		let index: number;

		for (const levelXML of allLevels) {
			if (!Progress.wasLevelEverVisited(intAttr(levelXML, 'LevelID'))) {
				continue;
			}

			index = intAttr(levelXML, 'OrderIndex') - 1;

			level = new TRestoreLevelButton(x => this.onLevelSelected(x), levelXML);
			level.x = this.levelsBackground.x + 2;
			level.y = this.levelsBackground.y + 2 + index * TRestoreLevelButton.HEIGHT;

			this._layer.add(level);

			this._levelButtons.push(level);
		}

		this._levelButtons.sort((a, b) => {
			return a.y - b.y;
		});

		index = 0;
		for (let i: number = 0; i < this._levelButtons.length; i++) {
			level = this._levelButtons[i];
			if (level.visible) {
				level.y = this.levelsBackground.y + 2 + index * TRestoreLevelButton.HEIGHT;
				index++;
			}
		}
	}

	private selectLevelByRoom(roomPid: string) {
		const levelID: number = Level.getLevelIdByRoomPid(roomPid);

		for (let level of this._levelButtons) {
			if (level.levelId == levelID) {
				level.set();
				return;
			}
		}
	}

	private selectRoom(roomPid: string) {
		if (this._currentRoomPid == roomPid) {
			this.selectLevelByRoom(roomPid);
			return;
		}

		if (!Level.getRoomStrict(roomPid)) {
			const entrance = Level.getFirstHoldEntrance();
			const roomId = intAttr(entrance, 'RoomID');
			this.selectRoom(Level.roomIdToPid(roomId));
			return;
		}


		this.updateMinimap(roomPid);
		this.selectLevelByRoom(roomPid);

		const roomOffset = Level.getRoomOffsetInLevel(roomPid);
		const roomStateData = Progress.getRoomEntranceState(roomPid);

		if (!roomStateData) {
			return;
		}

		this._currentRoomPid = roomPid;

		const room = new Room();
		const player = new TPlayer();

		this._layer.add(TWidgetMinimap.container); // Hack because new room will retake ownership of this
		room.loadRoom(roomPid);
		room.drawRoom();
		player.room = room;
		player.prevO = player.o = roomStateData.o;
		player.setPosition(roomStateData.x, roomStateData.y, true);
		player.setGfx();
		player.update();
		room.monsters.update();
		room.roomSpritesRenderer.renderSwords();

		room.renderInto(this._levelPreviewTexture);

		room.clear();

		// Update room position

		this.roomPosition.text = TWidgetLevelName.nameFromPosition(roomOffset.x, roomOffset.y);
		this.roomPosition.x = (204 - this.roomPosition.textWidth) / 2;

		this.updateSecretCount();
	}

	private updateSecretCount() {
		if (!Progress.isGameCompleted) {
			return;
		}

		const levelId: number = Level.getLevelIdByRoomPid(this._currentRoomPid);

		const secretRoomIds = Level.getSecretRoomPidsByLevelId(levelId);
		const secretsDone = secretRoomIds.filter(roomId => Progress.wasRoomEverConquered(roomId)).length;

		this.secretsCount.text = _("ui.restore.info.secrets", secretsDone, secretRoomIds.length);
		this.secretsCount.x = (204 - this.secretsCount.textWidth) / 2;
	}

	private onLevelSelected(data: Button) {
		for (let level of this._levelButtons) {
			level.unset();
		}

		const levelId = intAttr(data.data, 'LevelID');
		const room = Level.getAnyVisitedRoomInLevel(levelId);
		if (!room) {
			return;
		}
		this.selectRoom(attr(room, 'RoomPID'));
	}

	private updateMinimap(roomPid: string) {
		TWidgetMinimap.setRestoreScreenRoom(roomPid);
		TWidgetMinimap.update(roomPid, TWidgetMinimap.MODE_RESTORE);
	}
}
