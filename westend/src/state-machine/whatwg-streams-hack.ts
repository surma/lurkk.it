/* tslint:disable */
// This file is taken (almost) verbatim from DefnitelyTyped. We
// should keep it easy to diff.

/**
 * @license
 * Copyright (c) 2018 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */

// Type definitions for Streams API
// Project: https://github.com/whatwg/streams
// Definitions by: Kagami Sascha Rosylight <https://github.com/saschanaz>
//                 Konstantin Simon Maria Möllers <https://github.com/ksm2>
//                 Mattias Buelens <https://github.com/MattiasBuelens>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped
// TypeScript Version: 2.3

export interface ReadableStreamSource<R = ArrayBufferView> {
  start?(controller: ReadableStreamDefaultController<R>): void | Promise<any>;
  pull?(controller: ReadableStreamDefaultController<R>): void | Promise<any>;
  cancel?(reason: any): void | Promise<any>;
}

export interface ReadableByteStreamSource<R = ArrayBufferView> {
  start?(controller: ReadableByteStreamController<R>): void | Promise<any>;
  pull?(controller: ReadableByteStreamController<R>): void | Promise<any>;
  cancel?(reason: any): void | Promise<any>;

  type: "bytes";
  autoAllocateChunkSize?: number;
}

export interface QueuingStrategy<T = ArrayBufferView> {
  size?(chunk: T): number;
  highWaterMark?: number;
}

export interface PipeOptions {
  preventClose?: boolean;
  preventAbort?: boolean;
  preventCancel?: boolean;
}

export interface WritableReadablePair<
  T extends WritableStream<any>,
  U extends ReadableStream<any>
> {
  writable: T;
  readable: U;
}

export class ReadableStream<R = ArrayBufferView> {
  constructor(
    underlyingSource?: ReadableStreamSource<R>,
    strategy?: QueuingStrategy<R>
  );
  constructor(
    underlyingSource?: ReadableByteStreamSource<R>,
    strategy?: QueuingStrategy<R>
  );

  readonly locked: boolean;

  cancel(reason: any): Promise<void>;
  getReader(): ReadableStreamDefaultReader<R>;
  getReader({ mode }: { mode: "byob" }): ReadableStreamBYOBReader<R>;
  pipeThrough<T extends ReadableStream<any>>(
    { writable, readable }: WritableReadablePair<WritableStream<R>, T>,
    options?: PipeOptions
  ): T;
  pipeTo(dest: WritableStream<R>, options?: PipeOptions): Promise<void>;
  tee(): [ReadableStream<R>, ReadableStream<R>];
}

export class ReadableStreamDefaultReader<R = ArrayBufferView> {
  constructor(stream: ReadableStream<R>);

  readonly closed: Promise<void>;

  cancel(reason: any): Promise<void>;
  read(): Promise<IteratorResult<R>>;
  releaseLock(): void;
}

export class ReadableStreamBYOBReader<R = ArrayBufferView> {
  constructor(stream: ReadableStream<R>);

  readonly closed: Promise<void>;

  cancel(reason: any): Promise<void>;
  read<T extends ArrayBufferView>(view: T): Promise<IteratorResult<T>>;
  releaseLock(): void;
}

export class ReadableStreamDefaultController<R = ArrayBufferView> {
  readonly desiredSize: number | null;

  close(): void;
  enqueue(chunk: R): void;
  error(e: any): void;
}

export class ReadableByteStreamController<R = ArrayBufferView> {
  readonly byobRequest: ReadableStreamBYOBRequest<R>;
  readonly desiredSize: number | null;

  close(): void;
  enqueue(chunk: R): void;
  error(e: any): void;
}

export class ReadableStreamBYOBRequest<R = ArrayBufferView> {
  readonly view: R;

  respond(bytesWritten: number): void;
  respondWithNewView(view: ArrayBufferView): void;
}

interface WritableStreamSink<W = ArrayBufferView> {
  start?(controller: WritableStreamDefaultController<W>): void | Promise<any>;
  write?(
    chunk: W,
    controller?: WritableStreamDefaultController<W>
  ): void | Promise<any>;
  close?(controller: WritableStreamDefaultController<W>): void | Promise<any>;
  abort?(reason: any): void | Promise<any>;
}

export class WritableStream<W = ArrayBufferView> {
  constructor(
    underlyingSink?: WritableStreamSink<W>,
    strategy?: QueuingStrategy<W>
  );

  readonly locked: boolean;

  abort(reason: any): Promise<void>;
  getWriter(): WritableStreamDefaultWriter<W>;
}

export class WritableStreamDefaultWriter<W = ArrayBufferView> {
  constructor(stream: WritableStream<W>);

  readonly closed: Promise<void>;
  readonly desiredSize: number | null;
  readonly ready: Promise<void>;

  abort(reason: any): Promise<void>;
  close(): Promise<void>;
  releaseLock(): void;
  write(chunk: W): Promise<void>;
}

export class WritableStreamDefaultController<W = ArrayBufferView> {
  error(e: any): void;
}

export class ByteLengthQueuingStrategy<T = ArrayBufferView> {
  constructor({ highWaterMark }: { highWaterMark: number });

  size(chunk: T): number | undefined;
}

export class CountQueuingStrategy {
  constructor({ highWaterMark }: { highWaterMark: number });

  size(): 1;
}

export interface TransformStreamTransformer<R, W> {
  start?(controller: TransformStreamDefaultController<R>): void | Promise<any>;
  transform?(
    chunk: W,
    controller: TransformStreamDefaultController<R>
  ): void | Promise<any>;
  flush?(controller: TransformStreamDefaultController<R>): void | Promise<any>;
}

export class TransformStream<R, W>
  implements WritableReadablePair<WritableStream<W>, ReadableStream<R>> {
  constructor(
    transformer?: TransformStreamTransformer<R, W>,
    writableStrategy?: QueuingStrategy<W>,
    readableStrategy?: QueuingStrategy<R>
  );

  readonly readable: ReadableStream<R>;
  readonly writable: WritableStream<W>;
}

export class TransformStreamDefaultController<R> {
  enqueue(chunk: R): void;
  error(reason: any): void;
  terminate(): void;

  readonly desiredSize: number | null;
}
