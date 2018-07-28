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

import { TemplateResult } from "lit-html";

import { emitTrigger, getSnapshot } from "westend/utils/fsm-utils.js";

import {
  Node,
  Trigger,
  TriggerPayloadMap,
  Value
} from "../../fsm/generated.js";

import { defineCE, injectStyles } from "../../utils/dom-helpers.js";
import { unsafeHTML } from "../../utils/lit-helpers.js";

import BottomBar from "../../components/bottom-bar";
defineCE("bottom-bar", BottomBar);

import ItemStack from "../../components/item-stack";
defineCE("item-stack", ItemStack);

import { View, ViewType } from "../../model/view.js";
import { AppState, ViewRenderer } from "./types.js";

import { go } from "../../utils/router.js";

const viewRenderers = new Map<ViewType, () => Promise<ViewRenderer>>([
  [
    ViewType.THREAD,
    () => import("./views/thread/renderer.js").then(m => m.default)
  ],
  [
    ViewType.SUBREDDIT,
    () => import("./views/subreddit/renderer.js").then(m => m.default)
  ]
]);

async function renderView(view: View): Promise<TemplateResult> {
  if (!viewRenderers.has(view.type)) {
    throw new Error("Unknown view type");
  }
  const viewRenderer = await viewRenderers.get(view.type)!();
  return viewRenderer(view);
}

import styles from "./app-template.css";
import appTemplate from "./app-template.html";
injectStyles("app", styles);

import bottomBarStyles from "./fragments/bottom-bar/styles.css";
import bottomBar from "./fragments/bottom-bar/template.html";
injectStyles("bottom-bar", bottomBarStyles);

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

function extractSearchBarValue(view?: View): string {
  if (!view) {
    return "";
  }
  switch (view.type) {
    case ViewType.SUBREDDIT:
      return `/r/${view.subreddit.id}`;
    case ViewType.THREAD:
      return `/r/${view.thread.subreddit}`;
    default:
      return "";
  }
}

function open() {
  const input = document.querySelector(
    "#bottom-bar .input"
  )! as HTMLInputElement;
  let target = input.value;
  if (!target.startsWith("/r/")) {
    target = `/r/${target}`;
  }
  go(target);
  input.blur();
  return false;
}

function isLoading(state: AppState) {
  return state.value.loading.length > 0;
}

function topView(state: AppState): View | undefined {
  return state.value.stack[state.value.stack.length - 1];
}

function toggleBar(evt: Event) {
  const bottomBar = document.querySelector("#bottom-bar")! as BottomBar;
  bottomBar.toggle();
  evt.preventDefault();
}

async function refresh() {
  const itemStack = document.querySelector("item-stack")! as ItemStack;
  await itemStack.dismiss();
  emitTrigger<Trigger.REFRESH, TriggerPayloadMap>(Trigger.REFRESH, {});
}

function showFavorite(view?: View) {
  if (!view) {
    return false;
  }
  return view.type === ViewType.SUBREDDIT;
}

async function toggleFavorite() {
  // FIXME (@surma): This shouldn’t be necessary.
  const state = await getSnapshot<Node, Value>();
  const topV = topView(state);
  if (!topV || topV.type !== ViewType.SUBREDDIT) {
    return;
  }
  emitTrigger<Trigger.TOGGLE_FAVORITE, TriggerPayloadMap>(
    Trigger.TOGGLE_FAVORITE,
    {
      id: topV.subreddit.id
    }
  );
}

function isFavoriteSubreddit(state: AppState) {
  const view = topView(state);
  if (!view || view.type !== ViewType.SUBREDDIT) {
    return;
  }
  return state.value.favorites.includes(view.subreddit.id);
}

import backSVG from "../../icons/back.svg";
import downloadSVG from "../../icons/download.svg";
import offlineSVG from "../../icons/offline.svg";
import refreshSVG from "../../icons/refresh.svg";
import starOffSVG from "../../icons/star_off.svg";
import starOnSVG from "../../icons/star_on.svg";

export default (state: AppState) =>
  appTemplate(state, {
    back: () => history.back(),
    bottomBar,
    extractSearchBarValue,
    icons: {
      backSVG: unsafeHTML(backSVG),
      downloadSVG: unsafeHTML(downloadSVG),
      offlineSVG: unsafeHTML(offlineSVG),
      refreshSVG: unsafeHTML(refreshSVG),
      starOffSVG: unsafeHTML(starOffSVG),
      starOnSVG: unsafeHTML(starOnSVG)
    },
    isFavoriteSubreddit,
    isLoading,
    isNewFunc,
    open,
    refresh,
    renderView,
    showFavorite,
    toggleBar,
    toggleFavorite,
    topView
  });
