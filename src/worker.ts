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
import { Snapshot } from "westend/src/state-machine/state-machine.js";
import * as ServiceReady from "westend/utils/service-ready.js";
import { debug } from "westend/src/state-machine/state-machine-debugger.js";

import * as RequestResponse from "./utils/request-response-bus.js";

import {
  DataObject,
  fsm,
  State,
  Trigger,
  TriggerPayload
} from "./fsm/generated.js";

export enum FsmControlType {
  GET_SNAPSHOT,
  EMIT_TRIGGER
}

interface FsmRequestGetSnapshot {
  type: FsmControlType.GET_SNAPSHOT;
}

interface FsmRequestEmitTrigger<TriggerPayload> {
  type: FsmControlType.EMIT_TRIGGER;
  triggerPayload: TriggerPayload;
}

export type FsmRequest<TriggerPayload> = FsmRequestGetSnapshot | FsmRequestEmitTrigger<TriggerPayload>;

interface FsmResponseGetSnapshot<State, DataObject> {
  type: FsmControlType.GET_SNAPSHOT;
  snapshot: Snapshot<State, DataObject>;
}

interface FsmResponseEmitTrigger {
  type: FsmControlType.EMIT_TRIGGER;
}

export type FsmResponse<State, DataObject> = FsmResponseGetSnapshot<State, DataObject> | FsmResponseEmitTrigger;

(async function() {
  debug(fsm, { stateName: s => State[s], triggerName: t => Trigger[t] });

  const fsmStateChange = await MessageBus.get<Snapshot<State, DataObject>>(
    "fsm-statechange"
  );
  fsm.addStateChangeListener(async (newState: State, data: DataObject) => {
    fsmStateChange.send(fsm.snapshot());
  });

  await RequestResponse.register<FsmRequest<TriggerPayload>, FsmResponse<State, DataObject>>(
    "fsm-control",
    async req => {
      switch (req.type) {
        case FsmControlType.GET_SNAPSHOT:
          return {
            type: FsmControlType.GET_SNAPSHOT,
            snapshot: fsm.snapshot()
          };
        case FsmControlType.EMIT_TRIGGER:
          fsm.emitTrigger(req.triggerPayload.trigger, req.triggerPayload);
          return {
            type: FsmControlType.EMIT_TRIGGER,
          };
      }
    }
  );
  await ServiceReady.signal("fsm-ready");
})();
