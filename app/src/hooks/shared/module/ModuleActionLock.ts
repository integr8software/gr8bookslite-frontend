type ActionLock = {
	timeoutId: ReturnType<typeof setTimeout>;
};

const ActiveActionLocks = new Map<string, ActionLock>();

export function acquireModuleActionLock(key: string, ttlMs = 15000) {
	if (ActiveActionLocks.has(key)) {
		return null;
	}

	const timeoutId = setTimeout(() => {
		ActiveActionLocks.delete(key);
	}, ttlMs);

	ActiveActionLocks.set(key, { timeoutId });

	return () => {
		const lock = ActiveActionLocks.get(key);

		if (!lock) {
			return;
		}

		clearTimeout(lock.timeoutId);
		ActiveActionLocks.delete(key);
	};
}
