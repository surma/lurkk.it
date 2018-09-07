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

/**
 * @fileOverview This module implements a finite state machine (FSM) that can
 * run code on transitions and thus act as a state manager for apps.
 *
 * A state machine consists of a list of transitions between nodes, a current
 * node and a value. Each transition has an origin node and a target
 * node as well as a trigger that causes a transition to be taken.
 * Additionally, each transition has a list of guards and effects. Guards are
 * functions that determine wheter a transition can be taken at the current
 * point in time. Only if all guards on a transition return `true` can a
 * transition be taken. Effects are functions that get executed when a
 * transition is being taken. They offer a hook to manipulate the value
 * when transitioning to one node to the next.
 *
 * Triggers are what causes the state machine to try and take a transition.
 * Triggers have a payload attached to them that can be evaluated in guards and
 * effects.
 *
 * For an example of how to use the TypeScript generics, see the demo code.
 */

// Apologies, but @types/whatwg-streams conflicts with TypeScript’s standard
// library and can’t be used.
// TODO(@surma): Remove this when
// https://github.com/Microsoft/TypeScript/issues/25277 gets fixed.

import { TransformStream as WhatWGTransformStream } from "./whatwg-streams-hack.js";

const TransformStreamConstructor = new Promise<typeof WhatWGTransformStream>(
  async resolve => {
    if ("TransformStream" in self) {
      resolve((self as any).TransformStream);
      return;
    }
    const polyfill = await import("@mattiasbuelens/web-streams-polyfill");
    resolve(polyfill.TransformStream);
  }
);

/**
 * `NoTrigger` is a special trigger that causes a transition to be taken
 * immediately (provided no guard returns `false`).
 */
export type NoTrigger = "NO_TRIGGER";
export const NoTrigger = "NO_TRIGGER";

/**
 * `AnyTrigger` is a special trigger that causes a transition to be taken
 * with any trigger.
 */
export type AnyTrigger = "ANY_TRIGGER";
export const AnyTrigger = "ANY_TRIGGER";

/**
 * `AnyNode` is a special origin that causes a transition to be available
 * from any node.
 */
export type AnyNode = "ANY_STATE";
export const AnyNode = "ANY_STATE";

/**
 * `Loopback` is a special target that causes a transition to be loopback
 * to the same node it originated from. Mostly useful in conjunction with
 * `AnyNode`.
 */
export type Loopback = "LOOPBACK";
export const Loopback = "LOOPBACK";

export interface TriggerPayloadMapBase {
  [NoTrigger]: {};
}
/**
 * `Guard` is a function that is evaluated when a transition is about to be
 * taken. If any guard returns `false`, the transition is considered disabled.
 */
export type Guard<
  Node,
  Trigger extends keyof TriggerPayloadMap,
  TriggerPayloadMap extends TriggerPayloadMapBase,
  Value
> = (
  fsm: StateMachine<Node, TriggerPayloadMap, Value>,
  trigger: Trigger,
  payload: TriggerPayloadMap[Trigger]
) => boolean;

/**
 * `Effect` is a function that is executed when a transition is being taken.
 */
export type Effect<
  Node,
  Trigger extends keyof TriggerPayloadMap,
  TriggerPayloadMap extends TriggerPayloadMapBase,
  Value
> = (
  fsm: StateMachine<Node, TriggerPayloadMap, Value>,
  trigger: Trigger,
  payload: TriggerPayloadMap[Trigger]
) => Promise<void>;

/**
 * `Transition` contains all the data to model a transition between nodes.
 */
export interface Transition<
  Node,
  TriggerPayloadMap extends TriggerPayloadMapBase,
  Value
> {
  origin: Node | AnyNode;
  trigger: keyof TriggerPayloadMap;
  target: Node | Loopback;
  guards: Array<Guard<Node, keyof TriggerPayloadMap, TriggerPayloadMap, Value>>;
  effects: Array<
    Effect<Node, keyof TriggerPayloadMap, TriggerPayloadMap, Value>
  >;
}

/**
 * `State` is a POJO that holds all data of a state machine.
 */
export interface State<Node, Value> {
  currentNode: Node;
  value: Value;
}

/**
 * `changeListener` is a listener that gets called when a transition to a
 * new node has been taken successfully.
 */
export interface ChangeListener<Node, Value> {
  (node: Node, value: Value): void;
}

// tslint:disable-next-line:class-name PascalCase would make this name confusing
export interface StateMachine_addTransition_opts<
  Node,
  Trigger extends keyof TriggerPayloadMap,
  TriggerPayloadMap extends TriggerPayloadMapBase,
  Value
> {
  effects?: Array<Effect<Node, Trigger, TriggerPayloadMap, Value>>;
  guards?: Array<Guard<Node, Trigger, TriggerPayloadMap, Value>>;
}
// tslint:disable-next-line:variable-name PascalCase would make this name confusing
const StateMachine_addTransition_defaultOpts = {
  effects: [],
  guards: []
};
/**
 * An instance of `StateMachine` contains all data of a running state machine,
 * i.e. current node, transitions, guards, effects and data object. Its API
 * can be used to emit triggers and cause the respective node transitions.
 */
export class StateMachine<
  Node,
  TriggerPayloadMap extends TriggerPayloadMapBase,
  Value
> {
  private triggerStream = TransformStreamConstructor.then(
    ctor =>
      new ctor<
        [keyof TriggerPayloadMap, TriggerPayloadMap[keyof TriggerPayloadMap]],
        [keyof TriggerPayloadMap, TriggerPayloadMap[keyof TriggerPayloadMap]]
      >()
  );
  private transitions = new Map<
    Node | AnyNode,
    Array<Transition<Node, TriggerPayloadMap, Value>>
  >();

  private changeListeners: Array<ChangeListener<Node, Value>> = [];

  constructor(public currentNode: Node, public value: Value) {
    this.readLoop();
  }

  /**
   * `setValue` is the same as setting the `value` property directly, but does
   * emit a change event.
   */
  setValue(val: Value) {
    this.value = val;
    this.notify();
  }

  /**
   * `addTransition` adds a transition from `origin` to `target`, caused by
   * `trigger`. If the trigger is `NoTrigger`, the transition will be taken the
   * moment the state machine raches `origin` (guards permitting).
   */
  addTransition<Trigger extends keyof TriggerPayloadMap>(
    origin: Node | AnyNode,
    trigger: Trigger,
    target: Node | Loopback,
    opts: StateMachine_addTransition_opts<
      Node,
      Trigger,
      TriggerPayloadMap,
      Value
    > = {}
  ) {
    opts = { ...StateMachine_addTransition_defaultOpts, ...opts };
    if (!this.transitions.has(origin)) {
      this.transitions.set(origin, []);
    }
    this.transitions.get(origin)!.push({
      effects: opts.effects!,
      guards: opts.guards!,
      origin,
      target,
      trigger
      // TODO (@surma): Can’t get the types to work here
    } as any);
  }

  /**
   * `addChangeListener` adds a new listener that will be called whenever
   * the current node of the state machine changes.
   */
  addChangeListener(scl: ChangeListener<Node, Value>) {
    this.changeListeners.push(scl);
  }

  /**
   * `notify` calls are registered `ChangeListener`s with the current
   * node and value.
   */
  notify() {
    for (const scl of this.changeListeners) {
      scl(this.currentNode, this.value);
    }
  }

  /**
   * `getAvailableTransitions` returns all transitions that have the given node as
   * their origin.
   */
  getAvailableTransitions(
    node: Node = this.currentNode
  ): Array<Transition<Node, TriggerPayloadMap, Value>> {
    const anyTransitions = this.transitions.get(AnyNode) || [];
    if (!this.transitions.has(node)) {
      return anyTransitions;
    }
    return [...anyTransitions, ...this.transitions.get(node)!];
  }

  /**
   * `getTransitions` returns all transitions.
   */
  getTransitions(): Array<Transition<Node, TriggerPayloadMap, Value>> {
    const transitions = Array.from(this.transitions.values());
    return Array.prototype.concat.apply([], transitions);
  }

  /**
   * `emitTrigger` makes the state machine try to take transitions that
   * originate from the current node and have the emitted trigger as a trigger.
   * The state machine then evaluates the guards of all eligible transitions.
   * If more than one eligible transition remains, an error is thrown.
   * Otherwise, the eligible transition is taken, its effects executed and the
   * target node becomes the state machine’s current node.
   *
   * All effects are executed concurrently. (TODO (@surma): Is this good?)
   *
   * As long as they are `NoTrigger` transitions from the new current node,
   * they will be taken. If there are more than one eligible `NoTrigger`
   * transitions, an error is thrown.
   */
  async emitTrigger<K extends keyof TriggerPayloadMap>(
    trigger: K,
    payload: TriggerPayloadMap[K]
  ) {
    const writer = (await this.triggerStream).writable.getWriter();
    writer.write([trigger, payload]);
    writer.releaseLock();
  }

  /**
   * `snapshot` returns a snapshot of the state machine’s current state.
   */
  snapshot(): State<Node, Value> {
    return {
      currentNode: this.currentNode,
      value: this.value
    };
  }

  private async readLoop() {
    const reader = (await this.triggerStream).readable.getReader();
    while (true) {
      const { value, done } = await reader.read();
      if (done) {
        throw new Error("Trigger stream got closed");
      }
      await this.processTrigger(value[0], value[1]);
    }
  }

  private async processTrigger(
    trigger: keyof TriggerPayloadMap,
    payload: TriggerPayloadMap[keyof TriggerPayloadMap]
  ): Promise<void> {
    // Find all transitions that can be triggered from the current state
    // where all guards return true.
    const eligibleTransitions = this.getAvailableTransitions().filter(
      transition =>
        transition.trigger === AnyTrigger || transition.trigger === trigger
    );
    if (eligibleTransitions.length === 0 && trigger !== NoTrigger) {
      console.warn(`There are no transitions for trigger ${trigger}`);
      return;
    }
    const validTransitions = eligibleTransitions.filter(transition =>
      transition.guards.every(guard => guard(this, trigger, payload))
    );
    // If there’s no such transition, nothing happens.
    if (validTransitions.length === 0) {
      return;
    }
    // If there’s more than one such transition, the target node is
    // ambiguous and that’s an error.
    if (validTransitions.length > 1) {
      throw new Error("More than 1 possible transition available");
    }
    const transition = validTransitions[0];
    // Execute all (potentially asynchronous) effect.
    await Promise.all(
      transition.effects.map(
        async effect => await effect(this, trigger, payload)
      )
    );
    // Transition to target node. If target === Loopback, `currentNode`
    // doesn’t change.
    if (transition.target !== Loopback) {
      this.currentNode = transition.target;
    }
    this.notify();
    // Take transitions that don’t require a trigger.
    // FIXME (@surma): Can’t get the typing to work here, either.
    await this.processTrigger(NoTrigger, {} as any);
  }
}

/**
 * `not` is a utility function to negate a guard’s return value.
 */
export function not<
  Node,
  Trigger extends keyof TriggerPayloadMap,
  TriggerPayloadMap extends TriggerPayloadMapBase,
  Value
>(
  guard: Guard<Node, Trigger, TriggerPayloadMap, Value>
): Guard<Node, Trigger, TriggerPayloadMap, Value> {
  return (fsm, trigger, payload) => !guard(fsm, trigger, payload);
}
