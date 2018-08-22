/// <reference path="./index.d.ts" />
const { EventEmitter } = require('events')

const __EE__ = Symbol('__EVENTS__')
const __VA__ = Symbol('__VALIDATE__')

class RollingArray extends Array {
  /**
   * @param {number} [maxLen]
   * @param {number} [bufLen]
   * @param {...any} [args]
   */
  constructor (maxLen = Infinity, bufLen = 0, ...args) {
    super(...args)

    if (bufLen > maxLen) {
      bufLen = maxLen
    }

    Object.defineProperty(this, __EE__, {
      value: new EventEmitter(),
      enumerable: false
    })

    Object.defineProperty(this, 'maxLen', {
      value: maxLen,
      enumerable: false,
      writable: true
    })

    Object.defineProperty(this, 'bufLen', {
      value: bufLen,
      enumerable: false,
      writable: true
    })
  }

  /**
   * @param {...any} args
   */
  push (...args) {
    return this[__VA__](Math.min(super.push(...args), this.maxLen))
  }

  /**
   * @param {number} start
   * @param {number} deleteCount
   * @param {...any} newItems
   */
  splice (start, deleteCount, ...newItems) {
    return this[__VA__](super.splice(start, deleteCount, ...newItems))
  }

  /**
   * @param {...any} args
   */
  unshift (...args) {
    return this[__VA__](Math.min(super.unshift(...args), this.maxLen))
  }

  [__VA__] (ret) {
    if (this.length > this.maxLen) {
      const discarded = this.splice(0, this.length - this.maxLen + this.bufLen)
      this[__EE__].emit('overflow', discarded, this)
    }
    return ret
  }

  /**
   * @param {string} event
   * @param {(args: ...any)=>void} fn
   */
  on (event, fn) {
    this[__EE__].on(event, fn)
    return this
  }

  /**
   * @param {string} [event]
   * @param {(args: ...any)=>void} [fn]
   */
  off (event, fn) {
    this[__EE__][event && fn ? 'off' : 'removeAllListeners'](event, fn)
    return this
  }

  /**
   * @param {ArrayLike} arr
   * @param {number} [maxLen]
   * @param {number} [bufLen]
   * @param {...any} [args]
   */
  static from (arr, maxLen, bufLen) {
    return new RollingArray(maxLen, bufLen, ...Array.from(arr).slice(0, maxLen))
  }

  static get [Symbol.species] () {
    return Array
  }
}

module.exports.default = RollingArray
