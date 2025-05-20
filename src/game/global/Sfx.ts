import { ResourcesQueue } from "../../resources/mainGame/ResourcesQueue";
import { NutkaPlayback } from "../../../src.evidently_audio/NutkaPlayback";
import { NutkaDefinition } from "../../../src.evidently_audio/NutkaDefinition";
import { UtilsRandom } from "../../../src.framework/net/retrocade/utils/UtilsRandom";
import { C } from "../../C";
import { NutkaMusic } from "../../../src.evidently_audio/NutkaMusic";
import { RecamelEffect } from "../../../src.framework/net/retrocade/camel/effects/RecamelEffect";
import { DROD } from "./DROD";
import { ASSERT } from "../../ASSERT";
import { HoldOptions } from "../../platform/PlatformSpecific";
import { TEffMusicFade } from "../interfaces/TEffMusicFade";

const soundsMap = new Map<string, NutkaDefinition>();


export class Sfx {

	private static play(name: string, random: number): NutkaPlayback {
		let finalName = name + "_" + UtilsRandom.uint(1, random + 1).toString();
		const definition = soundsMap.get(finalName);
		if (!definition) {
			throw new Error(`Failed to find sfx '${finalName}'`);
		}
		return definition?.play({});
	}

	public static beethroScared() {
		return Sfx.play("beethroScared", 3);
	}

	public static brainsKilled() {
		return Sfx.play("brainsKilled", 1);
	}

	public static buttonClick() {
		return Sfx.play("buttonClick", 1);
	}

	public static checkpoint() {
		return Sfx.play("checkpoint", 1);
	}

	public static crumblyWallDestroy() {
		return Sfx.play("crumblyDestroy", 3);
	}

	public static doublePlaced() {
		return Sfx.play("mimicPlaced", 1);
	}

	public static evilEyeWoke() {
		return Sfx.play("evilEyeWake", 3);
	}

	public static gates() {
		return Sfx.play("gates", 1);
	}

	public static holdMastered() {
		return Sfx.play("gates", 1);
	}

	public static levelCompleted() {
		return Sfx.play("shortHarps", 1);
	}

	public static monsterKilled() {
		return Sfx.play("monsterKill", 9);
	}

	public static orbHit() {
		return Sfx.play("orbHit", 1);
	}

	public static playerDies() {
		return Sfx.play("playerDeath", 2);
	}

	public static playerHitsObstacle() {
		return Sfx.play("hitObstacle", 3);
	}

	public static playerStep() {
		return Sfx.play("step", 3);
	}

	public static potionDrank() {
		return Sfx.play("potionDrank", 1);
	}

	public static roomConquered() {
		return Sfx.play("roomConquered", 3);
	}

	public static roomLock() {
		return Sfx.play("bell", 1);
	}

	public static scrollRead() {
		return Sfx.play("scrollRead", 1);
	}

	public static secretFound() {
		return Sfx.play("shortHarps", 1);
	}

	public static swordSwing() {
		return Sfx.play("swordSwing", 3);
	}

	public static tarSplatter() {
		return Sfx.play("tarSplatter", 3);
	}

	public static trapdoorFell() {
		return Sfx.play("trapdoor", 3);
	}

	public static optionVoiceText() {
		soundsMap.get('roomConquered_3')!.play({});
	}

	public static initialize() {
		soundsMap.set('beethroScared_1', ResourcesQueue.getSound(C.RES_SFX_BEETHROSCARED1)); //play("beethroScared",  3)
		soundsMap.set('beethroScared_2', ResourcesQueue.getSound(C.RES_SFX_BEETHROSCARED2)); //play("beethroScared",  3)
		soundsMap.set('beethroScared_3', ResourcesQueue.getSound(C.RES_SFX_BEETHROSCARED3)); //play("beethroScared",  3)
		soundsMap.set('brainsKilled_1', ResourcesQueue.getSound(C.RES_SFX_BRAINSKILLED)); //play("brainsKilled",   1)
		soundsMap.set('buttonClick_1', ResourcesQueue.getSound(C.RES_SFX_BUTTONCLICK)); //play("buttonClick",    1)
		soundsMap.set('checkpoint_1', ResourcesQueue.getSound(C.RES_SFX_CHECKPOINT)); //play("checkpoint",     1)
		soundsMap.set('crumblyDestroy_1', ResourcesQueue.getSound(C.RES_SFX_CRUMBLYDESTROY1)); //play("crumblyDestroy", 3)
		soundsMap.set('crumblyDestroy_2', ResourcesQueue.getSound(C.RES_SFX_CRUMBLYDESTROY2)); //play("crumblyDestroy", 3)
		soundsMap.set('crumblyDestroy_3', ResourcesQueue.getSound(C.RES_SFX_CRUMBLYDESTROY3)); //play("crumblyDestroy", 3)
		soundsMap.set('mimicPlaced_1', ResourcesQueue.getSound(C.RES_SFX_MIMICPLACED)); //play("mimicPlaced",    1)
		soundsMap.set('evilEyeWake_1', ResourcesQueue.getSound(C.RES_SFX_EVILEYEWAKE1)); //play("evilEyeWake",    3)
		soundsMap.set('evilEyeWake_2', ResourcesQueue.getSound(C.RES_SFX_EVILEYEWAKE2)); //play("evilEyeWake",    3)
		soundsMap.set('evilEyeWake_3', ResourcesQueue.getSound(C.RES_SFX_EVILEYEWAKE3)); //play("evilEyeWake",    3)
		soundsMap.set('gates_1', ResourcesQueue.getSound(C.RES_SFX_GATES)); //play("gates",          1)
		soundsMap.set('shortHarps_1', ResourcesQueue.getSound(C.RES_SFX_SHORTHARPS)); //play("shortHarps",     1)
		soundsMap.set('monsterKill_1', ResourcesQueue.getSound(C.RES_SFX_MONSTERKILL1)); //play("monsterKill",    9)
		soundsMap.set('monsterKill_2', ResourcesQueue.getSound(C.RES_SFX_MONSTERKILL2)); //play("monsterKill",    9)
		soundsMap.set('monsterKill_3', ResourcesQueue.getSound(C.RES_SFX_MONSTERKILL3)); //play("monsterKill",    9)
		soundsMap.set('monsterKill_4', ResourcesQueue.getSound(C.RES_SFX_MONSTERKILL4)); //play("monsterKill",    9)
		soundsMap.set('monsterKill_5', ResourcesQueue.getSound(C.RES_SFX_MONSTERKILL5)); //play("monsterKill",    9)
		soundsMap.set('monsterKill_6', ResourcesQueue.getSound(C.RES_SFX_MONSTERKILL6)); //play("monsterKill",    9)
		soundsMap.set('monsterKill_7', ResourcesQueue.getSound(C.RES_SFX_MONSTERKILL7)); //play("monsterKill",    9)
		soundsMap.set('monsterKill_8', ResourcesQueue.getSound(C.RES_SFX_MONSTERKILL8)); //play("monsterKill",    9)
		soundsMap.set('monsterKill_9', ResourcesQueue.getSound(C.RES_SFX_MONSTERKILL9)); //play("monsterKill",    9)
		soundsMap.set('orbHit_1', ResourcesQueue.getSound(C.RES_SFX_ORBHIT)); //play("orbHit",         1)
		soundsMap.set('playerDeath_1', ResourcesQueue.getSound(C.RES_SFX_PLAYERDEATH1)); //play("playerDeath",    2)
		soundsMap.set('playerDeath_2', ResourcesQueue.getSound(C.RES_SFX_PLAYERDEATH2)); //play("playerDeath",    2)
		soundsMap.set('hitObstacle_1', ResourcesQueue.getSound(C.RES_SFX_HITOBSTACLE1)); //play("hitObstacle",    3)
		soundsMap.set('hitObstacle_2', ResourcesQueue.getSound(C.RES_SFX_HITOBSTACLE2)); //play("hitObstacle",    3)
		soundsMap.set('hitObstacle_3', ResourcesQueue.getSound(C.RES_SFX_HITOBSTACLE3)); //play("hitObstacle",    3)
		soundsMap.set('step_1', ResourcesQueue.getSound(C.RES_SFX_STEP1)); //play("step",           3)
		soundsMap.set('step_2', ResourcesQueue.getSound(C.RES_SFX_STEP2)); //play("step",           3)
		soundsMap.set('step_3', ResourcesQueue.getSound(C.RES_SFX_STEP3)); //play("step",           3)
		soundsMap.set('potionDrank_1', ResourcesQueue.getSound(C.RES_SFX_POTIONDRANK)); //play("potionDrank",    1)
		soundsMap.set('roomConquered_1', ResourcesQueue.getSound(C.RES_SFX_ROOMCONQUERED1)); //play("roomConquered",  3)
		soundsMap.set('roomConquered_2', ResourcesQueue.getSound(C.RES_SFX_ROOMCONQUERED2)); //play("roomConquered",  3)
		soundsMap.set('roomConquered_3', ResourcesQueue.getSound(C.RES_SFX_ROOMCONQUERED3)); //play("roomConquered",  3)
		soundsMap.set('bell_1', ResourcesQueue.getSound(C.RES_SFX_BELL)); //play("bell",           1)
		soundsMap.set('scrollRead_1', ResourcesQueue.getSound(C.RES_SFX_SCROLLREAD)); //play("scrollRead",     1)
		soundsMap.set('swordSwing_1', ResourcesQueue.getSound(C.RES_SFX_SWORDSWING1)); //play("swordSwing",     3)
		soundsMap.set('swordSwing_2', ResourcesQueue.getSound(C.RES_SFX_SWORDSWING2)); //play("swordSwing",     3)
		soundsMap.set('swordSwing_3', ResourcesQueue.getSound(C.RES_SFX_SWORDSWING3)); //play("swordSwing",     3)
		soundsMap.set('tarSplatter_1', ResourcesQueue.getSound(C.RES_SFX_TARSPLATTER1)); //play("tarSplatter",    3)
		soundsMap.set('tarSplatter_2', ResourcesQueue.getSound(C.RES_SFX_TARSPLATTER2)); //play("tarSplatter",    3)
		soundsMap.set('tarSplatter_3', ResourcesQueue.getSound(C.RES_SFX_TARSPLATTER3)); //play("tarSplatter",    3)
		soundsMap.set('trapdoor_1', ResourcesQueue.getSound(C.RES_SFX_TRAPDOOR1)); //play("trapdoor",       3)
		soundsMap.set('trapdoor_2', ResourcesQueue.getSound(C.RES_SFX_TRAPDOOR2)); //play("trapdoor",       3)
		soundsMap.set('trapdoor_3', ResourcesQueue.getSound(C.RES_SFX_TRAPDOOR3)); //play("trapdoor",       3)

		Sfx._musicLibrary.set(C.MUSIC_TITLE, [
			new NutkaMusic(ResourcesQueue.getSound(C.RES_MUSIC_TITLE), "Title"),
		]);
		Sfx._musicLibrary.set(C.MUSIC_OUTRO, [
			new NutkaMusic(ResourcesQueue.getSound(C.RES_MUSIC_CREDITS), "Outro"),
		]);
	}

	public static initializeHold(hold: HoldOptions) {
		Sfx._musicLibrary.set(C.MUSIC_PUZZLE, [
			new NutkaMusic(ResourcesQueue.getSound(hold.music.puzzle1), "Puzzle 1"),
			new NutkaMusic(ResourcesQueue.getSound(hold.music.puzzle2), "Puzzle 2"),
		]);
		Sfx._musicLibrary.set(C.MUSIC_ACTION, [
			new NutkaMusic(ResourcesQueue.getSound(hold.music.attack1), "Attack 1"),
			new NutkaMusic(ResourcesQueue.getSound(hold.music.attack2), "Attack 2"),
		]);
		Sfx._musicLibrary.set(C.MUSIC_AMBIENT, [
			new NutkaMusic(ResourcesQueue.getSound(hold.music.ambient), "Ambient"),
		]);
		Sfx._musicLibrary.set(C.MUSIC_LEVEL_EXIT, [
			new NutkaMusic(ResourcesQueue.getSound(hold.music.winLevel), "Level Exit"),
		]);

		Sfx._musicFades.forEach(fade => fade.endMusic());
		Sfx._musicFades.clear();
	}


	private static _currentMusic: string;
	private static _currentChannel: NutkaMusic | null;

	private static _musicFades = new Map<NutkaMusic, TEffMusicFade>();
	private static _musicLibrary = new Map<string, NutkaMusic[]>();

	public static getMusicInstance(musicName: string): NutkaMusic {
		let music = Sfx._musicLibrary.get(musicName)!;

		if (!music) {
			throw new Error(`Filed to find music '${musicName}'`);
		}

		return UtilsRandom.from(music);
	}

	public static playMusic(music: string) {
		return this.crossFadeMusic(music, 250);
	}

	public static update() {
		// Do nothing
	}

	public static crossFadeMusic(music: string, fadeDuration = 2500) {
		if (music == Sfx._currentMusic) {
			return;
		}

		console.log(`CROSS FADE MUSIC ${music} DURATION=${fadeDuration}`);

		for (const fade of Array.from(Sfx._musicFades.values())) {
			Sfx._musicFades.set(fade.channel, fade.toFadeOut(fadeDuration));
		}

		if (Sfx._currentChannel) {
			const fade = Sfx._musicFades.get(Sfx._currentChannel) ?? new TEffMusicFade(
				Sfx._currentChannel, 0, fadeDuration, Sfx.fadeFinishedCallback
			);

			Sfx._musicFades.set(Sfx._currentChannel, fade.toFadeOut(fadeDuration))
		}

		if (!music) {
			Sfx._currentMusic = "";
			Sfx._currentChannel = null;
			return;
		}

		Sfx._currentMusic = music;
		Sfx._currentChannel = Sfx.getMusicInstance(music);
		ASSERT(Sfx._currentChannel);
		Sfx._currentChannel.isLooping = true;
		Sfx._currentChannel.play();

		const fade = Sfx._musicFades.get(Sfx._currentChannel) ?? new TEffMusicFade(
			Sfx._currentChannel, 1, fadeDuration, Sfx.fadeFinishedCallback
		);

		Sfx._musicFades.set(Sfx._currentChannel, fade.toFadeIn(fadeDuration))
	}

	private static fadeFinishedCallback(effect: RecamelEffect | undefined) {
		if (effect) {
			const e = effect as TEffMusicFade;
			console.log(`${e.channel.name} -> Fade Finish V=${e.channel.volume.toFixed(2)}`);
			Sfx._musicFades.delete((effect as TEffMusicFade).channel);
		}
	}

	public static set volume(vol: number) {
		DROD.nutkaLayerMusic.volume = vol;
	}
}
