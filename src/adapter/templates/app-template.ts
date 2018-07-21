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

import { html, TemplateResult } from "lit-html";

import {defineCE} from "../../utils/dom-helpers.js";

import BottomBar from "../../components/bottom-bar";
defineCE("bottom-bar", BottomBar);

import ItemStack from "../../components/item-stack";
defineCE("item-stack", ItemStack);

import {AppState, ViewRenderer} from "./types.js";
import {ViewType, View} from "../../model/view.js";

const viewRenderers = new Map<ViewType, () => Promise<ViewRenderer>>([
  [ViewType.THREAD, () => import("./views/thread/renderer.js").then(m => m.default)],
  [ViewType.SUBREDDIT, () => import("./views/subreddit/renderer.js").then(m => m.default)],
]);

async function renderView(view: View): Promise<TemplateResult> {
  if(!viewRenderers.has(view.type)) {
    throw new Error("Unknown view type");
  }
  const viewRenderer = await viewRenderers.get(view.type)!();
  return viewRenderer(view);
}

import styles from "./app-template.css";
import appTemplate from "./app-template.html";

export default (state: AppState) => appTemplate({
  styles,
  views:  state.value.stack.map(renderView)
});
