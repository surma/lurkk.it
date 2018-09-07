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

import * as MessageBus from "../src/message-bus/message-bus.js";

enum ReadyMessage {
  QUERY,
  ANNOUNCE
}

/**
 * `waitFor` waits for a signal with the given name. The promise will resolve
 * once `signal` has been called with that name.
 */
export async function waitFor(name: string): Promise<void> {
  return new Promise<void>(async resolve => {
    const bus = await MessageBus.get<ReadyMessage>(name);
    bus.listen(msg => {
      if (msg === ReadyMessage.ANNOUNCE) {
        resolve();
      }
    });
    bus.send(ReadyMessage.QUERY);
  });
}

/**
 * `signal` sends a signal resolving all promises on the current origin created
 * with `waitFor` with the same name.
 */
export async function signal(name: string): Promise<void> {
  const bus = await MessageBus.get<ReadyMessage>(name);
  bus.listen(msg => {
    if (msg === ReadyMessage.QUERY) {
      bus.send(ReadyMessage.ANNOUNCE);
    }
  });
  bus.send(ReadyMessage.ANNOUNCE);
}
