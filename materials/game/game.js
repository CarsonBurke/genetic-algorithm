class Game {
    
    running = false
    graph = new Uint8Array()
    costs = new Uint32Array()
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

        if (this.generations.length < env.generationsQuota) this.initGeneration()
        else this.mutateGenerations()

        this.visualize()
    }
    initGeneration() {

        this.costs = new Uint32Array()
        const usedCoords = new Set()
        let totalCost = 0

        for (let i = 0; i < env.searchCount; i++) {

            let packedCoord
            while (true) {

                packedCoord = Math.floor(Math.random() * env.graphLength)
                if (usedCoords[packedCoord]) continue

                usedCoords.add(packedCoord)
                break
            }
            const coord = unpackCoord(packedCoord)

            totalCost += this.findCostOfCoord(coord)
        }

        console.log(usedCoords)
        console.log(totalCost)
        console.log('')

        this.generations.push({
            totalCost: totalCost,
            coords: Array.from(usedCoords).map(packedCoord => unpackCoord(packedCoord)),
            costMap: this.costs,
        })
    }
    findCostOfCoord(coord) {

        let totalCost = 0
        const visited = new Uint8Array(env.graphLength)
        let thisGeneration = [coord]
        let costAdd = 1
        
        while (thisGeneration.length) {
            let nextGeneration = []

            for (const coord of thisGeneration) {

                forAdjacentCoords(coord, adjCoord => {
                    const packedCoord = packCoord(adjCoord)

                    if (visited[packedCoord] !== 0) return
                    visited[packedCoord] = 1

                    nextGeneration.push(adjCoord)
                    totalCost += costAdd
                    this.costs[packedCoord] += costAdd
                })
            }

            thisGeneration = nextGeneration
            costAdd += 1
        }

        return totalCost
    }
    mutateGenerations() {

        for (const generation of this.generations) {

            this.costs = new Uint32Array(env.graphLength)
            const usedCoords = new Set(generation.coords.map(coord => packCoord(coord)))
            const newCoords = []
            let newTotalCost = 0

            for (const coord of generation.coords) {

                const packedCoord = packCoord(coord)

                // 50% chance to not mutate

                if (randomBool()) {

                    usedCoords.add(packedCoord)
                    newCoords.push(coord)
    
                    const newCost = this.findCostOfCoord(coord)
                    newTotalCost += newCost
                    continue
                }

                const newCoord = randomOffsetFor(coord)

                const packedNewCoord = packCoord(newCoord)
                if (usedCoords.has(packedNewCoord)) {

                    usedCoords.add(packedCoord)
                    newCoords.push(coord)
    
                    const newCost = this.findCostOfCoord(coord)
                    newTotalCost += newCost
                    continue
                }
                
                usedCoords.add(packedNewCoord)
                usedCoords.delete(packCoord(coord))
                newCoords.push(newCoord)

                const newCost = this.findCostOfCoord(newCoord)
                newTotalCost += newCost
            }

            generation.costs = new Uint32Array(this.costs)
            generation.coords = newCoords
            generation.totalCost = newTotalCost
        }

        console.log('end')
    }
    cloneGeneration() {

        
    }
    reset() {

        this.init()
    }
}

Game.prototype.init = function() {

    this.running = true

    this.graph = new Uint8Array(env.graphLength)
}

Game.prototype.visualize = function() {

    // Draw flood values
/* 
    for (let x = 0; x < env.graphSize; x++) {
        for (let y = 0; y < env.graphSize; y++) {

            let color = `hsl(${this.graph[packXY(x, y)]}, 100%, 60%)`
            env.cm.fillStyle = color

            env.cm.beginPath();
            env.cm.fillRect(x * env.coordSize, y * env.coordSize, env.coordSize, env.coordSize);
            env.cm.stroke();
        }
    }
 */
    const bestGeneration = this.generations.reduce((bestGen, gen) => gen.score > bestGen.score ? max : gen)

    for (const coord of bestGeneration.coords) {

        let color = `black`
        env.cm.fillStyle = color

        env.cm.beginPath();
        env.cm.fillRect(coord.x * env.coordSize, coord.y * env.coordSize, env.coordSize, env.coordSize);
        env.cm.stroke();
    }

    for (let x = 0; x < env.graphSize; x++) {
        for (let y = 0; y < env.graphSize; y++) {

            env.cm.fillStyle = 'white'
            env.cm.font = "10px Arial";
            env.cm.textAlign = "center";
            env.cm.fillText(this.costs[packXY(x, y)], x * env.coordSize + env.coordSize * 0.5, y * env.coordSize + env.coordSize * 0.75);
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