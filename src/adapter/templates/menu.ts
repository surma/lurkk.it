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
import { go } from "westend/utils/router.js";

import { html, render } from "lit-html/lib/lit-extended.js";
import { unsafeHTML } from "../../utils/lit-helpers.js";

import BottomBar from "../../components/bottom-bar.js";

import { State, View, ViewType } from "../../fsm/generated.js";

import {PartialTemplate} from "./template-types.js";
import { getTopView} from "./main.js";

export enum MenuState {
  OPEN,
  CLOSED
}

export function setMenuState(state: MenuState) {
  const bottomBar = document.querySelector(
    "bottom-bar"
  ) as BottomBar | null;
  if (!bottomBar) {
    return;
  }
  switch (state) {
    case MenuState.OPEN:
      bottomBar.open();
      break;
    case MenuState.CLOSED:
      bottomBar.close();
      break;
  }
}

export function getTitle(topView?: View | null): string {
  if (!topView) {
    return "LurkIt";
  }
  switch (topView.view) {
    case ViewType.EMPTY:
      return "Loading...";
      break;
    case ViewType.SUBREDDIT:
      return `/r/${topView.subreddit.id}`;
      break;
    case ViewType.THREAD:
      return `/r/${topView.thread.subreddit}`;
      break;
  }
  return "";
}

const defaultSubreddits = [
  "/r/all",
  "/r/leagueoflegends",
  "/r/mechanicalkeyboards",
  "/r/rocketleague"
];

function goToSubreddit() {
  const input = document.querySelector("input.subreddit")! as HTMLInputElement;
  let target = input.value;
  if (target.startsWith("/r/")) {
    target = target.substr(3);
  }
  if (target.length > 0) {
    go(`/r/${target}`);
    input.value = "";
    setMenuState(MenuState.CLOSED);
  }
  return false;
}

const partial: PartialTemplate = snapshot => html`
  <style>
    bottom-bar {
      align-items: stretch;
      box-shadow: 0px 3px 4px 4px var(--green);
      display: flex;
      flex-direction: column;
      background-color: var(--white);
      padding: calc(var(--side-padding) * var(--base));
      padding-top: 0;
    }
    bottom-bar > [slot="bar"] {
      font-size: var(--base-font);
      padding: calc(var(--side-padding) * var(--base)) 0;
    }
  </style>
  <bottom-bar id="sidenav">
    <div slot="bar">${getTitle(getTopView(snapshot))}</div>
    <form onsubmit=${() => goToSubreddit()}>
      <input type="text" placeholder="/r/..." class="subreddit">
      <input type="submit" class="go" value="Go">
    </form>
    <ul class="favorites">
      ${defaultSubreddits.map(
        subreddit => html`
          <li class="favorite">
            <a
              href="${subreddit}"
              on-click=${() => setMenuState(MenuState.CLOSED)}>
                ${subreddit}
            </a>
          </li>
        `
      )}
    </ul>
  </bottom-bar>
`;

export default partial;
