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

import { h, render } from "preact";

import * as RequestResponseBus from "westend/utils/request-response-bus.js";
import * as ServiceReady from "westend/utils/service-ready.js";

import { READY_CHANNEL as UI_THREAD_READY_CHANNEL, State } from "./types.js";

import * as UrlMapper from "./url-mapper.js";

import { READY_CHANNEL as REPOSITORY_READY_CHANNEL } from "../../repository/index.js";

import {
  DATA_SOURCE_NAME_CHANNEL,
  DataSourceNameRequest,
  DataSourceNameResponse
} from "../../repository/index.js";

import AppComponent from "./components/app/index.js";

import { subscribe } from "../../utils/observables.js";
import { getStateObservable, init as stateStreamInit } from "./state-stream.js";

export default class DomAdapter {
  async init() {
    await stateStreamInit();
    subscribe.call(getStateObservable(), this.render);

    if (isDebug()) {
      await activateDebugModel();
    }
    await UrlMapper.init();
    ServiceReady.signal(UI_THREAD_READY_CHANNEL);
  }

  private render(state: State) {
    render(
      <AppComponent state={state} />,
      document.body,
      document.body.firstElementChild!
    );
  }
}

function isDebug() {
  return new URL(location.href.toString()).searchParams.has("debug");
}

async function activateDebugModel() {
  console.log("Switching model to debug");
  await ServiceReady.waitFor(REPOSITORY_READY_CHANNEL);
  (await RequestResponseBus.get<DataSourceNameRequest, DataSourceNameResponse>(
    DATA_SOURCE_NAME_CHANNEL
  )).sendRequest("mock");
}
