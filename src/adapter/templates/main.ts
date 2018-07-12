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

import headerTemplate from "./header.js";
import menuTemplate from "./menu.js";

export function getTopView(snapshot: Snapshot<State, DataObject>): View | null {
  const stack = snapshot.data.stack;
  if (stack.length <= 0) {
    return null;
  }
  return stack[stack.length - 1];
}

export type PartialTemplate = (
  snapshot: Snapshot<State, DataObject>
) => TemplateResult;
export type ViewTemplate = (view: View) => TemplateResult;

const viewMap = new Map<ViewType, ViewTemplate>([
  [ViewType.EMPTY, view => html``],
  [ViewType.SUBREDDIT, SubredditView],
  [ViewType.THREAD, ThreadView]
]);

const renderView: PartialTemplate = snapshot => {
  const topView = getTopView(snapshot);
  if (!topView) {
    return html`Waiting for content...`;
  }
  const viewTemplate = viewMap.get(topView.view);
  if (!viewTemplate) {
    return html``;
  }
  return viewTemplate(topView);
};

export default (snapshot: Snapshot<State, DataObject>) => {
  const topView = getTopView(snapshot);
  return html`
    ${headerTemplate(snapshot)}
    ${menuTemplate(snapshot)}
    <main>
      ${renderView(snapshot)}
    </main>
  `;
};
