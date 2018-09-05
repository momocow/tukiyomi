declare namespace TukiYomi {
  interface Event {
    readonly timestamp: Date
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
