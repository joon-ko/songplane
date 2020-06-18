const canvas = document.getElementById('canvas')
const ctx = canvas.getContext('2d')

const resizeCanvas = () => {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
}
resizeCanvas()

const draw = () => {
    ctx.beginPath();
    ctx.fillStyle = `rgb(
        ${Math.floor(Math.random() * 255)},
        ${Math.floor(Math.random() * 255)},
        ${Math.floor(Math.random() * 255)}
    )`
    ctx.fillRect(0, 0, canvas.width, canvas.height)
}

window.setInterval(() => {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    draw()
}, 1000/5)