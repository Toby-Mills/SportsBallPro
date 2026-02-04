import { BattingInningsDetail } from './batting-innings-detail';

export class Innings {
    number: number = 0;  // 1 or 2
    battingInnings: BattingInningsDetail[] = [];  // Will contain 2 BattingInningsDetail objects
    isComplete: boolean = false;
}
