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

import { ViewType } from "../../../../repository/view.js";

import { decodeHTML, injectStyles } from "../../../../utils/dom-helpers.js";
import { pluralize } from "../../../../utils/lang-helpers.js";
import { ago } from "../../../../utils/mini-moment.js";
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
  const agoString = ago(state.thread.created);
  const points = state.thread.upvotes - state.thread.downvotes;
  const images = state.thread.images.sort((a, b) => b.width - a.width);
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
            {state.thread.subreddit} • {agoString}
          </p>
          <p class="engagement">
            {points} {pluralize("point", points)} • {state.thread.numComments}{" "}
            {pluralize("comment", state.thread.numComments)}
          </p>
        </header>
        {state.thread.link ? (
          <a
            href={state.thread.link}
            class="content link"
            style={
              images.length > 0
                ? {
                    backgroundImage: `url(${images[0].url}`,
                    paddingTop: `${(images[0].height / images[0].width) * 100}%`
                  }
                : {}
            }
          />
        ) : (
          <div
            class="content text"
            {...setInnerHTML(decodeHTML(state.thread.body!))}
          />
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
