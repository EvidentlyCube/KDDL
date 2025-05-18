export const UtilsNumber = {
	/**
	 * Modifies Initial to get closer to Target by a Factor, and rounds to it when the difference is equal or smaller to RoundWhen
	 *
	 * @param initial The number to be changed
	 * @param target Target number
	 * @param factor Factor by which the initial number is to be modified
	 * @param roundWhen Set to target when difference between initial and target is smaller than
	 * @param maxSpeed Maximum amount of change in one call
	 * @return The new number
	 */
	approach: (initial: number, target: number, factor: number = 0.1, roundWhen: number = 0.1, maxSpeed: number = Number.NaN) => {
		if (isNaN(maxSpeed)) {
			initial += (target - initial) * factor;
		} else {
			initial += UtilsNumber.limit((target - initial) * factor, maxSpeed);
		}

		if (target - initial <= roundWhen && target - initial >= -roundWhen) {
			initial = target;
		}

		return initial;
	},

	/**
	 * Calculates the distance, using the Pythagorean theorem
	 *
	 * @param	x1 X of the first object
	 * @param	y1 Y of the first object
	 * @param	x2 X of the second object
	 * @param	y2 Y of the second object
	 * @return Distance between the objects
	 */
	distance: (x1: number, y1: number, x2: number, y2: number) => {
		return (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1);
	},


	/**
	 * Modifies the passed variable so that it doesn't exceed set limits
	 *
	 * @param limited The number to be modified
	 * @param topLimit The largest value the variable can be
	 * @param mirror If set to true, bottomLimit is set to negated value of topLimited
	 * @param bottomLimit The smallest value the variable can be
	 * @return The modified number
	 */
	limit: (limited: number, topLimit: number = NaN, bottomLimit: number = Number.NaN, mirror: boolean = true) => {
		if (mirror && isNaN(bottomLimit)) {
			bottomLimit = -topLimit;
		}

		if (topLimit < bottomLimit) {
			const temp = topLimit;
			topLimit = bottomLimit;
			bottomLimit = temp;
		}

		if (!isNaN(topLimit) && limited > topLimit) {
			return topLimit;
		}

		if (!isNaN(bottomLimit) && limited < bottomLimit) {
			return bottomLimit;
		}

		return limited;
	},

	/**
	 * Returns a sign (-1 for negative, 1 for positive and 0 for anything else) of specified number
	 *
	 * @param number The number to get the sign
	 * @return Sign of the passed number
	 */
	sign: (number: number) => {
		if (number > 0) {
			return 1;
		} else if (number < 0) {
			return -1;
		} else {
			return 0;
		}
	},


	wrap: function (value: number, min: number, max: number) {
		if (Number.isNaN(value) || Number.isNaN(min) || Number.isNaN(max)) {
			return value;
		} else if (!Number.isFinite(value) || !Number.isFinite(min) || !Number.isFinite(max)) {
			return value;
		}

		const delta = max - min;
		while (value < min) {
			value += delta;
		}

		while (value >= max) {
			value -= delta;
		}

		return value;
	},


};
