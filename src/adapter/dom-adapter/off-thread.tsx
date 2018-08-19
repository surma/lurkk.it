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
import { State as FsmState } from "westend/src/state-machine/state-machine.js";
import * as FsmUtils from "westend/utils/fsm-utils.js";
import * as ServiceReady from "westend/utils/service-ready.js";

import {
  Node,
  READY_CHANNEL as FSM_READY_CHANNEL,
  Value
} from "../../fsm/generated.js";

import {
  CHANGE_CHANNEL as DOM_STATE_CHANGE_CHANNEL,
  READY_CHANNEL as UI_THREAD_READY_CHANNEL,
  State as DomState
} from "./types";

export async function init() {
  FsmUtils.onChange<Node, Value>(onStateChange);

  await ServiceReady.waitFor(FSM_READY_CHANNEL);
  await ServiceReady.waitFor(UI_THREAD_READY_CHANNEL);
  const snapshot = await FsmUtils.getSnapshot<Node, Value>();
  onStateChange(snapshot);
}

function map(state: FsmState<Node, Value>): DomState {
  return state;
}

const busPromise = MessageBus.get<DomState>(DOM_STATE_CHANGE_CHANNEL);
async function onStateChange(fsmState: FsmState<Node, Value>) {
  const domState = map(fsmState);
  const bus = await busPromise;
  bus.send(domState);
}
