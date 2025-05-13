import { Uint8ArrayPositioned } from "src.framework/net/retrocade/camel/objects/Uint8ArrayPositioned";
import { VOSpeech } from "./VOSpeech";
import { UtilsByteArray } from "src.framework/net/retrocade/utils/UtilsByteArray";
import { PlatformOptions } from "src/platform/PlatformOptions";
import { DB } from "../global/DB";
import { ASSERT } from "src/ASSERT";

export class VOCharacterCommand {
	public speechId: number = 0;
	public command: number = 0;
	public x: number = 0;
	public y: number = 0;
	public w: number = 0;
	public h: number = 0;
	public flags: number = 0;
	public label: string = '';

	public speech: VOSpeech = null!;

	public static deserializeBuffer(commandBuffer: Uint8Array, to?: VOCharacterCommand[]) {
		to = to ?? [];

		const buffer = new Uint8ArrayPositioned(commandBuffer);

		let index: number = 0;
		const bufferSize: number = buffer.array.length;

		while (index < bufferSize) {
			const command: VOCharacterCommand = new VOCharacterCommand();

			command.command = VOCharacterCommand.readBpUINT(buffer);
			command.x = VOCharacterCommand.readBpUINT(buffer);
			command.y = VOCharacterCommand.readBpUINT(buffer);
			command.w = VOCharacterCommand.readBpUINT(buffer);
			command.h = VOCharacterCommand.readBpUINT(buffer);
			command.flags = VOCharacterCommand.readBpUINT(buffer);

			command.speechId = VOCharacterCommand.readBpUINT(buffer);
			if (command.speechId) {
				command.speech = DB.getSpeech(command.speechId);
				if (PlatformOptions.isGame) {
					ASSERT(command.speech);
				}
			}

			const labelSize: number = VOCharacterCommand.readBpUINT(buffer);
			if (labelSize) {
				index = buffer.position;
				command.label = UtilsByteArray.readWChar(buffer.array, index, labelSize);
				buffer.position = index + labelSize;
			}

			index = buffer.position;

			to.push(command);
		}

		return to;
	}

	private static readBpUINT(buffer: Uint8ArrayPositioned): number {
		let index: number = buffer.position;
		let index2: number = index++;

		let n: number = 0;

		do {
			n = (n << 7) + buffer.array[index2];

			if (buffer.array[index2++] & 0x80) {
				break;
			}

			index++;

		} while (true);

		buffer.position = index;

		return n - 0x80;
	}
}
