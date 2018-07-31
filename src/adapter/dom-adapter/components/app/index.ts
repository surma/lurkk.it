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

import { html } from "htm/preact";
import { Component, RenderableProps, VNode } from "preact";

import { defineCE, injectStyles } from "../../../../utils/dom-helpers.js";

import ItemStack from "../../elements/item-stack";
defineCE("item-stack", ItemStack);

import { View, ViewType } from "../../../../model/view.js";
import { AppState } from "../../types.js";

import SubredditView from "../view-subreddit";
import ThreadView from "../view-thread";

const views = new Map<ViewType, (view: View) => VNode>([
  [ViewType.THREAD, (view: View) => html`<${ThreadView} state=${view} />`],
  [ViewType.SUBREDDIT, (view: View) => html`<${SubredditView} state=${view} />`]
]);

function getComponentForView(view: View): VNode {
  if (!views.has(view.type)) {
    throw new Error("Unknown view type");
  }
  const viewComponentFactory = views.get(view.type)!;
  return viewComponentFactory(view);
}

import styles from "./styles.css";
injectStyles("app", styles);

import BottomBarComponent from "../bottom-bar";

const seenItems = new Set<string>();
function isNewFunc(item: HTMLElement) {
  if (!("viewId" in item.dataset)) {
    return false;
  }
  const viewId = item.dataset.viewId!;
  const isSeen = seenItems.has(viewId);
  seenItems.add(viewId);
  return !isSeen;
}

function back() {
  history.back();
}

interface Props {
  state: AppState;
}
export default class App extends Component<Props> {
  render({ state }: RenderableProps<Props>) {
    return html`
      <main>
        <div id="root">Welcome to LurkIt</div>
        <item-stack
          isNewFunc=${isNewFunc}
          on:dismissgesture=${back}
        >
          ${state.value.stack.map(getComponentForView)}
        </item-stack>
        <${BottomBarComponent} state=${state} />
      </main>
    `;
  }
}
