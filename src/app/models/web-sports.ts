export class FixturesAPI {
	fixtures: Array<FixtureAPI> = []
}

export class FixtureAPI {
	gameID: string = ''
	game: string = ''
	fistureDate: string = ''
	datePlayed: Date = new Date()
	venueDescription = ''
	tossWonByTeam = ''
	decidedTo = ''
	aTeamID = ''
	bTeamID = ''
	aTeam = ''
	bTeam = ''
	aLogoName: string = ''
	bLogoName: string = ''
	RunsRequired: string = ''
	BreaksInPlay: string = ''
	result: string = ''
	InningsID: number = 0
	aRuns: number = 0
	aWickets: number = 0
	aOvers: number = 0
	aExtras: number = 0
	bRuns: number = 0
	bWickets: number = 0
	bOvers: number = 0
	bExtras: number = 0
	
}

export class BallCountdownAPI {
	ballcountdown: Array<BallAPI> = []
}

export class BallAPI {
	Over: string = ''
	eventID: number = 0
	BallDescription: string = ''
}

export class CommentaryAPI {
	commentary: Array<BallCommentaryAPI> = []
}

export class BallCommentaryAPI {
	GameID: string = ''
	EventID: number = 0
	currOver: number = 0
	Over: string = ''
	BallNote: string = ''
	BallDescription: string = ''
	PlayerIDBowling: number = 0
	TeamTotalRuns: number = 0
	TeamTotalWickets: number = 0
	BowlerTotalOvers: number = 0
	BowlerTotalRuns: number = 0
	BowlerTotalWickets: number = 0
}

export class BatsmenAPI {
	batsmen: Array<BatsmanAPI> = []
}

export class BatsmanAPI {
	ServerPlayerID: string = ''
	CurrentPlayer: string = ''
	PlayerName: string = ''
	PlayerSurname: string = ''
	BatRuns: number = 0
	BatBalls: number = 0
	batFours: number = 0
	batSixes: number = 0
}

export class FallOfWicketsAPI {
	fow: Array<FallOfWicketAPI> = []
}

export class FallOfWicketAPI {
	GameID: string = ''
	EventID: number = 0
	PlayerName: string = ''
	PlayerSurname: string = ''
	TeamTotalRuns: number = 0
	TeamTotalWickets: number = 0
}

export class BattingScorecardAPI {
	scorecard: Array<BattingScorecardEntryAPI> = []
}

export class BattingScorecardEntryAPI {
	HowOutFull: string = ''
	PlayerName: string = ''
	PlayerSurname: string = ''
	ServerPlayerID: string = ''
	BattingNr: number = 0
	WicketTaker: string = ''
	BatRuns: number = 0
	BatBalls: number = 0
	Fielder: string = ''
	BatFours: number = 0
	BatSixes: number = 0
	HowOut: string = ''
}

export class BowlingScorecardAPI {
	scorecard: Array<BowlingScorecardEntryAPI> = []
}

export class BowlingScorecardEntryAPI {
	ServerPlayerID: string = ''
	PlayerName: string = ''
	PlayerSurname: string = ''
	BowlNr: number = 0
	OversBowled: number = 0
	MaidensBowled: number = 0
	RunsAgainst: number = 0
	Wickets: number = 0
	NoBalls: number = 0
	Wides: number = 0
	TotalBowlerBalls: number = 0
}

export class BowlersAPI {
	bowlers: Array<BowlerAPI> = []
}

export class BowlerAPI {
	ServerPlayerID: string = ''
	CurrentPlayer: string = ''
	PlayerName: string = ''
	PlayerSurname: string = ''
	Bowler: boolean = false
	OversBowled: number = 0
	TotalBowlerBalls: number = 0
	maidensBowled: number = 0
	RunsAgainst: number = 0
	Wickets: number = 0
	Wides: number = 0
	NoBalls: number = 0
}

export class RunComparisonAPI {
	comparison: Array<RunComparisonOverAPI> = []
}

export class RunComparisonOverAPI {
	gameID: string = ''
	aRuns: number = 0
	aWickets: number = 0
	aOvers: number = 0
	bRuns: number = 0
	bWickets: number = 0
	bOvers: number = 0
	team: string = ''
	totalOvers: number = 0
	over:number = 0
	runsInOver: number = 0
	teamTotalRuns: number = 0
	totalWicketsInOver: number = 0
}

export class WagonWheelAPI {
	wagonwheel: Array<WagonWheelEventAPI> = []
}

export class WagonWheelEventAPI {
	GameID: string = ''
	EventID: number = 0
	EventRuns: number = 0
	RunX: number = 0
	RunY: number = 0
}

export class BattingLineupAPI {
	team:Array<PlayerAPI> = []
}

export class BowlingLineupAPI {
	team:Array<PlayerAPI> = []
}

export class PlayerAPI {
	PlayerID: number = 0
	Number: number = 0
	PlayerName: string = ''
	PlayerSurname: string = ''
}