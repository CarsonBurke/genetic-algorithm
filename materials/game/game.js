class Game {
    
    running = false
    graph = new Uint8Array()
    /**
     * { 
     * score: number,
     * coords: { x: number, y: number },
     * }[]
     */
    generations = []

    constructor() {

        this.ID = env.newID()

        env.games[this.ID] = this
    }
    run() {
        if (!this.running) {
            this.visualize()
            return
        }

        const usedCoords = new Set()
        let totalCost = 0

        for (let i = 0; i < env.searchCount; i++) {

            while (true) {

                const packedCoord = Math.floor(Math.random() * env.graphLength)
                if (usedCoords[packedCoord]) continue

                usedCoords.add(packedCoord)
                break
            }
            const coord = unpackCoord(packedCoord)

            totalCost += this.findCostOfCoord(coord)
        }

        this.visualize()
    }
    findCostOfCoord(coord) {

        let totalCost = 0
        const visited = new Uint8Array(env.graphLength)
        let thisGeneration = [coord]
        let costAdd = 1
        
        while (thisGeneration.length) {
            nextGeneration = []

            for (const coord of thisGeneration) {

                forAdjacentCoords(coord, adjCoord => {
                    const packedCoord = packCoord(adjCoord)

                    if (visited[packedCoord] !== 0) return
                    visited[packedCoord] = 1

                    nextGeneration.push(coord)
                    totalCost += costAdd
                })
            }

            thisGeneration = nextGeneration
            costAdd += 1
        }

        return totalCost
    }
    reset() {

        this.init()
    }
}

Game.prototype.init = function() {

    this.running = true

    this.graph = new Uint8Array(env.graphSize * env.graphSize)

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
/* 
    for (let x = 0; x < env.graphSize; x++) {
        for (let y = 0; y < env.graphSize; y++) {

            const packedCoord = packXY(x, y)

            const coordFrom = this.pathFrom[packedCoord]
            if (coordFrom) {

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
     */
}