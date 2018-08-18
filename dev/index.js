const { spawn } = require('child_process')

const path = require('path')

const ROOT = path.join(__dirname, '..')
const ELECTRON_BIN = path.join(ROOT, 'node_modules', '.bin', 'electron.cmd')

spawn(ELECTRON_BIN, [ ROOT, '--dev' ], {
  env: {
    NODE_ENV: 'development'
  }
})
