/** Returns the canonical option value when the input matches an allowed option. */
export function getModuleImportOptionValue(
	value: unknown,
	options: readonly string[],
) {
	if (typeof value !== "string") return undefined;
	const normalized = value.trim().toLocaleLowerCase();
	return options.find(
		(option) => option.trim().toLocaleLowerCase() === normalized,
	);
}

export function isModuleImportOptionValue(
	value: unknown,
	options: readonly string[],
) {
	return getModuleImportOptionValue(value, options) !== undefined;
}
