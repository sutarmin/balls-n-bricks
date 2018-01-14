import { MainStage } from './stages/main'

class Game {
    constructor(canvas) {
        if (!canvas.getContext) {
            console.log('canvas not supported');
        }
        this.ctx = canvas.getContext('2d');
        
        this.setStage(MainStage);        
    }

    setStage(Stage) {
        this.currentStage = new Stage(this.ctx);
    }

    setSpeed(newSpeed) {
        this.currentStage.setSpeed(newSpeed);
    }
}

Game.State = {
    AIMING: 0,
    SHOOTING: 1
}

export {
    Game
}