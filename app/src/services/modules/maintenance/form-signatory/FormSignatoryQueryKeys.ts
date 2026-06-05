export const FormSignatoryQueryKeys = {
	bootstrap: () => ["maintenance", "form-signatory", "bootstrap"] as const,
	options: () => ["maintenance", "form-signatory", "options"] as const,
	resolve: (unitId: number | null, moduleCodes: readonly string[]) =>
		[
			"maintenance",
			"form-signatory",
			"resolve",
			unitId,
			moduleCodes.join(","),
		] as const,
	setups: () => ["maintenance", "form-signatory", "setups"] as const,
	setup: (setupId: string) =>
		["maintenance", "form-signatory", "setup", setupId] as const,
};
