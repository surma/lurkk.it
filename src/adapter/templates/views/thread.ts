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

import { html, render, TemplateResult } from "lit-html";

import { ViewType } from "../../../fsm/generated.js";
import { Comment, Thread } from "../../../model/types.js";
import { decodeHTML } from "../../../utils/dom-helpers.js";
import { unsafeHTML } from "../../../utils/lit-helpers.js";
import { ViewTemplate } from "../template-types.js";

function renderComments(comments: Comment[]): TemplateResult {
  return html`
    <ul class="comments">
      ${comments.map(
        comment => html`
        <li class="comment">
          <div class="commentbody">
            ${unsafeHTML(decodeHTML(comment.htmlBody))}
          </div>
          <div class="commentmeta">
            /u/${comment.author}
          </div>
          <div class="commentengagement">
            ${comment.upvotes} upvotes,
            ${comment.downvotes} downvotes
          </div>
          ${
            comment.replies.length > 0
              ? renderComments(comment.replies)
              : html``
          }
        </li>
        `
      )}
    </ul>
  `;
}

function renderContent(t: Thread) {
  if (t.fullImage) {
    return html`
      <img class="main main--image" src="${t.fullImage}">
    `;
  } else if (t.link) {
    return html`
      <div class="main main--link">
        <a href="${t.link}">${t.link}</a>
      </div>
    `;
  } else if (t.htmlBody) {
    return html`
      <div class="main main--text">
        ${unsafeHTML(decodeHTML(t.htmlBody))}
      </div>
    `;
  }
  return html`
    <div class="main main--text main--error">
      This post has no content. At all.
      Not sure how that is possible, to be quite honest.
    </div>
  `;
}

const template: ViewTemplate = view => {
  if (view.view !== ViewType.THREAD) {
    throw new Error("Invalid view data for ThreadView");
  }

  return html`
    <div class="thread separator">
      <h1 class="title">
        ${view.thread.title}
      </h1>
      <div class="meta">
        /u/${view.thread.author}
      </div>
      <div class="engagement">
        ${view.thread.upvotes} upvotes,
        ${view.thread.downvotes} downvotes •
        ${view.thread.numComments} comments
      </div>
      ${renderContent(view.thread)}
    </div>
    ${renderComments(view.comments)}
  `;
};

export default template;
