import type { ImageResponseOptions } from "next/server";

type FontOptions = ImageResponseOptions["fonts"];

async function loadGoogleFont(font: string, weight: number) {
	const url = `https://fonts.googleapis.com/css2?family=${font}:wght@${weight}`;
	const css = await (await fetch(url)).text();
	const resource = css.match(
		/src: url\((.+)\) format\('(opentype|truetype)'\)/,
	);

	if (resource) {
		const response = await fetch(resource[1]);
		if (response.status === 200) {
			return {
				buffer: await response.arrayBuffer(),
				font: { family: font, weight: weight },
			};
		}
	}

	throw new Error("❌ Failed to load font data!");
}

export const getFonts = async () => {
	const fonts = await Promise.all([
		loadGoogleFont("Inter", 400),
		loadGoogleFont("Inter", 600),
		loadGoogleFont("Inter", 700),
	]);

	return fonts.map(({ font, buffer }) => ({
		name: font.family,
		data: buffer,
		style: "normal",
		weight: font.weight,
	})) as FontOptions;
};
