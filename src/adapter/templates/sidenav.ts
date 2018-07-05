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

import { html, render } from "lit-html/lib/lit-extended.js";
import { unsafeHTML } from "../../utils/lit-helpers.js";

import { go } from "westend/utils/router.js";

import { State, View, ViewType } from "../../fsm/generated.js";

import SwipeableSidenav from "../../components/swipeable-sidenav.js";

import { getTopView, PartialTemplate } from "./main.js";

const menuSVG = fetch("icons/menu.svg").then(r => r.text());

export enum SidenavState {
  OPEN,
  CLOSED
}

export function setSidenavState(state: SidenavState) {
  const sidenav = document.querySelector(
    "swipeable-sidenav"
  ) as SwipeableSidenav | null;
  if (!sidenav) {
    return;
  }
  switch (state) {
    case SidenavState.OPEN:
      sidenav.open();
      break;
    case SidenavState.CLOSED:
      sidenav.close();
      break;
  }
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
    setSidenavState(SidenavState.CLOSED);
  }
  return false;
}

const partial: PartialTemplate = snapshot => html`
  <swipeable-sidenav id="sidenav">
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
              on-click=${() => setSidenavState(SidenavState.CLOSED)}>
                ${subreddit}
            </a>
          </li>
        `
      )}
    </ul>
  </swipeable-sidenav>
`;

export default partial;
