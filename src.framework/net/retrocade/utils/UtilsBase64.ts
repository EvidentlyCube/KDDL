import { encode, decode } from 'base64-uint8';

function arrayToString(array: Uint8Array): string {
	let str = "";
	for (let i = 0; i < array.length; i++) {
		str += String.fromCharCode(array[i]);
	}

	return str;
}

export const UtilsBase64 = {
	encodeByteArray(decodedArray: Uint8Array): string {
		return encode(decodedArray);
	},

	encodeString(decodedString: string): string {
		return btoa(decodedString);
	},

	decodeByteArray(encodedArray: string): Uint8Array {
		return decode(encodedArray);
	},

	decodeByteArrayByteArray(encodedArray: Uint8Array): Uint8Array {
		return decode(arrayToString(encodedArray));
	},

	decodeWChar(data: string): string {
		const decodedArray: Uint8Array = decode(data);
		let string: string = "";

		let char: number;

		for (let i = 0; i < decodedArray.length; i++) {
			char = decodedArray[i];
			if (decodedArray[i] != 0) {
				string += String.fromCharCode(decodedArray[i]);
			}
		}

		return string;
	}
}

