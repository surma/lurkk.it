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

import { State as FsmState } from "../../../westend/src/state-machine/state-machine.js";
import { Node, Value } from "../../fsm/generated.js";
export type AppState = FsmState<Node, Value>;

import {
  Props as SubredditViewComponentProps,
  State as SubredditViewComponentState
} from "./components/view-subreddit";
import {
  Props as ThreadViewComponentProps,
  State as ThreadViewComponentState
} from "./components/view-thread";
export type ViewComponentState =
  | SubredditViewComponentState
  | ThreadViewComponentState;
export type ViewComponentProps =
  | SubredditViewComponentProps
  | ThreadViewComponentProps;

interface Favorite {
  link: string;
  label: string;
}
export interface State extends FsmState<Node, Value> {
  stack: ViewComponentState[];
  favorites: Favorite[];
  frontpage: string;
  isLoading: boolean;
  topView?: ViewComponentState;
  isFavoriteSubreddit: boolean;
  showFavoriteButton: boolean;
  searchBarValue: string;
}

export const READY_CHANNEL = "dom-adapter.ui-thread.ready";
export const CHANGE_CHANNEL = "dom-adapter.off-thread.change";
