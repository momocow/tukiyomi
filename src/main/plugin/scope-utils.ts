// scopeRule = <namespace>.<operation>
import _uniq from 'lodash/uniq'

export const SCOPES = {
  fs: new Set([
    'write',
    'read',
    'stat'
  ]),
  dom: new Set([
    'guest'
  ]),
  // canvas: new Set([
  //   'misc',
  //   'context'
  // ]),
  db: new Set([
    'read',
    'write'
  ])
}

export function expand (specs: string[]): string[] {
  const expanded = []
  for (const spec of specs) {
    if (validate(spec)) {
      const [ nsp, op ] = spec.split('.')
      if (!op) {
        let scopes: Set<string>
        switch (nsp) {
          case 'fs':
            scopes = SCOPES.fs
            break
          case 'dom':
            scopes = SCOPES.dom
            break
          case 'db':
            scopes = SCOPES.db
            break
          default:
            scopes = new Set()
        }
        for (const _op of scopes.values()) {
          expanded.push(`${nsp}.${_op}`)
        }
      } else {
        expanded.push(spec)
      }
    }
  }
  return _uniq(expanded)
}

/**
 * Whether or not **specs** from the plugin is authorized to perform the **required** operation
 */
export function authorize (specs: string[], required: string): boolean {
  if (!validate(required)) return false

  const [ nsp ] = required.split('.')
  for (const spec of specs) {
    if (spec === required) return true

    // wildcard match (only allowed on OP field)
    // i.e. spec="db" will authorize both OP="db.read" and OP="db.write" to be legal
    if (validate(spec)) {
      const [ specNsp, specOp ] = spec.split('.')
      if (specNsp === nsp && !specOp) {
        // wildcarded
        return true
      }
    }
  }
  return false
}

export function validate (scope: string): boolean {
  const [ nsp, op ] = scope.split('.')
  return ((nsp in SCOPES) && (!op || SCOPES[(<"fs"|"dom"|"db">nsp)].has(op)))
}
