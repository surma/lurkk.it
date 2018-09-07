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
  Effect,
  Guard,
  Loopback,
  NoTrigger,
  StateMachine,
  Transition,
  TriggerPayloadMapBase
} from "./state-machine.js";

export interface DebugOpts<
  Node,
  TriggerPayloadMap extends TriggerPayloadMapBase
> {
  nodeName?: (s: Node) => string;
  triggerName?: (t: keyof TriggerPayloadMap) => string;
}
// tslint:disable-next-line:variable-name
const debugOpts_default: DebugOpts<any, any> = {
  nodeName(s: any) {
    return `${s}`;
  },
  triggerName(t: any) {
    return `${t}`;
  }
};

function getTriggerName<Node, TriggerPayloadMap extends TriggerPayloadMapBase>(
  t: keyof TriggerPayloadMap | NoTrigger,
  opts: DebugOpts<Node, TriggerPayloadMap>
): string {
  opts = { ...debugOpts_default, ...opts };
  if (t === NoTrigger) {
    return "No trigger";
  }
  return opts.triggerName!(t);
}

function debugGuard<
  Node,
  Trigger extends keyof TriggerPayloadMap,
  TriggerPayloadMap extends TriggerPayloadMapBase,
  Value
>(
  guard: Guard<Node, Trigger, TriggerPayloadMap, Value>,
  transition: Transition<Node, TriggerPayloadMap, Value>,
  idx: number,
  opts: DebugOpts<Node, TriggerPayloadMap>
): Guard<Node, Trigger, TriggerPayloadMap, Value> {
  return (fsm, trigger, payload): boolean => {
    const r = guard(fsm, trigger, payload);
    console.groupCollapsed(`Evaluating guard #${idx}:`, r);
    console.log("FSM:", fsm);
    console.log("Trigger:", getTriggerName(trigger, opts));
    console.log("Payload:", payload);
    console.groupEnd();
    return r;
  };
}

function debugEffect<
  Node,
  Trigger extends keyof TriggerPayloadMap,
  TriggerPayloadMap extends TriggerPayloadMapBase,
  Value
>(
  effect: Effect<Node, Trigger, TriggerPayloadMap, Value>,
  transition: Transition<Node, TriggerPayloadMap, Value>,
  idx: number,
  opts: DebugOpts<Node, TriggerPayloadMap>
): Effect<Node, Trigger, TriggerPayloadMap, Value> {
  return async (fsm, trigger, payload) => {
    console.groupCollapsed(`Evaluating effect #${idx}`);
    console.log("FSM:", fsm);
    console.log("Trigger:", getTriggerName(trigger, opts));
    console.log("Payload:", payload);
    console.groupEnd();
    await effect(fsm, trigger, payload);
  };
}

/**
 * `debug` injects a couple of guards and effects into the given state
 * machine to produce debug logs when used.
 *
 * The given options object can contain helper functions that turn state and
 * trigger objects into printable strings.
 */
export function debug<
  Node,
  TriggerPayloadMap extends TriggerPayloadMapBase,
  Value
>(
  fsm: StateMachine<Node, TriggerPayloadMap, Value>,
  opts: DebugOpts<Node, TriggerPayloadMap> = {}
) {
  opts = { ...debugOpts_default, ...opts };
  for (const transition of fsm.getTransitions()) {
    transition.guards = [
      (fsm, trigger, payload) => {
        console.groupCollapsed(
          `Evaluating transition from ${opts.nodeName!(fsm.currentNode)} to ${
            transition.target === Loopback
              ? opts.nodeName!(fsm.currentNode)
              : opts.nodeName!(transition.target)
          }`
        );
        console.log("Trigger:", getTriggerName(trigger, opts));
        console.log("Payload:", payload);
        console.groupEnd();
        return true;
      },
      ...transition.guards.map((guard, idx) =>
        debugGuard(guard, transition, idx, opts)
      )
    ];
    transition.effects = [
      async (fsm, trigger, payload) => {
        console.groupCollapsed(`Guards passed. Applying effects.`);
        console.groupEnd();
      },
      ...transition.effects.map((effect, idx) =>
        debugEffect(effect, transition, idx, opts)
      ),
      async (fsm, trigger, payload) => {
        console.groupCollapsed(
          `Transitioned to ${opts.nodeName!(fsm.currentNode)}`
        );
        console.log("FSM:", fsm);
        console.log("Trigger:", getTriggerName(trigger, opts));
        console.log("Payload:", payload);
        console.groupEnd();
      }
    ];
  }

  fsm.addChangeListener((newNode, data) => {
    console.groupCollapsed(`Settled in ${opts.nodeName!(newNode)}`);
    console.log("FSM:", fsm);
    console.groupEnd();
  });
}
