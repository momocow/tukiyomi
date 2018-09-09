process.env.NODE_ENV = 'development'
process.env.START_FROM_NPM = true
const { resolve } = require('path')
const { main } = require('./package.json')
require(resolve(main))
