import { FatimaValidator, UnsafeEnvironmentVariables } from "../types";

export type ZodSchemaMock = {
	safeParse: (env: any) => {
		success: boolean;
		error?: {
			errors: Array<{
				path: (string | number)[];
				message: string;
			}>;
		};
		data?: any;
	};
};

export const zod = (constraint: ZodSchemaMock): FatimaValidator => {
	return (env: UnsafeEnvironmentVariables) => {
		const result = constraint.safeParse(env);

		const isValid = result.success;

		const errors = result.error?.errors.map((error) => ({
			key: error.path.join("."),
			message: error.message,
		}));

		return {
			isValid,
			errors,
		};
	};
};
