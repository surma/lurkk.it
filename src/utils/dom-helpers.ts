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

// TODO (@surma): Does this need to be more complete?
// Like https://dev.w3.org/html5/html-author/charref
const entities = new Map<RegExp, string>([
  [/&amp;/gi, "&"],
  [/&lt;/gi, "<"],
  [/&gt;/gi, ">"],
  [/&quot;/gi, '"']
]);

export function decodeHTML(input: string): string {
  for (const [pattern, replacement] of entities.entries()) {
    input = input.replace(pattern, replacement);
  }
  return input;
}

// Same as `customElements.define()`, but doesn’t throw when the element is
// already defined.
export function defineCE(name: string, clazz: Constructor<HTMLElement>) {
  if (customElements.get(name)) {
    return;
  }
  customElements.define(name, clazz);
}

export function injectStyles(id: string, stylesheet: string) {
  if (document.querySelector(`#style-${id}`)) {
    return;
  }
  const style = document.createElement("style");
  style.innerHTML = stylesheet;
  style.id = `style-${id}`;
  document.head.appendChild(style);
}
