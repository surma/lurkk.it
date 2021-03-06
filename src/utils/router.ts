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

import * as MessageBus from "../../westend/src/message-bus/message-bus.js";

export enum NavigationType {
  NAVIGATION,
  BACK
}
export interface NavigationMessage {
  path: string;
  type: NavigationType;
}

export const NAVIGATION_CHANNEL = "navigation";

const bus = MessageBus.get<NavigationMessage>(NAVIGATION_CHANNEL);

// tslint:disable-next-line:class-name these could get confusing otherwise
export interface go_opts {
  notify?: boolean;
  replace?: boolean;
}
// tslint:disable-next-line:variable-name these could get confusing otherwise
const go_defaultOpts: go_opts = {
  notify: true,
  replace: false
};
export function go(path: string, opts: go_opts = {}) {
  opts = { ...go_defaultOpts, ...opts };
  if (opts.replace) {
    history.replaceState(null, "", `#${path}`);
  } else {
    history.pushState(null, "", `#${path}`);
  }

  if (opts.notify) {
    notify();
  }
}

// Hijack click on <a> tags
document.addEventListener("click", onClick);
function onClick(evt: MouseEvent) {
  const target = evt.target;
  if (!isAnchorTag(target)) {
    return;
  }
  // If the `href` attribute does not have a scheme, it’s a same-origin link
  // and the router will handle it
  if (!/[a-z]+:\/\//.test(target.href)) {
    evt.preventDefault();
    evt.stopPropagation();
    return go(target.href);
  }
  // If the `href` does have a scheme, we have to check if it’s same-origin or
  // not.
  let targetURL;
  try {
    targetURL = new URL(target.href);
  } catch (e) {
    return;
  }
  if (targetURL.origin === location.origin) {
    evt.preventDefault();
    evt.stopPropagation();
    return go(targetURL.pathname);
  }
}

function isAnchorTag(el: any): el is HTMLAnchorElement {
  return el instanceof Element && el.nodeName === "A";
}

export function getPath(): string {
  return location.hash.substr(1) || "/";
}

window.addEventListener("popstate", _ => notify(NavigationType.BACK));
export async function notify(type: NavigationType = NavigationType.NAVIGATION) {
  (await bus).send({
    path: getPath(),
    type
  });
}
