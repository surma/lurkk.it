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
  State,
  StateMachine,
  TriggerPayloadMapBase
} from "../src/state-machine/state-machine.js";

import * as MessageBus from "../src/message-bus/message-bus.js";
import * as RequestResponseBus from "../utils/request-response-bus.js";

interface EmitTriggerRequest<TriggerPayloadMap> {
  trigger: keyof TriggerPayloadMap;
  payload: TriggerPayloadMap[keyof TriggerPayloadMap];
}

type EmitTriggerResponse = void;
const EMIT_TRIGGER_CHANNEL = "fsm.emitTrigger";

export function exposeEmitTrigger<
  Node,
  TriggerPayloadMap extends TriggerPayloadMapBase,
  Value
>(fsm: StateMachine<Node, TriggerPayloadMap, Value>) {
  RequestResponseBus.register<
    EmitTriggerRequest<TriggerPayloadMap>,
    EmitTriggerResponse
  >(EMIT_TRIGGER_CHANNEL, async req => {
    fsm.emitTrigger(req.trigger, req.payload);
  });
}

export async function emitTrigger<
  K extends keyof TriggerPayloadMap,
  TriggerPayloadMap extends TriggerPayloadMapBase
>(trigger: K, payload: TriggerPayloadMap[K]) {
  // FIXME(@surma): This leaks.
  const bus = await RequestResponseBus.get<
    EmitTriggerRequest<TriggerPayloadMap>,
    EmitTriggerResponse
  >(EMIT_TRIGGER_CHANNEL);
  await bus.sendRequest({ trigger, payload });
}

type GetSnapshotRequest = void;
type GetSnapshotResponse<Node, Value> = State<Node, Value>;
const SNAPSHOT_CHANNEL = "fsm.getSnapshot";

export function exposeGetSnapshot<
  Node,
  TriggerPayloadMap extends TriggerPayloadMapBase,
  Value
>(fsm: StateMachine<Node, TriggerPayloadMap, Value>) {
  RequestResponseBus.register<
    GetSnapshotRequest,
    GetSnapshotResponse<Node, Value>
  >(SNAPSHOT_CHANNEL, async req => {
    return await fsm.snapshot();
  });
}

export async function getSnapshot<Node, Value>() {
  // FIXME(@surma): This leaks.
  const bus = await RequestResponseBus.get<
    GetSnapshotRequest,
    GetSnapshotResponse<Node, Value>
  >(SNAPSHOT_CHANNEL);
  return await bus.sendRequest(void 0);
}

const CHANGE_CHANNEL = "fsm.change";

export async function exposeChangeListener<
  Node,
  TriggerPayloadMap extends TriggerPayloadMapBase,
  Value
>(fsm: StateMachine<Node, TriggerPayloadMap, Value>) {
  const bus = await MessageBus.get<State<Node, Value>>(CHANGE_CHANNEL);
  fsm.addChangeListener((node, value) => {
    bus.send(fsm.snapshot());
  });
}

export async function onChange<Node, Value>(
  l: (state: State<Node, Value>) => void
) {
  // FIXME(@surma): This leaks.
  const bus = await MessageBus.get<State<Node, Value>>(CHANGE_CHANNEL);
  bus.listen(state => {
    if (!state) {
      return;
    }
    l(state);
  });
}
