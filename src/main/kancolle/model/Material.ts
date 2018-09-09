/**
 * the same order as /api_get_member/material
 */
export enum EMaterial {
  fuel = 1,          // 油
  bullet = 2,        // 彈
  steel = 3,         // 鋼
  bauxite = 4,       // 鋁
  constructkit = 5,  // 高速建造材
  repairkit = 6,     // 高速修復材
  buildkit = 7,      // 開發資材
  remodelkit = 8     // 改修資材
}

export class Materials {
  private _map: Map<EMaterial, number> = new Map([
    [ EMaterial.fuel, 0 ],
    [ EMaterial.bullet, 0 ],
    [ EMaterial.steel, 0 ],
    [ EMaterial.bauxite, 0 ],
    [ EMaterial.constructkit, 0 ],
    [ EMaterial.repairkit, 0 ],
    [ EMaterial.buildkit, 0 ],
    [ EMaterial.remodelkit, 0 ]
  ])

  get fuel () {
    return this._map.get(EMaterial.fuel) || 0
  }

  set fuel (val: number) {
    this.set(EMaterial.fuel, val)
  }

  get bullet () {
    return this._map.get(EMaterial.bullet) || 0
  }

  set bullet (val: number) {
    this.set(EMaterial.bullet, val)
  }

  get steel () {
    return this._map.get(EMaterial.steel) || 0
  }

  set steel (val: number) {
    this.set(EMaterial.steel, val)
  }

  get bauxite () {
    return this._map.get(EMaterial.bauxite) || 0
  }

  set bauxite (val: number) {
    this.set(EMaterial.bauxite, val)
  }

  get constructkit () {
    return this._map.get(EMaterial.constructkit) || 0
  }

  set constructkit (val: number) {
    this.set(EMaterial.constructkit, val)
  }

  get repairkit () {
    return this._map.get(EMaterial.repairkit) || 0
  }

  set repairkit (val: number) {
    this.set(EMaterial.repairkit, val)
  }

  get buildkit () {
    return this._map.get(EMaterial.buildkit) || 0
  }

  set buildkit (val: number) {
    this.set(EMaterial.buildkit, val)
  }

  get remodelkit () {
    return this._map.get(EMaterial.remodelkit) || 0
  }

  set remodelkit (val: number) {
    this.set(EMaterial.remodelkit, val)
  }

  set (resource: EMaterial, val: number) {
    this._map.set(resource, val)
  }

  income (resource: EMaterial, val: number) {
    const cur = this._map.get(resource) || 0
    this.set(resource, cur + val)
  }

  expense (resource: EMaterial, val: number) {
    const cur = this._map.get(resource) || 0
    this.set(resource, cur - val)
  }
}
