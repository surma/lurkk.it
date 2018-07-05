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

import { Snapshot } from "westend/src/state-machine/state-machine.js";

import { DataObject, State, View, ViewType } from "../../fsm/generated.js";
import { getTopView, PartialTemplate } from "./main.js";
import { setSidenavState, SidenavState } from "./sidenav.js";

const menuSVG = fetch("icons/menu.svg").then(r => r.text());

function getTitle(topView?: View | null): string {
  if (!topView) {
    return "";
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

function spinnerClass(snapshot: Snapshot<State, DataObject>) {
  const showSpinner = [State.LOAD, State.DISPATCH].includes(
    snapshot.currentState
  );
  if (showSpinner) {
    return "loading";
  }
  return "";
}
const partial: PartialTemplate = snapshot => html`
  <header
    id="header"
    class$="${spinnerClass(snapshot)}"
  >
    <button
      class="menu-btn"
      on-click=${() => setSidenavState(SidenavState.OPEN)}
    >
      ${
        // FIXME(@surma): Couldn’t figure out how to
        // make asset bundling work with Rollup and
        // TypeScript.
        menuSVG.then(t => unsafeHTML(t))
      }
    </button>
    ${getTitle(getTopView(snapshot))}
  </header>
`;

export default partial;
