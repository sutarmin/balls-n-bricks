/*
    TODO: bricks
    TODO: moving aim
    TODO: aim to end of field
    TODO: расстояние между шариками зависит от угла запуска :(
*/

import { Game } from './game';
import { onLoad } from './debug';

window.onload = function () {
    const canvas = document.getElementById('game');
    window.game = new Game(canvas);
    onLoad();
}
