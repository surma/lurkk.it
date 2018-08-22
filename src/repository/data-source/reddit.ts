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

import { Comment as StorageComment } from "../storage-model/comment.js";
import { Subreddit as StorageSubreddit } from "../storage-model/subreddit.js";
import {
  Image as StorageImage,
  Thread as StorageThread,
  ThreadItem as StorageThreadItem
} from "../storage-model/thread.js";

import { decodeHTML } from "../../utils/dom-helpers.js";
import { optional } from "../../utils/js-helpers.js";

export interface Subreddit {
  data: {
    modhash: string;
    dist: number;
    children: ThreadItem[];
  };
  kind: "Listing";
}

export interface ImageVersion {
  height: number;
  url: string;
  width: number;
}

export interface Image {
  source: ImageVersion;
  resolutions: ImageVersion[];
  variants: {};
  id: string;
}

export interface ThreadItem {
  data: {
    author: string;
    created_utc: number;
    distinguished: "moderator" | false;
    domain: string;
    downs: number;
    edited: boolean;
    gilded: number;
    locked: boolean;
    media_embed: {};
    id: string;
    is_self: boolean;
    name: string;
    num_comments: number;
    over_18: boolean;
    preview?: {
      enabled: boolean;
      images: Image[];
    };
    score: number;
    selftext: string;
    selftext_html: string | null;
    spoiler: boolean;
    stickied: boolean;
    subreddit: string;
    thumbnail: string;
    thumbnail_width: number | null;
    title: string;
    url: string;
    ups: number;
  };
  kind: "t3";
}

export interface Comment {
  data: {
    author: string;
    body: string;
    body_html: string;
    created_utc: number;
    depth: number;
    distinguished: "moderator" | false;
    downs: number;
    edited: boolean;
    gilded: number;
    id: string;
    link_id: string;
    name: string;
    parent_id: string;
    score: number;
    subreddit: string;
    subreddit_id: string;
    ups: number;
    replies:
      | {
          kind: "Listing";
          data: {
            modhash: "";
            dist: null;
            children: Comment[];
          };
        }
      | "";
  };
  kind: "t1";
}

export type Thread = [
  {
    kind: "Listing";
    data: {
      modhash: "";
      dist: null;
      children: ThreadItem[];
    };
  },
  {
    kind: "Listing";
    data: {
      modhash: "";
      dist: null;
      children: Comment[];
    };
  }
];

function sanitizeUrl(url: string) {
  return url.split("&amp;").join("&");
}

function imageForStorage(img: Image): StorageImage[] {
  const r = img.resolutions.map(img => ({ ...img, url: decodeHTML(img.url) }));
  r.push(img.source);
  r.sort((a, b) => a.width * a.height - b.width * b.height);
  return r;
}

function threadItemForStorage(ti: ThreadItem): StorageThreadItem {
  const thread: StorageThreadItem = {
    author: ti.data.author,
    body: optional(ti.data.selftext_html),
    cachedAt: -1,
    created: ti.data.created_utc,
    downvotes: ti.data.downs,
    id: ti.data.name,
    images: ti.data.preview ? imageForStorage(ti.data.preview.images[0]) : [],
    link: !ti.data.is_self ? ti.data.url : undefined,
    nsfw: ti.data.over_18,
    numComments: ti.data.num_comments,
    subreddit: ti.data.subreddit,
    title: ti.data.title,
    upvotes: ti.data.ups
  };

  return thread;
}

function commentForStorage(
  comments: Comment[],
  parentId: string
): StorageComment[] {
  return comments
    .filter(comment => comment.kind === "t1")
    .filter(comment => comment.data.parent_id === parentId)
    .map(comment => ({
      author: comment.data.author,
      body: comment.data.body_html,
      comment: comment.data.body,
      created: comment.data.created_utc,
      downvotes: comment.data.downs,
      id: comment.data.name,
      points: comment.data.score,
      replies: !comment.data.replies
        ? []
        : commentForStorage(
            comment.data.replies.data.children,
            comment.data.name
          ),
      upvotes: comment.data.ups
    }));
}

export async function loadSubreddit(id: string): Promise<StorageSubreddit> {
  const rawData: Subreddit = await fetch(
    `https://www.reddit.com/r/${id}/.json`
  ).then(r => r.json());
  return processLoadSubredditAPIResponse(id, rawData);
}

export function processLoadSubredditAPIResponse(
  id: string,
  rawData: Subreddit
): StorageSubreddit {
  return {
    cachedAt: -1,
    id,
    items: rawData.data.children.map(threadItemForStorage)
  };
}

export async function loadThread(id: string): Promise<StorageThread> {
  const rawData: Thread = await fetch(
    `https://www.reddit.com/${id.substr(3)}/.json`
  ).then(r => r.json());
  return processLoadThreadAPIResponse(id, rawData);
}

export function processLoadThreadAPIResponse(
  id: string,
  rawData: Thread
): StorageThread {
  return [
    threadItemForStorage(rawData[0].data.children[0]),
    commentForStorage(rawData[1].data.children, id)
  ];
}
