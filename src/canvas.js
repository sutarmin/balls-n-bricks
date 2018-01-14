function getRelMousePosition(canvas, evt) {
    return {
        x: evt.pageX - canvas.offsetLeft,
        y: evt.pageY - canvas.offsetTop
    }
}

export {
    getRelMousePosition
}