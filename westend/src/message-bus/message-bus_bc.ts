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

import {
  BroadcastWorkerConstructor,
  Endpoint
} from "./message-bus_interface.js";
export { Endpoint } from "./message-bus_interface.js";

/**
 * `get` returns an `Endpoint` for the given topic name. Every message sent on
 * a topic will be broadcast to all other subscribers on that topic.
 */
export async function get<T>(name: string): Promise<Endpoint<T>> {
  const channel = new BroadcastChannel(name);
  return {
    send(payload?: T) {
      channel.postMessage({ payload });
    },

    listen(callback: (payload?: T) => void) {
      channel.onmessage = (evt: MessageEvent) => {
        callback.call(undefined, evt.data.payload);
      };
    },

    close() {
      channel.close();
    }
  };
}

// I can’t just extend `Worker`, as it is currently not exposed in Workers
// themselves.
export const BroadcastWorker: BroadcastWorkerConstructor = function(
  this: Worker,
  src: string
) {
  const worker = new Worker(src);
  Reflect.setPrototypeOf(this, Reflect.getPrototypeOf(worker));
  Object.assign(this, worker);
} as any;
