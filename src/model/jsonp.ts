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

export interface LoadOpts {
  jsonpFuncName?: string;
  jsonpParamName?: string;
}

function generateDefaultOpts(): LoadOpts {
  return {
    jsonpFuncName: `jsonp_callback_${Math.floor(
      Number.MAX_SAFE_INTEGER * Math.random()
    )}`,
    jsonpParamName: "jsonp"
  };
}

export function load<T>(url: string, opts: LoadOpts = {}): Promise<T> {
  opts = { ...generateDefaultOpts(), ...opts };

  return new Promise(resolve => {
    (self as any)[opts.jsonpFuncName!] = (value: T) => {
      resolve(value);
      delete (self as any)[opts.jsonpFuncName!];
    };
    const parsedURL = new URL(url);
    parsedURL.searchParams.set(opts.jsonpParamName!, opts.jsonpFuncName!);
    importScripts(parsedURL.toString());
  });
}
