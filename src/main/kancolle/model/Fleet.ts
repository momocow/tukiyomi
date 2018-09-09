export enum EMissionStatus {
  idle = 0,          // 未出撃
  ongoing = 1,       // 遠征中
  returning = 2,     // 遠征帰投
  retreating = 3     // 強制帰投中
}

export class MissionDescriptor {
  constructor (
    public status: EMissionStatus,
    public id: number,
    public completeTime: Date
  ) {}
}

export enum EAction {
  idle = 0,
  attack = 1,  // 出擊
  mission = 2,  // 遠征
  practice = 3  // 演習
}

export class Deck {
  public name?: string
  public action?: EAction
  public mission?: MissionDescriptor

  constructor (
    public readonly id: number
  ) {

  }

  startAttack (area: number, ) {

  }

  endAttack () {

  }

  startMission () {

  }

  endMission () {

  }
}

export class FleetState {
  private _map: Map<number, Deck> = new Map([
    [ 1, new Deck(1) ],
    [ 2, new Deck(2) ],
    [ 3, new Deck(3) ],
    [ 4, new Deck(4) ]
  ])

  get deck1 () {
    return this.get(1)
  }

  get deck2 () {
    return this.get(2)
  }

  get deck3 () {
    return this.get(3)
  }

  get deck4 () {
    return this.get(4)
  }

  get (deck: number): Deck | undefined {
    return this._map.get(deck)
  }
}
