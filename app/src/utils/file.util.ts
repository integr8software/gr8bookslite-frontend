export function formatFileSize(bytes: number) {
	if (bytes < 1024) {
		return `${bytes} B`;
	}

	const kilobytes = bytes / 1024;
	if (kilobytes < 1024) {
		return `${kilobytes.toFixed(kilobytes >= 10 ? 0 : 1)} KB`;
	}

	const megabytes = kilobytes / 1024;
	return `${megabytes.toFixed(megabytes >= 10 ? 0 : 1)} MB`;
}
