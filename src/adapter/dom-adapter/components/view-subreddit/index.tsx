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

import { injectStyles } from "../../../../utils/dom-helpers.js";

import SubredditItemComponent, {
  State as SubredditItemComponentState
} from "../subreddit-item/";
import styles from "./styles.css";
injectStyles("view-subreddit", styles);

import { SubredditView } from "../../../../repository/view.js";
import { ViewComponentProps } from "../../types.js";

export interface State extends SubredditView {
  items: SubredditItemComponentState[];
}
export interface Props extends SubredditView {
  state: State;
}
export default function SubredditViewComponent({
  state
}: RenderableProps<ViewComponentProps>) {
  if (state.type !== ViewType.SUBREDDIT) {
    throw new Error("Invalid state object for view");
  }
  return (
    <div
      class="view subreddit"
      data-view-id={state.uid}
      style={{
        display: "",
        transform: ""
      }}
    >
      {state.items.map(item => (
        <SubredditItemComponent state={item} />
      ))}
    </div>
  );
}
