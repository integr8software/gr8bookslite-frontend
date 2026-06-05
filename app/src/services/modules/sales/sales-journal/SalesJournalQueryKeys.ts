export const SalesJournalQueryKeys = {
	all: ["sales-journal"] as const,
	records: () => [...SalesJournalQueryKeys.all, "records"] as const,
};
