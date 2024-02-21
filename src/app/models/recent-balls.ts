export class Over {
    number: number = 0;
    current: boolean = false;
    balls: Ball[] = [];
}

export class Ball {
    number: number = 0;
    description: string = '';
    old: boolean = false;
    future: boolean = false;
    current: boolean = false;
  }

export class RecentBalls {
    overs: Over[] = [];
}
