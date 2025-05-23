import { Sprite } from "pixi.js";
import { RecamelCore } from "src.framework/net/retrocade/camel/core/RecamelCore";
import { RecamelLayerSprite } from "src.framework/net/retrocade/camel/layers/RecamelLayerSprite";
import { _, _r } from "../../../src.framework/_";
import { RecamelGroup } from "../../../src.framework/net/retrocade/camel/core/RecamelGroup";
import { RecamelState } from "../../../src.framework/net/retrocade/camel/core/RecamelState";
import { RecamelEffectFade } from "../../../src.framework/net/retrocade/camel/effects/RecamelEffectFade";
import { RecamelEffectScreenshot } from "../../../src.framework/net/retrocade/camel/effects/RecamelEffectScreenshot";
import { UtilsRandom } from "../../../src.framework/net/retrocade/utils/UtilsRandom";
import RawInput from "../../../src.tn/RawInput";
import { C } from "../../C";
import { F } from "../../F";
import { PlatformOptions } from "../../platform/PlatformOptions";
import { S } from "../../S";
import { T } from "../../T";
import { intAttr } from "../../XML";
import { Achievements } from "../achievements/Achievements";
import { DebugConsole } from "../DebugConsole";
import { Commands } from "../global/Commands";
import { Core } from "../global/Core";
import { CueEvents } from "../global/CueEvents";
import { DrodInput } from "../global/DrodInput";
import { Game } from "../global/Game";
import { Gfx } from "../global/Gfx";
import { HelpRoomOpener } from "../global/HelpRoomOpener";
import { Level } from "../global/Level";
import { Progress } from "../global/Progress";
import { Sfx } from "../global/Sfx";
import { VOCoord } from "../managers/VOCoord";
import { MonsterMessageType } from "../managers/VOMonsterMessage";
import { TCharacter } from "../objects/actives/TCharacter";
import { TEvilEye } from "../objects/actives/TEvilEye";
import { TMonster } from "../objects/actives/TMonster";
import { TMonsterPiece } from "../objects/actives/TMonsterPiece";
import { TEffect } from "../objects/effects/TEffect";
import { TEffectBlood } from "../objects/effects/TEffectBlood";
import { TEffectBump } from "../objects/effects/TEffectBump";
import { TEffectCheckpoint } from "../objects/effects/TEffectCheckpoint";
import { TEffectDebris } from "../objects/effects/TEffectDebris";
import { TEffectEvilEyeGaze } from "../objects/effects/TEffectEvilEyeGaze";
import { TEffectLevelStats } from "../objects/effects/TEffectLevelStats";
import { TEffectOrbHit } from "../objects/effects/TEffectOrbHit";
import { TEffectPlayerDeath } from "../objects/effects/TEffectPlayerDeath";
import { TEffectsPlayerDeathFade } from "../objects/effects/TEffectsPlayerDeathFade";
import { TEffectSwordSwing } from "../objects/effects/TEffectSwordSwing";
import { TEffectTarSplatter } from "../objects/effects/TEffectTarSplatter";
import { TEffectTextFlash } from "../objects/effects/TEffectTextFlash";
import { TEffectTrapdoorFall } from "../objects/effects/TEffectTrapdoorFall";
import { TEffectVermin } from "../objects/effects/TEffectVermin";
import { TEffectWalkStairs } from "../objects/effects/TEffectWalkStairs";
import { TEffectRoomSlide } from "../objects/TEffectRoomSlide";
import { TGameObject } from "../objects/TGameObject";
import { TWidgetClock } from "../widgets/TWidgetClock";
import { TWidgetFace } from "../widgets/TWidgetFace";
import { TWidgetLevelName } from "../widgets/TWidgetLevelName";
import { TWidgetMinimap } from "../widgets/TWidgetMinimap";
import { TWidgetMoveCounter } from "../widgets/TWidgetMoveCounter";
import { TWidgetOrbHighlight } from "../widgets/TWidgetOrbHighlight";
import { TWidgetScroll } from "../widgets/TWidgetScroll";
import { TWidgetSpeech } from "../widgets/TWidgetSpeech";
import { TWindowAchievements } from "../windows/TWindowAchievements";
import { TWindowHelp } from "../windows/TWindowHelp";
import { TWindowLevelScore } from "../windows/TWindowLevelScore";
import { TWindowLevelStart } from "../windows/TWindowLevelStart";
import { TWindowMessage } from "../windows/TWindowMessage";
import { TWindowPause } from "../windows/TWindowPause";
import { TWindowYesNoMessage } from "../windows/TWindowYesNoMessage";
import { TStateOutro } from "./TStateOutro";
import { TWidgetLargeMinimap } from "../widgets/TWidgetLargeMinimap";

export class TStateGame extends RecamelState {
	private static _instance: TStateGame | undefined;

	public static show() {
		TStateGame.instance.setState();
	}

	public static clear() {
		if (TStateGame._instance) {
			TStateGame._instance.teardown();
			TStateGame._instance = undefined;
		}
	}

	public static get instance(): TStateGame {
		if (!TStateGame._instance) {
			TStateGame._instance = new TStateGame();
		}

		return TStateGame._instance;
	}

	public static isInputLocked = false;

	public static effectsUnder = new RecamelGroup<TEffect>();
	public static effectsAbove = new RecamelGroup<TEffect>();


	public static offsetSpeed: number = 4;
	public static offsetNow: number = 0;
	public static offset: number = 0;

	public _uiLayer: RecamelLayerSprite;
	public _overLayer: RecamelLayerSprite;
	public lockIcon: Sprite;

	public isScrollDisplayed: boolean = false;
	public isRoomClearedOnce: boolean = false;
	public static isDoingUndo: boolean = false;
	public areMonstersInRoom: boolean = true;

	public commandQueue: number[] = [];

	public isStoppingEffectPlaying: boolean = false;
	public isStopEffectKeyReleased: boolean = false;
	public isStopEffectKeyCount = 0;

	public isRoomSliderKeyReleased: boolean = true;

	/**
	 * Helper variable used by debugTile();
	 */
	private debugTileCoordinates = new TGameObject();
	/**
	 * Helper variable used when room lock message appears
	 */
	private roomLockCoordinated = new TGameObject();

	public static lastCommand: number = -1;

	/**
	 * A helper to circumvent the bug when changing smoothness while the slide was happening.
	 */
	private waitingForEscape: boolean = false;

	private _minimap: TWidgetMinimap;
	private _largeMinimap: TWidgetLargeMinimap;

	public constructor() {
		super();

		this._uiLayer = RecamelLayerSprite.create();
		this._overLayer = RecamelLayerSprite.create();
		this.lockIcon = new Sprite(Gfx.LockTexture);
		this._minimap = new TWidgetMinimap(130, 138);
		this._largeMinimap = new TWidgetLargeMinimap();
		this._uiLayer.visible = false;
		this._overLayer.visible = false;

		this.lockIcon.x = 84;
		this.lockIcon.y = 522;

		this._minimap.x = 14;
		this._minimap.y = 448;

		this._minimap.on('click', () => this._largeMinimap.show());
		this._minimap.interactive = true;

		(window as any).debugState = this;
		(window as any).Game = Game;
	}

	public update() {
		this._overLayer.moveToFront();

		let forceFullRedraw: boolean = false;

		if (TEffectRoomSlide.instance) {
			return;
		}

		if (this._largeMinimap.visible) {
			this._largeMinimap.update();
			return;
		}

		if (PlatformOptions.isDebug && !TStateGame.isInputLocked) {
			// DEBUG
			if (RawInput.isMouseDown(0)) {
				if (RawInput.isCtrlDown) {
					if (Game.turnNo == 0) {
						Game.room.tilesSwords[Game.player.swordX + Game.player.swordY * S.RoomWidth]--;
					}

					Game.player.setPosition(
						(RawInput.localMouseX - S.LEVEL_OFFSET_X) / 22 | 0,
						(RawInput.localMouseY - S.LEVEL_OFFSET_Y) / 22 | 0,
					);
					this.drawActiveAndEffects(true);
				}
			} else if (RawInput.isMouseDown(2) && RawInput.isCtrlDown) {
				const x = (RawInput.localMouseX - S.LEVEL_OFFSET_X) / 22 | 0;
				const y = (RawInput.localMouseY - S.LEVEL_OFFSET_Y) / 22 | 0;

				if (F.isValidColRow(x, y)) {
					const monster = Game.room.tilesActive[x + y * S.RoomWidth];

					if (monster) {
						if (monster instanceof TMonsterPiece) {
							const parent = monster.monster;
							CueEvents.add(C.CID_SNAKE_DIED_FROM_TRUNCATION, parent);
							Game.room.killMonster(parent);
						} else {
							CueEvents.add(C.CID_MONSTER_DIED_FROM_STAB, monster);
							Game.room.killMonster(monster);
						}

						this.drawAll();
					}
				}
			}

			if (RawInput.isCtrlDown) {
				if (RawInput.isKeyPressed('a')) {
					Achievements.getActive().forEach(a => console.log(a.name, a._data));

				} else if (RawInput.isKeyPressed('ArrowLeft')) {
					RawInput.flushAll();
					Game.handleLeaveRoom(C.W, true);
					this.drawAll();
					return;
				} else if (RawInput.isKeyPressed('ArrowRight')) {
					RawInput.flushAll();
					Game.handleLeaveRoom(C.E, true);
					this.drawAll();
					return;
				} else if (RawInput.isKeyPressed('ArrowUp')) {
					RawInput.flushAll();
					Game.handleLeaveRoom(C.N, true);
					this.drawAll();
					return;
				} else if (RawInput.isKeyPressed('ArrowDown')) {
					RawInput.flushAll();
					Game.handleLeaveRoom(C.S, true);
					this.drawAll();
					return;
				} else if (RawInput.isKeyPressed(' ')) {
					new TEffectLevelStats(Game.getLevelStats(), 1500);

					this.isStoppingEffectPlaying = true;
					this.isStopEffectKeyReleased = false;
					return;
				} else if (RawInput.isKeyPressed('m')) {
					CueEvents.add(C.CID_HOLD_MASTERED);
					CueEvents.add(C.CID_SECRET_ROOM_FOUND);
					CueEvents.add(C.CID_COMPLETE_LEVEL);
					this.addFlashEvents();
				}
			}

			if (RawInput.isCtrlDown && RawInput.isKeyPressed('F12')) {
				Progress.clearProgress();
				Progress.saveProgress(true);
				Achievements.clearAll();
				TStateGame.startHold();
				return;
			}

			if (RawInput.isShiftDown && RawInput.isKeyPressed('F12')) {
				Achievements.clearAll();
				return;
			}

			if (RawInput.isKeyPressed('F7')) {
				const demo = Progress.getRoomDemo(Game.room.roomPid);

				if (demo.hasScore) {
					this.resetState();
					Progress.restoreToDemo(demo);
					Game.loadFromRoom(Progress.playerRoomPid, Progress.playerX, Progress.playerY, Progress.playerO);
					Game.startRoomX = demo.startX;
					Game.startRoomY = demo.startY;
					Game.startRoomO = demo.startO;

					Commands.fromString(demo.demoBuffer);
					Game.undoCommand();
					this.drawAll();
					this.drawActiveAndEffects(true);
					return;
				}
			}

			if (RawInput.isKeyPressed('F8')) {
				if (RawInput.isShiftDown) {
					for (let x = 0; x < S.RoomWidth; x++) {
						for (let y = 0; y < S.RoomHeight; y++) {
							if (F.isTar(Game.room.tilesTransparent[x + y * S.RoomWidth])) {
								Game.room.destroyTar(x, y);
							}
							if (F.isTrapdoor(Game.room.tilesOpaque[x + y * S.RoomWidth])) {
								Game.room.destroyTrapdoor(x, y);
							}
						}
					}
				}

				Game.room.clearMonsters(true);
				this.processCommand(C.CMD_WAIT);
				this.drawAll();
				return;
			} else if (RawInput.isKeyPressed('F9')) {
				const screenshot = new RecamelEffectScreenshot(2500);
				new RecamelEffectFade(screenshot.screenshot, 1, 0, 2500);

				new TStateOutro();
				Game.isGameActive = false;

				Sfx.playMusic(C.MUSIC_LEVEL_EXIT);
			}

		}

		if (!TStateGame.isInputLocked && !this.isStoppingEffectPlaying) {
			if (RawInput.isKeyPressed('Escape')) {
				RawInput.flushAll();

				this.waitingForEscape = true;
			} else if (RawInput.isKeyPressed('Enter')) {
				RawInput.flushAll();

				TWindowLevelScore.show();
				return;
			}
		}

		if (!this.isStoppingEffectPlaying && this.waitingForEscape && TStateGame.offsetNow == 0) {
			this.waitingForEscape = false;
			TWindowPause.show();
			return;
		}

		// PLAYER DEAD

		if (Game.isPlayerDying) {
			this.drawActiveAndEffects();

			if (RawInput.isKeyPressed(Core.getKey('restart')) || RawInput.isKeyPressed('F5')) {
				if (RawInput.isShiftDown) {
					this.restartCommand(true);
				} else {
					this.restartCommand();
				}

			} else if (RawInput.isKeyPressed(Core.getKey('undo'))) {
				this.undoCommand();
			}

			return;
		} else {
			TWidgetFace.setDying(false);
		}

		if (!TStateGame.isInputLocked && RawInput.isKeyPressed(' ')) {
			TWidgetSpeech.stopAllSpeech();
			forceFullRedraw = true;
		}

		if (this.isStoppingEffectPlaying) {
			this.drawActiveAndEffects(false);

			if (!this.isStopEffectKeyReleased && RawInput.keyDownCount === this.isStopEffectKeyCount) {
				return;
			}

			this.isStopEffectKeyReleased = true;

			if (RawInput.isAnyKeyPressed() || RawInput.isMousePressed(0)) {
				this.processStopEffectKeyPress();
			}

			return;
		}

		if (!TStateGame.isInputLocked && RawInput.isKeyPressed('Tab')) {
			TWindowAchievements.show();
			return;
		}


		if (RawInput.isKeyPressed('F3')) {
			TWidgetMoveCounter.toggle();
		}

		if (!TStateGame.isInputLocked && RawInput.isKeyPressed(Core.getKey('lock'))) {
			Game.isRoomLocked = !Game.isRoomLocked;
			this.drawAfterTurn();

			Sfx.roomLock();
		}

		if (!TStateGame.isInputLocked && RawInput.isKeyPressed('F1')) {
			TWindowHelp.show();
		}


		if (TStateGame.isInputLocked) {
			this.drawActiveAndEffects(false);
			return;
		}

		// COMMAND QUEUE

		DrodInput.update();

		while (this.commandQueue.length > 0) {
			this.processCommand(this.commandQueue.shift()!);
			if (!Game.isGameActive || this.isStoppingEffectPlaying) {
				this.commandQueue.length = 0;
				return;
			}
		}

		this.drawMimicPlacement();

		const mouseX = (RawInput.localMouseX - S.LEVEL_OFFSET_X) / 22 | 0;
		const mouseY = (RawInput.localMouseY - S.LEVEL_OFFSET_Y) / 22 | 0;
		if (RawInput.isMousePressed(0) && (!RawInput.isCtrlDown || !PlatformOptions.isDebug)) {
			if (Game.player.placingDoubleType) {
				this.processCommand(C.CMD_DOUBLE, mouseX, mouseY);
			} else {
				this.debugTile(mouseX, mouseY);
			}
		} else if (RawInput.isMousePressed(2) && (!RawInput.isCtrlDown || !PlatformOptions.isDebug)) {
			this.describeTile(mouseX, mouseY);
		}

		if (RawInput.isKeyPressed(Core.getKey('battle')) || RawInput.isKeyPressed('+')) {
			this.processCommand(F.reverseCommand(Commands.getLast()));

		} else if (DrodInput.doRotateCW()) {
			this.processCommand(C.CMD_C);
			if (DrodInput.isShiftDown()) {
				this.commandQueue.push(C.CMD_CC);
			}

		} else if (DrodInput.doRotateCCW()) {
			this.processCommand(C.CMD_CC);
			if (DrodInput.isShiftDown()) {
				this.commandQueue.push(C.CMD_C);
			}

		} else if (DrodInput.doMoveNW()) {
			this.processCommand(C.CMD_NW);
			if (DrodInput.isShiftDown()) {
				this.commandQueue.push(C.CMD_SE);
			}

		} else if (DrodInput.doMoveN()) {
			this.processCommand(C.CMD_N);
			if (DrodInput.isShiftDown()) {
				this.commandQueue.push(C.CMD_S);
			}

		} else if (DrodInput.doMoveNE()) {
			this.processCommand(C.CMD_NE);
			if (DrodInput.isShiftDown()) {
				this.commandQueue.push(C.CMD_SW);
			}

		} else if (DrodInput.doMoveW()) {
			this.processCommand(C.CMD_W);
			if (DrodInput.isShiftDown()) {
				this.commandQueue.push(C.CMD_E);
			}

		} else if (DrodInput.doMoveE()) {
			this.processCommand(C.CMD_E);
			if (DrodInput.isShiftDown()) {
				this.commandQueue.push(C.CMD_W);
			}

		} else if (DrodInput.doMoveSW()) {
			this.processCommand(C.CMD_SW);
			if (DrodInput.isShiftDown()) {
				this.commandQueue.push(C.CMD_NE);
			}

		} else if (DrodInput.doMoveS()) {
			this.processCommand(C.CMD_S);
			if (DrodInput.isShiftDown()) {
				this.commandQueue.push(C.CMD_N);
			}

		} else if (DrodInput.doMoveSE()) {
			this.processCommand(C.CMD_SE);
			if (DrodInput.isShiftDown()) {
				this.commandQueue.push(C.CMD_NW);
			}

		} else if (DrodInput.doMoveWait()) {
			this.processCommand(C.CMD_WAIT);
			if (DrodInput.isShiftDown()) {
				let i: number = 30 - (Game.spawnCycleCount % 30);
				while (i--) {
					this.commandQueue.push(C.CMD_WAIT);
				}
			}

		} else if (RawInput.isKeyPressed(Core.getKey('restart'))) {
			if (RawInput.isShiftDown) {
				this.restartCommand(true);
			} else {
				this.restartCommand();
			}

		} else if (RawInput.isKeyPressed('F5')) {
			this.restartCommand(true);
		} else if (RawInput.isKeyPressed(Core.getKey('undo'))) {
			this.undoCommand();
		} else {
			this.drawActiveAndEffects(forceFullRedraw);
		}
	}

	private drawMimicPlacement() {
		Game.room.mimicPlacement.visible = false;
		if (Game.player.placingDoubleType) {
			Game.room.mimicPlacement.visible = true;
			Game.room.mimicPlacement.update(
				Game.player.x,
				Game.player.y,
				Game.player.doubleCursorX,
				Game.player.doubleCursorY,
				Game.player.o,
				Game.room.doesSquareContainDoublePlacementObstacle(Game.player.doubleCursorX, Game.player.doubleCursorY)
			);
		}
	}

	public processCommand(command: number, wx: number = Number.MAX_VALUE, wy: number = Number.MAX_VALUE) {
		if (command == C.CMD_UNSPECIFIED) {
			return;
		}

		TWidgetSpeech.isPaused = false;
		TEffectBump.onCommandProcessed();

		Game.processCommand(command, wx, wy);

		Core.mouseVisibility(false);

		Game.updateTime();

		if (!Game.player.placingDoubleType) {
			TStateGame.offsetNow = TStateGame.offsetSpeed;
		}

		TStateGame.lastCommand = command;

		this.afterCommand();

		if (!this.isStoppingEffectPlaying && !Game.isPlayerDying) {
			Progress.saveProgress_commands();
		}
	}

	private afterCommand() {
		Game.room.drawPlots();

		this.processEvents();

		this.drawAfterTurn();

		Achievements.turnPassed();
		TWindowLevelStart.screenshot?.moveForward();
	}

	public drawAll() {
		if (Game.room.monsterCount == 0) {
			this.isRoomClearedOnce = true;
			this.areMonstersInRoom = false;
		}

		this._minimap.updateRoomState(Game.room.roomPid, this.isRoomClearedOnce);
		this._minimap.update(Game.room.roomPid);

		this.afterCommand();
	}

	private drawAfterTurn() {
		Game.room.drawPlots();

		TWidgetClock.update(!this.isScrollDisplayed && Game.room.isTimerNeeded(), Game.spawnCycleCount);

		TWidgetOrbHighlight.clear();

		this.drawActiveAndEffects(true);

		// Draw Invisibility rectangle
		Game.room.invisibilityRange.visible = Game.isInvisible;
		if (Game.isInvisible) {
			Game.room.invisibilityRange.x = Game.player.x * S.RoomTileWidth - C.DEFAULT_SMELL_RANGE * S.RoomTileWidth + S.LEVEL_OFFSET_X;
			Game.room.invisibilityRange.y = Game.player.y * S.RoomTileHeight - C.DEFAULT_SMELL_RANGE * S.RoomTileWidth + S.LEVEL_OFFSET_Y;
		}

		// Draw Mimic
		if (Game.player.placingDoubleType) {
			Game.room.setSaturation(0);

		} else {
			Game.room.setSaturation(1);
		}

		this.drawMimicPlacement();
		this.lockIcon.visible = Game.isRoomLocked;
	}

	private drawActiveAndEffects(force: boolean = false) {
		Game.player.setGfx();
		TWidgetFace.update();

		TWidgetSpeech.update();

		if (Game.room.monsterCount && UtilsRandom.fraction() < 0.0005 * Game.room.monsterCount) {
			const monster = Game.room.monsters.getRandom();
			if (monster) {
				monster.animationFrame = monster.animationFrame ? 0 : 1;
				monster.setGfx();
				monster.update();
			}
		}

		if (TStateGame.offsetNow > 0 || TStateGame.effectsAbove.length || TStateGame.effectsUnder.length || force) {
			if (TStateGame.offsetNow > 0) {
				TStateGame.offset = Math.max(0, --TStateGame.offsetNow / TStateGame.offsetSpeed);
				TGameObject.offset = TStateGame.offset;
			} else {
				TStateGame.offset = TGameObject.offset = TStateGame.offsetNow = 0;
			}

			TStateGame.effectsUnder.update();
			Game.player.update();
			Game.room.monsters.update();
			Game.room.roomSpritesRenderer.renderSwords();
			TStateGame.effectsAbove.update();

			TWidgetMoveCounter.draw();

			Game.room.roomSpritesRenderer.resetSwordDraws();
		} else {
			TStateGame.offset = TGameObject.offset = TStateGame.offsetNow = 0;
		}
	}

	public processEvents() {
		if (CueEvents.hasOccurred(C.CID_MONSTER_DIED_FROM_STAB)) {
			for (
				let monster = CueEvents.getFirstPrivateData(C.CID_MONSTER_DIED_FROM_STAB);
				monster != null;
				monster = CueEvents.getNextPrivateData()
			) {
				Game.room.roomSpritesRenderer.destroyObject(monster);
			}
		}

		if (CueEvents.hasOccurred(C.CID_SNAKE_DIED_FROM_TRUNCATION)) {
			for (
				let snake = CueEvents.getFirstPrivateData(C.CID_SNAKE_DIED_FROM_TRUNCATION);
				snake != null;
				snake = CueEvents.getNextPrivateData()
			) {
				Game.room.roomSpritesRenderer.destroyObject(snake);
			}
		}

		if (CueEvents.hasOccurred(C.CID_EGG_HATCHED)) {
			for (
				let egg = CueEvents.getFirstPrivateData(C.CID_EGG_HATCHED);
				egg != null;
				egg = CueEvents.getNextPrivateData()
			) {
				Game.room.roomSpritesRenderer.destroyObject(egg);
			}
		}


		if (CueEvents.hasOccurred(C.CID_EXIT_LEVEL_PENDING) || CueEvents.hasOccurred(C.CID_WIN_GAME)) {
			if (F.isStairs(Game.room.tilesOpaque[Game.player.x + Game.player.y * S.RoomWidth])) {
				new TEffectWalkStairs();

				if (CueEvents.hasOccurred(C.CID_WIN_GAME)) {
					new TEffectLevelStats(Game.getLevelStats(true), 1500);
				} else {
					new TEffectLevelStats(Game.getLevelStats(), 1500);
				}

				this.isStoppingEffectPlaying = true;
				this.isStopEffectKeyReleased = false;
				this.isStopEffectKeyCount = RawInput.keyDownCount;

				Sfx.playMusic(C.MUSIC_LEVEL_EXIT);

			} else if (CueEvents.hasOccurred(C.CID_WIN_GAME)) {
				const screenshot = new RecamelEffectScreenshot(2500);
				new RecamelEffectFade(screenshot.screenshot, 1, 0, 2500);

				new TStateOutro();
				Progress.clearStoredCommands();
				Progress.isGameCompleted = true;
				Game.isGameActive = false;

				Sfx.playMusic(C.MUSIC_LEVEL_EXIT);

			} else {
				const coords = CueEvents.getFirstPrivateData(C.CID_EXIT_LEVEL_PENDING);

				this.drawAfterTurn();

				TWindowLevelStart.show(coords.x, true, coords.y > 0);

				this.resetState();

				Game.loadFromLevelEntrance(coords.x);
				this.drawAfterTurn();
				Game.room.drawPlots();

				if (coords.y) {
					TWindowLevelStart.doCrossFade();
				}

				this._minimap.changedLevel(Game.room.levelId);
			}
		}

		if (CueEvents.hasOccurred(C.CID_ENTER_ROOM)) {
			const exitRoom: string = CueEvents.getFirstPrivateData(C.CID_EXIT_ROOM);
			TStateGame.lastCommand = -1;

			this.isRoomClearedOnce = false;

			this.resetState();

			this._minimap.addRoom(Game.room.roomPid);

			// Update the state of the room we just left on the minimap
			if (exitRoom) {
				this._minimap.updateRoomState(exitRoom, false);
			}

			this._minimap.update(Game.room.roomPid);

			TWidgetLevelName.update(Game.room.roomPid);

			TStateGame.updateMusicState();

			Game.player.hidePlayer = true;
			this.drawAfterTurn();


			if (TEffectRoomSlide.instance) {
				TEffectRoomSlide.instance.setNew(Game.room);
				TEffectRoomSlide.instance.start(exitRoom,
					CueEvents.getFirstPrivateData(C.CID_ENTER_ROOM));

				this.isRoomSliderKeyReleased = false;
			}

			Game.player.hidePlayer = false;
			Game.player.update();
		}

		if (CueEvents.hasAnyOccurred(C.CIDA_PLAYER_LEFT_ROOM)) {
			this.isRoomClearedOnce = false;
		}

		if (CueEvents.hasOccurred(C.CID_CONQUER_ROOM))
			this._minimap.updateRoomState(CueEvents.getFirstPrivateData(C.CID_CONQUER_ROOM), false);
		{
			if (CueEvents.hasOccurred(C.CID_ROOM_EXIT_LOCKED)) {
				this.roomLockCoordinated.x = Game.player.x;
				this.roomLockCoordinated.y = Game.player.y;

				TWidgetSpeech.addInfoSubtitle(
					this.roomLockCoordinated,
					_r("ingame.message.room_locked", {
						lock_key: RawInput.translateKeyName(Core.getKey('lock')),
					}),
					2000
				);

				Sfx.roomLock();
			}
		}

		if (CueEvents.hasOccurred(C.CID_SUBMIT_SCORE)) {

		} else if (CueEvents.hasOccurred(C.CID_ROOM_FIRST_VISIT)) {
		}

		this.addEffects();

		this.processQuestionPrompts();
	}

	public addFlashEvents() {
		let textFlashOffset: number = 200;
		let scrollTextId: string;

		if (CueEvents.hasOccurred(C.CID_COMPLETE_LEVEL)) {
			new TEffectTextFlash(_("ingame.flash_message.level_completed"), textFlashOffset);
			textFlashOffset += 62;
			Sfx.levelCompleted();
		}

		if (CueEvents.hasOccurred(C.CID_SECRET_ROOM_FOUND)) {
			new TEffectTextFlash(_("ingame.flash_message.secret_found"), textFlashOffset);
			textFlashOffset += 62;
			Sfx.secretFound();
		}

		if (CueEvents.hasOccurred(C.CID_HOLD_MASTERED)) {
			new TEffectTextFlash(_("ingame.flash_message.hold_mastered"), textFlashOffset);
			Sfx.holdMastered();
		}

		if (CueEvents.hasOccurred(C.CID_STEP_ON_SCROLL)) {
			for (scrollTextId = CueEvents.getFirstPrivateData(C.CID_STEP_ON_SCROLL); scrollTextId != null;
				scrollTextId = CueEvents.getNextPrivateData()) {
				TWidgetFace.setReading(true);
				TWidgetClock.update(false, 0);
				TWidgetScroll.update(true, _(scrollTextId));

				this.isScrollDisplayed = true;

				Sfx.scrollRead();
			}
		}

		this.processSpeech();
	}

	public processSpeech() {
		for (let speech = CueEvents.getFirstPrivateData(C.CID_SPEECH); speech != null;
			speech = CueEvents.getNextPrivateData()) {
			TWidgetSpeech.parseSpeechEvent(speech);
		}
	}

	private processStopEffectKeyPress() {
		if (CueEvents.hasOccurred(C.CID_WIN_GAME)) {
			new TStateOutro();
			Progress.clearStoredCommands();
			Progress.isGameCompleted = true;

		} else if (CueEvents.hasOccurred(C.CID_EXIT_LEVEL_PENDING)) {
			const i = CueEvents.getFirstPrivateData(C.CID_EXIT_LEVEL_PENDING);

			TWindowLevelStart.show(i.x, true, i.y as boolean);

			this.resetState();

			Game.loadFromLevelEntrance(i.x);
			this.drawAfterTurn();
			Game.room.drawPlots();

			Achievements.initRoomStarted();

			this._minimap.changedLevel(Game.room.levelId);
			this._minimap.addRoom(Game.room.roomPid);
			this._minimap.update(Game.room.roomPid);

			TWidgetLevelName.update(Game.room.roomPid);
			TWindowLevelStart.screenshot?.moveForward();
		}
	}


	/******************************************************************************************************/
	/**                                                                                          EFFECTS  */

	/******************************************************************************************************/

	private addEffects() {
		let unknown: any;
		let coord: VOCoord;
		let monster: TMonster;

		const isPlayerDead: boolean = CueEvents.hasAnyOccurred(C.CIDA_PLAYER_DIED);

		if (CueEvents.hasOccurred(C.CID_ORB_ACTIVATED_BY_PLAYER) || CueEvents.hasOccurred(C.CID_ORB_ACTIVATED_BY_DOUBLE)) {
			for (unknown = CueEvents.getFirstPrivateData(C.CID_ORB_ACTIVATED_BY_PLAYER); unknown != null;
				unknown = CueEvents.getNextPrivateData()) {
				new TEffectOrbHit(unknown, true);
			}

			for (unknown = CueEvents.getFirstPrivateData(C.CID_ORB_ACTIVATED_BY_DOUBLE); unknown != null;
				unknown = CueEvents.getNextPrivateData()) {
				new TEffectOrbHit(unknown, true);
			}

			Sfx.orbHit();
		}

		if (CueEvents.hasOccurred(C.CID_SWING_SWORD)) {
			for (coord = CueEvents.getFirstPrivateData(C.CID_SWING_SWORD); coord != null;
				coord = CueEvents.getNextPrivateData()) {
				new TEffectSwordSwing(coord.x, coord.y, coord.o);
			}

			Sfx.swordSwing();
		}

		if (CueEvents.hasOccurred(C.CID_MONSTER_DIED_FROM_STAB)) {
			for (monster = CueEvents.getFirstPrivateData(C.CID_MONSTER_DIED_FROM_STAB); monster != null;
				monster = CueEvents.getNextPrivateData()) {
				this.addDamageEffect(monster.getType(), new VOCoord(monster.x, monster.y, monster.killDirection));
			}

			Sfx.monsterKilled();
		}

		if (CueEvents.hasOccurred(C.CID_SNAKE_DIED_FROM_TRUNCATION)) {
			for (monster = CueEvents.getFirstPrivateData(C.CID_SNAKE_DIED_FROM_TRUNCATION); monster != null;
				monster = CueEvents.getNextPrivateData()) {
				this.addDamageEffect(monster.getType(), new VOCoord(monster.x, monster.y, C.NO_ORIENTATION));
			}

			Sfx.monsterKilled();
		}

		if (CueEvents.hasOccurred(C.CID_TRAPDOOR_REMOVED)) {
			for (coord = CueEvents.getFirstPrivateData(C.CID_TRAPDOOR_REMOVED); coord != null;
				coord = CueEvents.getNextPrivateData()) {
				new TEffectTrapdoorFall(coord.x, coord.y);
			}

			Sfx.trapdoorFell();
		}

		if (CueEvents.hasOccurred(C.CID_CHECKPOINT_ACTIVATED)) {
			for (coord = CueEvents.getFirstPrivateData(C.CID_CHECKPOINT_ACTIVATED); coord != null;
				coord = CueEvents.getNextPrivateData()) {
				new TEffectCheckpoint(coord);
			}

			Sfx.checkpoint();
		}

		if (CueEvents.hasOccurred(C.CID_CRUMBLY_WALL_DESTROYED)) {
			for (coord = CueEvents.getFirstPrivateData(C.CID_CRUMBLY_WALL_DESTROYED); coord != null;
				coord = CueEvents.getNextPrivateData()) {
				new TEffectDebris(coord, 10, 5, 1.5);
				new TEffectVermin(coord);
			}

			Sfx.crumblyWallDestroy();
		}

		for (coord = CueEvents.getFirstPrivateData(C.CID_TARSTUFF_DESTROYED); coord != null;
			coord = CueEvents.getNextPrivateData()) {
			new TEffectTarSplatter(coord, 10, 3);
		}

		for (coord = CueEvents.getFirstPrivateData(C.CID_EVIL_EYE_WOKE); coord != null;
			coord = CueEvents.getNextPrivateData()) {
			new TEffectEvilEyeGaze(coord);
		}

		if (CueEvents.hasOccurred(C.CID_STEP)) {
			if (this.isScrollDisplayed && !CueEvents.hasOccurred(C.CID_STEP_ON_SCROLL)) {
				TWidgetFace.setReading(false);
				this.isScrollDisplayed = false;
				TWidgetScroll.update(false);
			}

			Sfx.playerStep();
		}

		this.addFlashEvents();

		if (CueEvents.hasOccurred(C.CID_EVIL_EYE_WOKE)) {
			Sfx.evilEyeWoke();
		}

		if (CueEvents.hasOccurred(C.CID_TARSTUFF_DESTROYED)) {
			Sfx.tarSplatter();
		}

		if (CueEvents.hasOccurred(C.CID_DOUBLE_PLACED)) {
			Sfx.doublePlaced();
		}

		if (CueEvents.hasOccurred(C.CID_ALL_BRAINS_REMOVED)) {
			Sfx.brainsKilled();
		}

		if (CueEvents.hasOccurred(C.CID_DRANK_POTION)) {
			Sfx.potionDrank();
		}

		if (CueEvents.hasOccurred(C.CID_BLACK_GATES_TOGGLED) || CueEvents.hasOccurred(C.CID_RED_GATES_TOGGLED) ||
			CueEvents.getFirstPrivateData(C.CID_ROOM_CONQUER_PENDING) === true) {

			Sfx.gates();
		}

		if (CueEvents.hasOccurred(C.CID_TAR_BABY_FORMED)) {
			TStateGame.updateMusicState();

			if (this.isRoomClearedOnce && !this.areMonstersInRoom && Game.room.monsterCount) {
				this.areMonstersInRoom = true;

				this._minimap.updateRoomState(Game.room.roomPid, false);
				this._minimap.update(Game.room.roomPid);
			}
		}

		if (!this.isRoomClearedOnce) {
			if (CueEvents.hasOccurred(C.CID_ROOM_CONQUER_PENDING)) {
				this._minimap.updateRoomState(Game.room.roomPid, true);
				this._minimap.update(Game.room.roomPid);
				this.isRoomClearedOnce = true;
				this.areMonstersInRoom = false;
			}
		} else {
			if (this.areMonstersInRoom && Game.room.monsterCount == 0) {
				this.areMonstersInRoom = false;
				this._minimap.updateRoomState(Game.room.roomPid, true);
				this._minimap.update(Game.room.roomPid);
			}
		}

		if (CueEvents.hasOccurred(C.CID_ROOM_CONQUER_PENDING) &&
			CueEvents.getFirstPrivateData(C.CID_ROOM_CONQUER_PENDING) !== null &&
			!isPlayerDead) {

			Sfx.roomConquered();
		}

		if (CueEvents.hasOccurred(C.CID_SWORDSMAN_AFRAID)) {
			TWidgetFace.setMood('player', TWidgetFace.MOOD_NERVOUS);
		} else if (CueEvents.hasOccurred(C.CID_SWORDSMAN_AGGRESSIVE)) {
			TWidgetFace.setMood('player', TWidgetFace.MOOD_AGGRESSIVE);
		} else if (CueEvents.hasOccurred(C.CID_SWORDSMAN_NORMAL)) {
			TWidgetFace.setMood('player', TWidgetFace.MOOD_NORMAL);
		}

		if (CueEvents.hasAnyOccurred(C.CIDA_PLAYER_DIED)) {
			Sfx.playerDies();
			new TEffectPlayerDeath();
			new TEffectsPlayerDeathFade();

		} else if (CueEvents.hasOccurred(C.CID_SWORDSMAN_STABBED_MONSTER)) {
			TWidgetFace.setMood('player', TWidgetFace.MOOD_STRIKE, 200);
		}

		if (CueEvents.hasOccurred(C.CID_HIT_OBSTACLE)) {
			Sfx.playerHitsObstacle();

			coord = CueEvents.getFirstPrivateData(C.CID_HIT_OBSTACLE);
			if (coord) {
				new TEffectBump(coord);
			}

		} else if (CueEvents.hasOccurred(C.CID_SCARED)) {
			Sfx.beethroScared();
			TWidgetFace.setMood('player', TWidgetFace.MOOD_NERVOUS, 200);
		}
	}

	private addDamageEffect(monsterType: number, coords: VOCoord) {
		switch (monsterType) {
			case (C.M_TAR_BABY):
			case (C.M_TAR_MOTHER):
				new TEffectTarSplatter(coords, 7, 3);
				break;


			default:
				new TEffectBlood(coords, 16, 7, 2);
				break;
		}
	}

	public static updateMusicState() {
		const monsterCount: number = Game.room.monsterCount;

		if (monsterCount == 0) {
			Sfx.crossFadeMusic(C.MUSIC_AMBIENT);
		} else if (monsterCount < 30) {
			Sfx.crossFadeMusic(C.MUSIC_PUZZLE);
		} else {
			Sfx.crossFadeMusic(C.MUSIC_ACTION);
		}
	}


	/******************************************************************************************************/
	/**                                                                                         COMMANDS  */

	/******************************************************************************************************/

	private resetState() {
		this.commandQueue.length = 0;

		this.isStoppingEffectPlaying = false;
		this.isRoomClearedOnce = false;
		this.isScrollDisplayed = false;
		this.areMonstersInRoom = true;

		for (const effect of TStateGame.effectsAbove.getAllOriginal()) {
			effect?.end();
		}
		for (const effect of TStateGame.effectsUnder.getAllOriginal()) {
			effect?.end();
		}
		TStateGame.effectsAbove.clear();
		TStateGame.effectsUnder.clear();

		TWidgetSpeech.clear();
		TWidgetFace.setMood('player', TWidgetFace.MOOD_NORMAL);
		TWidgetScroll.update(false);

		Achievements.initRoomStarted();

		TStateGame.lastCommand = -1;
	}

	public restartCommand(restartAll: boolean = false) {
		this.resetState();

		TStateGame.isDoingUndo = true;

		if (restartAll) {
			Game.restartRoom();
		} else {
			Game.restartRoomFromLastCheckpoint();
		}

		this.drawAll();
		this.drawMimicPlacement();

		Achievements.turnPassed();

		TStateGame.lastCommand = C.CMD_UNDO;
		Achievements.turnPassed();


		TStateGame.isDoingUndo = false;
	}

	public undoCommand() {
		TStateGame.isDoingUndo = true;

		this.resetState();

		if (Commands.count() == 0) {
			return;
		}

		Game.undoCommand();

		this.drawAll();

		TStateGame.lastCommand = C.CMD_UNDO;
		Achievements.turnPassed();


		TStateGame.isDoingUndo = false;
	}

	public create() {
		TWidgetSpeech.isPaused = true;

		this._uiLayer.visible = true;
		this._uiLayer.moveToBack();
		this._overLayer.visible = true;
		this._overLayer.moveToBack();

		HelpRoomOpener.enabled = true;
		Game.statStartTime = Date.now();
		this.processEvents();
		this.drawAfterTurn();
		Game.room.drawPlots();

		TWidgetFace.update();
		this._minimap.changedLevel(Game.room.levelId);
		this._minimap.update(Game.room.roomPid);

		TStateGame.updateMusicState();

		document.addEventListener('pointermove', this.onMouseMoved);
		CueEvents.clear();

		if (PlatformOptions.isGame) {
			this._uiLayer.addAt(new Sprite(Gfx.InGameScreenTexture), 0);
			this._uiLayer.add(TWidgetFace.container);
			this._uiLayer.add(TWidgetLevelName.container);
			this._uiLayer.add(this._minimap);
			this._uiLayer.add(TWidgetScroll.container);
			this._uiLayer.add(TWidgetClock.container);
			this._uiLayer.add(this.lockIcon);
			this._overLayer.add(TWidgetOrbHighlight.container);
			this._overLayer.add(this._largeMinimap);
		}
	}

	public destroy() {
		this._uiLayer.clear();
		this._uiLayer.visible = false;
		this._overLayer.clear();
		this._overLayer.visible = false;

		HelpRoomOpener.enabled = false;
		document.removeEventListener('pointermove', this.onMouseMoved);
		Core.mouseVisibility(true);
		Game.room.layerEffects.visible = false;
		Game.room.layerUnder.visible = false;
		Game.room.layerSprites.visible = false;
		Game.room.layerUI.visible = false;
		Core.lMain.clear();
	}

	public teardown() {
		Game.room?.clear();
		this._uiLayer.removeLayer();
		this._overLayer.removeLayer();
	}

	public static continuePlaying() {
		CueEvents.clear();

		if (!Game.room) {
			if (Progress.hasSaveGame()) {
				TStateGame.restoreGame();

			} else {
				TStateGame.startHold();
			}
		} else {
			Game.room.layerUnder.visible = true;
			Game.room.layerSprites.visible = true;
			Game.room.layerEffects.visible = true;
			Game.room.layerUI.visible = true;
			TStateGame.show();
		}
	}

	public static startHold() {
		Progress.clearStoredCommands();
		CueEvents.clear();

		const entrance: Element = Level.getFirstHoldEntrance();
		Game.loadFromLevelEntrance(intAttr(entrance, 'EntranceID'));
		Game.room.layerUnder.visible = false;
		Game.room.layerSprites.visible = false;
		Game.room.layerEffects.visible = false;
		TWindowLevelStart.show(intAttr(entrance, 'EntranceID'), true);
		Game.room.layerUnder.visible = true;
		Game.room.layerSprites.visible = true;
		Game.room.layerEffects.visible = true;

		TStateGame.show();

		if (!Progress.isGameMastered && Progress.checkHoldMastery()) {
			CueEvents.add(C.CID_HOLD_MASTERED);
			Progress.isGameMastered = true;
		}
	}

	public static restoreGame() {
		CueEvents.clear();
		Level.restoreTo(Progress.playerRoomPid, Progress.playerX, Progress.playerY, Progress.playerO);
		TStateGame.show();
		TStateGame.instance.processSpeech();

		if (!Progress.isGameMastered && Progress.checkHoldMastery()) {
			CueEvents.add(C.CID_HOLD_MASTERED);
			Progress.isGameMastered = true;
		}
	}

	private describeTile(x: number, y: number) {
		if (!F.isValidColRow(x, y)) {
			return;
		}

		const index = x + y * S.RoomWidth;

		let toTrace: string = "(" + x + "," + y + ")";
		toTrace += "\n";

		if (Game.player.x == x && Game.player.y == y) {
			toTrace += _("ingame.monster.player");
			toTrace += "\n";
		}

		// Monster
		let monster = Game.room.tilesActive[index];
		if (monster) {
			if (monster.isPiece()) {
				monster = (monster as TMonsterPiece).monster;
			}

			if (monster.isNeather) {
				toTrace += _("ingame.monster.neather");

			} else {
				toTrace += _(`ingame.monster.${monster.getType()}`);
			}

			const monsterIndex: number = Game.room.monsters.getIndexOf(monster) + 1;

			if (monsterIndex > 0) {
				toTrace += " (#" + monsterIndex + ")";
			}

			toTrace += "\n";
		}

		// Transparent Layer
		let tile: number = Game.room.tilesTransparent[index];
		if (tile != C.T_EMPTY) {
			toTrace += _(`ingame.tile.${tile}`);
			toTrace += "\n";
		}

		// Floor Layer
		tile = Game.room.tilesFloor[index];
		if (tile != 0) {
			toTrace += _(`ingame.tile.${tile}`);
			toTrace += "\n";
		}

		// Checkpoint
		if (Game.room.checkpoints.contains(x, y)) {
			toTrace += _("ingame.tile.checkpoint");
			toTrace += "\n";
		}

		// Opaque Layer, is always described
		tile = Game.room.tilesOpaque[index];
		if (tile != 0) {
			if (tile == C.T_WALL && (Game.room.roomTileRenderer.opaqueData[index] & T.WALL_SECRET_OFFSET)) {
				toTrace += _("ingame.tile.62");
			} else {
				toTrace += _(`ingame.tile.${tile}`);
			}

			toTrace += "\n";
		}

		const swords: number = Game.room.tilesSwords[index];
		if (swords == 1) {
			toTrace += _("ingame.tile.sword");
		} else if (swords != 0) {
			toTrace += _("ingame.tile.swords", swords);
		}

		this.debugTileCoordinates.x = x;
		this.debugTileCoordinates.y = y;

		TWidgetSpeech.addInfoSubtitle(this.debugTileCoordinates, toTrace, 2000);
	}

	/**
	 * Displays information about tile the user has just clicked
	 *
	 * @param	x Tile X position
	 * @param	y Tile Y position
	 */
	private debugTile(x: number, y: number) {
		if (!F.isValidColRow(x, y)) {
			return;
		}

		const index = x + y * S.RoomWidth;
		let drawEffects = false;

		// Monster
		let monster = Game.room.tilesActive[index];
		if (monster) {
			if (monster.isPiece()) {
				monster = (monster as TMonsterPiece).monster;
			}

			if (monster instanceof TEvilEye) {
				new TEffectEvilEyeGaze(new VOCoord(x, y, monster.o));
				drawEffects = true;
			}
		}

		// Transparent Layer
		let tile: number = Game.room.tilesTransparent[index];
		if (tile != C.T_EMPTY) {
			if (tile == C.T_ORB) {
				TWidgetOrbHighlight.drawOrbHighlights(x, y);
				drawEffects = true;

			} else {
				TWidgetOrbHighlight.clear();
				drawEffects = true;
			}
		} else {
			TWidgetOrbHighlight.clear();
			drawEffects = true;
		}

		// Opaque Layer, is always described
		tile = Game.room.tilesOpaque[index];
		if (tile != 0) {
			if (tile === C.T_DOOR_Y || tile === C.T_DOOR_YO) {
				TWidgetOrbHighlight.drawDoorHighlights(x, y);
				drawEffects = true;
			}
		}

		if (drawEffects) {
			this.drawActiveAndEffects(true);
		}
	}

	private onMouseMoved = () => {
		Core.mouseVisibility(true);
	}

	private processQuestionPrompts(): void {
		const question = Game.pendingQuestions.shift();

		if (!question) {
			return;
		}

		switch (question.type) {
			case MonsterMessageType.NeatherImpossibleKill:
				return void TWindowMessage.show(
					question.message,
					300,
					false,
					false
				);

			case MonsterMessageType.NeatherSpareQuestion:
				return void TWindowYesNoMessage.show(
					question.message,
					300,
					false,
					false,
					answer => {
						if (answer) {
							Commands.add(C.CMD_YES);
						} else {
							Commands.add(C.CMD_NO);
						}
						const neather = question.sender;

						if (neather instanceof TCharacter) {
							neather.handleNeatherSpare(answer);
						}

						this.processEvents();
					}
				);
		}
	}
}


DebugConsole.registerAction('clear-room', "Clears the current room. It's cheating and can work weird! Use only for debugging.", () => {
	if (RecamelCore.currentState !== TStateGame.instance) {
		throw new Error("Must be playing game to run this command");
	}

	for (const monster of Game.room.monsters.getAll()) {
		if (!monster) {
			continue;
		}
		if (monster instanceof TMonsterPiece) {
			const parent = monster.monster;
			CueEvents.add(C.CID_SNAKE_DIED_FROM_TRUNCATION, parent);
			Game.room.killMonster(parent);
		} else {
			CueEvents.add(C.CID_MONSTER_DIED_FROM_STAB, monster);
			Game.room.killMonster(monster);
		}
	}

	Game.toggleGreenDoors();
	TStateGame.instance.drawAll();
});