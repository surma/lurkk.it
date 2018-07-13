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
import { unsafeHTML } from "../../../utils/lit-helpers.js";

import { ViewType } from "../../../fsm/generated.js";
import { ViewTemplate } from "../main.js";

import { Thread } from "../../../model/types.js";

function previewImageURL(item: Thread) {
  if (item.previewImage) {
    return item.previewImage;
  }
  return html``;
}

const template: ViewTemplate = view => {
  if (view.view !== ViewType.SUBREDDIT) {
    throw new Error("Invalid view data for SubredditView");
  }

  return html`
    <ul class="subreddit">
      ${view.subreddit.items.map(
        item => html`
          <li class="item separator">
            <layer-menu>
              <div slot="top" style="background-color: green;">
                <a class="title" href="/t/${item.id}">${item.title}</a>
                <span class="meta">/u/${item.author} (/r/${item.subreddit})</span>
                <span class="engagement">${item.upvotes - item.downvotes}pts • ${item.numComments} comment${item.numComments === 1 ? "" : "s"}</span>
              </div>
              <div style="background-color: red; text-align: right;">
              MUCH MENU
              </div>
            </layer-menu>
          </li>
        `
      )}
    </ul>
  `;
};

export default template;
