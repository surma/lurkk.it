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
import DomAdapter from "./adapter/dom-adapter/ui-thread.js";

// tslint:disable-next-line:no-unused-expression This boots a worker, duh
new BroadcastWorker("worker.js");

new DomAdapter().init();

async function init() {
  const swLoader = await import("./utils/sw-loader.js");
  await swLoader.default();
}

init();
