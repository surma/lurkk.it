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
  Snapshot,
  StateMachine
} from "westend/src/state-machine/state-machine.js";

import * as RequestResponseBus from "../utils/request-response-bus.js";

interface EmitTriggerRequest<TriggerPayload> {
  trigger: TriggerPayload | "NO_TRIGGER";
}

type EmitTriggerResponse = void;

export function exposeEmitTrigger<State, TriggerPayload, DataObject>(
  fsm: StateMachine<State, TriggerPayload, DataObject>
) {
  RequestResponseBus.register<
    EmitTriggerRequest<TriggerPayload>,
    EmitTriggerResponse
  >("fsm-emit-trigger", async req => {
    fsm.emitTrigger((req.trigger as any).trigger, req.trigger);
  });
}

export async function emitTrigger<TriggerPayload>(
  trigger: TriggerPayload | "NO_TRIGGER"
) {
  // FIXME(@surma): This leaks.
  const bus = await RequestResponseBus.get<
    EmitTriggerRequest<TriggerPayload>,
    EmitTriggerResponse
  >("fsm-emit-trigger");
  await bus.sendRequest({ trigger });
}

type GetSnapshotRequest = void;
type GetSnapshotResponse<State, DataObject> = Snapshot<State, DataObject>;

export function exposeGetSnapshot<State, TriggerPayload, DataObject>(
  fsm: StateMachine<State, TriggerPayload, DataObject>
) {
  RequestResponseBus.register<
    GetSnapshotRequest,
    GetSnapshotResponse<State, DataObject>
  >("fsm-get-snapshot", async req => {
    return await fsm.snapshot();
  });
}

export async function getSnapshot<State, DataObject>() {
  // FIXME(@surma): This leaks.
  const bus = await RequestResponseBus.get<
    GetSnapshotRequest,
    GetSnapshotResponse<State, DataObject>
  >("fsm-get-snapshot");
  return await bus.sendRequest(void 0);
}
