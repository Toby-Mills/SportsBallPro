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

    public loadRecentOvers(input: any): void {
        let updateFound: boolean = false;

        this.overs = [];

        if (input.ballcountdown.length > 0) {
            for (let inputBall of input.ballcountdown) {
                let overNumber = Number(inputBall.Over.split('.')[0]) + 1;
                let ballNumber = Number(inputBall.Over.split('.')[1]);
                let over = this.overs.find(over => over.number == overNumber);
                if (!over) {
                    over = new Over;
                    over.number = overNumber;
                    this.overs.push(over);
                }

                let ball = new Ball;
                ball.number = ballNumber;
                ball.description = inputBall.BallDescription;
                over.balls.push(ball);
            }

            //sort the overs
            this.overs.sort((a, b) => { if (a.number < b.number) { return 1 } else { return -1 } })

            //sort the balls in each over
            for (let over of this.overs) {
                over.balls = over.balls.sort((a, b) => { if (a.number > b.number) { return 1 } else { return -1 } })
            }

            //mark the current over
            let currentOver = this.overs[0];
            currentOver.current = true;

            //mark the current ball
            let currentBall = currentOver.balls[currentOver.balls.length - 1]
            currentBall.current = true;

            //add any missing balls at beginning of each over
            for (let over of this.overs) {
                let firstBall = over.balls[0];
                let newBalls = [];
                for (let i = 1; i < firstBall.number; i++) {
                    let newBall = new Ball;
                    newBall.number = i;
                    newBall.description = '';
                    newBall.old = true;
                    newBalls.push(newBall);
                }
                over.balls.unshift(...newBalls);
            }

            //add any future balls remaining at end of each over
            for (let over of this.overs) {
                over.balls = over.balls.sort((a, b) => { if (a.number > b.number) { return 1 } else { return -1 } })
                let lastBall = over.balls[over.balls.length - 1];
                let lastNumber = Number(lastBall.number);
                let newBalls = [];
                for (let i = lastNumber + 1; i <= 6; i++) {
                    let newBall = new Ball;
                    newBall.number = i;
                    newBall.description = '';
                    newBall.future = true;
                    newBalls.push(newBall);
                }
                over.balls.push(...newBalls);
            }

        }
    }
}
