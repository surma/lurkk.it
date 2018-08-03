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

interface Window {
  define: (moduleName: string, depsNames: string[], factory: Factory) => void;
}

interface WorkerGlobalScope {
  define: (moduleName: string, depsNames: string[], factory: Factory) => void;
}

type Factory = (...deps: Array<{}>) => void;

(function(scope: Window | WorkerGlobalScope) {
function isWorker(x: any): x is WorkerGlobalScope {
  return 'importScripts' in x;
}

const registry = new Map<string, Promise<{}>>([
  ['require', Promise.resolve(require)]
]);

function promiseSingleRequire(name: string): Promise<{}> {
  return new Promise(resolve => singleRequire(name, resolve));
}

async function singleRequire(name: string, resolve: (x: {}) => void) {
  if(!registry.has(name)) {
    await new Promise(resolve => {
      if(isWorker(scope)) {
        scope.importScripts(name);
        resolve();
      } else {
        const script = scope.document.createElement('script');
        script.src = name;
        // Ya never know
        script.defer = true;
        scope.document.head.appendChild(script);
        script.onload = resolve;
      }
    });

    if(!registry.has(name)) {
      throw new Error(`Module ${name} didn’t register its module`);
    }
  }
  resolve(registry.get(name)!);
}

async function require(name: string[], resolve:(x: {} | Array<{}>) => void) {
  const modules = await Promise.all(name.map(promiseSingleRequire));
  if(modules.length === 1) {
    return resolve(modules[0]);
  }
  resolve(modules);
}

scope.define = (moduleName: string, depsNames: string[], factory: Factory) => {
  if(registry.has(moduleName)) {
    // Module is already loading or loaded.
    return;
  }
  registry.set(moduleName, new Promise(async resolve => {
    let exports = {};
    const deps = await Promise.all(
      depsNames.map(depName => {
        if(depName === 'exports') {
          return exports;
        }
        return new Promise(resolve => singleRequire(depName, resolve));
      })
    );
    (exports as any).default = factory(...deps);
    resolve(exports);
  }));
};
})(self);
