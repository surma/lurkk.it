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

interface ModuleInterface {
  BroadcastWorker: new (src: string) => Promise<Worker>;
  get<T>(name: string): Promise<Endpoint<T>>;
}

import * as MessageBusBC from "./message-bus_bc.js";

function hasBroadcastChannel() {
  return "BroadcastChannel" in self;
}

let modulePromise: Promise<ModuleInterface> = Promise.resolve(MessageBusBC);
if (!hasBroadcastChannel()) {
  modulePromise = import("./message-bus_mc.js");
}

export async function get<T>(name: string): Promise<Endpoint<T>> {
  const module = await modulePromise;
  return module.get<T>(name);
}

export const BroadcastWorker: BroadcastWorkerConstructor = function(
  this: Worker,
  src: string
) {
  modulePromise.then(module => {
    const worker = new module.BroadcastWorker(src);
    Object.assign(this, worker);
    Reflect.setPrototypeOf(this, Reflect.getPrototypeOf(worker));
  });
} as any;
