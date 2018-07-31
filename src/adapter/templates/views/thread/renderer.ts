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

import { html } from "htm/preact";

import { Thread } from "../../../../model/thread.js";
import { View, ViewType } from "../../../../model/view.js";

import { injectStyles } from "../../../../utils/dom-helpers.js";
import { pluralize } from "../../../../utils/lang-helpers.js";
import { unsafeHTML } from "../../../../utils/lit-helpers.js";

function generateContent(thread: Thread) {
  if (thread.isLink) {
    return html`<a href="${
      thread.link
    }" class="content link" style="background-image: url(${
      thread.previewImage
    });"></a>`;
  } else {
    return html`<div class="content text">${unsafeHTML(
      thread.htmlBody!
    )}</div>`;
  }
}

import commentTemplate from "./comment-template.html";
import styles from "./styles.css";
import template from "./template.html";

export default (view: View) => {
  injectStyles("thread", styles);
  if (view.type !== ViewType.THREAD) {
    throw new Error("View is not of type THREAD");
  }
  return template(view, {
    commentTemplate,
    generateContent,
    pluralize,
    unsafeHTML
  });
};
