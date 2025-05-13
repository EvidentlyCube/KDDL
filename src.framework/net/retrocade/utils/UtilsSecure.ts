import {UtilsRandom} from "./UtilsRandom";

export const UtilsSecure = {

	hashByteArrayJenkins: (byteArray: Uint8Array, maxValue: number = Number.MAX_VALUE) => {
		let hash = 0;
		let i = 0;
		const l = byteArray.length;

		while (i < l) {
			hash += byteArray[i++];
			hash += (hash << 10);
			hash ^= (hash >> 6);
		}

		hash += (hash << 3);
		hash ^= (hash >> 11);
		hash += (hash << 15);

		return hash % (maxValue - 1) + 1;
	},

	/**
	 * Hashes a string using Jenkins Hash into a number.
	 * @param string string to hash
	 * @param maxValue
	 * @maxValue Maximum returned number, defaults to Number.MAX_VALUE
	 * @returns Hash of the string
	 */
	hashStringJenkins: (string: string, maxValue: number = Number.MAX_VALUE) => {
		let hash = 0;
		let i = 0;
		const l = string.length;

		while (i < l) {
			hash += string.charCodeAt(i++);
			hash += (hash << 10);
			hash ^= (hash >> 6);
		}

		hash += (hash << 3);
		hash ^= (hash >> 11);
		hash += (hash << 15);

		return hash % (maxValue - 1) + 1;
	}
}
