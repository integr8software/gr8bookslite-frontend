type DedupedRequestOptions = {
	enabled?: boolean;
	key: string;
};

const InFlightRequests = new Map<string, Promise<unknown>>();

export function RunDedupedApiRequest<T>(
	{ enabled = true, key }: DedupedRequestOptions,
	request: () => Promise<T>,
) {
	if (!enabled) {
		return request();
	}

	const pendingRequest = InFlightRequests.get(key);

	if (pendingRequest) {
		return pendingRequest as Promise<T>;
	}

	const promise = request().finally(() => {
		InFlightRequests.delete(key);
	});

	InFlightRequests.set(key, promise);

	return promise;
}

export function BuildApiRequestDedupeKey({
	baseURL,
	data,
	method,
	params,
	url,
}: {
	baseURL?: string;
	data?: unknown;
	method?: string;
	params?: unknown;
	url?: string;
}) {
	return [
		(method ?? "get").toUpperCase(),
		baseURL ?? "",
		url ?? "",
		stableStringify(params),
		stableStringify(data),
	].join("|");
}

function stableStringify(value: unknown): string {
	if (value == null) {
		return "";
	}

	if (typeof value !== "object") {
		return String(value);
	}

	if (value instanceof FormData) {
		const entries: string[] = [];

		value.forEach((entry, key) => {
			entries.push(`${key}:${stringifyFormDataEntry(entry)}`);
		});

		return `FormData{${entries.sort().join(",")}}`;
	}

	if (value instanceof URLSearchParams) {
		return value.toString();
	}

	if (Array.isArray(value)) {
		return `[${value.map((item) => stableStringify(item)).join(",")}]`;
	}

	const record = value as Record<string, unknown>;

	return `{${Object.keys(record)
		.sort()
		.map((key) => `${key}:${stableStringify(record[key])}`)
		.join(",")}}`;
}

function stringifyFormDataEntry(entry: FormDataEntryValue) {
	if (typeof entry === "string") {
		return entry;
	}

	return [
		entry.name,
		entry.size,
		entry.type,
		entry.lastModified,
	].join(":");
}
