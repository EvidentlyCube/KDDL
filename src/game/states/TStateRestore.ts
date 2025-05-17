import * as PIXI from 'pixi.js';
import {RecamelState} from "../../../src.framework/net/retrocade/camel/core/RecamelState";
import {Button} from "../../../src.framework/net/retrocade/standalone/Button";
import {BitmapDataWritable} from "../../C";
import {TRestoreLevel} from "../interfaces/TRestoreLevel";
import {Commands} from "../global/Commands";
import {Core} from "../global/Core";
import {Gfx} from "../global/Gfx";
import {Make} from "../global/Make";
import {Text} from "../../../src.framework/net/retrocade/standalone/Text";
import {F} from "../../F";
import {_} from "../../../src.framework/_";
import {S} from "../../S";
import {RecamelTooltip} from "../../../src.framework/net/retrocade/camel/core/RecamelTooltip";
import {Progress} from "../global/Progress";
import RawInput from "../../../src.tn/RawInput";
import {TWidgetMinimap} from "../widgets/TWidgetMinimap";
import {intAttr} from "../../XML";
import {TStateTitle} from "./TStateTitle";
import {TStateGame} from "./TStateGame";
import {Level} from "../global/Level";
import {Room} from "../global/Room";
import {Game} from "../global/Game";
import {UtilsBitmapData} from "../../../src.framework/net/retrocade/utils/UtilsBitmapData";
import {TWidgetLevelName} from "../widgets/TWidgetLevelName";
import {TWindowMessage} from "../windows/TWindowMessage";
import {RecamelEffectScreenshot} from "../../../src.framework/net/retrocade/camel/effects/RecamelEffectScreenshot";
import {Sfx} from "../global/Sfx";
import {RecamelEffectFade} from "../../../src.framework/net/retrocade/camel/effects/RecamelEffectFade";

export class TStateRestore extends RecamelState {
	private static _instance: TStateRestore;

	public static show() {
		if (!TStateRestore._instance) {
			TStateRestore._instance = new TStateRestore();
		}
		TStateRestore._instance.setState();
	}


	private header: Text;
	private background: PIXI.Sprite;
	private minimap: PIXI.Sprite;
	private minimapData: BitmapDataWritable;
	private minimapDataTexture: PIXI.Texture;
	private minimapBackground: PIXI.Graphics;
	private levelsBackground: PIXI.NineSlicePlane;
	private levelPreview: PIXI.Sprite;
	private levelPreviewTexture?: PIXI.Texture;
	private buttonRestore: Button;
	private buttonCancel: Button;

	private secretsCount: Text;
	private roomPosition: Text;

	private restoreFarthest: Button;
	private helpIcon: Button;

	private levels: TRestoreLevel[] = [];
	private currentRoomId: number = 0;

	public constructor() {
		super();

		this.background = new PIXI.Sprite(Gfx.MenuBgTexture);

		this.header = Make.text(36);

		this.minimapBackground = new PIXI.Graphics();
		this.minimapData = F.newCanvasContext(200, 200);
		this.minimapDataTexture = new PIXI.Texture(new PIXI.BaseTexture(this.minimapData.canvas));
		this.minimap = new PIXI.Sprite(this.minimapDataTexture);
		this.levelPreview = new PIXI.Sprite();
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

		this.minimapBackground.x = this.minimap.x = 10;
		this.minimapBackground.y = this.minimap.y = S.SIZE_GAME_HEIGHT - 210;

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
	}


	/****************************************************************************************************************/
	/**                                                                                           rSTATE OVERRIDES  */

	/****************************************************************************************************************/

	public create() {
		Commands.freeze();

		Core.lMain.add(this.background);
		Core.lMain.add(this.header);
		Core.lMain.add(this.minimapBackground);
		Core.lMain.add(this.minimap);
		Core.lMain.add(this.levelsBackground);
		Core.lMain.add(this.levelPreview);
		Core.lMain.add(this.buttonRestore);
		Core.lMain.add(this.buttonCancel);
		Core.lMain.add(this.roomPosition);
		Core.lMain.add(this.restoreFarthest);
		Core.lMain.add(this.helpIcon);

		if (Progress.isGameCompleted) {
			Core.lMain.add(this.secretsCount);
		}

		this.createLevels();

		this.selectRoom(Progress.playerRoomID);
	}

	public destroy() {
		Core.lMain.clear();

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
				RawInput.localMouseX - this.minimap.x,
				RawInput.localMouseY - this.minimap.y,
				TWidgetMinimap.MODE_RESTORE);

			if (room && Progress.wasRoomEverVisited(intAttr(room, 'RoomID'))) {
				this.selectRoom(intAttr(room, 'RoomID'));
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
		const newConq = Progress.getRoomEntranceState(this.currentRoomId)!.conqueredRoomIds.length;
		const nowConq = Progress.countRoomsConquered();

		if (newConq < nowConq) {
			TWindowMessage.show(_("ui.restore.warning"), 400, false, false, () => this.doRestore());
		} else {
			this.doRestore();
		}
	}

	private onClickRestoreFarthest() {
		const room: number = Progress.getBestRoomEntranceState().roomId;
		for (const level of this.levels) {
			level.unset();
		}

		this.selectRoom(room);
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
		Progress.restoreToRoom(this.currentRoomId);
		TStateGame.restoreGame();

		new RecamelEffectFade(screenshot.layer.displayObject, 1, 0, 500, screenshot.stop);
		screenshot.moveForward();
	}


	/****************************************************************************************************************/
	/**                                                                                               MAP CONTROLS  */

	/****************************************************************************************************************/

	private createLevels() {
		this.levels = [];

		const allLevels = Level.getAllLevels();
		let level: TRestoreLevel;

		let index: number;

		for (const levelXML of allLevels) {
			if (!Progress.wasLevelEverVisited(intAttr(levelXML, 'LevelID'))) {
				continue;
			}

			index = intAttr(levelXML, 'OrderIndex') - 1;

			level = new TRestoreLevel(x => this.onLevelSelected(x), levelXML);
			level.x = this.levelsBackground.x + 2;
			level.y = this.levelsBackground.y + 2 + index * TRestoreLevel.HEIGHT;

			Core.lMain.add(level);

			this.levels.push(level);
		}

		this.levels.sort((a, b) => {
			return a.y - b.y;
		});

		index = 0;
		for (let i: number = 0; i < this.levels.length; i++) {
			level = this.levels[i];
			if (level.visible) {
				level.y = this.levelsBackground.y + 2 + index * TRestoreLevel.HEIGHT;
				index++;
			}
		}
	}

	private selectLevelByRoom(roomID: number) {
		const levelID: number = Level.getLevelIdByRoomId(roomID);

		for (let level of this.levels) {
			if (level.levelId == levelID) {
				level.set();
				return;
			}
		}
	}

	private selectRoom(roomID: number) {
		if (this.currentRoomId == roomID){
			this.selectLevelByRoom(roomID);
			return;
		}

		if (!Level.getRoomStrict(roomID)) {
			const entrance = Level.getFirstHoldEntrance();
			this.selectRoom(intAttr(entrance, 'RoomID'));
			return;
		}


		this.drawWidget(roomID);
		this.selectLevelByRoom(roomID);

		const roomOffset = Level.getRoomOffsetInLevel(roomID);
		const roomStateData = Progress.getRoomEntranceState(roomID);

		if (!roomStateData) {
			return;
		}

		this.currentRoomId = roomID;

		const room = new Room();
		room.loadRoom(roomID);
		room.drawRoom();
		Game.player.drawTo(roomStateData.x, roomStateData.y, roomStateData.o, room);
		room.monsters.update();

		const newBD = F.newCanvasContext(S.RoomWidthPixels, S.RoomHeightPixels);
		UtilsBitmapData.blitPart(
			room.layerUnder.bitmapData.canvas, newBD,
			0, 0,
			S.LEVEL_OFFSET_X, S.LEVEL_OFFSET_Y,
			S.RoomWidthPixels, S.RoomHeightPixels,
		);
		UtilsBitmapData.blit(
			room.layerActive.bitmapData.canvas, newBD,
			0, 0,
		);
		room.clear();

		this.levelPreviewTexture?.destroy(true);

		this.levelPreviewTexture = new PIXI.Texture(new PIXI.BaseTexture(newBD.canvas));
		this.levelPreview.texture = this.levelPreviewTexture;

		// Update room position

		this.roomPosition.text = TWidgetLevelName.nameFromPosition(roomOffset.x, roomOffset.y);
		this.roomPosition.x = (204 - this.roomPosition.textWidth) / 2;

		this.updateSecretCount();
	}

	private updateSecretCount() {
		if (!Progress.isGameCompleted) {
			return;
		}

		const levelId: number = Level.getLevelIdByRoomId(this.currentRoomId);

		const secretRoomIds = Level.getSecretRoomIdsByLevelId(levelId);
		const secretsDone = secretRoomIds.filter(roomId => Progress.wasRoomEverConquered(roomId)).length;

		this.secretsCount.text = _("ui.restore.info.secrets", secretsDone, secretRoomIds.length);
		this.secretsCount.x = (204 - this.secretsCount.textWidth) / 2;
	}

	private onLevelSelected(data: Button) {
		for (let level of this.levels) {
			level.unset();
		}

		const levelId = intAttr(data.data, 'LevelID');
		const room = Level.getAnyVisitedRoomInLevel(levelId);
		if (!room) {
			return;
		}
		this.selectRoom(intAttr(room, 'RoomID'));
	}

	private drawWidget(room: number) {
		TWidgetMinimap.setRestoreScreenRoom(room);
		this.minimapData.clearRect(0, 0, this.minimapData.canvas.width, this.minimapData.canvas.height);
		TWidgetMinimap.plotWidget(room, TWidgetMinimap.MODE_RESTORE, this.minimapData);
		this.minimapDataTexture.baseTexture.update();
	}

}
