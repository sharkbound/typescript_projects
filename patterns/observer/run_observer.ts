type Listener<EventType> = (event: EventType) => void

interface Observer<EventType> {
    subscribe: (listener: Listener<EventType>) => (() => void)
    publish: (event: EventType) => void
}

function createObserver<EventType>(): Observer<EventType> {
    let listeners: Listener<EventType>[] = []
    return {
        subscribe: (listener: Listener<EventType>): (() => void) => {
            listeners.push(listener)
            return () => {
                listeners = listeners.filter(v => v !== listener)
            }
        },
        publish: (event: EventType): void => {
            for (const handler of listeners) {
                handler(event)
            }
        }
    }
}


type Item = { name: string, amount: number }

interface BaseEvent {
}

interface ItemEvent extends BaseEvent {
    type: string
    name: string
    amount: number
}


interface Database<T extends Item> {
    add: (T) => void
    remove: (T) => void
}

class ItemDatabase<T extends Item> implements Database<T> {
    private items: T[]
    private event: Observer<ItemEvent>

    constructor() {
        this.items = []
        this.event = createObserver<ItemEvent>()
    }

    add(item: T): void {
        this.items.push(item)
        this.event.publish({
            type: 'add',
            name: item.name,
            amount: item.amount
        })
    }

    remove(item: T): void {
        // todo
        this.event.publish({type: 'remove', name: item.name, amount: item.amount})
    }

    listen(listener: (ev: ItemEvent) => void): () => void {
        return this.event.subscribe(listener)
    }
}

let db = new ItemDatabase<Item>()
db.listen((e) => console.log(`item added: ${e.name}(${e.amount})`))
db.add({name: 'milk', amount: 100})
