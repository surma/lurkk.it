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

(function() {
if(self.define) {
  return;
}
const registry = {
  require: Promise.resolve(require)
};

async function singleRequire(name, resolve) {
  if(!registry[name]) {
    await new Promise(resolve => {
      if('importScripts' in self) {
        importScripts(name);
        resolve();
      } else {
        const script = document.createElement('script');
        script.src = name;
        // Ya never know
        script.defer = true;
        document.head.appendChild(script);
        script.onload = resolve;
      }
    });

    if(!registry[name]) {
      throw new Error(`Module ${name} didn’t register its module`);
    }
  }
  resolve(registry[name]);
}

async function require(names, resolve) {
  const modules = await Promise.all(names.map(name => new Promise(resolve => singleRequire(name, resolve))));
  resolve(modules.length === 1 ? modules[0] : modules);
}

self.define = (moduleName, depsNames, factory) => {
  if(registry[moduleName]) {
    // Module is already loading or loaded.
    return;
  }
  registry[moduleName] = new Promise(async resolve => {
    let exports = {};
    const deps = await Promise.all(
      depsNames.map(depName => {
        if(depName === 'exports') {
          return exports;
        }
        return new Promise(resolve => singleRequire(depName, resolve));
      })
    );
    exports.default = factory(...deps);
    resolve(exports);
  });
};
})();
