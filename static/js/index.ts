const canvas = <HTMLCanvasElement> document.getElementById('canvas')
const ctx = <CanvasRenderingContext2D> canvas.getContext('2d')
const info = <HTMLElement> document.getElementById('info')

const FONT_SIZE = 14
const CAMERA_SPEED = 5 // px/frame

const LIGHT_BLUE = '#c6e1ff'
const LIGHT_ORANGE = '#ffe29f'
const LIGHT_GREEN = 'rgb(186, 255, 184)'
const LIGHT_PURPLE = 'rgb(208, 144, 248)'

interface Point {
    x: number,
    y: number
}

interface Size {
    w: number, // width
    h: number  // height
}

interface SongMarker {
    pos: Point,
    alpha: number
}

let blocks = new BlockMap()
let audioCtx: AudioContext = null
let audioStarted = false

let camera: Point = {x: 0, y: 0}
let canvasCenter: Point
let magnitude: Size

let holdPoint: Point = null
let oldCamera: Point = null
let selected: Point = {x: 0, y: 0}
let connectMode = false

let frame = 0
let songMarker: SongMarker = null

// [space, left, up, right, down]
let holdArray = [false, false, false, false, false]
enum Key { Space = 0, Left, Up, Right, Down }

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

const onMousedown = (e: MouseEvent): void => {
    // start the audio context on the first click
    if (!audioStarted) {
        audioCtx = new AudioContext()
        audioStarted = true
    }

    // if spacebar is held, start dragging the camera view
    if (holdArray[Key.Space]) {
        holdPoint = getCursorPosition(e)
        oldCamera = camera
        return
    }

    const cursor = getCursorPosition(e)
    const blockP = getBlockFromCursor(cursor)

    // if a neighbor is clicked, make a connection
    if (connectMode) {
        const neighbors = getNeighbors(selected)
        for (let neighbor of neighbors) {
            if (blockP.x === neighbor.x && blockP.y === neighbor.y) {
                const fromBlock = blocks.get(selected)
                const toBlock = blocks.get(neighbor)
                fromBlock.connect(toBlock)
            }
        }
    }

    selected = blockP
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
    if (!holdArray[Key.Space]) { // not holding space
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

    if (e.key === 'q') {
        if (!blocks.has(selected)) {
            const options = {
                pos: selected,
                canvas: ctx,
                audio: audioCtx,
                color: LIGHT_BLUE,
                frequency: 220,
                type: 'sawtooth' as OscillatorType
            }
            blocks.set(selected, new Block(options))
        } else {
            const block = blocks.get(selected)
            block.color = LIGHT_BLUE
            block.source.frequency.value = 220
            block.source.type = 'sawtooth'
        }
    }
    if (e.key === 'w') {
        if (!blocks.has(selected)) {
            const options = {
                pos: selected,
                canvas: ctx,
                audio: audioCtx,
                color: LIGHT_ORANGE,
                frequency: 440,
                type: 'sine' as OscillatorType
            }
            blocks.set(selected, new Block(options))
        } else {
            const block = blocks.get(selected)
            block.color = LIGHT_ORANGE
            block.source.frequency.value = 440
            block.source.type = 'sine'
        }
    }
    if (e.key === 'Enter') {
        if (!blocks.has(selected)) {
            return
        }
        blocks.get(selected).playSound()
        songMarker = {pos: selected, alpha: 1.0}
    }
    if (e.key === 'c') {
        connectMode = true
    }

    for (let i = 0; i < holdArray.length; i++) {
        const keys = [' ', 'ArrowLeft', 'ArrowUp', 'ArrowRight', 'ArrowDown']
        if (e.key === keys[i]) {
            holdArray[i] = true
        }
    }
}

const onKeyUp = (e: KeyboardEvent): void => {
    if (e.key === 'c') { // C
        connectMode = false
    }

    for (let i = 0; i < holdArray.length; i++) {
        const keys = [' ', 'ArrowLeft', 'ArrowUp', 'ArrowRight', 'ArrowDown']
        if (e.key === keys[i]) {
            holdArray[i] = false
        }
    }
}

canvas.addEventListener('mousedown', onMousedown)
canvas.addEventListener('mousemove', onMousemove)
canvas.addEventListener('mouseup', onMouseup)
document.addEventListener('keydown', onKeyDown)
document.addEventListener('keyup', onKeyUp)

///////////////////////////////////////////////////////////////////////////////

// get a list of block coordinate neighbors
const getNeighbors = (pos: Point): Point[] => {
    const ret: Point[] = []
    // if the current point isn't a valid block, return no neighbors
    if (!blocks.has(pos)) {
        return ret
    }
    for (let [i, j] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const key = {x: selected.x + i, y: selected.y + j}
        if (blocks.has(key))
        ret.push(key)
    }
    return ret
}

// converts a block coordinate into the position on the canvas from which it should be drawn.
const blockToCanvas = (blockPoint: Point): Point => {
    let center: Point = {x: 100*blockPoint.x, y: 100*blockPoint.y}
    let vector: Size = {
        w: center.x - 50 - camera.x,
        h: center.y + 50 - camera.y
    }
    return {
        x: canvasCenter.x + vector.w,
        y: canvasCenter.y - vector.h
    }
}

// draw the block border, along with supplemental info
const drawBorders = (pos: Point, text: string): void => {
    ctx.strokeRect(pos.x, pos.y, 100, 100)
    ctx.strokeStyle = 'black'
    ctx.lineWidth = 1.0

    const realTextPos = [
        pos.x + 5,
        pos.y + 5 + FONT_SIZE
    ]
    ctx.fillText(text, realTextPos[0], realTextPos[1])
}

const drawThickBorder = (pos: Point, color: string): void => {
    ctx.strokeStyle = color
    ctx.lineWidth = 4.0
    ctx.strokeRect(pos.x + 3, pos.y + 3, 94, 94) // draw inside the box
    ctx.strokeStyle = 'black'
    ctx.lineWidth = 1.0
}

const draw = (): void => {
    // draw existing blocks first
    for (let key of blocks.keys()) {
        const canvasPos = blockToCanvas(key)
        blocks.get(key).draw(canvasPos)
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
            const canvasPos = blockToCanvas({x: i, y: j})
            drawBorders(canvasPos, `(${i}, ${j})`)
        }
    }

    // draw song indicator
    if (songMarker !== null) {
        let markerPos = blockToCanvas(songMarker.pos)
        markerPos = {x: markerPos.x + 50, y: markerPos.y + 50}

        ctx.beginPath()
        ctx.arc(markerPos.x, markerPos.y, 20, 0, 2*Math.PI, true)
        ctx.globalAlpha = songMarker.alpha
        ctx.fill()

        songMarker.alpha -= (1/30)
        if (songMarker.alpha <= 0) {
            songMarker = null
        }
        ctx.globalAlpha = 1.0
    }

    // draw a 'selected' border around the selected block
    const canvasPos = blockToCanvas(selected)
    drawThickBorder(canvasPos, LIGHT_GREEN)

    // draw neighbor blocks that can be connected
    // only valid blocks can be connected to other valid blocks
    if (connectMode) {
        const neighbors = getNeighbors(selected)
        for (let neighbor of neighbors) {
            const canvasPos = blockToCanvas(neighbor)
            drawThickBorder(canvasPos, LIGHT_PURPLE)
        }
    }

    // finally, draw connections
    for (let key of blocks.keys()) {
        const canvasPos = blockToCanvas(key)
        blocks.get(key).drawConnections(canvasPos)
    }
}

const moveCamera = (): void => {
    if (holdArray[Key.Left]) {
        camera.x -= CAMERA_SPEED
    }
    if (holdArray[Key.Up]) {
        camera.y += CAMERA_SPEED
    }
    if (holdArray[Key.Right]) {
        camera.x += CAMERA_SPEED
    }
    if (holdArray[Key.Down]) {
        camera.y -= CAMERA_SPEED
    }
}

const renderInfo = (): void => {
    const colorText = blocks.has(selected) ? blocks.get(selected).color : ''
    info.innerHTML = `
        <div>frame: ${frame}</div>
        <div>selected: (${selected.x}, ${selected.y})</div>
        <div>connect mode: ${connectMode}</div>
    `
}

window.setInterval(() => {
    frame += 1
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    draw()
    moveCamera()
    renderInfo()
}, 1000/60)
