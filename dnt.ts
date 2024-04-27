// Bundle src/FlushableSet.ts into both ESM and CJS format.
import { build, emptyDir } from "https://deno.land/x/dnt/mod.ts";
import pkg from "./deno.json" with { type: "json" };

await emptyDir("./dnt");

await build({
  entryPoints: ["./FlushableSet.ts"],
  outDir: "./dnt",
  shims: {
    deno: false,
  },
  package: {
    name: "flushable-set",
    version: pkg.version,
    description:
      "A drop-in replacement of the native Set with an optional max size and a flush callback.",
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
  postBuild() {
    // steps to run after building and before running the tests
    Deno.copyFileSync("LICENSE", "dnt/LICENSE");
    Deno.copyFileSync("README.md", "dnt/README.md");
  },
});
