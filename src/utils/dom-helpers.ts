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

export function decodeHTML(input: string): string {
  const e = document.createElement("div");
  e.innerHTML = input;
  return e.innerText;
}

// Same as `customElements.define()`, but doesn’t throw when the element is
// already defined.
export function defineCE(name: string, clazz: Constructor<HTMLElement>) {
  if (customElements.get(name)) {
    return;
  }
  customElements.define(name, clazz);
}
