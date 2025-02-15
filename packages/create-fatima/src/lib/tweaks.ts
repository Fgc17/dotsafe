import { tweakUserConfig } from "src/utils/tweak-user-config";
import type { Language } from "./types";

const tweakTypescript = () => {
	tweakUserConfig("tsconfig.json", (config) => {
		config.compilerOptions = {
			...config.compilerOptions,
			paths: {
				...config.compilerOptions?.paths,
				env: ["./env.ts"],
			},
		};
		return config;
	});

	tweakUserConfig(".gitignore", (content) => {
		const additions = ["\n", "# fatima", "\n", "env.ts"];
		return additions.filter((item) => !content.includes(item)).join("");
	});
};

const tweakJavascript = () => {
	tweakUserConfig("jsconfig.json", (config) => {
		config.compilerOptions = {
			...config.compilerOptions,
			paths: {
				...config.compilerOptions?.paths,
				"#env": ["./env.js"],
			},
		};
		return config;
	});

	tweakUserConfig("package.json", (config) => {
		config.imports = {
			...config.imports,
			"#env": "./env.js",
		};
		return config;
	});

	tweakUserConfig(".gitignore", (content) => {
		const additions = ["\n", "# fatima", "\n", "env.js"];
		return additions.filter((item) => !content.includes(item)).join("");
	});
};

export const applyUserConfigTweaks = (language: Language) => {
	if (language === "typescript") {
		tweakTypescript();
	} else {
		tweakJavascript();
	}
};
