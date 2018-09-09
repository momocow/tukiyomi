const { inspect } = require('util')
const { isAbsolute } = require('path')

/**
 * @param {Error} err
 */
function prettifyStacktrace (err) {
  return inspect(err)
    .split('\n')
    .filter(line => {
      const matched = line.match(/at .*?([^(]*):\d*:\d*/)
      return !matched || isAbsolute(matched[1])
    })
    .join('\n')
}

/**
 * @param {any} any
 * @return {string}
 */
function stringify (any) {
  return typeof any === 'string' ? any
  : any instanceof Error ? prettifyStacktrace(any)
    : inspect(any)
}

module.exports = {
  prettifyStacktrace, stringify
}
