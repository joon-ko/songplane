const canvas = <HTMLCanvasElement> document.getElementById('canvas')
const ctx = <CanvasRenderingContext2D> canvas.getContext('2d')
const info = <HTMLElement> document.getElementById('info')

const FONT_SIZE = 20
const CAMERA_SPEED = 5 // px/frame

interface Point {
    x: number,
    y: number
}

interface Size {
    w: number, // width
    h: number  // height
}

interface Block {
    color: string,
    source: OscillatorNode,
    gain: GainNode,
    pitch?: number
}

let blocks: Map<string, Block> = new Map()
let audioCtx: AudioContext = null
let audioStarted = false

let camera: Point = {x: 0, y: 0}
let canvasCenter: Point
let magnitude: Size

let holdPoint: Point = null
let oldCamera: Point = null
let selected: Point = {x: 0, y: 0}

let holdSpace = false
let holdLeft = false
let holdRight = false
let holdDown = false
let holdUp = false

///////////////////////////////////////////////////////////////////////////////

const resizeCanvas = (): void => {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    canvasCenter = {
        x: Math.round(window.innerWidth/2),
        y: Math.round(window.innerHeight/2)
    }
    const maxBlocks = [
        Math.ceil(window.innerWidth/100),
        Math.ceil(window.innerHeight/100)
    ]
    magnitude = {
        w: (maxBlocks[0] + (maxBlocks[0] % 2 === 0 ? 0 : 1)) / 2,
        h: (maxBlocks[1] + (maxBlocks[1] % 2 === 0 ? 0 : 1)) / 2
    }
    ctx.strokeStyle = 'black'
    ctx.font = `${FONT_SIZE}px sans-serif`
}
resizeCanvas()
window.addEventListener('resize', resizeCanvas)

///////////////////////////////////////////////////////////////////////////////

/* Gets the cursor position on the given canvas. */
const getCursorPosition = (e: MouseEvent): Point => {
    const rect = canvas.getBoundingClientRect();
    return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
    }
}

const getBlockFromCursor = (cursor: Point): Point => {
    const canvasCorner = { // top left corner of canvas, in 'real' coords
        x: camera.x - canvasCenter.x,
        y: camera.y + canvasCenter.y
    }
    const realPoint = {
        x: canvasCorner.x + cursor.x,
        y: canvasCorner.y - cursor.y
    }
    return {
        x: Math.floor((realPoint.x + 50) / 100),
        y: Math.floor((realPoint.y + 50) / 100)
    }
}

const initializeBlock = (block: Block): void => {
    block.gain.gain.value = 0
    block.source.connect(block.gain)
    block.gain.connect(audioCtx.destination)
    block.source.start()
}

const playSound = (block: Block): void => {
    block.gain.gain.cancelScheduledValues(audioCtx.currentTime)
    block.gain.gain.setValueCurveAtTime([0, 0.2], audioCtx.currentTime, 0.005)
    block.gain.gain.setValueCurveAtTime([0.2, 0], audioCtx.currentTime + 0.005, 0.5 - 0.005)
}

const onMousedown = (e: MouseEvent): void => {
    // start the audio context on the first click
    if (!audioStarted) {
        audioCtx = new AudioContext()
        audioStarted = true
    }

    // if spacebar is held, start dragging the camera view
    if (holdSpace) {
        holdPoint = getCursorPosition(e)
        oldCamera = camera
        return
    }

    // if just a normal click, select the clicked block
    const cursor = getCursorPosition(e)
    selected = getBlockFromCursor(cursor)
}

const onMousemove = (e: MouseEvent): void => {
    if (holdPoint === null) {
        return
    }
    const cursor = getCursorPosition(e)
    const diff: Size = {
        w: cursor.x - holdPoint.x,
        h: -1 * (cursor.y - holdPoint.y)
    }
    camera = {x: oldCamera.x - diff.w, y: oldCamera.y - diff.h}
}

const onMouseup = (e: MouseEvent): void => {
    if (!holdSpace) {
        return
    }
    holdPoint = null
    oldCamera = null
}

const onKeyDown = (e: KeyboardEvent): void => {
    // start the audio context on the first keydown
    if (!audioStarted) {
        audioCtx = new AudioContext()
        audioStarted = true
    }

    let key: string
    let block: Block
    switch (e.keyCode) {
        case 81: // Q
            key = `${selected.x},${selected.y}`
            block = {
                color: '#c6e1ff', // light blue
                source: new OscillatorNode(audioCtx, {
                    frequency: 220,
                    type: "triangle"
                }),
                gain: audioCtx.createGain()
            }
            initializeBlock(block)
            blocks.set(key, block)
            break
        case 87: // W
            key = `${selected.x},${selected.y}`
            block = {
                color: '#ffe29f', // light orange
                source: new OscillatorNode(audioCtx, {
                    frequency: 440,
                    type: "sine"
                }),
                gain: audioCtx.createGain()
            }
            initializeBlock(block)
            blocks.set(key, block)
            break
        case 13: // Enter
            key = `${selected.x},${selected.y}`
            if (!blocks.has(key)) {
                return
            }
            block = blocks.get(key)
            playSound(block)
            break
        case 32:
            holdSpace = true
            break
        case 37:
            holdLeft = true
            break
        case 38:
            holdUp = true
            break
        case 39:
            holdRight = true
            break
        case 40:
            holdDown = true
            break
    }
}

const onKeyUp = (e: KeyboardEvent): void => {
    switch (e.keyCode) {
        case 32:
            holdSpace = false
            break
        case 37:
            holdLeft = false
            break
        case 38:
            holdUp = false
            break
        case 39:
            holdRight = false
            break
        case 40:
            holdDown = false
            break
    }
}

canvas.addEventListener('mousedown', onMousedown)
canvas.addEventListener('mousemove', onMousemove)
canvas.addEventListener('mouseup', onMouseup)
document.addEventListener('keydown', onKeyDown)
document.addEventListener('keyup', onKeyUp)

///////////////////////////////////////////////////////////////////////////////

// converts a block coordinate into the position on the canvas from which it should be drawn.
const blockToCanvasPos = (i: number, j: number): Point => {
    let center: Point = {x: 100*i, y: 100*j}
    let vector: Size = {
        w: center.x - 50 - camera.x,
        h: center.y + 50 - camera.y
    }
    return {
        x: canvasCenter.x + vector.w,
        y: canvasCenter.y - vector.h
    }
}

const drawBorders = (pos: Point, i: number, j: number): void => {
    ctx.strokeRect(pos.x, pos.y, 100, 100)
    ctx.strokeStyle = 'black'
    ctx.lineWidth = 1.0

    const text = `(${i}, ${j})`
    const textWidth = ctx.measureText(text).width
    const realTextPos = [
        pos.x + 50 - (textWidth/2),
        pos.y + 50
    ]
    ctx.fillText(text, realTextPos[0], realTextPos[1])
}

const drawBlock = (pos: Point, block: Block): void => {
    ctx.fillStyle = block.color
    ctx.fillRect(pos.x, pos.y, 100, 100)
    ctx.fillStyle = 'black'
}

const drawSelectedBorder = (pos: Point): void => {
    ctx.strokeStyle = 'rgb(186, 255, 184)'
    ctx.lineWidth = 5.0
    ctx.strokeRect(pos.x, pos.y, 100, 100)
    ctx.strokeStyle = 'black'
    ctx.lineWidth = 1.0
}

const draw = (): void => {
    // draw existing blocks first
    for (let key of blocks.keys()) {
        const pos = key.split(',').map(Number)
        const canvasPos = blockToCanvasPos(pos[0], pos[1])
        drawBlock(canvasPos, blocks.get(key))
    }

    // then fill in with borders, info
    const cameraBlock: Point = {
        x: Math.floor((camera.x + 50) / 100),
        y: Math.floor((camera.y + 50) / 100)
    }
    const [lowX, highX] = [cameraBlock.x - magnitude.w, cameraBlock.x + magnitude.w]
    const [lowY, highY] = [cameraBlock.y - magnitude.h, cameraBlock.y + magnitude.h]
    for (let i = lowX; i <= highX; i++) {
        for (let j = lowY; j <= highY; j++) {
            const canvasPos = blockToCanvasPos(i, j)
            drawBorders(canvasPos, i, j)
        }
    }

    // redraw the border around the selected block
    const canvasPos = blockToCanvasPos(selected.x, selected.y)
    drawSelectedBorder(canvasPos)
}

const moveCamera = (): void => {
    let cameraSpeed = [0, 0]
    if (holdLeft) {
        cameraSpeed[0] -= CAMERA_SPEED
    }
    if (holdUp) {
        cameraSpeed[1] += CAMERA_SPEED
    }
    if (holdRight) {
        cameraSpeed[0] += CAMERA_SPEED
    }
    if (holdDown) {
        cameraSpeed[1] -= CAMERA_SPEED
    }
    camera.x += cameraSpeed[0]
    camera.y += cameraSpeed[1]
}

const renderInfo = (): void => {
    let key = `${selected.x},${selected.y}`
    const colorText = blocks.has(key) ? blocks.get(key).color : ''
    info.innerHTML = `
        <div>selected: (${selected.x}, ${selected.y})</div>
        <div>color: ${colorText}</div>
    `
}

window.setInterval(() => {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    draw()
    moveCamera()
    renderInfo()
}, 1000/60)
