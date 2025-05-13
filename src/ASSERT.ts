export function ASSERT(cause: any, description: string = "") {
	if (!cause) {
		if (description) {
			throw new Error(description);
		} else {
			throw new Error("Assertion failed");
		}
	}
}

export function assertDefined<T>(obj: T | undefined | null, context: string): asserts obj is T {
	if (obj === undefined || obj === null) {
		throw new Error(`${context} -> value is null or undefined`);
	}
}