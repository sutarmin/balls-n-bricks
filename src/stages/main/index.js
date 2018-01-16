import { renderDebugWindow } from 'debug';

import { GAME_SETTINGS } from "game-settings";
import { getRelMousePosition } from 'canvas';
import { Ball } from 'ball';
import { Brick } from 'brick';

import { Field } from './field';

class MainStage {
    constructor(ctx) {
        this.ctx = ctx;

        const fieldPosition = {
            top: 0,
            bottom: -30,
            // left: 40,
            // right: -40,
        }
        this.field = new Field(ctx, fieldPosition);
        this.isFreezed = false;
        this.speed = GAME_SETTINGS.GAME_SPEED;

        setTimeout(this.gameLoop.bind(this), 0);
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
        this.field.tick();
    }

    setSpeed(newSpeed) {
        this.speed = newSpeed;
    }

}

export {
    MainStage
}