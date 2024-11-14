export class Fixtures {
	fixtures: Array<Fixture> = []
}

export class Fixture {
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
}

export class BallCountdown {
	ballcountdown: Array<Ball> = []
}

export class Ball {
	Over: string = ''
	eventID: number = 0
	BallDescription: string = ''
}

export class Batsmen {
	batsmen: Array<Batsman> = []
}

export class Batsman {
	ServerPlayerID: string = ''
	CurrentPlayer: string = ''
	PlayerName: string = ''
	PlayerSurname: string = ''
	BatRuns: number = 0
	BatBalls: number = 0
	batFours: number = 0
	batSixes: number = 0
}

export class FallOfWickets {
	fow: Array<FallOfWicket> = []
}

export class FallOfWicket {
	GameID: string = ''
	EventID: number = 0
	PlayerName: string = ''
	PlayerSurname: string = ''
	TeamTotalRuns: number = 0
	TeamTotalWickets: number = 0
}

export class BattingScorecard {
	scorecard: Array<BattingScorecardEntry> = []
}

export class BattingScorecardEntry {
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

export class BowlingScorecard {
	scorecard: Array<BowlingScorecardEntry> = []
}

export class BowlingScorecardEntry {
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

export class Bowlers {
	bowlers: Array<Bowler> = []
}

export class Bowler {
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