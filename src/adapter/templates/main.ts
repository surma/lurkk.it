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
import * as ColorTools from "../../utils/color-tools.js";


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


const primary = "#009B9B";
const secondary1 = "#FFD200";
const secondary2 = "#CE0074";

const boxTemplate = (hsl: ColorTools.HSLColor) => {
  return html`
    <div style="background-color: hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%);">
      ${ColorTools.RGBtoHex(ColorTools.HSLtoRGB(hsl))}
    </div>
  `;
};

export default (snapshot: Snapshot<State, DataObject>) => {
  const topView = getTopView(snapshot);
  return html`
    ${headerTemplate(snapshot)}
    ${menuTemplate(snapshot)}
    <main>
      ${renderView(snapshot)}
    </main>
    <item-stack style="width: 500px; height: 500px">
      <div style="background-color: blue"></div>
      <div style="background-color: green"></div>
      <div style="background-color: red"></div>
      <div style="display: grid; grid-template-columns: repeat(5, 1fr);">
        ${
          ColorTools.generatePalette(primary).map(boxTemplate)
        }
        ${
          ColorTools.generatePalette(secondary1).map(boxTemplate)
        }
        ${
          ColorTools.generatePalette(secondary2).map(boxTemplate)
        }
      </div>
    </item>
  `;
};
