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

import { blockable, cacheLast, create } from "../../utils/observables.js";

import { CHANGE_CHANNEL as DOM_STATE_CHANGE_CHANNEL, State } from "./types.js";

const rootStream = create<State>(emit => {
  return new Promise(async () => {
    const bus = await MessageBus.get<State>(DOM_STATE_CHANGE_CHANNEL);
    bus.listen(msg => {
      if (!msg) {
        return;
      }
      emit(msg);
    });
  });
});

const blockableStream = blockable.call(rootStream);
const lastCachedStream = cacheLast.call(blockableStream);

export function last(): State {
  return lastCachedStream.last;
}

const blockers = new Set<string>();
export function block(id: string) {
  blockers.add(id);
  blockableStream.block();
}

export function unblock(id: string) {
  blockers.delete(id);
  if (blockers.size === 0) {
    blockableStream.unblock();
  }
}

export default lastCachedStream;
