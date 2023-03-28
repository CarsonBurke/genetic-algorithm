function packCoord(coord) {

    return coord.x * env.graphSize + coord.y
}

function packXY(x, y) {

    return x * env.graphSize + y
}

function unpackCoord(packedCoord) {

    return {
        x: Math.floor(packedCoord / env.graphSize),
        y: Math.floor(packedCoord % env.graphSize),
    }
}

/**
 * Takes a rectange and returns the positions inside of it in an array
 */
function findCoordsInsideRect(x1, y1, x2, y2) {
    const positions = []

    for (let x = x1; x <= x2; x += 1) {
        for (let y = y1; y <= y2; y += 1) {
            // Iterate if the pos doesn't map onto a room

            if (x < 0 || x >= env.graphSize || y < 0 || y >= env.graphSize) continue

            // Otherwise pass the x and y to positions

            positions.push({ x, y })
        }
    }

    return positions
}

function isXYInGraph(x, y) {

    return x >= 0 && x < env.graphSize && y >= 0 && y < env.graphSize
}

/**
 * Gets the range between two positions' x and y (Half Manhattan)
 * @param x1 the first position's x
 * @param y1 the first position's y
 * @param x2 the second position's x
 * @param y2 the second position's y
 */
 function getRange(x1, x2, y1, y2) {
    // Find the range using Chebyshev's formula

    return Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1))
}

function getRangeOfCoords(coord1, coord2) {
    return getRange(coord1.x, coord2.x, coord1.y, coord2.y)
}

function findLowestCost(origin, iter) {

    let lowestCost = Infinity

    for (const packedCoord of iter) {
        
        const goal = unpackCoord(packedCoord)
        const cost = getRangeOfCoords(origin, goal)
        if (cost >= lowestCost) continue

        lowestCost = cost
    }

    return lowestCost
}