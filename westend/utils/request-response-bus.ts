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

export interface Endpoint<Request, Response> {
  sendRequest(req: Request): Promise<Response>;
  close(): void;
}

interface IdWrapper<T> {
  counter: number;
  value: T;
}

type PromiseResolver<T> = (v: T) => void;

const uid = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
let globalCounter = 0;
export async function get<Request, Response>(
  name: string
): Promise<Endpoint<Request, Response>> {
  const requestChannel = await MessageBus.get<IdWrapper<Request>>(
    `request.${name}`
  );
  const responseChannel = await MessageBus.get<IdWrapper<Response>>(
    `response.${name}`
  );
  const resolverMap = new Map<number, PromiseResolver<Response>>();

  responseChannel.listen(msg => {
    if (!msg) {
      return;
    }
    if (!resolverMap.has(msg.counter)) {
      return;
    }
    resolverMap.get(msg.counter)!(msg.value);
  });

  return {
    async sendRequest(req: Request): Promise<Response> {
      const counter = globalCounter++;
      return new Promise<Response>(resolve => {
        resolverMap.set(counter, resolve);
        requestChannel.send({
          counter,
          value: req
        });
      });
    },
    close() {
      requestChannel.close();
      responseChannel.close();
    }
  };
}

export async function register<Request, Response>(
  name: string,
  listener: (req: Request) => Promise<Response>
) {
  const requestChannel = await MessageBus.get<IdWrapper<Request>>(
    `request.${name}`
  );
  const responseChannel = await MessageBus.get<IdWrapper<Response>>(
    `response.${name}`
  );
  requestChannel.listen(async msg => {
    if (!msg) {
      return;
    }
    const response = await listener(msg.value);
    responseChannel.send({
      counter: msg.counter,
      value: response
    });
  });
}
