import typescript from "rollup-plugin-typescript2";
import nodeResolve from "rollup-plugin-node-resolve";
import { terser } from "rollup-plugin-terser";
import css from "./utils/rollup-plugin-css";
import markup from "./utils/rollup-plugin-markup";
import amdRename from "./utils/rollup-plugin-amd-rename";

// Delete 'dist'
require("rimraf").sync("dist");

export default [
  {
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
      terser(),
      css(),
      markup(),
      amdRename()
    ],
    experimentalCodeSplitting: true
  },
  {
    input: "utils/amd-loader.ts",
    output: {
      file: "dist/loader.js",
      format: "iife",
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
      terser()
    ]
  }
];
