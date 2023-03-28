class Game {
    
    running = false
    origins
    goals
    graph = new Uint8Array()
    visited = new Uint8Array()
    pathGraph = new Uint32Array()
    path = []
    /**
     * The coord from which the best score was found from
     */
    pathFrom = []

    //

    lowestNextGenCost = Infinity

    constructor() {

        this.ID = env.newID()

        env.games[this.ID] = this
    }
    run() {
        if (!this.running) {
            this.visualize()
            return
        }

        while (this.floodGenGraph.size) {

            let nextFloodGen = new Set()
            const lowestGenCost = this.lowestNextGenCost
            this.lowestNextGenCost = Infinity

            for (const packedCoord of this.floodGenGraph) {

                const coord = unpackCoord(packedCoord)
                const coordCost = this.findCostOfCoord(coord) + this.graph[packedCoord]

                if (coordCost > lowestGenCost) {

                    nextFloodGen.add(packedCoord)
                    continue
                }

                for (const offset of adjacentOffsets) {

                    const adjCoord = {
                        x: coord.x + offset.x,
                        y: coord.y + offset.y
                    }

                    // We're outside the map

                    if (!isXYInGraph(adjCoord.x, adjCoord.y)) continue

                    const packedAdjcoord = packCoord(adjCoord)

                    const graphWeight = this.graph[packedAdjcoord]
                    if (graphWeight === 255) continue
                    
                    if (this.visited[packedAdjcoord] === 1) continue
                    this.visited[packedAdjcoord] = 1
                    
                    nextFloodGen.add(packedAdjcoord)
                    this.pathFrom[packedAdjcoord] = coord

                    const adjCoordCost = this.findCostOfCoord(adjCoord) + graphWeight
                    this.pathGraph[packedAdjcoord] = adjCoordCost

                    if (adjCoordCost < this.lowestNextGenCost) this.lowestNextGenCost = adjCoordCost
                }
            }
            
            this.floodGenGraph = nextFloodGen
            break
        }

        for (const packedCoord of this.goals) {
            
            if (!this.floodGenGraph.has(packedCoord)) continue

            // We have reached a goal, record the path

            this.path = this.findPathOfCoord(packCoord(packedCoord))
            env.pathLength = this.path.length
            this.running = false
        }

        if (!this.floodGenGraph.size) this.running = false

        this.visualize()
    }
    findCostOfCoord(coord) {

        const goalCost = findLowestCost(coord, this.goals)
        const originCost = this.findPathOfCoord(coord).length
     
        return goalCost + originCost
    }
    findPathOfCoord(coord) {

        const path = []
        path.push(coord)

        const packedCoord = packCoord(coord)
        let nextCoord = this.pathFrom[packedCoord]

        while (nextCoord) {

            path.push(nextCoord)
            nextCoord = this.pathFrom[packCoord(nextCoord)]
        }

        return path
    }
    reset() {

        this.init()
    }
}

Game.prototype.init = function() {

    this.running = true

    this.lowestNextGenCost = Infinity
    this.graph = new Uint8Array(env.graphSize * env.graphSize)
    this.visited = new Uint8Array(env.graphSize * env.graphSize)
    this.pathGraph = new Uint32Array(env.graphSize * env.graphSize)
    this.pathFrom = []
    this.path = []

    this.origins = [packXY(0, 4)]
    this.floodGenGraph = new Set(this.origins)
    for (const packedCoord of this.floodGenGraph) this.visited[packedCoord] = 1

    this.goals = new Set([packXY(10, 4)])

    for (let x = 0; x < env.graphSize; x++) {
        for (let y = 0; y < env.graphSize; y++) {

            this.graph[packXY(x, y)] = 0
        }
    }

    let coords = findCoordsInsideRect(0, 0, 2, 3)

    for (const coord of coords) {

        this.graph[packCoord(coord)] = 255
    }

    coords = findCoordsInsideRect(6, 0, 11, 3)

    for (const coord of coords) {

        this.graph[packCoord(coord)] = 255
    }

    coords = findCoordsInsideRect(0, 5, 11, 11)

    for (const coord of coords) {

        this.graph[packCoord(coord)] = 255
    }

    coords = findCoordsInsideRect(4, 1, 4, 3)

    for (const coord of coords) {

        this.graph[packCoord(coord)] = 255
    }

    coords = findCoordsInsideRect(4, 4, 4, 4)

    for (const coord of coords) {

        this.graph[packCoord(coord)] = 10
    }
}

Game.prototype.visualize = function() {

    // Draw flood values

    for (let x = 0; x < env.graphSize; x++) {
        for (let y = 0; y < env.graphSize; y++) {

            let color = `hsl(570${this.graph[packXY(x, y)] * 1.7}, 100%, 60%)`
            if (this.visited[packXY(x, y)] === 1 && this.graph[packXY(x, y)] === 0) color = 'blue'
            env.cm.fillStyle = color

            env.cm.beginPath();
            env.cm.fillRect(x * env.coordSize, y * env.coordSize, env.coordSize, env.coordSize);
            env.cm.stroke();
        }
    }

    for (let x = 0; x < env.graphSize; x++) {
        for (let y = 0; y < env.graphSize; y++) {

            const packedCoord = packXY(x, y)

            const coordFrom = this.pathFrom[packedCoord]
            if (coordFrom) {
                /* const coordFrom = unpackCoord(packedCoordFrom) */
                /* console.log(x, y, coordFrom) */
                env.cm.strokeStyle = '#ff0000';
                env.cm.beginPath();
                env.cm.moveTo(x * env.coordSize + env.coordSize * 0.5, y * env.coordSize + env.coordSize * 0.5);
                env.cm.lineTo(coordFrom.x * env.coordSize+ env.coordSize * 0.5, coordFrom.y * env.coordSize + env.coordSize * 0.5);
                env.cm.stroke();
            }

            const heuristic = this.pathGraph[packedCoord]
            if (heuristic === 0) continue

            env.cm.fillStyle = 'white'
            env.cm.font = "15px Arial";
            env.cm.textAlign = "center";
            env.cm.fillText(heuristic.toString(), x * env.coordSize + env.coordSize * 0.5, y * env.coordSize + env.coordSize * 0.75);
        }
    }

    // Draw goals

    for (const packedCoord of this.goals) {

        const coord = unpackCoord(packedCoord)

        env.cm.drawImage(document.getElementById('x'), coord.x * env.coordSize, coord.y * env.coordSize, env.coordSize, env.coordSize)
    }

    for (const coord of this.path) {

        env.cm.fillStyle = 'green'

        env.cm.beginPath();
        env.cm.fillRect(coord.x * env.coordSize, coord.y * env.coordSize, env.coordSize, env.coordSize);
        env.cm.stroke();
    }
}