// a wrapper around Map that can deal with Point key types.
class BlockMap {
    map: Map<string, Block>

    constructor() {
        this.map = new Map()
    }

    get(point: Point): Block {
        const key = `${point.x},${point.y}`
        return this.map.get(key)
    }

    set(point: Point, block: Block): void {
        const key = `${point.x},${point.y}`
        this.map.set(key, block)
    }

    has(point: Point): boolean {
        const key = `${point.x},${point.y}`
        return this.map.has(key)
    }

    keys(): Point[] {
        const ret = []
        for (let k of this.map.keys()) {
            const split = k.split(',').map(Number)
            ret.push({x: split[0], y: split[1]})
        }
        return ret
    }
}
