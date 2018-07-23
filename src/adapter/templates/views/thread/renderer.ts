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

import { html } from "lit-html/lib/lit-extended.js";

import { Comment } from "../../../../model/comment.js";
import { Thread } from "../../../../model/thread.js";
import { View, ViewType } from "../../../../model/view.js";

import {
  decodeHTML,
  defineCE,
  injectStyles
} from "../../../../utils/dom-helpers.js";
import { unsafeHTML } from "../../../../utils/lit-helpers.js";
import { ago } from "../../../../utils/mini-moment.js";
import { computeAdditionalThreadData } from "../../../../utils/model-helpers.js";

function generateContent(thread: Thread) {
  if (thread.isLink) {
    return html`<a href="${thread.link}"><img src="${
      thread.previewImage
    }"></a>`;
  } else {
    return unsafeHTML(decodeHTML(thread.htmlBody!));
  }
}

import commentTemplate from "./comment-template.html";
import styles from "./styles.css";
import template from "./template.html";

function processComment(comment: Comment): {} {
  const points = comment.upvotes - comment.downvotes;
  return {
    ...comment,
    content: unsafeHTML(decodeHTML(comment.htmlBody)),
    pointLabel: `point${points === 1 ? "" : "s"}`,
    points,
    replies: comment.replies.map(processComment)
  };
}

export default (view: View) => {
  injectStyles("thread", styles);
  if (view.type !== ViewType.THREAD) {
    throw new Error("View is not of type THREAD");
  }
  return template({
    ...view,
    commentTemplate,
    comments: view.comments.map(processComment),
    thread: {
      ...view.thread,
      ...computeAdditionalThreadData(view.thread),
      content: generateContent(view.thread)
    }
  });
};
