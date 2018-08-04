/**
 * @license
 * Copyright (c) 2018 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */

import {readFileSync} from "fs";
import {dirname, join} from "path";

export default function (opts = {}) {
  if(!opts.loader) {
    // Rollup uses itself to inline all imports, so `__dirname` doesn’t work.
    const thisFile = require.resolve('rollup-plugin-codesplitloader');
    const thisDir = join(dirname(thisFile));
    opts.loader = readFileSync(thisDir + '/loader.js');
  }
  return {
    name: 'codesplitloader',

    transformChunk(code, outputOptions, chunk) {
      if(outputOptions.format !== 'amd') {
        throw new Error(`You must set output.format to 'amd'`);
      }
      const id = `./${chunk.id}`;
      // FIXME (@surma): Is this brittle? HELL YEAH.
      // Happy to accept PRs that make this more robust.

      // Strip off `define(` at the start
      code = code.substr('define('.length);
      // If the module does not have any dependencies, it’s technically okay
      // to skip the dependency array. But our minimal loader expects it, so
      // we add it back in.
      if(!code.startsWith('[')) {
        code = `[], ${code}`;
      }
      // And add the `define(` back in with the module name inlined.
      code = `define("${id}", ${code}`;
      // If this is an entry module, add the loader code.
      // FIXME(@surma): This also adds the loader to named chunks and I have
      // no idea how to fix it.
      if(chunk.isEntryModuleFacade) {
        code = opts.loader + code;
      }
      return {code, map: null};
    }
  };
}
