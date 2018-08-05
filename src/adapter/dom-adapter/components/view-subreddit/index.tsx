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

import { Component, h, RenderableProps } from "preact";

import { SubredditView } from "../../../../model/view.js";

import { injectStyles } from "../../../../utils/dom-helpers.js";

import SubredditItemComponent from "../subreddit-item/";
import styles from "./styles.css";
injectStyles("view-subreddit", styles);

interface Props {
  state: SubredditView;
}
export default class SubredditViewComponent extends Component<Props, {}> {
  render({ state }: RenderableProps<Props>) {
    return (
      <div
        class="view subreddit"
        data-view-id={state.uid}
        style={{
          display: "",
          transform: ""
        }}
      >
        {state.subreddit.items.map(item => (
          <SubredditItemComponent state={item} />
        ))}
      </div>
    );
  }
}
