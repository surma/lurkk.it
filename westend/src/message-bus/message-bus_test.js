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
import * as MessageBus from "/base/dist/message-bus/message-bus.js";

describe("Message Bus", () => {
  it("sends messages to a single recipient", async () => {
    const origPayload = { bar: "baz" };
    const outgoing = await MessageBus.get("foo");
    const incoming1 = await MessageBus.get("foo");
    const incoming2 = await MessageBus.get("bar");

    await new Promise((resolve, reject) => {
      incoming1.listen(payload => {
        chai.expect(payload).to.deep.equal(origPayload);
        resolve();
      });

      incoming2.listen(_ => reject());
      outgoing.send(origPayload);
    });

    outgoing.close();
    incoming1.close();
    incoming2.close();
  });

  it("sends messages to multiple recipients", async () => {
    const origPayload = { bar: "baz" };
    const outgoing = await MessageBus.get("foo");
    const incoming1 = await MessageBus.get("foo");
    const incoming2 = await MessageBus.get("foo");

    const p1 = new Promise(resolve => {
      incoming1.listen(payload => {
        chai.expect(payload).to.deep.equal(origPayload);
        resolve();
      });
    });

    const p2 = new Promise(resolve => {
      incoming2.listen(payload => {
        chai.expect(payload).to.deep.equal(origPayload);
        resolve();
      });
    });

    outgoing.send(origPayload);

    await Promise.all([p1, p2]);

    outgoing.close();
    incoming1.close();
    incoming2.close();
  });

  it("allows multiple senders on the same provide", async () => {
    const origPayload1 = { bar: "baz" };
    const origPayload2 = { bar: "foo" };
    const outgoing1 = await MessageBus.get("foo");
    const outgoing2 = await MessageBus.get("foo");
    const incoming = await MessageBus.get("foo");
    const expected = [origPayload1, origPayload2];

    await new Promise(resolve => {
      let idx = 0;
      incoming.listen(payload => {
        chai.expect(payload).to.deep.equal(expected[idx++]);

        if (idx === expected.length) {
          resolve();
        }
      });

      outgoing1.send(origPayload1);
      outgoing2.send(origPayload2);
    });

    outgoing1.close();
    outgoing2.close();
    incoming.close();
  });
});
