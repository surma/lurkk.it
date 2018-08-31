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

import { BroadcastWorker } from "westend/src/message-bus/message-bus.js";
import * as RequestResponseBus from "westend/utils/request-response-bus.js";
import * as ServiceReady from "westend/utils/service-ready.js";

import DomAdapter from "./adapter/dom-adapter/ui-thread.js";

import { READY_CHANNEL as REPOSITORY_READY_CHANNEL } from "./repository/index.js";
import {
  DATA_SOURCE_NAME_CHANNEL,
  DataSourceNameRequest,
  DataSourceNameResponse
} from "./repository/index.js";

async function init() {
  new DomAdapter().init();

  const parsedURL = new URL(location.toString());
  if (!parsedURL.searchParams.has("ui-thread-only")) {
    // tslint:disable-next-line:no-unused-expression This boots a worker, duh
    new BroadcastWorker("worker.js");
  } else {
    const script = document.createElement("script");
    script.src = "worker.js";
    document.head.appendChild(script);
  }
  if (!parsedURL.searchParams.has("no-sw")) {
    const swLoader = await import("./utils/sw-loader.js");
    await swLoader.default();
  }
  if (parsedURL.searchParams.has("mock")) {
    await activateMockAPI();
  }
}

async function activateMockAPI() {
  console.log("Switching to mock API");
  await ServiceReady.waitFor(REPOSITORY_READY_CHANNEL);
  (await RequestResponseBus.get<DataSourceNameRequest, DataSourceNameResponse>(
    DATA_SOURCE_NAME_CHANNEL
  )).sendRequest("mock");
}

init();
