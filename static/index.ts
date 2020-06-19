const canvas = <HTMLCanvasElement> document.getElementById('canvas')
const ctx = <CanvasRenderingContext2D> canvas.getContext('2d')

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

let camera: Point = {x: 0, y: 0}
let canvasCenter: Point
let maxBlocks: Size
let magnitude: Size

let holdPoint: Point = null
let oldCamera: Point = null

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
    maxBlocks = {
        w: Math.ceil(window.innerWidth/100),
        h: Math.ceil(window.innerHeight/100)
    }
    magnitude = {
        w: (maxBlocks.w + (maxBlocks.w % 2 === 0 ? 0 : 1)) / 2,
        h: (maxBlocks.h + (maxBlocks.h % 2 === 0 ? 0 : 1)) / 2
    }
    ctx.strokeStyle = 'blue'
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

const onMousedown = (e: MouseEvent): void => {
    holdPoint = getCursorPosition(e)
    oldCamera = camera
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
    holdPoint = null
    oldCamera = null
}

const onKeyDown = (e: KeyboardEvent): void => {
    switch (e.keyCode) {
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

const drawBlock = (canvasPos: Point, i: number, j: number): void => {
    // the origin is special
    if (i === 0 && j === 0) {
        ctx.fillStyle = '#70a3cc'
        ctx.fillRect(canvasPos.x, canvasPos.y, 100, 100)
        ctx.fillStyle = 'black'
    }

    ctx.strokeRect(canvasPos.x, canvasPos.y, 100, 100)

    const text = `(${i}, ${j})`
    const textWidth = ctx.measureText(text).width
    const realTextPos = [
        canvasPos.x + 50 - (textWidth/2),
        canvasPos.y + 50
    ]
    ctx.fillText(text, realTextPos[0], realTextPos[1])
}

const draw = (): void => {
    const cameraBlock: Point = {
        x: Math.floor((camera.x + 50) / 100),
        y: Math.floor((camera.y + 50) / 100)
    }
    const [lowX, highX] = [cameraBlock.x - magnitude.w, cameraBlock.x + magnitude.w]
    const [lowY, highY] = [cameraBlock.y - magnitude.h, cameraBlock.y + magnitude.h]
    for (let i=lowX; i<=highX; i++) {
        for (let j=lowY; j<=highY; j++) {
            const canvasPos = blockToCanvasPos(i, j)
            drawBlock(canvasPos, i, j)
        }
    }
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

window.setInterval(() => {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    draw()
    moveCamera()
}, 1000/60)
