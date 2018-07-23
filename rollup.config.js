import typescript from "rollup-plugin-typescript2";
import nodeResolve from "rollup-plugin-node-resolve";
import css from "./utils/rollup-plugin-css";
import markup from "./utils/rollup-plugin-markup";
import { terser } from "rollup-plugin-terser";

// Delete 'dist'
require("rimraf").sync("dist");

export default {
  input: ["src/bootstrap.ts", "src/worker.ts"],
  output: {
    dir: "dist",
    format: "es"
  },
  plugins: [
    typescript({
      clean: true,
      // Make sure we are using our version of TypeScript.
      typescript: require("typescript")
    }),
    nodeResolve(),
    // terser(),
    css(),
    markup()
  ],
  experimentalCodeSplitting: true
};
