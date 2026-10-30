// Configuration for the `npx sanity ...` CLI (e.g. `npx sanity dataset export`).

import { defineCliConfig } from "sanity/cli";
import { dataset, projectId } from "./sanity/env";

export default defineCliConfig({ api: { projectId, dataset } });
