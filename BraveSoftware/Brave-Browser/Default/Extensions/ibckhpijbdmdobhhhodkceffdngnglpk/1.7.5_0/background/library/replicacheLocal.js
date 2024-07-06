import '../../common/library-components/dist/store/_schema.js';
import { accessors } from '../../common/library-components/dist/store/accessors.js';
import { mutators } from '../../common/library-components/dist/store/mutators.js';
import '../../node_modules/react/index.js';
import '../../node_modules/react-dom/index.js';
import { createStore, get, keys, set, del, entries } from '../../node_modules/idb-keyval/dist/index.js';

// local-only replicache stub
async function processLocalReplicacheMessage({ type, methodName, args, }) {
    if (type === "query") {
        const result = await accessors[methodName](new LocalReadTransaction(), ...args);
        // console.log(methodName, args, result);
        return result;
    }
    else if (type === "mutate") {
        const result = await mutators[methodName](new LocalWriteTransaction(), args);
        // console.log(methodName, args, result);
        // notify data subscribers
        Object.values(dataSubscribers).forEach((fn) => fn());
        return result;
    }
}
const dataSubscribers = {};
const prevResults = {};
async function processLocalReplicacheSubscribe(port) {
    port.onMessage.addListener((msg) => {
        const { methodName, args } = msg;
        // console.log("subscribe", methodName);
        // port.onDisconnect.addListener(() => {
        //     console.log("subscribe disconnect", methodName);
        // });
        const subscriberId = `${methodName}-${Date.now()}`;
        dataSubscribers[subscriberId] = async () => {
            const newResult = await accessors[methodName](new LocalReadTransaction(), ...args);
            // skip if no change
            const prevResult = prevResults[subscriberId];
            if (prevResult && JSON.stringify(prevResult) === JSON.stringify(newResult)) {
                return;
            }
            prevResults[subscriberId] = newResult;
            port.postMessage(newResult);
        };
        dataSubscribers[subscriberId](); // called once immediately
        port.onDisconnect.addListener(() => {
            delete dataSubscribers[subscriberId];
        });
    });
}
async function processLocalReplicacheWatch(prefix, onDataChanged) {
    const tx = new LocalReadTransaction();
    let previousEntries = (await tx.scan({ prefix }).toArray());
    let previousEntriesObj = previousEntries.reduce((acc, entry) => {
        acc[entry.id] = entry;
        return acc;
    }, {});
    const subscriberId = `watch-${Date.now()}`;
    dataSubscribers[subscriberId] = async () => {
        const newEntries = (await tx.scan({ prefix }).toArray());
        const newEntriesObj = newEntries.reduce((acc, entry) => {
            // @ts-ignore
            acc[entry.id] = entry;
            return acc;
        }, {});
        // get added and removed entries
        const added = newEntries.filter((entry) => !previousEntriesObj[entry.id]);
        const removed = previousEntries.filter((entry) => !newEntriesObj[entry.id]);
        // TODO improve performance of local change detection?
        const changed = newEntries.filter((entry) => {
            const prevEntry = previousEntriesObj[entry.id];
            return prevEntry && JSON.stringify(prevEntry) !== JSON.stringify(entry);
        });
        if (added.length || removed.length || changed.length) {
            // console.log(added, removed, changed);
            previousEntries = newEntries;
            previousEntriesObj = newEntriesObj;
            onDataChanged(added.concat(changed), removed);
        }
    };
}
const idbStore = createStore("replicache-local", "keyval");
class LocalReadTransaction {
    constructor() {
        this.clientID = "local-replicache";
    }
    async get(key) {
        return await get(key, idbStore);
    }
    async has(key) {
        return !!this.get(key);
    }
    async isEmpty() {
        return (await keys(idbStore)).length === 0;
    }
    scan(options) {
        return new LocalScanResult(options);
    }
}
class LocalWriteTransaction extends LocalReadTransaction {
    async put(key, value) {
        await set(key, value, idbStore);
    }
    async del(key) {
        const exists = this.has(key);
        await del(key, idbStore);
        return exists;
    }
    async get(key) {
        return await get(key, idbStore);
    }
    scan(options) {
        return new LocalScanResult(options);
    }
}
class LocalScanResult {
    constructor(options) {
        this.options = options;
    }
    keys() {
        return new AsyncIteratorToArray(this.toAsyncIterator(entries(idbStore)
            .then(async (entries) => this.filterEntries(entries).map((entry) => entry[0]))));
    }
    values() {
        return new AsyncIteratorToArray(this.toAsyncIterator(entries(idbStore)
            .then(async (entries) => this.filterEntries(entries).map((entry) => entry[1]))));
    }
    entries() {
        return new AsyncIteratorToArray(this.toAsyncIterator(entries(idbStore)
            .then(async (entries) => this.filterEntries(entries))));
    }
    [Symbol.asyncIterator]() {
        return this.values();
    }
    toArray() {
        return this.values().toArray();
    }
    filterEntries(entries) {
        var _a, _b, _c, _d, _e;
        entries.sort((a, b) => (a[0] >= b[0] ? 1 : -1));
        // stub index implementation
        // @ts-ignore
        if (((_a = this.options) === null || _a === void 0 ? void 0 : _a.indexName) === "articlesByTopic") {
            entries = entries.filter(
            // @ts-ignore
            (e) => e[0].startsWith("articles/") && e[1].topic_id === this.options.prefix);
            // @ts-ignore
        }
        else if (((_b = this.options) === null || _b === void 0 ? void 0 : _b.indexName) === "annotationsPerArticle") {
            entries = entries.filter(
            // @ts-ignore
            (e) => e[0].startsWith("annotations/") && e[1].article_id === this.options.prefix);
        }
        else if ((_c = this.options) === null || _c === void 0 ? void 0 : _c.prefix) {
            entries = entries.filter((e) => e[0].startsWith(this.options.prefix));
        }
        if ((_d = this.options) === null || _d === void 0 ? void 0 : _d.start) {
            entries = entries.filter((e) => (e[0] === this.options.start.key && !this.options.start.exclusive) ||
                e[0] > this.options.start.key);
        }
        if ((_e = this.options) === null || _e === void 0 ? void 0 : _e.limit) {
            entries = entries.slice(0, this.options.limit);
        }
        return entries;
    }
    async *toAsyncIterator(resultsPromise) {
        let results = await resultsPromise;
        for (let x of results) {
            yield x;
        }
    }
}
class AsyncIteratorToArray {
    constructor(iterator) {
        this.iterator = iterator;
    }
    next() {
        return this.iterator.next();
    }
    [Symbol.asyncIterator]() {
        return this.iterator[Symbol.asyncIterator]();
    }
    async toArray() {
        let e = [];
        for await (let t of this.iterator)
            e.push(t);
        return e;
    }
}

export { LocalReadTransaction, LocalWriteTransaction, processLocalReplicacheMessage, processLocalReplicacheSubscribe, processLocalReplicacheWatch };
