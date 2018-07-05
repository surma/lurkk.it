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

export enum FsmReqType {
  GET_SNAPSHOT
}

interface FsmRequestGetSnapshot {
  type: FsmReqType.GET_SNAPSHOT;
}

export type FsmRequest = FsmRequestGetSnapshot;

interface FsmResponseGetSnapshot<State, DataObject> {
  type: FsmReqType.GET_SNAPSHOT;
  snapshot: Snapshot<State, DataObject>;
}

export type FsmResponse<State, DataObject> = FsmResponseGetSnapshot<State, DataObject>;

(async function() {
  debug(fsm, { stateName: s => State[s], triggerName: t => Trigger[t] });

  const fsmStateChange = await MessageBus.get<Snapshot<State, DataObject>>(
    "fsm-statechange"
  );
  fsm.addStateChangeListener(async (newState: State, data: DataObject) => {
    fsmStateChange.send(fsm.snapshot());
  });

  const fsmTrigger = await MessageBus.get<TriggerPayload>("fsm-trigger");
  fsmTrigger.listen((triggerPayload?: TriggerPayload) => {
    if (!triggerPayload) {
      return;
    }
    fsm.emitTrigger(triggerPayload.trigger, triggerPayload);
  });

  await RequestResponse.register<FsmRequest, FsmResponse<State, DataObject>>(
    "fsm-snapshot",
    async req => {
      switch (req.type) {
        case FsmReqType.GET_SNAPSHOT:
          return {
            type: FsmReqType.GET_SNAPSHOT,
            snapshot: fsm.snapshot()
          };
      }
    }
  );
  await ServiceReady.signal("fsm-ready");
})();
