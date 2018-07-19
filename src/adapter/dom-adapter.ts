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

import { html, render } from "lit-html";

import * as MessageBus from "westend/src/message-bus/message-bus.js";
import { State } from "westend/src/state-machine/state-machine.js";
import * as FsmUtils from "westend/utils/fsm-utils.js";
import * as RequestResponseBus from "westend/utils/request-response-bus.js";
import * as ServiceReady from "westend/utils/service-ready.js";

import { READY_CHANNEL as MODEL_READY_CHANNEL } from "../model/model.js";

import {
  DATA_SOURCE_NAME_CHANNEL,
  DataSourceNameRequest,
  DataSourceNameResponse
} from "../model/loading.js";

import {
  Node,
  READY_CHANNEL as FSM_READY_CHANNEL,
  Trigger,
  TriggerPayloadMap,
  Value
} from "../fsm/generated.js";

import {
  getPath,
  go,
  NAVIGATION_CHANNEL,
  NavigationMessage
} from "../utils/router.js";

export class DomAdapter {
  async init() {
    if (isDebug()) {
      await this.initDebug();
    }
    FsmUtils.onChange<Node, Value>(this.onFsmChange.bind(this));

    await ServiceReady.waitFor(FSM_READY_CHANNEL);
    this.render(await FsmUtils.getSnapshot<Node, Value>());

    const navigationBus = await MessageBus.get<NavigationMessage>(
      NAVIGATION_CHANNEL
    );
    navigationBus.listen((navigationMsg?: NavigationMessage) => {
      if (!navigationMsg) {
        return;
      }
      this.onPathChange(navigationMsg.path);
    });
    this.onPathChange(getPath());
    (self as any).go = go;
  }

  private async onPathChange(path: string) {
    if (path === "/") {
      go("/r/all");
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

  private onFsmChange(snapshot: State<Node, Value>) {
    this.render(snapshot);
  }

  private render(snapshot: State<Node, Value>) {
    render(
      html`
      node: ${Node[snapshot.currentNode]}
      stack: <pre>${JSON.stringify(snapshot.value.stack, null, "  ")}</pre>
    `,
      document.body
    );
  }

  private async initDebug() {
    console.log("Initializing in debug mode");
    await ServiceReady.waitFor(MODEL_READY_CHANNEL);
    (await RequestResponseBus.get<
      DataSourceNameRequest,
      DataSourceNameResponse
    >(DATA_SOURCE_NAME_CHANNEL)).sendRequest("mock");
  }
}

function isDebug() {
  return new URL(location.href.toString()).searchParams.has("debug");
}
