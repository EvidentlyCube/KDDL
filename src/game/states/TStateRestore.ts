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
import { TWidgetSpeech } from "../widgets/TWidgetSpeech";

export class TStateRestore extends RecamelState {
	private static _instance: TStateRestore | undefined;

	public static show() {
		if (!TStateRestore._instance) {
			TStateRestore._instance = new TStateRestore();
		}
		TStateRestore._instance.setState();
	}

	public static clear() {
		if (TStateRestore._instance) {
			TStateRestore._instance.teardown();
			TStateRestore._instance = undefined;
		}
	}

	private _layer: RecamelLayerSprite;

	private header: Text;
	private background: Sprite;
	private _minimapBackground: Graphics;
	private _levelsListBackground: NineSlicePlane;
	private _levelPreviewSprite: Sprite;
	private _levelPreviewTexture: RenderTexture;
	private _restoreButton: Button;
	private _cancelButton: Button;

	private _secretsCountTextCount: Text;
	private _roomPositionTextField: Text;

	private _restoreFarthestButton: Button;
	private _helpButton: Button;

	private _levelButtons: TRestoreLevelButton[] = [];
	private _currentRoomPid = "";

	private _minimap: TWidgetMinimap;

	public constructor() {
		super();

		this._layer = RecamelLayerSprite.create();
		this._layer.visible = false;

		this.background = new Sprite(Gfx.MenuBgTexture);

		this.header = Make.text(36);

		this._minimap = new TWidgetMinimap(196, 196);
		this._minimapBackground = new Graphics();
		this._levelPreviewTexture = RenderTexture.create({
			width: S.RoomWidthPixels,
			height: S.RoomHeightPixels,
		});
		this._levelPreviewSprite = new Sprite(this._levelPreviewTexture);
		this._levelsListBackground = Make.inputGrid9();
		this._restoreButton = Make.buttonColor(() => this.onClickRestore(), _("ui.restore.buttons.restore"));
		this._cancelButton = Make.buttonColor(() => this.onClickReturnToTitle(), _("ui.common.close"));
		this._secretsCountTextCount = Make.text(20);
		this._roomPositionTextField = Make.text(16);
		this._restoreFarthestButton = Make.buttonColor(() => this.onClickRestoreFarthest(), _("ui.restore.buttons.farthest"));
		this._helpButton = Make.buttonColor(() => this.onClickHelp(), "?");

		this.header.text = _("ui.restore.header");
		this.header.x = (S.SIZE_GAME_WIDTH - this.header.textWidth - 10) / 2;
		this.header.y = 10;

		this._minimapBackground.beginFill(0x663333);
		this._minimapBackground.drawRect(0, 0, 200, 200);

		this._minimapBackground.beginFill(0, 0.5);
		this._minimapBackground.drawRect(-2, -2, 204, 2);
		this._minimapBackground.drawRect(-2, 0, 2, 202);

		this._minimapBackground.beginFill(0xFFFFFF, 0.5);
		this._minimapBackground.drawRect(200, 0, 2, 202);
		this._minimapBackground.drawRect(0, 200, 200, 2);

		this._minimapBackground.x = 10;
		this._minimapBackground.y = S.SIZE_GAME_HEIGHT - 210;

		this._minimap.x = this._minimapBackground.x + 4;
		this._minimap.y = this._minimapBackground.y + 4;

		this._levelsListBackground.x = 8;
		this._levelsListBackground.y = 60;
		this._levelsListBackground.width = 204;
		this._levelsListBackground.height = 280;

		this._secretsCountTextCount.x = 5;
		this._secretsCountTextCount.y = this._levelsListBackground.x + this._levelsListBackground.height - 6;

		this._roomPositionTextField.x = 5;
		this._roomPositionTextField.y = this._levelsListBackground.x + this._levelsListBackground.height + 22;

		this._levelPreviewSprite.x = 246;
		this._levelPreviewSprite.y = 60;
		this._levelPreviewSprite.scale.set(17.8 / 22, 17.8 / 22);

		this._restoreButton.x = 220;
		this._cancelButton.x = S.SIZE_GAME_WIDTH - this._cancelButton.getLocalBounds().width - 10;

		this._restoreButton.y = S.SIZE_GAME_HEIGHT - this._restoreButton.getLocalBounds().height - 10;
		this._cancelButton.y = S.SIZE_GAME_HEIGHT - this._cancelButton.getLocalBounds().height - 10;

		this._restoreFarthestButton.bottom = this._restoreButton.y - 10;
		this._restoreFarthestButton.x = 220;

		this._helpButton.right = this._cancelButton.right;
		this._helpButton.y = this._restoreFarthestButton.y;

		RecamelTooltip.hook(this._helpButton, _('ui.restore.buttons.help.tooltip'));

		this._layer.add(this.background);
		this._layer.add(this.header);
		this._layer.add(this._minimapBackground);
		this._layer.add(this._minimap);
		this._layer.add(this._levelsListBackground);
		this._layer.add(this._levelPreviewSprite);
		this._layer.add(this._restoreButton);
		this._layer.add(this._cancelButton);
		this._layer.add(this._roomPositionTextField);
		this._layer.add(this._restoreFarthestButton);
		this._layer.add(this._helpButton);

	}


	/****************************************************************************************************************/
	/**                                                                                           rSTATE OVERRIDES  */

	/****************************************************************************************************************/

	public create() {
		Commands.freeze();

		if (Progress.isGameCompleted) {
			this._layer.add(this._secretsCountTextCount);
		}

		this._currentRoomPid = "";
		this.createLevels();

		this.selectRoom(Progress.playerRoomPid);

		this._layer.visible = true;
		this._layer.moveToFront();
	}

	public destroy() {
		this._layer.remove(this._minimap);
		this._layer.visible = false;

		Commands.unfreeze();
	}

	public teardown() {
		this._layer.removeLayer();
	}

	public update() {
		if (RawInput.isKeyDown('Escape')) {
			RawInput.flushAll();
			this.onClickReturnToTitle();
			return;
		}

		if (RawInput.isMousePressed(0)) {
			const room = this._minimap.getRoomOnClick(
				RawInput.localMouseX - this._minimapBackground.x,
				RawInput.localMouseY - this._minimapBackground.y,
			);

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

		new RecamelEffectFade(screenshot.layer.displayObject, 1, 0, 500, () => {
			screenshot.stop();
			TWidgetSpeech.isPaused = false;
			TStateGame.instance.addFlashEvents();
		});
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
			level.x = this._levelsListBackground.x + 2;
			level.y = this._levelsListBackground.y + 2 + index * TRestoreLevelButton.HEIGHT;

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
				level.y = this._levelsListBackground.y + 2 + index * TRestoreLevelButton.HEIGHT;
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
			const roomPid = attr(entrance, 'RoomPID');
			this.selectRoom(roomPid);
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

		this._layer.add(this._minimap); // Hack because new room will retake ownership of this
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

		this._roomPositionTextField.text = TWidgetLevelName.nameFromPosition(roomOffset.x, roomOffset.y);
		this._roomPositionTextField.x = (204 - this._roomPositionTextField.textWidth) / 2;

		this.updateSecretCount();
	}

	private updateSecretCount() {
		if (!Progress.isGameCompleted) {
			return;
		}

		const levelId: number = Level.getLevelIdByRoomPid(this._currentRoomPid);

		const secretRoomPids = Level.getSecretRoomPidsByLevelId(levelId);
		const secretsDone = secretRoomPids.filter(roomPid => Progress.wasRoomEverConquered(roomPid)).length;

		this._secretsCountTextCount.text = _("ui.restore.info.secrets", secretsDone, secretRoomPids.length);
		this._secretsCountTextCount.x = (204 - this._secretsCountTextCount.textWidth) / 2;
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
		this._minimap.setRestoreScreenRoom(roomPid);
		this._minimap.update(roomPid);
	}
}
