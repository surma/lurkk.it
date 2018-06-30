const path = require("path");
const babel = require("rollup-plugin-babel");
const typescript = require("rollup-plugin-typescript2");
const nodeResolve = require("rollup-plugin-node-resolve");

// Load this project’s package.json so we can rip the babel config out of it.
const pkg = require("./package.json");

function taskify(input) {
  const ext = path.extname(input);
  const base = path.basename(input, ext);
  const dir = path.dirname(input);

  return {
    input: `src/${input}`,
    output: {
      file: `dist/${dir}/${base}.js`,
      format: "iife"
    },
    plugins: [
      typescript({
        clean: true,
        // Make sure we are using our version of TypeScript.
        typescript: require("typescript")
      }),
      nodeResolve(),
      babel(pkg.babel)
    ]
  };
}

// Delete 'dist'
require("rimraf").sync("dist");

export default ["bootstrap.ts", "worker.ts"].map(taskify);
