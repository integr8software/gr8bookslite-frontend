export function createTablePreferencesStorageKey(
	storageKey: string,
	userId: number,
	companyId: number,
) {
	return `${storageKey}:user:${userId}:company:${companyId}`;
}

export function createLegacyUserTablePreferencesStorageKey(
	storageKey: string,
	userId: number,
) {
	return `${storageKey}:user:${userId}`;
}
