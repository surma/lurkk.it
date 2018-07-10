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
import { Effect, Guard, not, NoTrigger, StateMachine, Snapshot } from "westend/src/state-machine/state-machine.js";
import { debug } from "westend/src/state-machine/state-machine-debugger.js";
import * as ServiceReady from "westend/utils/service-ready.js";


import * as Model from "./model/model.js";

import {
  DataObject,
  fsm,
  FSM_READY,
  FSM_STATECHANGE,
  State,
  Trigger,
} from "./fsm/generated.js";
import * as FsmUtils from "./utils/fsm-utils.js";

(async function() {
  await Model.init();
  debug(fsm, { stateName: s => State[s], triggerName: t => Trigger[t] });

  const fsmStateChange = await MessageBus.get<Snapshot<State, DataObject>>(
    FSM_STATECHANGE
  );
  fsm.addStateChangeListener(async (newState: State, data: DataObject) => {
    fsmStateChange.send(fsm.snapshot());
  });

  FsmUtils.exposeGetSnapshot(fsm);
  FsmUtils.exposeEmitTrigger(fsm);

  await ServiceReady.signal(FSM_READY);
})();
