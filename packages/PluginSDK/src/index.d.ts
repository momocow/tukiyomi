declare namespace TukiYomi {
  interface Event {
    readonly time: Date
  }

  interface KCApiEvent extends Event {

  }

  interface BattleEvent extends KCApiEvent {
    
  }

  interface BattleStartEvent extends BattleEvent {
    
  }

  interface BattleEndEvent extends BattleEvent {
    
  }
}
