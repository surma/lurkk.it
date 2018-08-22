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

import * as MessageBus from "westend/src/message-bus/message-bus.js";
import { State as FsmState } from "westend/src/state-machine/state-machine.js";
import * as FsmUtils from "westend/utils/fsm-utils.js";
import * as ServiceReady from "westend/utils/service-ready.js";

import {
  Node,
  READY_CHANNEL as FSM_READY_CHANNEL,
  Value
} from "../../fsm/generated.js";

import {
  CHANGE_CHANNEL as DOM_STATE_CHANGE_CHANNEL,
  READY_CHANNEL as UI_THREAD_READY_CHANNEL,
  State as DomState,
  ViewComponentState
} from "./types";

export async function init() {
  FsmUtils.onChange<Node, Value>(onStateChange);

  await ServiceReady.waitFor(FSM_READY_CHANNEL);
  await ServiceReady.waitFor(UI_THREAD_READY_CHANNEL);
  const snapshot = await FsmUtils.getSnapshot<Node, Value>();
  onStateChange(snapshot);
}

import { decodeHTML } from "../../utils/dom-helpers.js";
import { pluralize } from "../../utils/lang-helpers.js";
import { ago } from "../../utils/mini-moment.js";
import { setInnerHTML } from "../../utils/preact-helpers.js";

import { View, ViewType } from "../../repository/view.js";

function getTopView(state: FsmState<Node, Value>): View | undefined {
  return state.value.stack[state.value.stack.length - 1];
}

function isFavoriteSubreddit(state: FsmState<Node, Value>) {
  const view = getTopView(state);
  if (!view || view.type !== ViewType.SUBREDDIT) {
    return false;
  }
  return state.value.favorites.includes(view.subreddit.id);
}

function showFavoriteButton(view?: View) {
  if (!view) {
    return false;
  }
  return view.type === ViewType.SUBREDDIT;
}

function extractSearchBarValue(view?: View): string {
  if (!view) {
    return "";
  }
  switch (view.type) {
    case ViewType.SUBREDDIT:
      return `/r/${view.subreddit.id}`;
    case ViewType.THREAD:
      return `/r/${view.thread.subreddit}`;
    default:
      return "";
  }
}

function domain(url?: string) {
  if (!url) {
    return "self";
  }
  return new URL(url).hostname
    .split(".")
    .slice(-2)
    .join(".");
}

function viewToViewState(view: View): ViewComponentState {
  switch (view.type) {
    case ViewType.SUBREDDIT:
      return {
        ...view,
        items: view.subreddit.items.map(item => {
          const points = item.upvotes - item.downvotes;
          let previewImage = "";
          if (item.images.length > 0) {
            previewImage = `url(${item.images[0].url})`;
          }

          return {
            ...item,
            ago: ago(item.created),
            commentsLabel: pluralize("comment", item.numComments),
            domain: domain(item.link),
            points,
            pointsLabel: pluralize("point", points),
            previewImage
          };
        })
      };
    case ViewType.THREAD:
      const points = view.thread.upvotes - view.thread.downvotes;
      let previewImage = "";
      let previewRatio = "33%";
      if (view.thread.images.length > 0) {
        const bigImage = view.thread.images[view.thread.images.length - 1];
        previewImage = `url(${bigImage.url})`;
        previewRatio = `${(bigImage.height / bigImage.width) * 100}%`;
      }
      return {
        ...view,
        ago: ago(view.thread.created),
        body: view.thread.link
          ? {}
          : setInnerHTML(decodeHTML(view.thread.body!)),
        commentsLabel: pluralize("comment", view.thread.numComments),
        points,
        pointsLabel: pluralize("point", points),
        previewImage,
        previewRatio
      };
  }
}

function map(state: FsmState<Node, Value>): DomState {
  const stack = state.value.stack.map(viewToViewState);
  const topView = stack[stack.length - 1];
  return {
    ...state,
    isFavoriteSubreddit: isFavoriteSubreddit(state),
    isLoading: state.value.loading.length > 0,
    searchBarValue: extractSearchBarValue(topView),
    showFavoriteButton: showFavoriteButton(topView),
    stack,
    topView
  };
}

const busPromise = MessageBus.get<DomState>(DOM_STATE_CHANGE_CHANNEL);
async function onStateChange(fsmState: FsmState<Node, Value>) {
  const domState = map(fsmState);
  const bus = await busPromise;
  bus.send(domState);
}
