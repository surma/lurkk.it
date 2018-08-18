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

import { h, RenderableProps } from "preact";

import { emitTrigger } from "westend/utils/fsm-utils.js";

import { Trigger, TriggerPayloadMap } from "../../../../fsm/generated.js";
import { ThreadItem } from "../../../../repository/storage-model/thread.js";

import { decodeHTML, defineCE } from "../../../../utils/dom-helpers.js";
import { pluralize } from "../../../../utils/lang-helpers.js";
import { ago } from "../../../../utils/mini-moment.js";
import { setInnerHTML } from "../../../../utils/preact-helpers.js";

import LayerMenu from "../../elements/layer-menu";
defineCE("layer-menu", LayerMenu);
declare global {
  namespace JSX {
    interface IntrinsicElements {
      ["layer-menu"]: Partial<LayerMenu & { children: any }> & {
        [x: string]: any;
      };
    }
  }
}

import downloadSVG from "../../../../icons/download.svg";
import offlineSVG from "../../../../icons/offline.svg";

function downloadThread(this: LayerMenu, ev: CustomEvent) {
  const target = ev.target;
  if (!target || !(target instanceof HTMLElement)) {
    return;
  }
  const menu = target.closest("layer-menu") as LayerMenu | null;
  if (!menu) {
    return;
  }
  menu.close();
  emitTrigger<Trigger.DOWNLOAD, TriggerPayloadMap>(Trigger.DOWNLOAD, {
    ids: [menu.dataset.threadId!]
  });
}

interface Props {
  state: ThreadItem;
}
export default function SubredditItemComponent({
  state
}: RenderableProps<Props>) {
  const agoString = ago(state.created);
  const points = state.upvotes - state.downvotes;
  let domain = "self";
  if (state.link) {
    domain = new URL(state.link).hostname
      .split(".")
      .slice(-2)
      .join(".");
  }
  return (
    <layer-menu
      class="item"
      downloaded={state.cachedAt >= 0}
      slide-width="80"
      slide-zone="380"
      onOpengesture={downloadThread}
      data-thread-id={state.id}
    >
      <div slot="top" class="top">
        <div
          class="preview"
          style={
            state.images.length > 0
              ? {
                  backgroundImage: `url(${decodeHTML(
                    state.images.sort((a, b) => a.width - b.width)[0].url
                  )})`
                }
              : {}
          }
        >
          <div class="dlbadge offline" {...setInnerHTML(offlineSVG)} />
          <div class="dlbadge download" {...setInnerHTML(downloadSVG)} />
        </div>
        <a href={`/t/${state.id}`} class="title">
          {state.title}
        </a>
        <div class="meta">
          /u/
          {state.author} • /r/
          {state.subreddit} • {agoString}
        </div>
        <div class="engagement">
          {points} {pluralize("point", points)} • {state.numComments}{" "}
          {pluralize("comment", state.numComments)} • {domain}
        </div>
      </div>
      <div class="bottom">
        <div class="action" {...setInnerHTML(downloadSVG)} />
      </div>
    </layer-menu>
  );
}
