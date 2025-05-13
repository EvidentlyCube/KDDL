
export const printf = (string: string, ...params: (string|number)[]) => {
	let matchCount = 0;

	return string.replace(/%%/g, () => {
		if (params.length > matchCount) {
			matchCount++;
			return params[matchCount - 1].toString();
		}

		return "%%";
	});
};
