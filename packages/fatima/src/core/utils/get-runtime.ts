declare const Bun: any;
declare const Deno: any;

export const getRuntime = () => {
	let runtime: string = "";

	if (process.release.name === "node") {
		runtime = "node";
	}

	if (typeof Bun !== "undefined") {
		runtime = "bun";
	}

	if (typeof Deno !== "undefined") {
		runtime = "deno";
	}

	const supportedRuntimes = ["node", "bun"];

	if (!supportedRuntimes.includes(runtime)) {
		throw new Error(`Unsupported runtime: ${runtime}`);
	}

	return runtime;
};
