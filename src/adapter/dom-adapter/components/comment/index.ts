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
import { Component } from "preact";

import { Comment } from "../../../../model/comment.js";

import { pluralize } from "../../../../utils/lang-helpers.js";
import { setInnerHTML } from "../../../../utils/preact-helpers.js";

interface Props {
  state: Comment;
}
export default class CommentComponent extends Component<Props, {}> {
  render({ state }: Props) {
    return html`
      <li class="comment">
        <div
          class="content"
          ...${setInnerHTML(state.htmlBody)}
        ></div>
        <div class="meta">
          /u/${state.author} • ${state.points} ${pluralize(
      "point",
      state.points
    )}
        </div>
        <ul class="comments replies">
          ${state.replies.map(
            comment => html`<${CommentComponent} state=${comment} />`
          )}
        </ul>
      </li>
    `;
  }
}
