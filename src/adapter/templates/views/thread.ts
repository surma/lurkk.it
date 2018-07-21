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

import { html, render } from "lit-html";

import {ViewRenderer} from "../types.js";
import {ViewType} from "../../../model/view.js";

const template: ViewRenderer = view => {
  if(view.type !== ViewType.THREAD) {
    throw new Error("View is not of type THREAD");
  }
  return html`
    <div>
      THREAD ${view.thread.id} ${view.thread.subreddit}
    </div>
  `;
};
export default template;
