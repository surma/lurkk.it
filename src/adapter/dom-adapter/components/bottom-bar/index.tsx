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

import { h, RenderableProps } from "preact";

import { emitTrigger } from "../../../../../westend/utils/fsm-utils.js";

import { Trigger, TriggerPayloadMap } from "../../../../fsm/generated.js";

import { getLast } from "../../state-stream.js";

import { defineCE, injectStyles } from "../../../../utils/dom-helpers.js";

import BottomBar from "../../elements/bottom-bar";
defineCE("bottom-bar", BottomBar);
declare global {
  namespace JSX {
    interface IntrinsicElements {
      ["bottom-bar"]: Partial<BottomBar & { children: any }> & {
        [x: string]: any;
      };
    }
  }
}

import ItemStack from "../../elements/item-stack";

import { State } from "../../types.js";

import { go } from "../../../../utils/router.js";

import styles from "./styles.css";
injectStyles("bottom-bar-component", styles);

import { View, ViewType } from "../../../../repository/view.js";

import backSVG from "../../../../icons/back.svg";
import downloadSVG from "../../../../icons/download.svg";
import refreshSVG from "../../../../icons/refresh.svg";
import starOffSVG from "../../../../icons/star_off.svg";
import starOnSVG from "../../../../icons/star_on.svg";

function open(event: Event) {
  event.preventDefault();
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

async function toggleFavorite() {
  const lastState = getLast();
  if (!lastState) {
    return;
  }
  const topView = lastState.stack[lastState.stack.length - 1];
  if (!topView || topView.type !== ViewType.SUBREDDIT) {
    return;
  }
  emitTrigger<Trigger.TOGGLE_FAVORITE, TriggerPayloadMap>(
    Trigger.TOGGLE_FAVORITE,
    {
      id: topView.subreddit.id
    }
  );
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
  state: State;
}
export default function BottomBarComponent({ state }: RenderableProps<Props>) {
  return (
    <bottom-bar id="bottom-bar" onDblclick={toggleBar}>
      <div slot="bar" class="bar">
        <button class="button back" onClick={back} {...setInnerHTML(backSVG)} />
        <form onSubmit={open}>
          <input
            placeholder="/r/..."
            class="input"
            value={state.searchBarValue}
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
            state.showFavoriteButton ? "" : "invisible",
            state.isFavoriteSubreddit ? "favorited" : ""
          ].join(" ")}
          onClick={toggleFavorite}
          {...setInnerHTML(state.isFavoriteSubreddit ? starOnSVG : starOffSVG)}
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
            {state.favorites.map(i => (
              <a class="favorite" onClick={closeBar} href={i.link}>
                {i.label}
              </a>
            ))}
          </ul>
        </section>
      </div>
    </bottom-bar>
  );
}
