import { FallOfWicketsAPI as WebSportsFallOfWickets } from './web-sports';
export class FallOfWickets {

    wickets: FallOfWicket[] = [];

    public loadFromAPI(update: WebSportsFallOfWickets) {
        this.wickets = [];
        if (update.fow) {
            for (let fow of update.fow) {
                let NewFallOfWicket = new FallOfWicket();
                NewFallOfWicket.gameId = fow.GameID;
                NewFallOfWicket.eventId = fow.EventID;
                NewFallOfWicket.firstName = fow.PlayerName;
                NewFallOfWicket.surname = fow.PlayerSurname;
                NewFallOfWicket.teamRuns = fow.TeamTotalRuns || 0;
                NewFallOfWicket.teamWickets = fow.TeamTotalWickets || 0;
                this.wickets.push(NewFallOfWicket);
            }
        }
    }
}

export class FallOfWicket {
    gameId: string = '';
    eventId: number = 0;
    firstName: string = '';
    surname: string = '';
    teamRuns: number = 0;
    teamWickets: number = 0;
}