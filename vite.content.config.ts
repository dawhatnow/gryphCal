// Builds the content script separately as ONE self-contained file.
// Why separate? Content scripts can't use `import`, so everything they need
// must be bundled into a single IIFE (an immediately-run function).
import { defineConfig } from "vite";
import { fileURLToPath } from "node:url";

export default defineConfig({
  build: {
    outDir: "dist",
    emptyOutDir: false, // keep the popup/calendar build from the first step
    lib: {
      entry: fileURLToPath(new URL("src/content/index.ts", import.meta.url)),
      name: "CourseCalContent",
      formats: ["iife"],
      fileName: () => "content.js",
    },
  },
});
