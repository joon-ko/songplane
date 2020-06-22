interface Options {
    canvas: CanvasRenderingContext2D,
    audio: AudioContext,

    color?: string,
    frequency?: number,
    type?: OscillatorType
}

class Block {
    canvas: CanvasRenderingContext2D
    audio: AudioContext
    source: OscillatorNode
    volume: GainNode

    color: string
    frequency: number
    type: OscillatorType

    constructor(options: Options) {
        this.color = (options.color !== undefined) ? options.color : 'pink'
        this.frequency = (options.frequency !== undefined) ? options.frequency : 440
        this.type = (options.type !== undefined) ? options.type : 'sine'

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
}
