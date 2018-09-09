const LEVELS = {
  ALL: 0,
  DEBUG: 10,
  INFO: 20,
  WARN: 30,
  ERROR: 40,
  NONE: 100
}

class LogLevel {
  /**
   * @param {string} lvtag
   */
  constructor (lvtag) {
    this.tag = lvtag.toUpperCase()
    this.value = LEVELS[this.tag]
  }

  valueOf () {
    return this.value
  }

  toString () {
    return this.tag
  }
}

module.exports = {
  ALL: new LogLevel('ALL'),
  DEBUG: new LogLevel('DEBUG'),
  INFO: new LogLevel('INFO'),
  WARN: new LogLevel('WARN'),
  ERROR: new LogLevel('ERROR'),
  NONE: new LogLevel('NONE')
}
