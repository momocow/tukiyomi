enum ESeason {
  spring,
  summer,
  autumn,
  winter
}

class Sea {
  constructor (
    public readonly area: number,
    public readonly sea: number,
    public readonly isEvent: boolean = false,
    public readonly eventYear?: number,
    public readonly eventSeason?: ESeason
  ) {}

  toReadable () {
    return (this.isEvent ? 'E' : this.area) + '-' + this.sea
  }
}

export const SEAS: Map<string, Sea> = new Map()

export function importSeas () {

}
