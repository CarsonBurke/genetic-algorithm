class Env {
    constructor() {

        this.gamesAmount = 1
        this.games = {}
        this.graphSize = 11
        this.coordSize = 20
        this.IDIndex = 0
        this.width = this.graphSize * this.coordSize
        this.height = this.graphSize * this.coordSize
        this.lastReset = 0

        this.tick = 0
        this.roundTick = 0
        this.speed = 1
        this.pathLength = 'unknown'

        this.stats = [
            'tick',
            'roundTick',
            'speed',
            'pathLength',
        ]
    }
}

const env = new Env()

Env.prototype.init = function() {

    // Get the existing canvas environment

    env.canvas = document.getElementsByClassName('env')[0]

    // Style canvas

    env.canvas.width = env.width
    env.canvas.height = env.height

    // Create canvas manager by configuring canvas context

    env.cm = env.canvas.getContext('2d')

    // Turn off anti-aliasing

    env.cm.imageSmoothingEnabled = true

    env.initGames()
}

Env.prototype.initGames = function() {

    //

    for (let i = 0; i < env.gamesAmount; i++) {

        const game = new Game()
        game.init()
    }
}

Env.prototype.newID = function() {

    return env.IDIndex++
}

Env.prototype.run = function() {

    env.tick += 1
    env.roundTick += 1

    for (const statType of env.stats) {

        document.getElementById(statType).innerText = env[statType]
    }

    // Store the current transformation matrix

    env.cm.save()

    // Use the identity matrix while clearing the canvas

    env.cm.setTransform(1, 0, 0, 1, 0, 0)
    env.cm.clearRect(0, 0, env.width, env.height)

    //

    // Restore the transform

    env.cm.restore()

    let runningGames = 0

    for (const gameID in env.games) {

        const game = env.games[gameID]
        if (game.running) runningGames += 1

        game.run()
    }

    //

    if (!runningGames) {

        env.reset()
    }
}

Env.prototype.reset = function() {

    env.lastReset = env.tick
    env.roundTick = 0
    env.generation += 1

    for (const gameID in env.games) {

        const game = env.games[gameID]

        game.reset()
        game.init()
    }
}