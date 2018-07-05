const path = require("path");
const babel = require("rollup-plugin-babel");
const typescript = require("rollup-plugin-typescript2");
const nodeResolve = require("rollup-plugin-node-resolve");

// Load this project’s package.json so we can rip the babel config out of it.
const pkg = require("./package.json");

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
    babel(pkg.babel)
  ],
  experimentalCodeSplitting: true
};
