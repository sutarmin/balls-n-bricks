import { renderDebugWindow } from '../debug';

import { GAME_SETTINGS } from "../game-settings";
import { getRelMousePosition } from '../canvas';
import { calcAngle, distBetweenPoints } from '../geometry';
import { Ball } from '../ball';
import { Brick } from '../brick';

class MainStage {
    constructor(ctx) {
        this.ctx = ctx;

        this.state = MainStage.States.AIMING; 
        this.speed = GAME_SETTINGS.GAME_SPEED;
        setTimeout(this.startNewGame.bind(this), 0);
    }

    setEventHandlers() {
        this.ctx.canvas.onclick = this.canvasClickHandler.bind(this);
        this.ctx.canvas.onmousemove = this.canvasMouseMoveHandler.bind(this);

    }

    startNewGame() {
        
        const { 
            BALL_RADIUS, 
            BALL_COLOR,
            BACKGROUND, 
            BALL_SPEED,
        } = GAME_SETTINGS;

        this.isFreezed = false;
        // this.ctx.canvas.height = ;
        this.field 
        this.base = {
            x: 3 * this.ctx.canvas.width / 5,
            y: this.ctx.canvas.height - 20,
        };

        this.level = 10;
        const ballsCount = this.level;

        this.balls = [];
        for (let i = 0; i < ballsCount; i++) {
            const angle = this.shootingAngle;        
            const ball = new Ball(this.base.x, this.base.y - BALL_RADIUS);
            ball.setSpeed(BALL_SPEED);
            this.balls.push(ball);
        }
        this.bricks = [];
        this.setEventHandlers();        
        this.generateBricks();
        requestAnimationFrame(this.gameLoop.bind(this));
    }

    generateBricks() {
        const ctx = this.ctx;
        const brickMargin = GAME_SETTINGS.BRICK_MARGIN;
        this.cellSize = ctx.canvas.width / GAME_SETTINGS.FIELD_WIDTH;
        const brickSize = this.cellSize - 2*brickMargin;

        ctx.save();
        ctx.strokeStyle = 'green';
        for (let j = 0; j < 8; j++) {
            for (let i = 0; i < GAME_SETTINGS.FIELD_WIDTH; i++) {
                if (Math.random() > 0.5) {
                    const lives = Math.floor(Math.random() * this.level) + 1;
                    const brick = new Brick(this.cellSize*i + brickMargin, this.cellSize*j + brickMargin, brickSize, lives); 
                    this.bricks.push(brick);
                }
            }
        }
        ctx.restore();
    }

    gameLoop() {
        if (!this.isFreezed) {
            let ticks = 0;
            while(ticks < this.speed) {
                this.gameTick();
                ticks++;
            }
        }
        renderDebugWindow();
        requestAnimationFrame(this.gameLoop.bind(this));
    }

    gameTick() {
        const { ctx, canvas } = this;
        const {
            BACKGROUND
        } = GAME_SETTINGS;
        
        this.drawBackground();
        if (GAME_SETTINGS.DEBUG) {
            this.DEBUG_drawBricksCells();               
        }
        this.drawBricks();
        this.drawBallsCount();
        switch (this.state) {
            case MainStage.States.SHOOTING:
                this.handleShooting();
                break;
            case MainStage.States.AIMING:
                this.handleAiming();
                break;
            case MainStage.States.WAITING_BRICKS:
                this.handleBricksMovement();
                break;
            default:
                throw new Error ('game state is not set');               
        }
    }

    generateNewBrickRow() {
        const brickMargin = GAME_SETTINGS.BRICK_MARGIN;
        const brickSize = this.cellSize - 2*brickMargin;
        for (let i = 0; i < GAME_SETTINGS.FIELD_WIDTH; i++) {
            if (Math.random() > 0.5) {
                const lives = Math.floor(Math.random() * this.level) + 1;
                const brick = new Brick(this.cellSize*i + brickMargin, -this.cellSize + brickMargin, brickSize, lives); 
                this.bricks.push(brick);
            }
        }
    }

    handleBricksMovement() {
        this.brickMovementTicks++;
        this.bricks.forEach(brick => {
            brick.setY(brick.y + this.cellSize / 30);
        });
        if (this.brickMovementTicks === 30) {
            this.setState(MainStage.States.AIMING);
        }
    }

    drawBallsCount() {
        let count = 0;
        this.balls.forEach((ball) => {
            if (ball.state === Ball.State.WAITING) {
                count++ ;
            }
        })
        if (count === 0) {
            return;
        }
        const ctx = this.ctx;
        ctx.save();
        ctx.font = '12px Arial';
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';

        ctx.fillText(`x${count}`, this.base.x, this.base.y + 12);
        ctx.restore();
        ctx.restore();
    }

    drawBackground() {
        const ctx = this.ctx;
        const canvas = this.ctx.canvas;
        ctx.save();
        ctx.fillStyle = GAME_SETTINGS.BACKGROUND;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.strokeStyle = '#fff';
        ctx.beginPath();
        ctx.moveTo(0, this.base.y);
        ctx.lineTo(canvas.width, this.base.y);
        ctx.stroke();
        ctx.closePath();
        ctx.restore();
    }

    DEBUG_drawBricksCells() {
        const ctx = this.ctx;
        const brickPadding = 2;
        const cellSize = ctx.canvas.width / GAME_SETTINGS.FIELD_WIDTH;
        const brickSize = cellSize - 2*brickPadding;

        ctx.save();
        ctx.strokeStyle = 'green';
        for (let j = 0; j < 8; j++) {
            for (let i = 0; i < GAME_SETTINGS.FIELD_WIDTH; i++) {
                ctx.strokeRect(cellSize*i + brickPadding, cellSize*j + brickPadding, brickSize, brickSize); 

            }
        }
        ctx.restore();
    }

    DEBUG_triggerFreeze() {
        this.isFreezed = !this.isFreezed;
    }

    drawBricks() {
        for(const brick of this.bricks) {
            brick.draw(this.ctx);
        }
    }

    canvasClickHandler(e) {
        switch (this.state) {
            case MainStage.States.AIMING:
                this.setShootingAngleToPoint(
                    getRelMousePosition(this.ctx.canvas, e)
                );
                break;
            default:
                console.log('mouse click has no handling for game state ' + this.state);
        }
    }

    canvasMouseMoveHandler(e) {
        const mouseCoords = getRelMousePosition(this.ctx.canvas, e);
        this.mousePosition = mouseCoords;
    }

    setState(state) {
        switch (state) {
            case MainStage.States.AIMING:
                break;
            case MainStage.States.SHOOTING:
                this.balls.forEach(ball => {
                    ball.state = Ball.State.WAITING;
                });
                this.balls[0].state = Ball.State.FLYING;
                this.ticksFromLastShootedBall = 0;
                break;
            case MainStage.States.WAITING_BRICKS:
                this.shootingAngle = void 0;
                this.base = this.nextBase;
                this.nextBase = void 0;
                this.brickMovementTicks = 0;
                this.generateNewBrickRow();                
                break;
            default:
                throw new Error("no handlers for state " + state);
        }
        this.state = state;
    }
    
    handleShooting() {
        this.ticksFromLastShootedBall++ ;
        this.checkBorderCollisions();
        this.checkBricksCollisions();
        this.checkReturnedBalls();
        this.balls.forEach((ball, index, balls) => {
            switch (ball.state) {
                case Ball.State.RETURNING:
                    if (this.nextBase === void 0) {
                        this.nextBase = {
                            x: ball.x,
                            y: this.base.y
                        };
                    }
                    ball.returnToBase(this.nextBase);
                    break;
                case Ball.State.FLYING:
                    ball.move();
                    break;
                case Ball.State.WAITING:
                    if (this.ticksFromLastShootedBall > GAME_SETTINGS.TICKS_BETWEEN_BALLS) {
                        ball.state = Ball.State.FLYING;
                        this.ticksFromLastShootedBall = 0;
                    }
                    break;
                case Ball.State.RETURNED:
                    break;
                default:
                    throw new Error ('ball state is not set');
            }
            ball.draw(this.ctx);
        });
        if (this.balls.every(ball => ball.state === Ball.State.RETURNED)) {
            this.balls.forEach(ball => ball.state = Ball.State.WAITING);
            this.setState(MainStage.States.WAITING_BRICKS);
        }
    }

    handleAiming() {
        if (this.shootingAngle === void 0) {
            this.balls.forEach(ball => {
                ball.draw(this.ctx);
            });
            if (this.mousePosition) {
                const angle = calcAngle({
                    x: this.base.x,
                    y: this.base.y - GAME_SETTINGS.BALL_RADIUS
                }, this.mousePosition);
                const degreeAngle = angle * 180 / Math.PI;
                if (degreeAngle < 180 - GAME_SETTINGS.AIM_MIN_ANGLE_IN_DEGREES
                    && degreeAngle > GAME_SETTINGS.AIM_MIN_ANGLE_IN_DEGREES) {
                    this.drawAim(this.mousePosition); 
                }
            }
        } else {
            this.balls.forEach(ball => {
                ball.setAngle(this.shootingAngle);
                ball.draw(this.ctx);
            });       
            this.setState(MainStage.States.SHOOTING);
        }
        
    }

    checkBorderCollisions() {
        const width = this.ctx.canvas.width;
        const height = this.base.y;
        this.balls.forEach(ball => {
            
            if (ball.x - ball.radius < 0 || 
                ball.x + ball.radius > width) {
                ball.setAngle(Math.PI - ball.angle);
            }
            if (ball.y - ball.radius < 0 || 
                ball.y + ball.radius > height) {
                ball.setAngle(-ball.angle);
            } 
        });
    }

    checkBricksCollisions() {
        const removeIndices = [];
        this.bricks.forEach((brick, brickIndex) => {
            this.balls.forEach((ball, ballIndex) => {
                const newBallAngle = brick.calcNewBallAngle(ball);
                if (newBallAngle === undefined) {
                    return;
                }
                if (newBallAngle) {
                    brick.makeCollision(1);
                    if (brick.lives === 0) {
                        this.bricks.splice(brickIndex, 1);
                    }            
                    ball.setAngle(newBallAngle);
                }
            });
        });
        for (let index of removeIndices) {
        }
    }

    checkReturnedBalls() {
        const width = this.ctx.canvas.width;
        const height = this.base.y;
        this.balls.forEach(ball => {
            const nextBallCoords = ball.nextCoords();
            if (ball.state === Ball.State.FLYING && 
                nextBallCoords.y + ball.radius > height) {
                ball.state = Ball.State.RETURNING;
                ball.y = height - ball.radius;                
            }
        });
    }

    setSpeed(newSpeed) {
        this.speed = newSpeed;
    }

    drawAim(toPoint) {

        const { ctx, base } = this;
        ctx.save();
        ctx.strokeStyle = '#fff';
        ctx.beginPath();
        ctx.moveTo(base.x, base.y - GAME_SETTINGS.BALL_RADIUS);
        ctx.lineTo(toPoint.x, toPoint.y);
        ctx.stroke();
        ctx.restore();
    }

    setShootingAngleToPoint(point) {
        const angle = calcAngle(this.base, point);
        this.shootingAngle = angle;
    }

}

MainStage.States = {
    AIMING: 0,
    SHOOTING: 1,
    WAITING_BRICKS: 2
}

export {
    MainStage
}