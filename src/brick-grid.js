import { Brick } from './brick';

export class BrickGrid {
    constructor(ctx, width, brickSize) {
        this.ctx = ctx;
        this.width = width;
        this.brickSize = brickSize;
        this.bricks = [];
    }

    addRow(num) {
        const newRow = [];
        const brick = new Brick(0, 0, this.brickSize);
        this.bricks.unshift(newRow);
    }
}