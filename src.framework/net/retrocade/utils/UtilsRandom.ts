let seed = 1;
export const UtilsRandom = {
	/**
	 * Seed of the PRNG, can not be set to 0
	 */
	setSeed(newSeed: number) {
		if (newSeed == 0) {
			throw new Error("Seed can never be 0");
		}

		seed = newSeed;
	},

	getSeed() {
		return seed;
	},


	/****************************************************************************************************************/
	/**                                                                                                  FUNCTIONS  */
	/****************************************************************************************************************/

	/**
	 * Retrieves a random number between 0 and 1
	 */
	fraction() {
		return (((((seed = (seed * 16807) % 0x7FFFFFFF)) - 1) / 0x7FFFFFFF));
	},

	/**
	 * Retrieves a random number between min (inclusive) and max (exclusive)
	 */
	uint(min: number = 0, max: number = Number.MAX_VALUE): number {
		return (((((seed = (seed * 16807) % 0x7FFFFFFF)) - 1) / 0x7FFFFFFF)) * (max - min) + min | 0;
	},

	bool(): boolean {
		return ((((seed = (seed * 16807) % 0x7FFFFFFF)) - 1) / 0x7FFFFFFF) > 0.5;
	},

	/**
	 * Retrieves a random number of value (-a, a)
	 */
	fMid(a: number): number {
		return (((((seed = (seed * 16807) % 0x7FFFFFFF)) - 1) / 0x7FFFFFFF)) * a * 2 - a;
	},

	from<T>(array: T[]): T {
		return array[UtilsRandom.uint(0, array.length)];
	}
}
