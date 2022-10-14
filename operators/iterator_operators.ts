class ClosedRange {
    constructor(start: number, end: number) {
        this.start = start;
        this.end = end;
    }

    start: number
    end: number

    * [Symbol.iterator]() {
        for (let i = this.start; i <= this.end; i++) {
            yield i
        }
    }
}

for (const value of new ClosedRange(10, 20)) {
    console.log(value)
}
