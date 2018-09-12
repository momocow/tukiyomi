import { KCSAPIEvent } from "./KCSAPIEvent"

export class MapEvent extends KCSAPIEvent {
  // TODO parse api_data api_result to KCSAPIEvent
  /**
   * 第 N 海域
   */
  get area () {
    return this.responseJSON.api_data.api_maparea_id
  }

  /**
   * 第 N 張圖
   */
  get sea () {
    return this.responseJSON.api_data.api_mapinfo_no
  }

  get isEventMap () {
    return 'api_eventmap' in this.responseJSON.api_data
  }

  get mapReadable () {
    return (this.isEventMap ? 'E' : this.area) + `-${this.sea}`
  }
}

export class MapStartEvent extends MapEvent {

}

export class MapEndEvent extends MapEvent {

}

export class MapNextEvent extends MapEvent {

}
