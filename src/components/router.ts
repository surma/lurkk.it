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

import * as MessageBus from "westend/src/message-bus/message-bus.js";

export interface NavigationMessage {
  url: string;
}

const bus = MessageBus.get("navigation");

export function go(path: string) {
  history.pushState(null, "", `#${path}`);
  notify();
}

document.addEventListener("click", onClick);
function onClick(evt: MouseEvent) {
  const target = evt.target;
  if (!isAnchorTag(target)) {
    return;
  }
  if (target.href.startsWith("/")) {
    evt.preventDefault();
    evt.stopPropagation();
    return go(target.href);
  }
  let targetURL;
  try {
    targetURL = new URL(target.href);
  } catch (e) {
    return;
  }
  if (targetURL.origin === location.origin) {
    evt.preventDefault();
    evt.stopPropagation();
    go(targetURL.pathname);
  }
}

function isAnchorTag(el: any): el is HTMLAnchorElement {
  return el instanceof Element && el.nodeName === "A";
}

window.addEventListener("popstate", notify);
export async function notify() {
  (await bus).send({
    url: location.href.toString()
  });
}
