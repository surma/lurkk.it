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

import { ReadableStream } from "../../utils/observables.js";

import { CHANGE_CHANNEL as DOM_STATE_CHANGE_CHANNEL, State } from "./types.js";

export default new ReadableStream<State>({
  async start(controller) {
    const bus = await MessageBus.get<State>(DOM_STATE_CHANGE_CHANNEL);
    bus.listen(msg => {
      if (!msg) {
        return;
      }
      controller.enqueue(msg);
    });
  }
});
