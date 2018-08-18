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

import { h } from "preact";

import { Comment } from "../../../../repository/storage-model/comment.js";

import { decodeHTML } from "../../../../utils/dom-helpers.js";
import { pluralize } from "../../../../utils/lang-helpers.js";
import { ago } from "../../../../utils/mini-moment.js";
import { setInnerHTML } from "../../../../utils/preact-helpers.js";

interface Props {
  state: Comment;
}
export default function CommentComponent({ state }: Props) {
  const points = state.upvotes - state.downvotes;
  const agoString = ago(state.created);
  return (
    <li class="comment">
      <div class="content" {...setInnerHTML(decodeHTML(state.body))} />
      <div class="meta">
        /u/
        {state.author} • {points} {pluralize("point", points)} • {agoString}
      </div>
      <ul class="comments replies">
        {state.replies.map(comment => (
          <CommentComponent state={comment} />
        ))}
      </ul>
    </li>
  );
}
