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

import { html, render } from "htm/src/integrations/preact";

import { State } from "westend/src/state-machine/state-machine.js";
import * as FsmUtils from "westend/utils/fsm-utils.js";
import * as RequestResponseBus from "westend/utils/request-response-bus.js";
import * as ServiceReady from "westend/utils/service-ready.js";

import * as UrlMapper from "./url-mapper.js";

import { READY_CHANNEL as MODEL_READY_CHANNEL } from "../../model/model.js";

import {
  DATA_SOURCE_NAME_CHANNEL,
  DataSourceNameRequest,
  DataSourceNameResponse
} from "../../model/loading.js";

import {
  Node,
  READY_CHANNEL as FSM_READY_CHANNEL,
  Value
} from "../../fsm/generated.js";

import App from "./components/app";
import { AppState } from "./types.js";

export default class DomAdapter {
  async init() {
    if (isDebug()) {
      await activateDebugModel();
    }
    FsmUtils.onChange<Node, Value>(this.onFsmChange.bind(this));
    await ServiceReady.waitFor(FSM_READY_CHANNEL);
    await UrlMapper.init();
    this.render(await FsmUtils.getSnapshot<Node, Value>());
  }

  private onFsmChange(snapshot: State<Node, Value>) {
    this.render(snapshot);
  }

  private render(state: AppState) {
    render(html`<${App} state=${state} />`, document.body);
  }
}

function isDebug() {
  return new URL(location.href.toString()).searchParams.has("debug");
}

async function activateDebugModel() {
  console.log("Switching model to debug");
  await ServiceReady.waitFor(MODEL_READY_CHANNEL);
  (await RequestResponseBus.get<DataSourceNameRequest, DataSourceNameResponse>(
    DATA_SOURCE_NAME_CHANNEL
  )).sendRequest("mock");
}
