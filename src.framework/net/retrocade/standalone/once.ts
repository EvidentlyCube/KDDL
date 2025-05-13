
const called = new Set<() => void>();

export async function once(callback: () => Promise<void>): Promise<void> {
	if (!called.has(callback)){
		await callback();
		called.add(callback);
	}
}