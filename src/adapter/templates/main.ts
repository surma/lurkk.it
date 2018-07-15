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
 * hgtp://polymer.github.io/PATENTS.txt
 */

import { TemplateResult } from "lit-html";
import { html, render } from "lit-html/lib/lit-extended.js";
import { repeat} from "lit-html/lib/repeat.js";

import {defineCE} from "../../utils/dom-helpers.js";
import { unsafeHTML } from "../../utils/lit-helpers.js";

import SubredditView from "./views/subreddit.js";
import ThreadView from "./views/thread.js";

import { Snapshot } from "westend/src/state-machine/state-machine.js";
import {
  DataObject,
  State,
  Trigger,
  View,
  ViewType
} from "../../fsm/generated.js";

import {ViewTemplate} from "./template-types.js";

import menuTemplate from "./menu.js";

import BottomBar from "../../components/bottom-bar.js";
defineCE("bottom-bar", BottomBar);

import ItemStack from "../../components/item-stack.js";
defineCE("item-stack", ItemStack);

export function getTopView(snapshot: Snapshot<State, DataObject>): View | null {
  const stack = snapshot.data.stack;
  if (stack.length <= 0) {
    return null;
  }
  return stack[stack.length - 1];
}

const viewMap = new Map<ViewType, () => Promise<ViewTemplate>>([
  [ViewType.EMPTY, () => Promise.resolve((view: View) => html``)],
  [ViewType.SUBREDDIT, () => import("./views/subreddit.js").then(m => m.default)],
  [ViewType.THREAD, () => import("./views/thread.js").then(m => m.default)]
]);

async function renderView(view: View): Promise<TemplateResult> {
  if (!viewMap.has(view.view)) {
    return html``;
  }
  const viewTemplate = await viewMap.get(view.view)!();
  return viewTemplate(view);
};

let seenUIDs = new Set<string>();
function uidNewFunc(el: HTMLElement) {
  const uid = el.dataset["uid"];
  if(!uid) {
    return false;
  }
  const isNew = !seenUIDs.has(uid);
  seenUIDs.add(uid);
  return isNew;
}

export default (snapshot: Snapshot<State, DataObject>) => {
  const topView = getTopView(snapshot);
  return html`
    <style>
      main {
        width: 100vw;
        height: 100vh;
        overflow: hidden;
      }
      item-stack {
        width: 100%;
        height: 100%;
      }
      item-stack > * {
        overflow: auto;
      }
    </style>
    <main>
      <item-stack isNewFunc=${(el: HTMLElement) => uidNewFunc(el)}>
        ${repeat(snapshot.data.stack, item => item.uid, item => renderView(item))}
      </item-stack>
    </main>
    ${menuTemplate(snapshot)}
  `;
};
