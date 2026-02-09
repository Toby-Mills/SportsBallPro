export enum EventType {
  MATCH_STARTED = 'match_started',
  WICKET = 'wicket',
  MILESTONE_BATSMAN = 'milestone_batsman',
  MILESTONE_PARTNERSHIP = 'milestone_partnership',
  MILESTONE_TEAM = 'milestone_team',
  MAIDEN_OVER = 'maiden_over',
  HAT_TRICK = 'hat_trick',
  BOUNDARY = 'boundary',
  INNINGS_CHANGE = 'innings_change',
  MATCH_STATUS = 'match_status',
}

export interface NotificationEvent {
  id: string;
  gameId: string;
  timestamp: Date;
  eventType: EventType;
  title: string;
  description: string;
  team?: string;
  player?: string;
  value?: number; // runs, wickets, etc.
}
