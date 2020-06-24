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

    clear(): void {
        for (let block of this.map.values()) {
            block.kill = true
        }
        this.map.clear()
    }
}

const pitchNameMap: Map<number, string> = new Map([
    [16, 'C2'],
    [17, 'C#/Db2'],
    [18, 'D2'],
    [19, 'D#/Eb2'],
    [20, 'E2'],
    [21, 'F2'],
    [22, 'F#2/Gb2'],
    [23, 'G2'],
    [24, 'G#/Ab2'],
    [25, 'A2'],
    [26, 'A#/Bb2'],
    [27, 'B2'],
    [28, 'C3'],
    [29, 'C#/Db3'],
    [30, 'D3'],
    [31, 'D#/Eb3'],
    [32, 'E3'],
    [33, 'F3'],
    [34, 'F#/Gb3'],
    [35, 'G3'],
    [36, 'G#/Ab3'],
    [37, 'A3'],
    [38, 'A#/Bb3'],
    [39, 'B3'],
    [40, 'C4'],
    [41, 'C#/Db4'],
    [42, 'D4'],
    [43, 'D#/Eb4'],
    [44, 'E4'],
    [45, 'F4'],
    [46, 'F#/Gb4'],
    [47, 'G4'],
    [48, 'G#/Ab4'],
    [49, 'A4'],
    [50, 'A#/Bb4'],
    [51, 'B4'],
    [52, 'C5'],
    [53, 'C#/Db5'],
    [54, 'D5'],
    [55, 'D#/Eb5'],
    [56, 'E5'],
    [57, 'F5'],
    [58, 'F#/Gb5'],
    [59, 'G5'],
    [60, 'G#/Ab5'],
    [61, 'A5'],
    [62, 'A#/Bb5'],
    [63, 'B5'],
    [64, 'C6'],
    [65, 'C#/Db6'],
    [66, 'D6'],
    [67, 'D#/Eb6'],
    [68, 'E6'],
    [69, 'F6'],
    [70, 'F#6/Gb6'],
    [71, 'G6'],
    [72, 'G#/Ab6'],
    [73, 'A6'],
    [74, 'A#/Bb6'],
    [75, 'B6'],
    [76, 'C6']
  ])