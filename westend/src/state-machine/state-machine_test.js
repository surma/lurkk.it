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

import * as StateMachine from "/base/dist/state-machine/state-machine.js";

describe("State Machine", () => {
  beforeEach(function() {
    this.fsm = new StateMachine.StateMachine("A", {});
    this.createChangePromise = () =>
      new Promise(resolve => this.fsm.addChangeListener(resolve));
  });

  it("transitions from one node to the next", async function() {
    this.fsm.addTransition("A", "T1", "B");
    chai.expect(this.fsm.currentNode).to.equal("A");
    this.fsm.emitTrigger("T1", {});
    await this.createChangePromise();
    chai.expect(this.fsm.currentNode).to.equal("B");
  });

  it("transitions when there’s transition from `AnyNode`", async function() {
    this.fsm.addTransition(StateMachine.AnyNode, "T1", "B");
    chai.expect(this.fsm.currentNode).to.equal("A");
    this.fsm.emitTrigger("T1", {});
    await this.createChangePromise();
    chai.expect(this.fsm.currentNode).to.equal("B");
  });

  it("transitions when there’s transition with `AnyTrigger`", async function() {
    this.fsm.addTransition("A", StateMachine.AnyTrigger, "B");
    chai.expect(this.fsm.currentNode).to.equal("A");
    this.fsm.emitTrigger("T1", {});
    await this.createChangePromise();
    chai.expect(this.fsm.currentNode).to.equal("B");
  });

  it("transitions correctly with `Loopback` destinations", async function() {
    this.fsm.addTransition("A", "T1", "B");
    this.fsm.addTransition(StateMachine.AnyNode, "T2", StateMachine.Loopback);
    chai.expect(this.fsm.currentNode).to.equal("A");
    this.fsm.emitTrigger("T2", {});
    await this.createChangePromise();
    chai.expect(this.fsm.currentNode).to.equal("A");
    this.fsm.emitTrigger("T1", {});
    await this.createChangePromise();
    chai.expect(this.fsm.currentNode).to.equal("B");
    this.fsm.emitTrigger("T2", {});
    await this.createChangePromise();
    chai.expect(this.fsm.currentNode).to.equal("B");
  });

  it("evaluates guards before transitioning", async function() {
    this.fsm.addTransition("A", "T1", "B", {
      guards: [
        (fsm, trigger, payload) => {
          expect(fsm).to.equal(this.fsm);
          expect(trigger).to.equal("T1");
          expect(payload).to.equal("payload");
          return false;
        }
      ]
    });
    let called = false;
    this.fsm.addTransition("A", "T2", "C", {
      guards: [
        (fsm, trigger, payload) => {
          expect(fsm).to.equal(this.fsm);
          expect(trigger).to.equal("T2");
          expect(payload).to.equal("payload");
          called = true;
          return true;
        }
      ]
    });
    chai.expect(this.fsm.currentNode).to.equal("A");
    this.fsm.emitTrigger("T1", "payload");
    this.fsm.emitTrigger("T2", "payload");
    await this.createChangePromise();
    chai.expect(called).to.equal(true);
    chai.expect(this.fsm.currentNode).to.equal("C");
  });

  it("evaluates guards before applying effects", async function() {
    this.fsm.value.count = 0;
    this.fsm.addTransition("A", "T1", "B", {
      effects: [
        (fsm, trigger, payload) => {
          fsm.value.count++;
        }
      ],
      guards: [
        (fsm, trigger, payload) => {
          expect(fsm).to.equal(this.fsm);
          expect(trigger).to.equal("T1");
          expect(payload).to.equal("payload");
          return false;
        }
      ]
    });
    this.fsm.addTransition("A", "T2", "C", {
      effects: [
        (fsm, trigger, payload) => {
          expect(fsm).to.equal(this.fsm);
          expect(trigger).to.equal("T2");
          expect(payload).to.equal("payload");
          fsm.value.count++;
        }
      ],
      guards: [
        (fsm, trigger, payload) => {
          expect(fsm).to.equal(this.fsm);
          expect(trigger).to.equal("T2");
          expect(payload).to.equal("payload");
          return true;
        }
      ]
    });
    chai.expect(this.fsm.currentNode).to.equal("A");
    this.fsm.emitTrigger("T1", "payload");
    this.fsm.emitTrigger("T2", "payload");
    await this.createChangePromise();
    chai.expect(this.fsm.value.count).to.equal(1);
    chai.expect(this.fsm.currentNode).to.equal("C");
  });

  it("takes NoTrigger transitions immediately", function(done) {
    const expectedSequence = ["B", "C", "D"];
    let count = 0;
    this.fsm.addChangeListener(newNode => {
      chai.expect(newNode).to.equal(expectedSequence[count++]);
      if (count === 3) {
        done();
      }
    });
    this.fsm.addTransition("A", "T1", "B");
    this.fsm.addTransition("B", StateMachine.NoTrigger, "C");
    this.fsm.addTransition("C", StateMachine.NoTrigger, "D");
    chai.expect(this.fsm.currentNode).to.equal("A");
    this.fsm.emitTrigger("T1", {});
  });

  it("calls listeners on change", function(done) {
    this.fsm.addTransition("A", "T1", "B", {
      effects: [
        // This one should NOT cause a change vent
        fsm => (fsm.value = "ohai"),
        fsm => fsm.setValue("ohai2"),
        fsm => fsm.setValue("ohai3")
      ]
    });
    let count = 0;
    this.fsm.addChangeListener((state, value) => {
      switch (count++) {
        case 0:
          chai.expect(state).to.equal("A");
          chai.expect(value).to.equal("ohai2");
          return;
        case 1:
          chai.expect(state).to.equal("A");
          chai.expect(value).to.equal("ohai3");
          return;
        case 2:
          chai.expect(state).to.equal("B");
          chai.expect(value).to.equal("ohai3");
          done();
          return;
      }
    });
    this.fsm.emitTrigger("T1", {});
  });

  it("calls multiple listeners", function(done) {
    this.fsm.addTransition("A", "T1", "B");
    let counter = 0;
    const listener = () => {
      if (++counter === 3) {
        done();
      }
    };
    this.fsm.addChangeListener(listener);
    this.fsm.addChangeListener(listener);
    this.fsm.addChangeListener(listener);
    this.fsm.emitTrigger("T1", {});
  });

  it("keeps emitted triggers in order", function(done) {
    let resolve;
    const promise = new Promise(r => (resolve = r));
    // The transition from A to B is blocked until we call `resolve()`
    this.fsm.addTransition("A", "T1", "B", {
      effects: [() => promise]
    });
    // Only if all triggers are evaluated in order should we end up in D.
    // Otherwise the FSM ends up in the error node.
    this.fsm.addTransition("B", "T2", "C");
    this.fsm.addTransition("A", "T2", "Error");
    this.fsm.addTransition("C", "T3", "D");
    this.fsm.addTransition("A", "T3", "Error");
    this.fsm.addTransition("B", "T3", "Error");
    this.fsm.emitTrigger("T1");
    this.fsm.emitTrigger("T2");
    this.fsm.emitTrigger("T3");
    this.fsm.addChangeListener(newNode => {
      if (newNode === "D") {
        done();
      }
    });
    // Unblock first transition.
    resolve();
  });

  it("holds all transitions", function() {
    this.fsm.addTransition("A", "T1", "B", {
      // tslint:disable-next-line:no-empty just need something in there
      effects: [() => {}]
    });
    this.fsm.addTransition("B", "T2", "C", {
      // tslint:disable-next-line:no-empty just need something in there
      guards: [() => {}]
    });

    const transitions = this.fsm.getTransitions();
    expect(transitions).to.have.length(2);
    let transition;
    transition = transitions.find(t => t.origin === "A");
    expect(transition.target).to.equal("B");
    expect(transition.trigger).to.equal("T1");
    expect(transition.guards).to.have.length(0);
    expect(transition.effects).to.have.length(1);
    transition = transitions.find(t => t.origin === "B");
    expect(transition.target).to.equal("C");
    expect(transition.trigger).to.equal("T2");
    expect(transition.guards).to.have.length(1);
    expect(transition.effects).to.have.length(0);
  });
});
