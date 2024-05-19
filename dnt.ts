// Bundle src/mod.ts into both ESM and CJS format.
import { build } from "@deno/dnt";
import pkg from "./deno.json" with { type: "json" };

await Deno.remove("./dnt", { recursive: true }).catch(() => {});

await build({
  entryPoints: ["./mod.ts"],
  outDir: "./dnt",
  shims: {
    deno: false,
  },
  package: {
    name: "flushable-set",
    version: pkg.version,
    description: pkg.description,
    license: "MIT",
    repository: {
      type: "git",
      url: "git+https://github.com/vicary/flushable-set.git",
    },
    bugs: {
      url: "https://github.com/vicary/flushable-set/issues",
    },
    keywords: [
      "async",
      "await",
      "batch",
      "chunk",
      "flushable",
      "memory management",
      "promise",
      "promises",
      "set",
      "stream",
      "throttle",
    ],
    funding: {
      type: "github",
      url: "https://github.com/sponsors/vicary",
    },
  },
  async postBuild() {
    // steps to run after building and before running the tests
    await Deno.copyFile("LICENSE", "dnt/LICENSE");
    await Deno.copyFile("README.md", "dnt/README.md");
  },
  typeCheck: "both",
});
