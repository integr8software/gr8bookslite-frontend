type ExportThemeColors = {
	accentArgb: string;
	accentPdfRgb: string;
	contrastArgb: string;
	contrastPdfRgb: string;
};

const DefaultAccentHex = "#57c4e5";
const DefaultContrastHex = "#ffffff";

export function getModuleTableExportThemeColors(): ExportThemeColors {
	const accentHex = getCssColorVariable("--skyblue", DefaultAccentHex);
	const contrastHex = getCssColorVariable(
		"--skyblue-contrast",
		DefaultContrastHex,
	);

	return {
		accentArgb: hexToArgb(accentHex),
		accentPdfRgb: hexToPdfRgb(accentHex),
		contrastArgb: hexToArgb(contrastHex),
		contrastPdfRgb: hexToPdfRgb(contrastHex),
	};
}

function getCssColorVariable(variableName: string, fallback: string) {
	if (typeof window === "undefined") {
		return fallback;
	}

	const value = window
		.getComputedStyle(document.documentElement)
		.getPropertyValue(variableName)
		.trim();

	return normalizeHexColor(value) ?? fallback;
}

function normalizeHexColor(value: string) {
	if (/^#[0-9a-f]{6}$/i.test(value)) {
		return value;
	}

	if (/^#[0-9a-f]{3}$/i.test(value)) {
		const [, red, green, blue] = value;

		return `#${red}${red}${green}${green}${blue}${blue}`;
	}

	return undefined;
}

function hexToArgb(hexColor: string) {
	return `FF${hexColor.replace("#", "").toUpperCase()}`;
}

function hexToPdfRgb(hexColor: string) {
	const { blue, green, red } = hexToRgb(hexColor);

	return `${toPdfColorChannel(red)} ${toPdfColorChannel(
		green,
	)} ${toPdfColorChannel(blue)}`;
}

function hexToRgb(hexColor: string) {
	const normalizedHex = hexColor.replace("#", "");

	return {
		blue: Number.parseInt(normalizedHex.slice(4, 6), 16),
		green: Number.parseInt(normalizedHex.slice(2, 4), 16),
		red: Number.parseInt(normalizedHex.slice(0, 2), 16),
	};
}

function toPdfColorChannel(value: number) {
	return (value / 255).toFixed(3).replace(/0+$/, "").replace(/\.$/, "");
}
