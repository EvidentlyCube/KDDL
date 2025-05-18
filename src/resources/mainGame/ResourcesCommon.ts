/// <reference path='../../index.d.ts'/>

import * as TutorialKeysPath from '../../../src.assets/gfx/by_maurycy/ui/Keys.png';

import * as ButtonSystemPath from '../../../src.assets/gfx/by_maurycy/ui/buttonSystem.jpg';
import * as ButtonSystemDownPath from '../../../src.assets/gfx/by_maurycy/ui/buttonSystemDown.jpg';
import * as WindowSystemPath from '../../../src.assets/gfx/by_maurycy/ui/windowSystem.jpg';
import * as TooltipSystemPath from '../../../src.assets/gfx/by_maurycy/ui/tooltipSystem.jpg';
import * as TextInputPath from '../../../src.assets/gfx/by_maurycy/ui/TextInput.jpg';
import * as GameScreenPath from '../../../src.assets/gfx/by_caravelgames/bgs/GameScreen.jpg';
import * as LogoPath from '../../../src.assets/gfx/by_maurycy/ui/logo_common.png';

import * as GeneralPath from '../../../src.assets/gfx/by_caravelgames/tiles/general.png';
import * as EffectsPath from '../../../src.assets/gfx/by_caravelgames/sprites/effects.png';
import * as BoltsPath from '../../../src.assets/gfx/by_caravelgames/sprites/bolts.png';
import * as FacesPath from '../../../src.assets/gfx/by_caravelgames/ui/faces.png';
import * as FaceEyesPath from '../../../src.assets/gfx/by_caravelgames/ui/face_eyes.png';
import * as EyesPath from '../../../src.assets/gfx/by_caravelgames/ui/eyes.png';
import * as ScrollsPath from '../../../src.assets/gfx/by_caravelgames/ui/scrolls.png';
import * as MenuBGPath from '../../../src.assets/gfx/by_caravelgames/ui/menuBG.jpg';
import * as PreloaderPath from '../../../src.assets/gfx/by_mixed/bgs/preloader_2.jpg';
import * as LevelStartBackgroundPath from '../../../src.assets/gfx/by_caravelgames/bgs/levelStartBackground.jpg';
import * as TitleScreenPath from '../../../src.assets/gfx/by_mixed/bgs/titleScreen.jpg';
import * as LogoCaravelPath from '../../../src.assets/gfx/by_caravelgames/bgs/logoCaravel.jpg';
import * as LogoRetrocadePath from '../../../src.assets/gfx/by_mixed/bgs/logoRetrocade.jpg';
import * as AchievementPath from '../../../src.assets/gfx/by_mixed/ui/achievement.png';
import * as LockPath from '../../../src.assets/gfx/by_maurycy/ui/lock.png';

import * as LocaleCreditsPath from '../../../src.assets/i18n/credits.txt';
import * as LocaleEn_KeyNames_Path from '../../../src.assets/i18n/en/key_names.yml';
import * as LocaleEn_UI_Path from '../../../src.assets/i18n/en/ui.yml';
import * as LocaleEn_Controls_Path from '../../../src.assets/i18n/en/controls.yml';
import * as LocaleEn_Ingame_Path from '../../../src.assets/i18n/en/ingame.yml';
import * as LocaleEn_Achievements_Path from '../../../src.assets/i18n/en/common_achievements.yml';
import * as LocaleEn_Outro_Common_Path from '../../../src.assets/i18n/en/outro_common.yml';

import {ResourcesQueue} from "./ResourcesQueue";
import {C} from "../../C";

import * as BeethroScared1Path from "../../../src.assets/sfx/BeethroScared1.ogg";
import * as BeethroScared2Path from "../../../src.assets/sfx/BeethroScared2.ogg";
import * as BeethroScared3Path from "../../../src.assets/sfx/BeethroScared3.ogg";
import * as BellPath from "../../../src.assets/sfx/Bell.ogg";
import * as BrainsKilledPath from "../../../src.assets/sfx/BrainsKilled.ogg";
import * as ButtonClickPath from "../../../src.assets/sfx/ButtonClick.ogg";
import * as CheckpointPath from "../../../src.assets/sfx/Checkpoint.ogg";
import * as CrumblyDestroy1Path from "../../../src.assets/sfx/CrumblyDestroy_1.ogg";
import * as CrumblyDestroy2Path from "../../../src.assets/sfx/CrumblyDestroy_2.ogg";
import * as CrumblyDestroy3Path from "../../../src.assets/sfx/CrumblyDestroy_3.ogg";
import * as EvilEyeWake1Path from "../../../src.assets/sfx/EvilEyeWake_1.ogg";
import * as EvilEyeWake2Path from "../../../src.assets/sfx/EvilEyeWake_2.ogg";
import * as EvilEyeWake3Path from "../../../src.assets/sfx/EvilEyeWake_3.ogg";
import * as GatesPath from "../../../src.assets/sfx/Gates.ogg";
import * as HitObstacle1Path from "../../../src.assets/sfx/HitObstacle_1.ogg";
import * as HitObstacle2Path from "../../../src.assets/sfx/HitObstacle_2.ogg";
import * as HitObstacle3Path from "../../../src.assets/sfx/HitObstacle_3.ogg";
import * as MimicPlacedPath from "../../../src.assets/sfx/MimicPlaced.ogg";
import * as MonsterKill1Path from "../../../src.assets/sfx/MonsterKilled_1.ogg";
import * as MonsterKill2Path from "../../../src.assets/sfx/MonsterKilled_2.ogg";
import * as MonsterKill3Path from "../../../src.assets/sfx/MonsterKilled_3.ogg";
import * as MonsterKill4Path from "../../../src.assets/sfx/MonsterKilled_4.ogg";
import * as MonsterKill5Path from "../../../src.assets/sfx/MonsterKilled_5.ogg";
import * as MonsterKill6Path from "../../../src.assets/sfx/MonsterKilled_6.ogg";
import * as MonsterKill7Path from "../../../src.assets/sfx/MonsterKilled_7.ogg";
import * as MonsterKill8Path from "../../../src.assets/sfx/MonsterKilled_8.ogg";
import * as MonsterKill9Path from "../../../src.assets/sfx/MonsterKilled_9.ogg";
import * as OrbHitPath from "../../../src.assets/sfx/OrbHit.ogg";
import * as PlayerDeath1Path from "../../../src.assets/sfx/PlayerDeath_1.ogg";
import * as PlayerDeath2Path from "../../../src.assets/sfx/PlayerDeath_2.ogg";
import * as PotionDrankPath from "../../../src.assets/sfx/PotionDrank.ogg";
import * as RoomConquered1Path from "../../../src.assets/sfx/RoomConquered_1.ogg";
import * as RoomConquered2Path from "../../../src.assets/sfx/RoomConquered_2.ogg";
import * as RoomConquered3Path from "../../../src.assets/sfx/RoomConquered_3.ogg";
import * as ScrollReadPath from "../../../src.assets/sfx/ScrollRead.ogg";
import * as ShortHarpsPath from "../../../src.assets/sfx/ShortHarps.ogg";
import * as Step1Path from "../../../src.assets/sfx/Step_1.ogg";
import * as Step2Path from "../../../src.assets/sfx/Step_2.ogg";
import * as Step3Path from "../../../src.assets/sfx/Step_3.ogg";
import * as SwordSwing1Path from "../../../src.assets/sfx/SwordSwing_1.ogg";
import * as SwordSwing2Path from "../../../src.assets/sfx/SwordSwing_2.ogg";
import * as SwordSwing3Path from "../../../src.assets/sfx/SwordSwing_3.ogg";
import * as TarSplatter1Path from "../../../src.assets/sfx/TarSplatter_1.ogg";
import * as TarSplatter2Path from "../../../src.assets/sfx/TarSplatter_2.ogg";
import * as TarSplatter3Path from "../../../src.assets/sfx/TarSplatter_3.ogg";
import * as Trapdoor1Path from "../../../src.assets/sfx/Trapdoor_1.ogg";
import * as Trapdoor2Path from "../../../src.assets/sfx/Trapdoor_2.ogg";
import * as Trapdoor3Path from "../../../src.assets/sfx/Trapdoor_3.ogg";
import {DROD} from "../../game/global/DROD";
import {HoldOptions} from "../../platform/PlatformSpecific";
import {StyleResourceAboveground} from "./StyleResourceAboveground";
import {StyleResourceIceworks} from "./StyleResourceIceworks";
import {StyleResourceFoundation} from "./StyleResourceFoundation";
import {StyleResourceFortress} from "./StyleResourceFortress";
import {StyleResourceDeepSpaces} from "./StyleResourceDeepSpaces";

import * as MusicAmbient1Path from "../../../src.assets/music/Kdd1_Ambient.mp3";
import * as MusicAmbient2Path from "../../../src.assets/music/Kdd2_Ambient.mp3";
import * as MusicAmbient3Path from "../../../src.assets/music/Kdd3_Ambient.mp3";
import * as MusicWinLevel1Path from "../../../src.assets/music/Kdd1_WinLevel.mp3";
import * as MusicWinLevel2Path from "../../../src.assets/music/Kdd2_WinLevel.mp3";
import * as MusicWinLevel3Path from "../../../src.assets/music/Kdd3_WinLevel.mp3";
import * as MusicAttack1Path from "../../../src.assets/music/Kdd1_Attack_1.mp3";
import * as MusicAttack2Path from "../../../src.assets/music/Kdd1_Attack_2.mp3";
import * as MusicAttack3Path from "../../../src.assets/music/Kdd2_Attack_1.mp3";
import * as MusicAttack4Path from "../../../src.assets/music/Kdd2_Attack_2.mp3";
import * as MusicAttack5Path from "../../../src.assets/music/Kdd3_Attack_1.mp3";
import * as MusicAttack6Path from "../../../src.assets/music/Kdd3_Attack_2.mp3";
import * as MusicPuzzle1Path from "../../../src.assets/music/Kdd1_Puzzle_1.mp3";
import * as MusicPuzzle2Path from "../../../src.assets/music/Kdd1_Puzzle_2.mp3";
import * as MusicPuzzle3Path from "../../../src.assets/music/Kdd2_Puzzle_1.mp3";
import * as MusicPuzzle4Path from "../../../src.assets/music/Kdd2_Puzzle_2.mp3";
import * as MusicPuzzle5Path from "../../../src.assets/music/Kdd3_Puzzle_1.mp3";
import * as MusicPuzzle6Path from "../../../src.assets/music/Kdd3_Puzzle_2.mp3";
import * as MusicCreditsPath from "../../../src.assets/music/Credits.mp3";
import * as MusicTitlePath from "../../../src.assets/music/Title.mp3";
import {NutkaLayer} from "../../../src.evidently_audio/NutkaLayer";
import {StyleResourceCity} from "./StyleResourceCity";

const resourceToFileMap = new Map<string, string>([
	[C.RES_MUSIC_AMBIENT_1, MusicAmbient1Path.default],
	[C.RES_MUSIC_AMBIENT_2, MusicAmbient2Path.default],
	[C.RES_MUSIC_AMBIENT_3, MusicAmbient3Path.default],
	[C.RES_MUSIC_WIN_LEVEL_1, MusicWinLevel1Path.default],
	[C.RES_MUSIC_WIN_LEVEL_2, MusicWinLevel2Path.default],
	[C.RES_MUSIC_WIN_LEVEL_3, MusicWinLevel3Path.default],
	[C.RES_MUSIC_ATTACK_1, MusicAttack1Path.default],
	[C.RES_MUSIC_ATTACK_2, MusicAttack2Path.default],
	[C.RES_MUSIC_ATTACK_3, MusicAttack3Path.default],
	[C.RES_MUSIC_ATTACK_4, MusicAttack4Path.default],
	[C.RES_MUSIC_ATTACK_5, MusicAttack5Path.default],
	[C.RES_MUSIC_ATTACK_6, MusicAttack6Path.default],
	[C.RES_MUSIC_PUZZLE_1, MusicPuzzle1Path.default],
	[C.RES_MUSIC_PUZZLE_2, MusicPuzzle2Path.default],
	[C.RES_MUSIC_PUZZLE_3, MusicPuzzle3Path.default],
	[C.RES_MUSIC_PUZZLE_4, MusicPuzzle4Path.default],
	[C.RES_MUSIC_PUZZLE_5, MusicPuzzle5Path.default],
	[C.RES_MUSIC_PUZZLE_6, MusicPuzzle6Path.default],
]);

export const SharedResources = {
	registerMusic(holdOptions: HoldOptions, musicLayer: NutkaLayer) {
		const resources = [
			holdOptions.music.winLevel,
			holdOptions.music.ambient,
			holdOptions.music.attack1,
			holdOptions.music.attack2,
			holdOptions.music.puzzle1,
			holdOptions.music.puzzle2,
		];

		resources.forEach(resourceName => {
			ResourcesQueue.queueSound(resourceName, musicLayer, resourceToFileMap.get(resourceName)!);
		});
	},

	registerHoldStyles(holdOptions: HoldOptions) {
		StyleResourceAboveground();
		StyleResourceCity();
		StyleResourceDeepSpaces();
		StyleResourceFortress();
		StyleResourceFoundation();
		StyleResourceIceworks();
	}
};

export function ResourcesCommon() {
	ResourcesQueue.queueSound(C.RES_SFX_BEETHROSCARED1, DROD.nutkaLayerSpeech, BeethroScared1Path.default);
	ResourcesQueue.queueSound(C.RES_SFX_BEETHROSCARED2, DROD.nutkaLayerSpeech, BeethroScared2Path.default);
	ResourcesQueue.queueSound(C.RES_SFX_BEETHROSCARED3, DROD.nutkaLayerSpeech, BeethroScared3Path.default);
	ResourcesQueue.queueSound(C.RES_SFX_BELL, DROD.nutkaLayerSfx, BellPath.default);
	ResourcesQueue.queueSound(C.RES_SFX_BRAINSKILLED, DROD.nutkaLayerSfx, BrainsKilledPath.default);
	ResourcesQueue.queueSound(C.RES_SFX_BUTTONCLICK, DROD.nutkaLayerSfx, ButtonClickPath.default);
	ResourcesQueue.queueSound(C.RES_SFX_CHECKPOINT, DROD.nutkaLayerSfx, CheckpointPath.default);
	ResourcesQueue.queueSound(C.RES_SFX_CRUMBLYDESTROY1, DROD.nutkaLayerSfx, CrumblyDestroy1Path.default);
	ResourcesQueue.queueSound(C.RES_SFX_CRUMBLYDESTROY2, DROD.nutkaLayerSfx, CrumblyDestroy2Path.default);
	ResourcesQueue.queueSound(C.RES_SFX_CRUMBLYDESTROY3, DROD.nutkaLayerSfx, CrumblyDestroy3Path.default);
	ResourcesQueue.queueSound(C.RES_SFX_EVILEYEWAKE1, DROD.nutkaLayerSfx, EvilEyeWake1Path.default);
	ResourcesQueue.queueSound(C.RES_SFX_EVILEYEWAKE2, DROD.nutkaLayerSfx, EvilEyeWake2Path.default);
	ResourcesQueue.queueSound(C.RES_SFX_EVILEYEWAKE3, DROD.nutkaLayerSfx, EvilEyeWake3Path.default);
	ResourcesQueue.queueSound(C.RES_SFX_GATES, DROD.nutkaLayerSfx, GatesPath.default);
	ResourcesQueue.queueSound(C.RES_SFX_HITOBSTACLE1, DROD.nutkaLayerSfx, HitObstacle1Path.default);
	ResourcesQueue.queueSound(C.RES_SFX_HITOBSTACLE2, DROD.nutkaLayerSfx, HitObstacle2Path.default);
	ResourcesQueue.queueSound(C.RES_SFX_HITOBSTACLE3, DROD.nutkaLayerSfx, HitObstacle3Path.default);
	ResourcesQueue.queueSound(C.RES_SFX_MIMICPLACED, DROD.nutkaLayerSfx, MimicPlacedPath.default);
	ResourcesQueue.queueSound(C.RES_SFX_MONSTERKILL1, DROD.nutkaLayerSfx, MonsterKill1Path.default);
	ResourcesQueue.queueSound(C.RES_SFX_MONSTERKILL2, DROD.nutkaLayerSfx, MonsterKill2Path.default);
	ResourcesQueue.queueSound(C.RES_SFX_MONSTERKILL3, DROD.nutkaLayerSfx, MonsterKill3Path.default);
	ResourcesQueue.queueSound(C.RES_SFX_MONSTERKILL4, DROD.nutkaLayerSfx, MonsterKill4Path.default);
	ResourcesQueue.queueSound(C.RES_SFX_MONSTERKILL5, DROD.nutkaLayerSfx, MonsterKill5Path.default);
	ResourcesQueue.queueSound(C.RES_SFX_MONSTERKILL6, DROD.nutkaLayerSfx, MonsterKill6Path.default);
	ResourcesQueue.queueSound(C.RES_SFX_MONSTERKILL7, DROD.nutkaLayerSfx, MonsterKill7Path.default);
	ResourcesQueue.queueSound(C.RES_SFX_MONSTERKILL8, DROD.nutkaLayerSfx, MonsterKill8Path.default);
	ResourcesQueue.queueSound(C.RES_SFX_MONSTERKILL9, DROD.nutkaLayerSfx, MonsterKill9Path.default);
	ResourcesQueue.queueSound(C.RES_SFX_ORBHIT, DROD.nutkaLayerSfx, OrbHitPath.default);
	ResourcesQueue.queueSound(C.RES_SFX_PLAYERDEATH1, DROD.nutkaLayerSpeech, PlayerDeath1Path.default);
	ResourcesQueue.queueSound(C.RES_SFX_PLAYERDEATH2, DROD.nutkaLayerSpeech, PlayerDeath2Path.default);
	ResourcesQueue.queueSound(C.RES_SFX_POTIONDRANK, DROD.nutkaLayerSfx, PotionDrankPath.default);
	ResourcesQueue.queueSound(C.RES_SFX_ROOMCONQUERED1, DROD.nutkaLayerSpeech, RoomConquered1Path.default);
	ResourcesQueue.queueSound(C.RES_SFX_ROOMCONQUERED2, DROD.nutkaLayerSpeech, RoomConquered2Path.default);
	ResourcesQueue.queueSound(C.RES_SFX_ROOMCONQUERED3, DROD.nutkaLayerSpeech, RoomConquered3Path.default);
	ResourcesQueue.queueSound(C.RES_SFX_SCROLLREAD, DROD.nutkaLayerSfx, ScrollReadPath.default);
	ResourcesQueue.queueSound(C.RES_SFX_SHORTHARPS, DROD.nutkaLayerSfx, ShortHarpsPath.default);
	ResourcesQueue.queueSound(C.RES_SFX_STEP1, DROD.nutkaLayerSfx, Step1Path.default);
	ResourcesQueue.queueSound(C.RES_SFX_STEP2, DROD.nutkaLayerSfx, Step2Path.default);
	ResourcesQueue.queueSound(C.RES_SFX_STEP3, DROD.nutkaLayerSfx, Step3Path.default);
	ResourcesQueue.queueSound(C.RES_SFX_SWORDSWING1, DROD.nutkaLayerSfx, SwordSwing1Path.default);
	ResourcesQueue.queueSound(C.RES_SFX_SWORDSWING2, DROD.nutkaLayerSfx, SwordSwing2Path.default);
	ResourcesQueue.queueSound(C.RES_SFX_SWORDSWING3, DROD.nutkaLayerSfx, SwordSwing3Path.default);
	ResourcesQueue.queueSound(C.RES_SFX_TARSPLATTER1, DROD.nutkaLayerSfx, TarSplatter1Path.default);
	ResourcesQueue.queueSound(C.RES_SFX_TARSPLATTER2, DROD.nutkaLayerSfx, TarSplatter2Path.default);
	ResourcesQueue.queueSound(C.RES_SFX_TARSPLATTER3, DROD.nutkaLayerSfx, TarSplatter3Path.default);
	ResourcesQueue.queueSound(C.RES_SFX_TRAPDOOR1, DROD.nutkaLayerSfx, Trapdoor1Path.default);
	ResourcesQueue.queueSound(C.RES_SFX_TRAPDOOR2, DROD.nutkaLayerSfx, Trapdoor2Path.default);
	ResourcesQueue.queueSound(C.RES_SFX_TRAPDOOR3, DROD.nutkaLayerSfx, Trapdoor3Path.default);

	ResourcesQueue.queueSound(C.RES_MUSIC_TITLE, DROD.nutkaLayerMusic, MusicTitlePath.default);
	ResourcesQueue.queueSound(C.RES_MUSIC_CREDITS, DROD.nutkaLayerMusic, MusicCreditsPath.default);

	ResourcesQueue.queueLocale('i18n_en_credits__', 'en', LocaleCreditsPath.default);
	ResourcesQueue.queueLocale('i18n_en_key_names', 'en', LocaleEn_KeyNames_Path.default);
	ResourcesQueue.queueLocale('i18n_en_ui_______', 'en', LocaleEn_UI_Path.default);
	ResourcesQueue.queueLocale('i18n_en_controls_', 'en', LocaleEn_Controls_Path.default);
	ResourcesQueue.queueLocale('i18n_en_achieves_', 'en', LocaleEn_Achievements_Path.default);
	ResourcesQueue.queueLocale('i18n_en_ingame___', 'en', LocaleEn_Ingame_Path.default);
	ResourcesQueue.queueLocale('i18n_en_outro____', 'en', LocaleEn_Outro_Common_Path.default);

	ResourcesQueue.queueImage(C.RES_TUTORIAL_KEYS, document.createElement('img'), TutorialKeysPath.default);

	ResourcesQueue.queueImage(C.RES_BUTTON_SYSTEM, document.createElement('img'), ButtonSystemPath.default);
	ResourcesQueue.queueImage(C.RES_BUTTON_DOWN_SYSTEM, document.createElement('img'), ButtonSystemDownPath.default);
	ResourcesQueue.queueImage(C.RES_WINDOW_BG_SYSTEM, document.createElement('img'), WindowSystemPath.default);
	ResourcesQueue.queueImage(C.RES_TOOLTIP_BG_SYSTEM, document.createElement('img'), TooltipSystemPath.default);
	ResourcesQueue.queueImage(C.RES_INPUT_BG_SYSTEM, document.createElement('img'), TextInputPath.default);
	ResourcesQueue.queueImage(C.RES_GAME_SCREEN, document.createElement('img'), GameScreenPath.default);

	ResourcesQueue.queueImage(C.RES_PRELOADER_BG, document.createElement('img'), PreloaderPath.default);
	ResourcesQueue.queueImage(C.RES_GENERAL_TILES, document.createElement('img'), GeneralPath.default);
	ResourcesQueue.queueImage(C.RES_EFFECTS, document.createElement('img'), EffectsPath.default);
	ResourcesQueue.queueImage(C.RES_BOLTS, document.createElement('img'), BoltsPath.default);
	ResourcesQueue.queueImage(C.RES_FACES, document.createElement('img'), FacesPath.default);
	ResourcesQueue.queueImage(C.RES_FACE_EYES, document.createElement('img'), FaceEyesPath.default);
	ResourcesQueue.queueImage(C.RES_EYES, document.createElement('img'), EyesPath.default);
	ResourcesQueue.queueImage(C.RES_SCROLLS, document.createElement('img'), ScrollsPath.default);
	ResourcesQueue.queueImage(C.RES_MENU_BG, document.createElement('img'), MenuBGPath.default);
	ResourcesQueue.queueImage(C.RES_LEVEL_START_BG, document.createElement('img'), LevelStartBackgroundPath.default);
	ResourcesQueue.queueImage(C.RES_LOGO_GAME, document.createElement('img'), LogoPath.default);
	ResourcesQueue.queueImage(C.RES_TITLE_BG, document.createElement('img'), TitleScreenPath.default);
	ResourcesQueue.queueImage(C.RES_LOGO_CARAVEL, document.createElement('img'), LogoCaravelPath.default);
	ResourcesQueue.queueImage(C.RES_LOGO_RETROCADE, document.createElement('img'), LogoRetrocadePath.default);
	ResourcesQueue.queueImage(C.RES_ACHIEVEMENT, document.createElement('img'), AchievementPath.default);
	ResourcesQueue.queueImage(C.RES_LOCK, document.createElement('img'), LockPath.default);
}