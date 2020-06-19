const canvas = <HTMLCanvasElement> document.getElementById('canvas')
const ctx = <CanvasRenderingContext2D> canvas.getContext('2d')

const FONT_SIZE = 20

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

const draw = (): void => {
    for (let i=-1*magnitude.w; i<=magnitude.w; i++) {
        for (let j=-1*magnitude.h; j<=magnitude.h; j++) {
            const canvasPos = blockToCanvasPos(i, j)
            drawBlock(canvasPos, i, j)
        }
    }
}

const drawBlock = (canvasPos: Point, i: number, j: number): void => {
    ctx.strokeRect(canvasPos.x, canvasPos.y, 100, 100)

    const text = `(${i}, ${j})`
    const textWidth = ctx.measureText(text).width
    const realTextPos = [
        canvasPos.x + 50 - (textWidth/2),
        canvasPos.y + 50
    ]
    ctx.fillText(text, realTextPos[0], realTextPos[1])
}

window.setInterval(() => {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    draw()
}, 1000)
