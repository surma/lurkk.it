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

import * as MessageBus from "../../utils/broadcast-channel-ponyfill.js";
import * as FsmUtils from "../../utils/fsm-utils.js";

import ItemStack from "./elements/item-stack";

import {
  Node,
  READY_CHANNEL as FSM_READY_CHANNEL,
  Trigger,
  TriggerPayloadMap,
  Value
} from "../../fsm/generated.js";

import {
  getPath,
  go,
  NAVIGATION_CHANNEL,
  NavigationMessage,
  NavigationType
} from "../../utils/router.js";

async function onPathChange(path: string) {
  if (path === "/") {
    go("/r/all", { replace: true });
    return;
  }
  if (path.startsWith("/r/")) {
    await FsmUtils.emitTrigger<Trigger.VIEW_SUBREDDIT, TriggerPayloadMap>(
      Trigger.VIEW_SUBREDDIT,
      {
        id: path.substr(3)
      }
    );
    return;
  } else if (path.startsWith("/t/")) {
    await FsmUtils.emitTrigger<Trigger.VIEW_THREAD, TriggerPayloadMap>(
      Trigger.VIEW_THREAD,
      {
        id: path.substr(3)
      }
    );
    return;
  }
}

export async function init() {
  const navigationBus = await MessageBus.get<NavigationMessage>(
    NAVIGATION_CHANNEL
  );
  navigationBus.listen(async (navigationMsg?: NavigationMessage) => {
    if (!navigationMsg) {
      return;
    }
    if (navigationMsg.type === NavigationType.BACK) {
      const itemStack = document.querySelector("item-stack") as ItemStack;
      // FIXME (@surma): This does the right thing most of the time, but a quick
      // double-tap of the back button will break it. I should probably just
      // switch to observables so I can queue up these events properly.
      if (!itemStack.hasDismissedItems) {
        await itemStack.dismiss();
      }
      await FsmUtils.emitTrigger<Trigger.DISMISS, TriggerPayloadMap>(
        Trigger.DISMISS,
        {}
      );
      const currentPath = getPath();
      if (itemStack.numItems === 0 && currentPath !== "/") {
        onPathChange(currentPath);
      }
      return;
    }
    onPathChange(navigationMsg.path);
  });
  onPathChange(getPath());
}
