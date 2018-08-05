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

import { Component, h, RenderableProps } from "preact";

import { emitTrigger, getSnapshot } from "westend/utils/fsm-utils.js";

import {
  Node,
  Trigger,
  TriggerPayloadMap,
  Value
} from "../../../../fsm/generated.js";

import { defineCE, injectStyles } from "../../../../utils/dom-helpers.js";

import BottomBar from "../../elements/bottom-bar";
defineCE("bottom-bar", BottomBar);
declare global {
  namespace JSX {
    interface IntrinsicElements {
      ["bottom-bar"]: Partial<BottomBar> & { [x: string]: any };
    }
  }
}

import ItemStack from "../../elements/item-stack";

import { AppState } from "../../types.js";

import { go } from "../../../../utils/router.js";

import styles from "./styles.css";
injectStyles("bottom-bar-component", styles);

import { View, ViewType } from "../../../../model/view.js";

import backSVG from "../../../../icons/back.svg";
import downloadSVG from "../../../../icons/download.svg";
import refreshSVG from "../../../../icons/refresh.svg";
import starOffSVG from "../../../../icons/star_off.svg";
import starOnSVG from "../../../../icons/star_on.svg";

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
  closeBar();
  input.blur();
  return false;
}

function isLoading(state: AppState) {
  return state.value.loading.length > 0;
}

function getTopView(state: AppState): View | undefined {
  return state.value.stack[state.value.stack.length - 1];
}

function toggleBar(evt: Event) {
  const bottomBar = document.querySelector("#bottom-bar")! as BottomBar;
  bottomBar.toggle();
  evt.preventDefault();
}

function closeBar(evt?: Event) {
  const bottomBar = document.querySelector("#bottom-bar")! as BottomBar;
  bottomBar.close();
  if (evt) {
    evt.preventDefault();
  }
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
  const topV = getTopView(state);
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
  const view = getTopView(state);
  if (!view || view.type !== ViewType.SUBREDDIT) {
    return;
  }
  return state.value.favorites.includes(view.subreddit.id);
}

function back() {
  history.back();
}

function onTouchMove(ev: TouchEvent) {
  ev.stopPropagation();
}

function download() {
  alert("Not implemented yet");
}

import { setInnerHTML } from "../../../../utils/preact-helpers.js";

interface Props {
  state: AppState;
}
export default class BottomBarComponent extends Component<Props> {
  render({ state }: RenderableProps<Props>) {
    const topView = getTopView(state);
    return (
      <bottom-bar
        id="bottom-bar"
        loading={isLoading(state)}
        onDblclick={toggleBar}
      >
        <div slot="bar" class="bar">
          <div class="loader" />
          <button
            class="button back"
            onClick={back}
            {...setInnerHTML(backSVG)}
          />
          <form onSubmit={open}>
            <input
              placeholder="/r/..."
              class="input"
              value={extractSearchBarValue(topView)}
            />
            <input type="submit" class="button button--primary go" value="Go" />
          </form>
          <button
            class="button download"
            onClick={download}
            {...setInnerHTML(downloadSVG)}
          />
          <button
            class={[
              "button",
              "favorite",
              showFavorite(topView) ? "" : "invisible",
              isFavoriteSubreddit(state) ? "favorited" : ""
            ].join(" ")}
            onClick={toggleFavorite}
            {...setInnerHTML(
              isFavoriteSubreddit(state) ? starOnSVG : starOffSVG
            )}
          />
          <button
            class="button refresh"
            onClick={refresh}
            {...setInnerHTML(refreshSVG)}
          />
        </div>
        <div class="main">
          <section class="panel favorites" onTouchMove={onTouchMove}>
            <h1>Favorites</h1>
            <ul class="favorites">
              {state.value.favorites.sort().map(i => (
                <a class="favorite" onClick={closeBar} href={`/r/${i}`}>
                  /r/{i}
                </a>
              ))}
            </ul>
          </section>
        </div>
      </bottom-bar>
    );
  }
}
