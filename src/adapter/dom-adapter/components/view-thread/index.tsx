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

import { h, RenderableProps } from "preact";

import { ViewType } from "../../../../model/view.js";

import { injectStyles } from "../../../../utils/dom-helpers.js";
import { pluralize } from "../../../../utils/lang-helpers.js";
import { setInnerHTML } from "../../../../utils/preact-helpers.js";

import styles from "./styles.css";
injectStyles("view-thread", styles);

import CommentComponent from "../comment";

import { ViewComponentProps } from "../../types.js";
export default function ThreadViewComponent({
  state
}: RenderableProps<ViewComponentProps>) {
  if (state.type !== ViewType.THREAD) {
    throw new Error("Invalid state object for view");
  }
  return (
    <div
      class="view thread"
      data-view-id={state.uid}
      style={{
        display: "",
        transform: ""
      }}
    >
      <div class="post">
        <header class="header">
          <h1 class="title">{state.thread.title}</h1>
          <p class="meta">
            /u/
            {state.thread.author} • /r/
            {state.thread.subreddit} •{state.thread.ago}
          </p>
          <p class="engagement">
            {state.thread.points}
            {pluralize("point", state.thread.points)} •
            {state.thread.numComments}
            {pluralize("comment", state.thread.numComments)}
          </p>
        </header>
        {state.thread.isLink ? (
          <a
            href={state.thread.link}
            class="content link"
            style={{
              backgroundImage: `url(${state.thread.previewImage});`
            }}
          />
        ) : (
          <div class="content text" {...setInnerHTML(state.thread.htmlBody!)} />
        )}
      </div>
      <ul class="comments">
        {state.comments.map(comment => (
          <CommentComponent state={comment} />
        ))}
      </ul>
    </div>
  );
}
