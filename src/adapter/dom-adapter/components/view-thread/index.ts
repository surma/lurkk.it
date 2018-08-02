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

import { html } from "htm/src/integrations/preact";
import { Component, RenderableProps } from "preact";

import { ThreadView } from "../../../../model/view.js";

import { injectStyles } from "../../../../utils/dom-helpers.js";
import { pluralize } from "../../../../utils/lang-helpers.js";
import { setInnerHTML } from "../../../../utils/preact-helpers.js";

import styles from "./styles.css";
injectStyles("view-thread", styles);

import CommentComponent from "../comment";

interface Props {
  state: ThreadView;
}
export default class ThreadViewComponent extends Component<Props, {}> {
  render({ state }: RenderableProps<Props>) {
    return html`
      <div class="view thread" data-view-id="${state}" style="${{
      display: "",
      transform: ""
    }}">
        <div class="post">
          <header class="header">
            <h1 class="title">${state.thread.title}</h1>
            <p class="meta">
              /u/${state.thread.author} •
              /r/${state.thread.subreddit} •
              ${state.thread.ago}
            </p>
            <p class="engagement">
              ${state.thread.points}
              ${pluralize("point", state.thread.points)} •
              ${state.thread.numComments}
              ${pluralize("comment", state.thread.numComments)}
            </p>
          </header>
          ${
            state.thread.isLink
              ? html`
                <a
                  href="${state.thread.link}"
                  class="content link"
                  style="background-image: url(${state.thread.previewImage});"
                ></a>
              `
              : html`
              <div
                class="content text"
                ...${setInnerHTML(state.thread.htmlBody!)}
              ></div>
            `
          }
        </div>
        <ul class="comments">
          ${state.comments.map(
            comment => html`<${CommentComponent} state=${comment} />`
          )}
        </ul>
      </div>
    `;
  }
}
