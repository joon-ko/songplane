interface Options {
    pos: Point,
    canvas: CanvasRenderingContext2D,
    audio: AudioContext,

    color?: string,
    frequency?: number,
    type?: OscillatorType
}

interface Connection {
    direction: string,
    block: Block
}

class Block {
    pos: Point
    canvas: CanvasRenderingContext2D
    audio: AudioContext
    source: OscillatorNode
    volume: GainNode

    color: string
    frequency: number
    type: OscillatorType
    connections: Connection[]

    constructor(options: Options) {
        this.color = (options.color !== undefined) ? options.color : 'pink'
        this.frequency = (options.frequency !== undefined) ? options.frequency : 440
        this.type = (options.type !== undefined) ? options.type : 'sine'
        this.connections = []

        this.pos = options.pos
        this.canvas = options.canvas
        this.audio = options.audio
        this.source = new OscillatorNode(this.audio, {
            frequency: this.frequency,
            type: this.type
        })
        this.volume = this.audio.createGain()

        this.volume.gain.value = 0
        this.source.connect(this.volume)
        this.volume.connect(this.audio.destination)
        this.source.start()
    }

    playSound(): void {
        this.volume.gain.cancelScheduledValues(audioCtx.currentTime)
        this.volume.gain.setValueCurveAtTime([0, 0.2], audioCtx.currentTime, 0.005)
        this.volume.gain.setValueCurveAtTime([0.2, 0], audioCtx.currentTime + 0.005, 0.5 - 0.005)
    }

    // draw the inside of the block
    draw(pos: Point): void {
        this.canvas.fillStyle = this.color
        this.canvas.fillRect(pos.x, pos.y, 100, 100)
        this.canvas.fillStyle = 'black'
    }

    connect(block: Block): void {
        // do some math to figure out the connection direction
        let direction: string = null
        const [toX, toY] = [block.pos.x, block.pos.y]
        const [fromX, fromY] = [this.pos.x, this.pos.y]
        if (toY < fromY) direction = 'down';
        else if (toY > fromY) direction = 'up';
        else if (toX > fromX) direction = 'right';
        else if (toX < fromX) direction = 'left';

        this.connections.push({
            direction: direction,
            block: block
        })
    }

    drawConnections(pos: Point): void {
        // draw any connections
        for (let c of this.connections) {
            switch (c.direction) {
                case 'down':
                    this._drawDownConnection(pos)
                    break
                case 'up':
                    this._drawUpConnection(pos)
                    break
                case 'right':
                    this._drawRightConnection(pos)
                    break
                case 'left':
                    this._drawLeftConnection(pos)
                    break
            }
        }
    }

    _drawDownConnection = (pos: Point): void => {
        const p1 = {x: pos.x + 35, y: pos.y + 100}
        const p2 = {x: p1.x + 30, y: p1.y}
        const p3 = {x: p2.x - 15, y: p2.y + 15}
        this._drawConnection(p1, p2, p3)
    }

    _drawUpConnection = (pos: Point): void => {
        const p1 = {x: pos.x + 35, y: pos.y}
        const p2 = {x: p1.x + 30, y: p1.y}
        const p3 = {x: p2.x - 15, y: p2.y - 15}
        this._drawConnection(p1, p2, p3)
    }

    _drawLeftConnection = (pos: Point): void => {
        const p1 = {x: pos.x, y: pos.y + 35}
        const p2 = {x: p1.x, y: p1.y + 30}
        const p3 = {x: p2.x - 15, y: p2.y - 15}
        this._drawConnection(p1, p2, p3)
    }

    _drawRightConnection = (pos: Point): void => {
        const p1 = {x: pos.x + 100, y: pos.y + 35}
        const p2 = {x: p1.x, y: p1.y + 30}
        const p3 = {x: p2.x + 15, y: p2.y - 15}
        this._drawConnection(p1, p2, p3)
    }

    _drawConnection = (p1: Point, p2: Point, p3: Point): void => {
        this.canvas.beginPath()
        this.canvas.moveTo(p1.x, p1.y)
        this.canvas.lineTo(p2.x, p2.y)
        this.canvas.lineTo(p3.x, p3.y)
        this.canvas.lineTo(p1.x, p1.y)
        this.canvas.fill()
    }
}
