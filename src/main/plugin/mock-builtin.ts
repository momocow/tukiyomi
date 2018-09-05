export function mockBuiltins (scopes?: string[]): {[k: string]: any} {
  const ret: any = {}
  if (Array.isArray(scopes)) {
    scopes.forEach(scope => {
      if (scope.startsWith('fs')) {
        const fs = require('fs')
        if (scope === 'fs.write') {
          ret.writeFile = fs.writeFile
          ret.writeFileSync = fs.writeFileSync
          ret.write = fs.write
          ret.writeSync = fs.writeSync
        } else if (scope === 'fs.read') {
          ret.readFile = fs.readFile
          ret.readFileSync = fs.readFileSync
          ret.read = fs.read
          ret.readSync = fs.readSync
        } else if (scope === 'fs.stat') {
          ret.fstat = fs.fstat
          ret.lstat = fs.lstat
          ret.stat = fs.stat
          ret.fstatSync = fs.fstatSync
          ret.lstatSync = fs.lstatSync
          ret.statSync = fs.statSync
          ret.existSync = fs.existSync
          // ret.access = fs.access
          // ret.accessSync = fs.accessSync
        }
      }
    })
  }
  return ret
}