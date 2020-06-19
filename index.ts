const canvas = <HTMLCanvasElement> document.getElementById('canvas')
const ctx = <CanvasRenderingContext2D> canvas.getContext('2d')

let camera = [0, 0]
let canvasCenter: number[]
let maxX: number
let maxY: number
let limitX: number
let limitY: number

const resizeCanvas = (): void => {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    canvasCenter = [Math.round(window.innerWidth/2), Math.round(window.innerHeight/2)]

    maxX = Math.ceil(window.innerWidth/100)
    maxY = Math.ceil(window.innerHeight/100)
    limitX = (maxX + (maxX % 2 === 0 ? 0 : 1)) / 2
    limitY = (maxY + (maxY % 2 === 0 ? 0 : 1)) / 2
}
resizeCanvas()
window.addEventListener('resize', resizeCanvas)

const blockToCanvasPos = (i: number, j: number): [number, number] => {
    let center = [100*i, 100*j]
    let vector = [center[0]-50-camera[0], center[1]+50-camera[1]]
    return [canvasCenter[0]+vector[0], canvasCenter[1]-vector[1]]
}

const draw = (): void => {
    for (let i=-1*limitX; i<=limitX; i++) {
        for (let j=-1*limitY; j<=limitY; j++) {
            const canvasPos = blockToCanvasPos(i, j)
            drawBlock(canvasPos)
        }
    }
}

const drawBlock = (pos: number[]): void => {
    ctx.beginPath();
    ctx.fillStyle = `rgb(
        ${Math.floor(Math.random() * 255)},
        ${Math.floor(Math.random() * 255)},
        ${Math.floor(Math.random() * 255)}
    )`
    ctx.fillRect(pos[0], pos[1], 100, 100)
}

window.setInterval(() => {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    draw()
}, 1000/10)
