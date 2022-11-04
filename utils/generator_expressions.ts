function* range(start: number = null, stop: number = null, step: number = null) {
    if (stop === null) {
        stop = start
        start = 0
    }
    if (step === null) {
        step = (stop < start) ? -1 : 1
    }

    console.log('DEBUG:', {start, stop, step})
    for (let i = start; step < 0 ? (i > stop) : (i < stop); i += step) {
        yield i
    }
}

function* map<IN, OUT>(func: (IN) => OUT, items: Iterable<IN>) {
    for (let value of items) {
        yield func(value)
    }
}

function* filter<IN>(func: (IN) => boolean, items: Iterable<IN>) {
    for (let value of items) {
        console.log(value)
        if (func(value)) {
            yield value
        }
    }
}


