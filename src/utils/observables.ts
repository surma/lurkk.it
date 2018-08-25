/**
 * Copyright 2018 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {
  ReadableStream as WhatWGReadableStream,
  ReadableStreamDefaultController,
  TransformStream as WhatWGTransformStream,
  WritableStream as WhatWGWritableStream
} from "./whatwg-streams-hack.js";

declare var ReadableStream: typeof WhatWGReadableStream;
declare var WritableStream: typeof WhatWGWritableStream;
declare var TransformStream: typeof WhatWGTransformStream;

export { ReadableStream, WritableStream, TransformStream };

export function from<T extends Event = Event>(
  el: HTMLElement,
  evName: string
): WhatWGReadableStream<T> {
  let f: ((ev: T) => void) | undefined;
  return new ReadableStream<T>({
    start(controller) {
      f = function(ev: T) {
        controller.enqueue(ev);
      };
      el.addEventListener(evName, f! as any);
    },
    cancel() {
      el.removeEventListener(evName, f! as any);
    }
  });
}

export function just<T>(item: T) {
  return new ReadableStream<T>({
    start(controller) {
      controller.enqueue(item);
      controller.close();
    }
  });
}

export function repeat<T>(items: T | T[]) {
  let i = 0;
  if (!Array.isArray(items)) {
    items = [items];
  }
  return new ReadableStream<T>({
    pull(controller) {
      controller.enqueue((items as T[])[i]);
      i = (i + 1) % (items as T[]).length;
    }
  });
}

export function countUp() {
  let i = 0;
  return new ReadableStream<number>({
    pull(controller) {
      controller.enqueue(i++);
    }
  });
}

export function timer(ms: number) {
  return new ReadableStream<{}>({
    start(controller) {
      setInterval(_ => controller.enqueue({}), ms);
    }
  });
}

export function delay<T>(ms: number) {
  return new TransformStream<T, T>({
    transform(item, controller) {
      setTimeout(_ => controller.enqueue(item), ms);
    }
  });
}

export function map<R, W>(f: (w: W) => R) {
  return new TransformStream<R, W>({
    transform(item, controller) {
      controller.enqueue(f(item));
    }
  });
}

export function filter<T>(f: (t: T) => boolean) {
  return new TransformStream<T, T>({
    transform(item, controller) {
      if (f(item)) {
        controller.enqueue(item);
      }
    }
  });
}

export function take<T>(n: number) {
  return new TransformStream<T, T>({
    start(controller) {
      if (n <= 0) {
        controller.terminate();
      }
    },
    transform(item, controller) {
      controller.enqueue(item);
      n--;
      if (n <= 0) {
        controller.terminate();
      }
    }
  });
}

export function takeLast<T>(n: number) {
  const buffer = new Array<T>(n);
  return new TransformStream<T, T>({
    transform(item) {
      buffer.push(item);
      buffer.shift();
    },
    flush(controller) {
      buffer.forEach(item => controller.enqueue(item));
    }
  });
}

export function skip<T>(n: number) {
  return new TransformStream<T, T>({
    transform(item, controller) {
      if (n > 0) {
        n--;
        return;
      }
      controller.enqueue(item);
    }
  });
}

export function skipLast<T>(n: number) {
  const buffer: T[] = [];
  return new TransformStream<T, T>({
    transform(item, controller) {
      buffer.push(item);
      if (buffer.length === n + 1) {
        controller.enqueue(buffer.shift()!);
      }
    }
  });
}

export function merge<T>(...os: Array<WhatWGReadableStream<T>>) {
  return new ReadableStream<T>({
    async start(controller) {
      const rs = os.map(o => o.getReader()).map(async r => {
        while (true) {
          const { value, done } = await r.read();
          if (done) {
            return;
          }
          controller.enqueue(value);
        }
      });
      await Promise.all(rs);
      controller.close();
    }
  });
}

export function concat<T>(...os: Array<WhatWGReadableStream<T>>) {
  const ts = new TransformStream<T, T>();
  (async _ => {
    for (const o of os) {
      await o.pipeTo(ts.writable, { preventClose: true });
    }
    ts.writable.getWriter().close();
  })();
  return ts.readable;
}

export function zip<T>(...os: Array<WhatWGReadableStream<T>>) {
  const rs = os.map(o => o.getReader());
  return new ReadableStream<T[]>({
    async pull(controller) {
      const values = await Promise.all(rs.map(r => r.read()));
      if (values.some(v => v.done)) {
        rs.map(r => r.releaseLock());
        controller.close();
      }
      controller.enqueue(values.map(v => v.value));
    }
  });
}

export function eat<T>(): WhatWGWritableStream<T> {
  return new WritableStream<T>();
}

export function forEach<T>(f: (t: T) => void) {
  return map<T, T>(t => {
    f(t);
    return t;
  });
}
