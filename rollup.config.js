import typescript from "rollup-plugin-typescript2";
import nodeResolve from "rollup-plugin-node-resolve";
import { terser } from "rollup-plugin-terser";
import css from "./utils/rollup-plugin-css";
import markup from "./utils/rollup-plugin-markup";
import codesplitloader from "./utils/rollup-plugin-codesplitloader/index.js";

import { readFileSync } from "fs";

// Delete 'dist'
require("rimraf").sync("dist");

export default {
  input: ["src/bootstrap.ts", "src/worker.ts", "src/sw.ts"],
  output: {
    dir: "dist",
    format: "amd",
    sourcemap: process.env.SOURCEMAPS ? "inline" : false
  },
  plugins: [
    typescript({
      clean: true,
      // Make sure we are using our version of TypeScript.
      typescript: require("typescript"),
      tsconfigOverride: {
        compilerOptions: {
          sourceMap: true
        }
      }
    }),
    nodeResolve(),
    css(),
    markup(),
    codesplitloader({
      loader: readFileSync("./utils/rollup-plugin-codesplitloader/loader.js")
    })
    // terser(),
  ],
  experimentalCodeSplitting: true
};
