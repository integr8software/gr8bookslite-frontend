export function getDefaultAccountTableMinWidthClassName(
	visibleColumnCount: number,
) {
	if (visibleColumnCount >= 7) return "min-w-[104rem]";
	if (visibleColumnCount === 6) return "min-w-[90rem]";
	if (visibleColumnCount === 5) return "min-w-[76rem]";
	return "min-w-[64rem]";
}
