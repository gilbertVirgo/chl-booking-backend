import { fileURLToPath } from "url";
import path from "path";

export default (importMetaURL) => path.dirname(fileURLToPath(importMetaURL));

// Usage getDirname(import.meta.url);
