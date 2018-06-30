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

import * as JSONP from "./jsonp.js";

export type ThreadID = string;
export type SubredditID = string;
export type CommentID = string;

export interface Subreddit {
  id: SubredditID;
  items: Thread[];
}

export interface Thread {
  author: string;
  downvotes: number;
  id: ThreadID;
  numComments: number;
  fullImage?: string;
  previewImage?: string;
  subreddit: string;
  title: string;
  upvotes: number;
  body?: string;
  htmlBody?: string;
  link?: string;
}

export interface Comment {
  id: CommentID;
  author: string;
  body: string;
  htmlBody: string;
  downvotes: number;
  upvotes: number;
  replies: Comment[];
}

interface ApiSubreddit {
  data: {
    modhash: string;
    dist: number;
    children: ApiThreadEntity[];
  };
  kind: "Listing";
}

interface ApiPreviewImageVersion {
  height: number;
  url: string;
  width: number;
}

interface ApiPreviewImage {
  source: ApiPreviewImageVersion;
  resolutions: ApiPreviewImageVersion[];
  variants: {};
  id: string;
}

interface ApiThreadEntity {
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
    name: string;
    num_comments: number;
    preview: {
      enabled: boolean;
      images: ApiPreviewImage[];
    };
    selftext: string;
    selftext_html: string;
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

interface ApiComment {
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
    subreddit: string;
    subreddit_id: string;
    ups: number;
    replies:
      | {
          kind: "Listing";
          data: {
            modhash: "";
            dist: null;
            children: ApiComment[];
          };
        }
      | "";
  };
  kind: "t1";
}

type ApiThread = [
  {
    kind: "Listing";
    data: {
      modhash: "";
      dist: null;
      children: ApiThreadEntity[];
    };
  },
  {
    kind: "Listing";
    data: {
      modhash: "";
      dist: null;
      children: ApiComment[];
    };
  }
];

function sanitizeUrl(url: string) {
  return url.split("&amp;").join("&");
}

function apiThreadEntityToModel(te: ApiThreadEntity): Thread {
  const thread: Thread = {
    author: te.data.author,
    body: te.data.selftext,
    downvotes: te.data.downs,
    htmlBody: te.data.selftext_html,
    id: te.data.name,
    link: te.data.url,
    numComments: te.data.num_comments,
    subreddit: te.data.subreddit,
    title: te.data.title,
    upvotes: te.data.ups
  };

  if (te.data.preview && te.data.preview.images.length >= 1) {
    thread.fullImage = sanitizeUrl(te.data.preview.images[0].source.url);

    const previewCandidate = te.data.preview.images[0].resolutions.find(
      variant => variant.height <= 200
    );
    if (previewCandidate) {
      thread.previewImage = sanitizeUrl(previewCandidate.url);
    }
  }
  return thread;
}

function apiCommentsToModel(
  comments: ApiComment[],
  parentId: string
): Comment[] {
  return comments
    .filter(comment => comment.kind === "t1")
    .filter(comment => comment.data.parent_id === parentId)
    .map(comment => ({
      author: comment.data.author,
      body: comment.data.body,
      comment: comment.data.body,
      downvotes: comment.data.downs,
      htmlBody: comment.data.body_html,
      id: comment.data.name,
      replies:
        comment.data.replies === ""
          ? []
          : apiCommentsToModel(
              comment.data.replies.data.children,
              comment.data.name
            ),
      upvotes: comment.data.ups
    }));
}

export async function loadSubreddit(id: SubredditID): Promise<Subreddit> {
  const rawData = await JSONP.load<ApiSubreddit>(
    `https://www.reddit.com/r/${id}/.json`
  );
  return {
    id,
    items: rawData.data.children.map(apiThreadEntityToModel)
  };
}

export async function loadThread(id: ThreadID): Promise<[Thread, Comment[]]> {
  const rawData = await JSONP.load<ApiThread>(
    `https://www.reddit.com/${id.substr(3)}/.json`
  );
  return [
    apiThreadEntityToModel(rawData[0].data.children[0]),
    apiCommentsToModel(rawData[1].data.children, id)
  ];
}
