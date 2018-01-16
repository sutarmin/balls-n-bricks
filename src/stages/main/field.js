import { GAME_SETTINGS } from 'game-settings';
import { getRelMousePosition } from 'canvas';
import { calcAngle, distBetweenPoints } from 'geometry';

import { Ball } from "ball";
import { Brick } from "brick";

class Field {
    constructor(ctx, position, initState = {}) {
        this.ctx = ctx;
        this.position = {
            top: position.top || 0,
            bottom: position.bottom || ctx.canvas.height,
            left: position.left || 0,
            right: position.right || ctx.canvas.width
        }
        if (this.position.bottom < 0) {
            this.position.bottom = ctx.canvas.height + this.position.bottom;
        }
        if (this.position.right < 0) {
            this.position.right = ctx.canvas.width + this.position.right;
        }
        this.width = this.position.right - this.position.left;
        this.height = this.position.bottom - this.position.top;
        const defaultState = {
            level: 10,
        };
        this.state = Object.assign({}, defaultState, initState);
        this.action = Field.Actions.AIMING; 

        const { 
            BALL_RADIUS, 
            BALL_COLOR,
            BACKGROUND, 
            BALL_SPEED,
        } = GAME_SETTINGS;

        this.base = {
            x: this.width / 2,
            y: this.position.bottom,
        };

        const ballsCount = this.state.level;
        this.balls = [];
        for (let i = 0; i < ballsCount; i++) {      
            const ball = new Ball(this.base.x, this.base.y - BALL_RADIUS);
            ball.setSpeed(BALL_SPEED);
            this.balls.push(ball);
        }
        this.bricks = [];
        this.setEventHandlers();        
        this.generateBricks();
    }

    tick() {
        const {
            BACKGROUND
        } = GAME_SETTINGS;
        
        this.drawBackground();
        if (GAME_SETTINGS.DEBUG) {
            this.DEBUG_drawBricksCells();               
        }
        this.drawBricks();
        this.drawBallsCount();
        switch (this.action) {
            case Field.Actions.SHOOTING:
                this.handleShooting();
                break;
            case Field.Actions.AIMING:
                this.handleAiming();
                break;
            case Field.Actions.WAITING_BRICKS:
                this.handleBricksMovement();
                break;
            default:
                throw new Error ('game state is not set');               
        }
    }

    setAction(action) {
        switch (action) {
            case Field.Actions.AIMING:
                break;
            case Field.Actions.SHOOTING:
                this.balls.forEach(ball => {
                    ball.state = Ball.State.WAITING;
                });
                this.balls[0].state = Ball.State.FLYING;
                this.ticksFromLastShootedBall = 0;
                break;
            case Field.Actions.WAITING_BRICKS:
                this.shootingAngle = void 0;
                this.base = this.nextBase;
                this.nextBase = void 0;
                this.brickMovementTicks = 0;
                this.generateNewBrickRow();                
                break;
            default:
                throw new Error("no handlers for state " + action);
        }
        this.action = action;
    }

    //#region event handling funcitions
    
    setEventHandlers() {
        this.ctx.canvas.onclick = this.canvasClickHandler.bind(this);
        this.ctx.canvas.onmousemove = this.canvasMouseMoveHandler.bind(this);
    }

    canvasClickHandler(e) {
        switch (this.action) {
            case Field.Actions.AIMING:
                this.setShootingAngleToPoint(
                    getRelMousePosition(this.ctx.canvas, e)
                );
                break;
            default:
                console.log('mouse click has no handling for game state ' + this.action);
        }
    }

    canvasMouseMoveHandler(e) {
        const mouseCoords = getRelMousePosition(this.ctx.canvas, e);
        this.mousePosition = mouseCoords;
    }
    //#endregion

    //#region bricks generation

    generateBricks() {
        const ctx = this.ctx;
        const brickMargin = GAME_SETTINGS.BRICK_MARGIN;
        this.cellSize = this.width / GAME_SETTINGS.FIELD_WIDTH;
        const brickSize = this.cellSize - 2 * brickMargin;

        ctx.save();
        ctx.strokeStyle = 'green';
        for (let j = 0; j < 8; j++) {
            for (let i = 0; i < GAME_SETTINGS.FIELD_WIDTH; i++) {
                if (Math.random() > 0.5) {
                    const lives = Math.floor(Math.random() * this.state.level) + 1;
                    const brick = new Brick(this.position.left + this.cellSize*i + brickMargin,
                                            this.position.top + this.cellSize*j + brickMargin, 
                                            brickSize, 
                                            lives); 
                    this.bricks.push(brick);
                }
            }
        }
        ctx.restore();
    }

    generateNewBrickRow() {
        const brickMargin = GAME_SETTINGS.BRICK_MARGIN;
        const brickSize = this.cellSize - 2*brickMargin;
        for (let i = 0; i < GAME_SETTINGS.FIELD_WIDTH; i++) {
            if (Math.random() > 0.5) {
                const lives = Math.floor(Math.random() * this.state.level) + 1;
                const brick = new Brick(this.position.left + this.cellSize*i + brickMargin, 
                                        this.position.top - this.cellSize + brickMargin, 
                                        brickSize, 
                                        lives); 
                this.bricks.push(brick);
            }
        }
    }
    //#endregion

    //#region drawing functions

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
        ctx.moveTo(this.position.left, this.position.bottom);
        ctx.lineTo(this.position.right, this.position.bottom);
        ctx.stroke();
        ctx.closePath();

        ctx.beginPath();
        ctx.moveTo(this.position.left, this.position.top);
        ctx.lineTo(this.position.right, this.position.top);
        ctx.stroke();
        ctx.closePath();
        ctx.restore();
    }

    drawBricks() {
        for(const brick of this.bricks) {
            brick.draw(this.ctx);
        }
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
    
    //#endregion

    //#region debug functions

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
    //#endregion
    
    //#region actions handlers

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
            this.setAction(Field.Actions.WAITING_BRICKS);
        }
    }

    handleAiming() {
        if (this.shootingAngle === undefined) {
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
            this.setAction(Field.Actions.SHOOTING);
        }
        
    }

    handleBricksMovement() {
        this.brickMovementTicks++;
        this.bricks.forEach(brick => {
            brick.setY(brick.y + this.cellSize / 30);
        });
        if (this.brickMovementTicks === 30) {
            this.setAction(Field.Actions.AIMING);
        }
    }

    //#endregion

    //#region checker functions

    checkBorderCollisions() {
        const width = this.width;
        const height = this.base.y;
        this.balls.forEach(ball => {
            
            if (ball.x - ball.radius < this.position.left || 
                ball.x + ball.radius > this.position.right) {
                ball.setAngle(Math.PI - ball.angle);
            }
            if (ball.y - ball.radius < this.position.top || 
                ball.y + ball.radius > this.position.bottom) {
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
        const width = this.width;
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

    //#endregion

    // other functions

    setShootingAngleToPoint(point) {
        const angle = calcAngle(this.base, point);
        this.shootingAngle = angle;
    }

}

Field.Actions = {
    AIMING: 0,
    SHOOTING: 1,
    WAITING_BRICKS: 2
}

export {
    Field
}