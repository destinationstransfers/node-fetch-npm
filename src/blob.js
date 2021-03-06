'use strict';

// Based on https://github.com/tmpvar/jsdom/blob/aa85b2abf07766ff7bf5c1f6daafb3726f2f2db5/lib/jsdom/living/blob.js
// (MIT licensed)

const BUFFER = Symbol('buffer');
const TYPE = Symbol('type');
const CLOSED = Symbol('closed');

class Blob {
  constructor(blobParts, options) {
    Object.defineProperty(this, Symbol.toStringTag, {
      value: 'Blob',
      writable: false,
      enumerable: false,
      configurable: true,
    });

    this[CLOSED] = false;
    this[TYPE] = '';

    const buffers = [];

    if (blobParts) {
      const a = blobParts;
      const length = Number(a.length);
      for (let i = 0; i < length; i++) {
        const element = a[i];
        let buffer;
        if (Buffer.isBuffer(element)) {
          buffer = element;
        } else if (ArrayBuffer.isView(element)) {
          buffer = Buffer.from(
            new Uint8Array(
              element.buffer,
              element.byteOffset,
              element.byteLength,
            ),
          );
        } else if (element instanceof ArrayBuffer) {
          buffer = Buffer.from(new Uint8Array(element));
        } else if (element instanceof Blob) {
          buffer = element[BUFFER];
        } else {
          buffer = Buffer.from(
            typeof element === 'string' ? element : String(element),
          );
        }
        buffers.push(buffer);
      }
    }

    this[BUFFER] = Buffer.concat(buffers);

    const type =
      options &&
      options.type !== undefined &&
      String(options.type).toLowerCase();
    if (type && !/[^\u0020-\u007E]/.test(type)) {
      this[TYPE] = type;
    }
  }

  /**
   * 
   * @returns {number}
   * @readonly
   * @memberof Blob
   */
  get size() {
    return this[CLOSED] ? 0 : this[BUFFER].length;
  }

  /**
   * 
   * @returns {string}
   * @readonly
   * @memberof Blob
   */
  get type() {
    return this[TYPE];
  }

  /**
   * 
   * 
   * @readonly
   * @returns {boolean}
   * @memberof Blob
   */
  get isClosed() {
    return this[CLOSED];
  }

  /**
   * The Blob.slice() method is used to create a new Blob object
   * containing the data in the specified range of bytes of the source Blob.
   * 
   * @param {number} [start=0]
   * @param {number} [end=size] 
   * @param {string} [contentType='']
   * @returns {Blob}
   * @memberof Blob
   */
  slice(start, end, contentType) {
    const { size } = this;

    let relativeStart;
    let relativeEnd;
    if (start === undefined) {
      relativeStart = 0;
    } else if (start < 0) {
      relativeStart = Math.max(size + start, 0);
    } else {
      relativeStart = Math.min(start, size);
    }
    if (end === undefined) {
      relativeEnd = size;
    } else if (end < 0) {
      relativeEnd = Math.max(size + end, 0);
    } else {
      relativeEnd = Math.min(end, size);
    }
    const span = Math.max(relativeEnd - relativeStart, 0);

    const buffer = this[BUFFER];
    const slicedBuffer = buffer.slice(relativeStart, relativeStart + span);
    const blob = new Blob([], { type: contentType });
    blob[BUFFER] = slicedBuffer;
    blob[CLOSED] = this[CLOSED];
    return blob;
  }
  close() {
    this[CLOSED] = true;
  }
}

module.exports = Blob;
module.exports.BUFFER = BUFFER;

Object.defineProperty(Blob.prototype, Symbol.toStringTag, {
  value: 'BlobPrototype',
  writable: false,
  enumerable: false,
  configurable: true,
});
