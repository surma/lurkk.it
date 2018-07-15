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
import { State } from "westend/src/state-machine/state-machine.js";
import { debug } from "westend/src/state-machine/state-machine-debugger.js";
import * as ServiceReady from "westend/utils/service-ready.js";


import * as Model from "./model/model.js";

import {
  fsm,
  Node,
  Trigger,
  Value,
  READY_CHANNEL,
  STATECHANGE_CHANNEL
} from "./fsm/generated.js";

import * as FsmUtils from "./utils/fsm-utils.js";

(async function() {
  await Model.init();
  debug(fsm, { nodeName: n => Node[n], triggerName: t => Trigger[t] });

  const stateChangeChannel = await MessageBus.get<State<Node, Value>>(
    STATECHANGE_CHANNEL
  );
  fsm.addChangeListener(async (node: Node, value: Value) => {
    stateChangeChannel.send(fsm.snapshot());
  });

  FsmUtils.exposeGetSnapshot(fsm);
  FsmUtils.exposeEmitTrigger(fsm);

  await ServiceReady.signal(READY_CHANNEL);
})();
