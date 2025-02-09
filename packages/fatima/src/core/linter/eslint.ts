const noEnvRuleObject = {
	meta: {
		type: "problem",
		docs: {
			description: "Prevents unsafe access of the 'env' object.",
			recommended: false,
		},
		schema: [],
		messages: {
			noEnv: "Access to the 'env' object is not allowed here.",
		},
	},

	create(context: any) {
		return {
			MemberExpression(node: any) {
				if (node.object && node.object.name === "env") {
					context.report({
						node,
						messageId: "noEnv",
					});
				}
			},

			CallExpression(node: any) {
				if (node.callee?.object?.name === "env") {
					context.report({
						node,
						messageId: "noEnv",
					});
				}
			},
		};
	},
};

const noProcessEnvRule = {
	meta: {
		type: "problem",
		docs: {
			description: "Prevents unsafe access of the 'process.env' object.",
			recommended: false,
		},
		schema: [],
		messages: {
			noProcessEnv:
				"Access to the 'process.env' object is not allowed, use 'env' or 'publicEnv'.",
		},
	},

	create(context: any) {
		return {
			MemberExpression(node: any) {
				if (node.object?.name === "process" && node.property?.name === "env") {
					context.report({
						node,
						messageId: "noProcessEnv",
					});
				}
			},

			CallExpression(node: any) {
				if (
					node.callee?.object?.name === "process" &&
					node.callee.property?.name === "env"
				) {
					context.report({
						node,
						messageId: "noProcessEnv",
					});
				}
			},
		};
	},
};

export const plugin = {
	plugins: {
		"@fatima": {
			rules: {
				"no-env": noEnvRuleObject,
				"no-process-env": noProcessEnvRule,
			},
		},
	},
	rules: {
		"@fatima/no-process-env": "error",
	},
};

export const noEnvRule = (...files: string[]) => ({
	files,
	rules: {
		"@fatima/no-env": "error",
	},
});
