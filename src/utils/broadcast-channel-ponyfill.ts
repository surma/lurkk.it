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

type Listener<T = {}> = (payload?: T) => void;

const backchannels: Channel[] = [];
const localListeners: Map<string, Listener[]> = new Map();

if (isWorkerScope(self)) {
  backchannels.push(self);
  self.addEventListener("message", dedupedMessageListener());
}

export interface Endpoint<T> {
  send(payload?: T): void;
  listen(callback: Listener<T>): void;
  close(): void;
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

interface MessageWrapper {
  uuid: string;
  channel: string;
  payload?: {};
}

interface Channel {
  postMessage(msg: any): void;
}

export async function get<T>(channel: string): Promise<Endpoint<T>> {
  return {
    send(payload?: T) {
      const msg: MessageWrapper = {
        channel,
        payload,
        uuid: uuid()
      };
      processMessage(msg);
    },
    listen(callback: Listener<T>) {
      let listeners = localListeners.get(channel);
      if (!listeners) {
        localListeners.set(channel, (listeners = []));
      }
      listeners.push(callback as any);
    },
    close() {
      // FIXME
    }
  };
}

function dedupedMessageListener() {
  const uuids = new Set<string>();
  return (evt: MessageEvent) => {
    if (!evt.data || !evt.data.channel || !evt.data.uuid) {
      return;
    }
    const msg = evt.data as MessageWrapper;
    if (!uuids.has(msg.uuid)) {
      uuids.add(msg.uuid);
      processMessage(msg);
    }
  };
}

function processMessage(msg: MessageWrapper) {
  for (const backchannel of backchannels) {
    backchannel.postMessage(msg);
  }
  const listeners = localListeners.get(msg.channel);
  if (listeners) {
    for (const listener of listeners) {
      listener(msg.payload);
    }
  }
}

// I can’t just extend `Worker`, as it is currently not exposed in Workers
// themselves.
export const BroadcastWorker: Constructor<Worker> = function(
  this: Worker,
  src: string
) {
  const worker = new Worker(src);
  backchannels.push(worker);

  worker.addEventListener("message", dedupedMessageListener());

  Reflect.setPrototypeOf(this, Reflect.getPrototypeOf(worker));
  Object.assign(this, worker);
} as any;
