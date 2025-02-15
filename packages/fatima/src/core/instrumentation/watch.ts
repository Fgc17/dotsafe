import { listenParentEnv } from "src/lib/listeners/parent-env";
import { lifecycle } from "../lifecycle";
import { fatimaStore } from "src/lib/store/store";

export function watch() {
	const port = Number(fatimaStore.get("fatimaInstrumentationPort"));

	if (!port) return lifecycle.error.missingWatchPort();

	listenParentEnv(port);
}
