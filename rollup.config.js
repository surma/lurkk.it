const path = require("path");
const typescript = require("rollup-plugin-typescript2");
const nodeResolve = require("rollup-plugin-node-resolve");

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
    nodeResolve()
  ],
  experimentalCodeSplitting: true
};
