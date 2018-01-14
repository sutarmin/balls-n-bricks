import { calcAngle, distBetweenPoints } from './geometry';

class Brick {
    
    /**
     * 
     * @param {Number} x - x coord
     * @param {Number} y - y coord
     * @param {Number} size - size of brick
     * @param {Number} lives - lives of brick
     */
    constructor(x, y, size, lives) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.center = {
            x: this.x + size / 2,
            y: this.y + size / 2
        };
        this.lives = lives || 1;
    }

    draw(ctx) {
        const padding = 3;
        ctx.save();
        ctx.fillStyle = '#f88';
        ctx.fillRect(this.x, this.y, this.size, this.size);
        ctx.fillStyle = '#c66';
        ctx.fillRect(this.x + padding, this.y + padding, this.size - 2 * padding, this.size - 2 * padding);
        ctx.font = '16px Arial';
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.fillText(this.lives, this.center.x, this.center.y + 7);
        ctx.restore();
    }

    calcNewBallAngle(ball) {
        const nextBallPos = ball.nextCoords();
        // первичная проверка
        const centerDist = distBetweenPoints(this.center, nextBallPos);
        if (centerDist > (this.size*Math.sqrt(2) / 2 + ball.radius)) {
            return false;
        }
        // основная проверка
        const katetX = Math.abs(this.center.x - nextBallPos.x);
        const katetY = Math.abs(this.center.y - nextBallPos.y);
        let lengthInsideBrick;
        if (katetX < katetY) {
            // шарик снизу/сверху
            // console.log('снизу');
            const alpha = Math.asin(katetX / centerDist);
            lengthInsideBrick = this.size / (2 * Math.cos(alpha));
        } else {
            // шарик сбоку
            // console.log('сбоку');
            lengthInsideBrick = this.size * centerDist / (2 * katetX);
        }
        const willCollide = (lengthInsideBrick + ball.radius) > centerDist;
        if (!willCollide) {
            return undefined;
        }
        if (katetX < katetY) {
            return -ball.angle;
        } else {
            return Math.PI - ball.angle;
        }
    }

    setY(newY) {
        this.y = newY;
        this.center.y = this.y + this.size / 2;
    }

    makeCollision(lifeCost = 1) {
        this.lives -= lifeCost;
    }
}

export {
    Brick
}