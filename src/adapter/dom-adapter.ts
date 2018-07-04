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

import { html, render } from "lit-html";

import * as MessageBus from "westend/src/message-bus/message-bus.js";
import { Snapshot } from "westend/src/state-machine/state-machine.js";
import * as ServiceReady from "westend/utils/service-ready.js";

import {
  DataObject,
  LoadRequest,
  LoadRequestType,
  State,
  Trigger,
  TriggerPayload
} from "../fsm/generated.js";

// Child templates
import mainTemplate from "./templates/main.js";

import * as Router from "../components/router.js";
import SwipeableSidenav from "../components/swipeable-sidenav.js";

customElements.define("swipeable-sidenav", SwipeableSidenav);

const template = mainTemplate;

export class DomAdapter {
  private fsmTrigger = MessageBus.get<TriggerPayload>("fsm-trigger");
  private navigationBus = MessageBus.get<Router.NavigationMessage>(
    "navigation"
  );

  async init() {
    const fsmStateChange = await MessageBus.get<Snapshot<State, DataObject>>(
      "fsm-statechange"
    );

    fsmStateChange.listen(this.onFsmStateChange.bind(this));

    await ServiceReady.waitFor("fsm-ready");
    if (location.hash === "") {
      Router.go("/r/webdev");
    } else {
      Router.notify();
    }

    (await this.navigationBus).listen((msg?: Router.NavigationMessage) => {
      if (!msg) {
        return;
      }
      this.onURLChange(msg.url);
    });
  }

  private onFsmStateChange(msg: Snapshot<State, DataObject>) {
    render(template(msg), document.body);
  }

  private async onURLChange(url: string) {
    const parsedURL = new URL(url);
    const path = parsedURL.hash.substr(1);

    let loadRequest: LoadRequest;
    if (path.startsWith("/r/")) {
      loadRequest = {
        id: path.substr(3),
        type: LoadRequestType.SUBREDDIT
      };
    } else if (path.startsWith("/t/")) {
      loadRequest = {
        id: path.substr(3),
        type: LoadRequestType.THREAD
      };
    }
    (await this.fsmTrigger).send({
      loadRequest: loadRequest!,
      trigger: Trigger.LOAD_REQUEST
    });
  }
}

function isDebug() {
  return new URL(location.href.toString()).searchParams.has("debug");
}
