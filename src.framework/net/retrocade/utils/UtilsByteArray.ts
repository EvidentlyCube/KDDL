import {BinaryReader, BinaryWriter, Encoding} from 'csharp-binary-stream';

export const UtilsByteArray = {
	fromString(str: string) {
		const buffer = new Uint8Array(str.length);
		for (let i = 0; i < str.length; i++) {
			buffer[i] = str.charCodeAt(i);
		}

		return buffer;
	},
	toString(data: Uint8Array) {
		const reader = new BinaryReader(data);

		return reader.readChars(data.length, Encoding.Utf8);
	},
	/**
	 * Clones passed Uint8Array. Doesn't modify original Uint8Array's position
	 * and the new Uint8Array's position is set to 0.
	 * @param  array Uint8Array to clone
	 * @return Cloned Uint8Array
	 */
	clone(array: Uint8Array) {
		return new Uint8Array(array.buffer.slice(array.byteOffset, array.byteOffset + array.byteLength));
	},

	readWChar(array: Uint8Array, from: number = 0, to: number = 0) {
		let newString: string = "";

		to = (to ? to + from : array.length);

		for (let i = from; i < to; i += 2) {
			newString += String.fromCharCode(array[i]);
		}

		return newString;
	},

	writeWChar(writer: BinaryWriter, string: string): void {
		for (let i = 0; i < string.length; i++) {
			writer.writeByte(string.charCodeAt(i));
			writer.writeByte(0);
		}
	},
};
