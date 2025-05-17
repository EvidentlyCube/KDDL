import { encode, decode } from 'base64-uint8';

export const UtilsBase64 = {
	encodeByteArray(decodedArray: Uint8Array): string {
		return encode(decodedArray);
	},

	decodeByteArray(encodedArray: string): Uint8Array {
		return decode(encodedArray);
	},

	decodeWChar(data: string): string {
		const decodedArray: Uint8Array = decode(data);
		let string: string = "";


		for (let i = 0; i < decodedArray.length; i++) {
			const char = decodedArray[i];
			if (char != 0) {
				string += String.fromCharCode(char);
			}
		}

		return string;
	}
}

