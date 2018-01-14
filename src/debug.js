import { calcAngle } from './geometry';
import { getRelMousePosition } from './canvas';
import { MainStage } from './stages/main';
import { GAME_SETTINGS } from './game-settings';

function onLoad() {
    const ffBtn = document.getElementById('ff');
    ffBtn.onmousedown = () => {
        game.setSpeed(GAME_SETTINGS.GAME_SPEED*10);
    }
    ffBtn.onmouseup = () => {
        game.setSpeed(GAME_SETTINGS.GAME_SPEED);
    }
    const freezeBtn = document.getElementById('freeze');
    freezeBtn.onclick = () => {
        game.currentStage.DEBUG_triggerFreeze();
    }

    document.onmousemove = (evt) => {
        const pos = getRelMousePosition(game.ctx.canvas, evt);
        document.getElementById("mouse").innerText = `${pos.x} ${pos.y}`;    
    }
}

function renderDebugWindow() {
    const game = window.game;
    const stage = game.currentStage;
    if (stage instanceof MainStage) {
        document.getElementById("ball0-x").innerText = stage.balls[0].x.toFixed(2);
        document.getElementById("ball0-y").innerText = stage.balls[0].y.toFixed(2);
        if (stage.mousePosition) {
            const angle = calcAngle(stage.base, stage.mousePosition) * 180 / Math.PI;
            document.getElementById("aimingPosition").innerText = angle.toFixed(2);
        }
    }    
}

export {
    renderDebugWindow,
    onLoad
}
