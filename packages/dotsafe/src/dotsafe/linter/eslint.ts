const eslintRule = {
  meta: {
    type: "problem",

    docs: {
      description: "Disallow access to the 'env' object",
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
        if (
          node.callee &&
          node.callee.object &&
          node.callee.object.name === "env"
        ) {
          context.report({
            node,
            messageId: "noEnv",
          });
        }
      },
    };
  },
};

export const noEnvPlugin = {
  plugins: {
    "@dotsafe": {
      rules: {
        "no-env": eslintRule,
      },
    },
  },
};

export const noEnvRule = (...files: string[]) => ({
  files,
  rules: {
    "@dotsafe/no-env": "error",
  },
});
