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

interface ItemEvent<T extends Item> extends BaseEvent {
    type: string
    item: Item
}


interface Database<T extends Item> {
    add: (T) => void
    remove: (T) => void
}

type EventTypeOptions = 'add' | 'remove' | 'delete' | 'any'

class ItemDatabase<T extends Item> implements Database<T> {
    private items: { [key: string]: T }
    private event: Observer<ItemEvent<T>>

    constructor() {
        this.items = {}
        this.event = createObserver<ItemEvent<T>>()
    }

    add(item: T): void {
        if (this.items.hasOwnProperty(item.name)) {
            this.items[item.name].amount += item.amount
        } else {
            this.items[item.name] = item
        }

        this.event.publish({
            type: 'add',
            item: item
        })
    }

    remove(item: T): void {
        if (!this.items.hasOwnProperty(item.name)) {
            return
        }

        let currentItem = this.items[item.name]
        currentItem.amount -= item.amount

        if (currentItem.amount <= 0) {
            delete this.items[item.name]
            currentItem.amount = 0

            this.event.publish({
                    type: 'delete',
                    item: currentItem
                }
            )
        } else {
            this.event.publish({type: 'remove', item: item})
        }
    }

    listen(eventType: EventTypeOptions, listener: Listener<ItemEvent<Item>>): () => void {
        return this.event.subscribe((e) => {
            if (eventType == 'any' || e.type === eventType) {
                listener(e)
            }
        })
    }
}

let db = new ItemDatabase<Item>()
db.listen('any', (e) => console.log(`event: ${e.type}`))
db.add({name: 'milk', amount: 100})
db.remove({name: 'milk', amount: 100})
