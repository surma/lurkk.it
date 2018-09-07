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

import { emitTrigger } from "../../../../../westend/utils/fsm-utils.js";

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

import rawDownloadSVG from "../../../../icons/download.svg";
const downloadSVG = setInnerHTML(rawDownloadSVG);
import rawOfflineSVG from "../../../../icons/offline.svg";
const offlineSVG = setInnerHTML(rawOfflineSVG);

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

const clientWidth = window.innerWidth;

export interface State extends ThreadItem {
  ago: string;
  points: number;
  pointsLabel: string;
  commentsLabel: string;
  domain: string;
  link: string;
  previewImage: string;
  threadLink: string;
}
export interface Props {
  state: State;
}
export default function SubredditItemComponent({
  state
}: RenderableProps<Props>) {
  return (
    <layer-menu
      class="item"
      downloaded={state.cachedAt >= 0}
      slide-width="80"
      slide-zone={clientWidth - 10}
      onOpengesture={downloadThread}
      data-thread-id={state.id}
    >
      <div slot="top" class="top">
        <a
          href={state.link}
          class="preview"
          style={{
            backgroundImage: state.previewImage
          }}
        >
          <div class="dlbadge offline" {...offlineSVG} />
          <div class="dlbadge download" {...downloadSVG} />
        </a>
        <a href={state.threadLink} class="title">
          {state.title}
        </a>
        <div class="meta">
          /u/
          {state.author} • /r/
          {state.subreddit} • {state.ago}
        </div>
        <div class="engagement">
          {state.points} {state.pointsLabel} • {state.numComments}{" "}
          {state.commentsLabel} • {state.domain}
        </div>
      </div>
      <div class="bottom">
        <div class="action" {...downloadSVG} />
      </div>
    </layer-menu>
  );
}
