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

export function requestAnimationFramePromise() {
  return new Promise(resolve => requestAnimationFrame(resolve));
}

export async function doubleRAF() {
  await requestAnimationFramePromise();
  await requestAnimationFramePromise();
}

export function transitionEndPromise(elem: Element, duration: number = 0) {
  const tep = new Promise(resolve => {
    elem.addEventListener("transitionend", function l(ev: TransitionEvent) {
      if (ev.target !== elem) {
        return;
      }
      elem.removeEventListener("transitionend", l);
      resolve();
    });
  });
  if (duration <= 0) {
    return tep;
  }
  return Promise.race([
    tep,
    new Promise(resolve => setTimeout(resolve, duration))
  ]);
}

export async function animateTo(
  el: HTMLElement,
  transition: string,
  style: Partial<CSSStyleDeclaration>
) {
  Object.assign(el.style, { transition });
  await requestAnimationFramePromise();
  await requestAnimationFramePromise();
  Object.assign(el.style, style);
  await transitionEndPromise(el);
}
