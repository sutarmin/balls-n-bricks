function calcAngle(point1, point2) {
    const angle = Math.atan2(
        point1.y - point2.y,
        Math.abs(point1.x - point2.x)
    );
    return point1.x > point2.x ?
        Math.PI - angle : angle;
}

function distBetweenPoints(point1, point2) {
    return Math.sqrt(
        (point1.x - point2.x) ** 2 + 
        (point1.y - point2.y) ** 2
    );
}

export {
    calcAngle,
    distBetweenPoints
}