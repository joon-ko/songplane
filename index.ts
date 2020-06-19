const canvas = <HTMLCanvasElement> document.getElementById('canvas')
const ctx = <CanvasRenderingContext2D> canvas.getContext('2d')

let camera = [0, 0]
let canvasCenter: number[];

const resizeCanvas = (): void => {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    canvasCenter = [Math.round(window.innerWidth/2), Math.round(window.innerHeight/2)]
}
resizeCanvas()

const blocks: [number, number] = [
    Math.ceil(canvas.width/100),
    Math.ceil(canvas.height/100)
]
console.log(canvas.width, canvas.height)
console.log(blocks)
if (blocks[0] % 2 === 0) blocks[0]++;
if (blocks[1] % 2 === 0) blocks[1]++;
const limitX = (blocks[0]-1)/2
const limitY = (blocks[1]-1)/2

const blockToPlane = (s: [number, number]): [number, number] => {
    const center = [100*s[0], 100*s[1]]
    return [center[0]-50, center[1]+50] // top left corner of square
}

const draw = (): void => {
    for (let i=-1*limitX; i<=limitX; i++) {
        for (let j=-1*limitY; j<=limitY; j++) {
            // console.log(`drawing block [${i}, ${j}]`)
            const block: [number, number] = [i, j]
            const plane = blockToPlane(block)
            const vector = [plane[0]-camera[0], plane[1]-camera[1]]
            const canvasPos = [canvasCenter[0]+vector[0], canvasCenter[1]-vector[1]]
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
}, 1000)
