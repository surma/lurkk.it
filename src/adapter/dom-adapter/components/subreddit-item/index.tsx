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

import { Component, h, RenderableProps } from "preact";

import { emitTrigger } from "westend/utils/fsm-utils.js";

import { Trigger, TriggerPayloadMap } from "../../../../fsm/generated.js";
import { Thread } from "../../../../model/thread.js";

import { defineCE } from "../../../../utils/dom-helpers.js";
import { pluralize } from "../../../../utils/lang-helpers.js";
import { setInnerHTML } from "../../../../utils/preact-helpers.js";

import LayerMenu from "../../elements/layer-menu";
defineCE("layer-menu", LayerMenu);
declare global {
  namespace JSX {
    interface IntrinsicElements {
      ["layer-menu"]: Partial<LayerMenu> & { [x: string]: any };
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
  state: Thread;
}
export default class SubredditItemComponent extends Component<Props, {}> {
  render({ state }: RenderableProps<Props>) {
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
            style={{
              backgroundImage: `url(${state.previewImage})`
            }}
          >
            <div class="dlbadge offline" {...setInnerHTML(offlineSVG)} />
            <div class="dlbadge download" {...setInnerHTML(downloadSVG)} />
          </div>
          <a href={`/t/${state.id}`} class="title">
            {state.title}
          </a>
          <div class="meta">
            /u/{state.author} • /r/{state.subreddit} • {state.ago}
          </div>
          <div class="engagement">
            {state.points} {pluralize("point", state.points)} •
            {state.numComments} {pluralize("comment", state.numComments)}
            {state.domain}
          </div>
        </div>
        <div class="bottom">
          <div class="action" {...setInnerHTML(downloadSVG)} />
        </div>
      </layer-menu>
    );
  }
}
