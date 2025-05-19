import {VOSpeech} from "../managers/VOSpeech";
import {RecamelGroup} from "../../../src.framework/net/retrocade/camel/core/RecamelGroup";
import {TEffectRoomSlide} from "../objects/TEffectRoomSlide";
import {TEffectSubtitle} from "../objects/effects/TEffectSubtitle";
import {VOSpeechCommand} from "../managers/VOSpeechCommand";
import {Game} from "../global/Game";
import {_, _def} from "../../../src.framework/_";
import {C} from "../../C";
import {ASSERT} from "../../ASSERT";
import {F} from "../../F";
import {S} from "../../S";
import {TCharacter} from "../objects/actives/TCharacter";
import {TWidgetFace} from "./TWidgetFace";
import {TGameObject} from "../objects/TGameObject";
import {DB} from "../global/DB";
import {NutkaSfx} from "../../../src.evidently_audio/NutkaSfx";

export class TWidgetSpeech {
	private static subtitles: TEffectSubtitle[] = [];
	private static speechSoundChannels: NutkaSfx[] = [];

	public static nextSpeechTime: number = 0;
	public static speeches = new RecamelGroup<VOSpeechCommand>();

	public static update() {
		if (TEffectRoomSlide.instance || Date.now() < TWidgetSpeech.nextSpeechTime) {
			return;
		}

		if (TWidgetSpeech.speeches.length == 0 && TWidgetSpeech.nextSpeechTime) {
			TWidgetSpeech.nextSpeechTime = 0;

			TWidgetSpeech.showPlayerFace();
			return;
		}

		if (Game.player.placingDoubleType) {
			return;
		}

		while (TWidgetSpeech.speeches.length) {
			const command: VOSpeechCommand = TWidgetSpeech.speeches.getFirst() as VOSpeechCommand;

			TWidgetSpeech.speeches.nullify(command);

			if (!TWidgetSpeech.processSpeechSpeaker(command)) {
				continue;
			}

			const speech: VOSpeech = command.command.speech;
			let delay: number = speech.delay;

			if (command.playSound) {
				const sound = DB.getSound(speech.soundID);

				if (sound){
				    TWidgetSpeech.speechSoundChannels.push(sound);
				    sound.play();

				    if (!delay) {
					    delay = sound.duration * 1000;
				    }
				}
			}

			if (!delay) {
				delay = 1000 + speech.translatedMessage.length * 50;
			}

			TWidgetSpeech.addSubtitle(command, delay);
			TWidgetSpeech.nextSpeechTime = Date.now() + delay;

			break;
		}
	}

	public static parseSpeechEvent(speech: VOSpeechCommand) {
		if (!speech.flush) {
			if (speech.command.speech) {
				TWidgetSpeech.prepareCustomSpeaker(speech);
				TWidgetSpeech.speeches.add(speech);
			}
		}
	}

	private static prepareCustomSpeaker(speechCmd: VOSpeechCommand) {
		const command = speechCmd.command;
		const speech = command.speech;

		if (speech.character == C.SPEAK_Custom) {
			ASSERT(F.isValidColRow(command.x, command.y));
			const monster = Game.room.tilesActive[command.x + command.y * S.RoomWidth];
			if (monster) {
				speechCmd.speakingEntity = monster;

			} else {
				const character = speechCmd.executingNPC as TCharacter;
				const speaker = new TCharacter();
				speaker.prevX = speaker.x = command.x;
				speaker.prevY = speaker.y = command.y;

				speaker.logicalIdentity = character.logicalIdentity;
				speaker.identity = character.identity;

				speechCmd.speakingEntity = speaker;
			}
		}
	}

	private static processSpeechSpeaker(command: VOSpeechCommand): boolean {
		const entity = Game.getSpeakingEntity(command);

		if (entity == command.executingNPC && !command.executingNPC.isAlive) {
			return false;
		}

		const speech: VOSpeech = command.command.speech;
		let speaker: number = speech.character;

		if (speech.character == C.SPEAK_None) {
			TWidgetSpeech.showPlayerFace();

		} else {
			if (speech.character != C.SPEAK_Custom && speech.character != C.SPEAK_Self) {
				TWidgetFace.setSpeaker(true, speaker, speech.mood);

			} else {
				speaker = F.getSpeakerType(command.speakingEntity.getIdentity());
				if (speaker != C.SPEAK_None) {
					TWidgetFace.setSpeaker(true, speaker, speech.mood);
				}
			}
		}

		return true;
	}

	public static showPlayerFace() {
		TWidgetFace.setSpeaker(false, 0, 0);
	}

	private static addSubtitle(command: VOSpeechCommand, duration: number) {
		const speaker = Game.getSpeakingEntity(command);
		const speech = command.command.speech;
		const text = _def(`speech.${speech.id}`, speech.message);

		const subtitle = TWidgetSpeech.getSubtitle(speaker);

		if (subtitle) {
			subtitle.addTextLine(text, duration);
			return;
		}

		let speakerIdentity: number = speech.character;
		if (speakerIdentity == C.SPEAK_Custom || speakerIdentity == C.SPEAK_Self) {
			speakerIdentity = C.SPEAK_None;
		}

		let color: number;
		if (speakerIdentity != C.SPEAK_None) {
			color = C.SPEAKER_COLOUR[speakerIdentity];
		} else {
			speakerIdentity = command.speakingEntity.getIdentity();

			color = C.SPEAKER_COLOUR[F.getSpeakerType(speakerIdentity)];
		}

		TWidgetSpeech.subtitles.push(new TEffectSubtitle(speaker, text, 0, color, duration));
	}

	public static addInfoSubtitle(coords: TGameObject, text: string, duration: number,
	                              displayLines: number = 1, color: number = 0, fadeDuration: number = 500,
	) {

		for (const subtitle of TWidgetSpeech.subtitles) {
			if (subtitle.coords == coords) {
				subtitle.addTextLine(text, duration);
				return;
			}
		}

		TWidgetSpeech.subtitles.push(new TEffectSubtitle(
			coords,
			text,
			color,
			C.SPEAKER_COLOUR[C.SPEAK_None],
			duration,
			displayLines,
			fadeDuration
		));
	}

	private static getSubtitle(forEntity: TGameObject): TEffectSubtitle | null {
		for (const i of TWidgetSpeech.subtitles) {
			if (i.coords == forEntity) {
				return i;
			}
		}

		return null;
	}

	public static removeSubtitle(subtitle: TEffectSubtitle) {
		const index: number = TWidgetSpeech.subtitles.indexOf(subtitle);

		if (index != -1) {
			TWidgetSpeech.subtitles.splice(index);
		}
	}

	public static clear() {
		for (const sc of TWidgetSpeech.speechSoundChannels) {
			sc.stop();
		}

		TWidgetSpeech.speechSoundChannels.length = 0;

		TWidgetSpeech.subtitles.length = 0;
		TWidgetSpeech.speeches.clear();

		TWidgetSpeech.nextSpeechTime = 0;

		TWidgetSpeech.showPlayerFace();
	}

	public static stopAllSpeech() {
		for (const sc of TWidgetSpeech.speechSoundChannels) {
			sc.stop();
		}

		for (const speech of TWidgetSpeech.subtitles) {
			speech.end();
		}

		TWidgetSpeech.speechSoundChannels.length = 0;
		TWidgetSpeech.subtitles.length = 0;
		TWidgetSpeech.speeches.clear();

		TWidgetSpeech.nextSpeechTime = 0;

		TWidgetSpeech.showPlayerFace();
	}
}
