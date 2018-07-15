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
  STATECHANGE_CHANNEL,
  Trigger,
  TriggerPayloadMap,
  Value
} from "../fsm/generated.js";

import { emitTrigger, getSnapshot } from "../utils/fsm-utils.js";
import * as RequestResponseBus from "../utils/request-response-bus.js";

export class DomAdapter {
  async init() {
    if (isDebug()) {
      await this.initDebug();
    }
    const fsmStateChange = await MessageBus.get<State<Node, Value>>(
      STATECHANGE_CHANNEL
    );

    fsmStateChange.listen(this.onFsmStateChange.bind(this));

    await ServiceReady.waitFor(FSM_READY_CHANNEL);
    this.render(await getSnapshot<Node, Value>());

    if (location.hash === "") {
      await emitTrigger<Trigger.VIEW_SUBREDDIT, TriggerPayloadMap>(
        Trigger.VIEW_SUBREDDIT,
        {
          id: "all",
          trigger: Trigger.VIEW_SUBREDDIT
        }
      );
    } else {
      await emitTrigger<Trigger.VIEW_SUBREDDIT, TriggerPayloadMap>(
        Trigger.VIEW_SUBREDDIT,
        {
          id: location.hash.substr(4),
          trigger: Trigger.VIEW_SUBREDDIT
        }
      );
    }
  }

  private onFsmStateChange(snapshot: State<Node, Value>) {
    this.render(snapshot);
  }

  private render(snapshot: State<Node, Value>) {
    render(
      html`
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
