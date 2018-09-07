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

// This is currently equivalent to a Set, but I created a wrapper so we could
// switch to a ringbuffer or something later on.
class UUIDCache {
  private cache = new Set<string>();

  has(uuid: string) {
    return this.cache.has(uuid);
  }

  add(uuid: string) {
    this.cache.add(uuid);
  }
}

interface MessageWrapper {
  uuid: string;
  channel: string;
  payload?: {};
}

interface Channel {
  postMessage(msg: any): void;
}
const backchannels: Channel[] = [];

type Listener = (msg: MessageWrapper) => void;
const localListeners: Map<string, Listener[]> = new Map();

function isMessage(data: any): data is MessageWrapper {
  return data && data.uuid && data.channel;
}

if (isWorkerScope(self)) {
  backchannels.push(self);
  const dedupedLocalBroadcast = generateDedupedLocalBroadcast();
  self.addEventListener("message", evt => {
    if (isMessage(evt.data)) {
      dedupedLocalBroadcast(evt.data);
    }
  });
}

function uuid() {
  let uuid = "";
  for (let i = 0; i < 16; i++) {
    const code = Math.floor(97 + Math.random() * 26);
    uuid += String.fromCharCode(code);
  }
  return uuid;
}

function isWorkerScope(x: any): x is DedicatedWorkerGlobalScope {
  return "importScripts" in x;
}

function remoteBroadcast(msg: MessageWrapper) {
  for (const backchannel of backchannels) {
    backchannel.postMessage(msg);
  }
}

function generateDedupedLocalBroadcast() {
  const uuids = new UUIDCache();
  return (msg: MessageWrapper) => {
    if (!uuids.has(msg.uuid)) {
      uuids.add(msg.uuid);
      localBroadcast(msg);
    }
  };
}

function localBroadcast(msg: MessageWrapper) {
  const listeners = localListeners.get(msg.channel);
  if (listeners) {
    for (const listener of listeners) {
      listener(msg);
    }
  }
}

export async function get<T>(channel: string): Promise<Endpoint<T>> {
  const uuids = new UUIDCache();
  return {
    send(payload?: T) {
      const msg: MessageWrapper = {
        channel,
        payload,
        uuid: uuid()
      };
      uuids.add(msg.uuid);
      localBroadcast(msg);
      remoteBroadcast(msg);
    },
    listen(callback: (msg?: T) => void) {
      let listeners = localListeners.get(channel);
      if (!listeners) {
        localListeners.set(channel, (listeners = []));
      }
      listeners.push(msg => {
        if (uuids.has(msg.uuid)) {
          return;
        }
        if (msg.channel !== channel) {
          return;
        }
        callback(msg.payload as any);
      });
    },
    close() {
      // FIXME
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
  backchannels.push(worker);

  const localBroadcast = generateDedupedLocalBroadcast();
  worker.addEventListener("message", evt => {
    if (!isMessage(evt.data)) {
      return;
    }
    localBroadcast(evt.data);
    remoteBroadcast(evt.data);
  });

  Reflect.setPrototypeOf(this, Reflect.getPrototypeOf(worker));
  Object.assign(this, worker);
} as any;
