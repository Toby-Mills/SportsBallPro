import { WagonWheelAPI as WebSportsWagonWheel } from './web-sports'

export class WagonWheel {
	teamId: string = '';
	playerId: number = 0
	firstName: string = ''
	surname: string = ''
	type: 'Batting' | 'Bowling' | '' = ''
	events: Array<WagonWheelEvent> = []

	public loadFromAPI(teamId: string, playerId: number,type: 'Batting'|'Bowling', input: WebSportsWagonWheel) {
		this.teamId = teamId;
		this.playerId = playerId;
		this.type = type;
		this.events = [];
		for (let event of input.wagonwheel) {
			let newEvent = new WagonWheelEvent;
			newEvent.eventId = event.EventID;
			newEvent.runs = event.EventRuns;
			newEvent.x = event.RunX;
			newEvent.y = event.RunY;
			this.events.push(newEvent);
		}
	}
}

export class WagonWheelEvent {
	eventId: number = 0
	runs: number = 0
	x: number = 0
	y: number = 0
}