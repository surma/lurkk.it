import svelte from "rollup-plugin-svelte";
import nodeResolve from "rollup-plugin-node-resolve";
import { terser } from "rollup-plugin-terser";
import loadz0r from "rollup-plugin-loadz0r";

// Delete 'dist'
require("rimraf").sync("dist");

export default {
  input: ["src/bootstrap.js"], //, "src/worker.ts", "src/sw.ts"],
  output: {
    dir: "dist",
    format: "amd",
    sourcemap: true
  },
  plugins: [nodeResolve(), svelte(), loadz0r(), terser()],
  experimentalCodeSplitting: true
};
