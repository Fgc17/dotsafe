import { fatimaStore } from "../store/store";

const utils = {
	error: console.error,
	log: console.log,
};

export const debug = new Proxy(utils, {
	get(target, key: string) {
		if (!fatimaStore.get("fatimaDebug")) return () => null;

		return Reflect.get(target, key);
	},
});
