/*
NOTE:

this file is based on this video here:

Design Patterns in TypeScript
https://www.youtube.com/watch?v=D40olxrDw38
 */


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
    item: T
}


interface Database<T extends Item> {
    add: (item: T) => void
    remove: (item: T) => void
}

type EventTypeOptions = 'add' | 'remove' | 'delete' | 'any'
type Visitor<T> = (item: T) => void


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
            if (eventType === 'any' || e.type === eventType) {
                listener(e)
            }
        })
    }

    visit(visitor: Visitor<T>) {
        for (const item of Object.values(this.items)) {
            visitor(item)
        }
    }

    findBest(scoreFunc: (item: T) => number | undefined): T | undefined {
        let best: { score: number | undefined, item: T | undefined } = {score: undefined, item: undefined}
        Object.values(this.items).reduce((best, item) => {
            let score = scoreFunc(item)
            if (score === undefined) {
                return best
            }
            if (best.score === undefined || score > best.score) {
                best.score = score
                best.item = item
            }
            return best
        }, best)

        return best.item
    }
}

function formatEvent<T extends Item>(event: ItemEvent<T>) {
    switch (event.type) {
        case 'add':
            return `added ${event.item.amount}x of ${event.item.name}`
        case'remove':
            return `removed ${event.item.amount}x of ${event.item.name}`
        case 'delete':
            return `deleted ${event.item.name}`
    }
}

let db = new ItemDatabase<Item>()
db.listen('any', (e) => console.log(formatEvent(e)))
db.add({name: 'milk', amount: 100})
db.add({name: 'eggs', amount: 30})
db.add({name: 'bread', amount: 45})
db.remove({name: 'eggs', amount: 1})

db.visit((e) => console.log(e))
console.log(`best by item name length:`, db.findBest(e => e.name.length));
console.log(`best by item highest amount:`, db.findBest(e => e.amount));
console.log(`best by item least amount:`, db.findBest(e => -e.amount));
