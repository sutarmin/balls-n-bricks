import { GAME_SETTINGS } from "./game-settings";

class Ball {
    constructor(x, y) {
        this.x = x;
        this.y = y;

        this.speed = 0;
        this.color = GAME_SETTINGS.BALL_COLOR;
        this.radius = GAME_SETTINGS.BALL_RADIUS;
        this.state = Ball.State.WAITING;
    }

    draw(ctx) {
        ctx.save();
        ctx.beginPath();
        ctx.fillStyle = this.color;
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    setAngle(angle) {
        this.angle = angle;
    }

    setSpeed(speed) {
        this.speed = speed;
    }

    move() {
        this.x += this.speed * Math.cos(this.angle);
        this.y -= this.speed * Math.sin(this.angle);
    }

    nextCoords() {
        return {
            x: this.x + this.speed * Math.cos(this.angle),
            y: this.y - this.speed * Math.sin(this.angle),
        }
            
    }

    returnToBase(base) {
        if (this.y !== base.y) {
            this.y = base.y - this.radius;
        }
        if (GAME_SETTINGS.BALL_RETURNING_SPEED > Math.abs(base.x - this.x)) {
            this.state = Ball.State.RETURNED;
            this.x = base.x;
        } else {
            const step = GAME_SETTINGS.BALL_RETURNING_SPEED;
            const direction = Math.sign(base.x - this.x);
            this.x += direction * step;
        }
    }
}

Ball.State = {
    WAITING: 0,
    FLYING: 1,
    RETURNING: 2,
    RETURNED: 3
}

export {
    Ball
}