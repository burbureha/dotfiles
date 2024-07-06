import { Replicache as Jr } from '../../node_modules/replicache/out/replicache.mjs.js';
import { getLibraryUser, getLibraryUserJwt } from '../../common/storage.js';
import '../../common/library-components/dist/store/_schema.js';
import { accessors } from '../../common/library-components/dist/store/accessors.js';
import { mutators } from '../../common/library-components/dist/store/mutators.js';
import '../../node_modules/react/index.js';
import '../../node_modules/react-dom/index.js';

// const apiHost = "http://localhost:3000"
const apiHost = "https://library.lindylearn.io";
let rep = null;
let usedRepUserId = null;
async function initReplicache() {
    const userId = await getLibraryUser();
    const jwt = await getLibraryUserJwt();
    if (!userId || !jwt) {
        return;
    }
    if (rep) {
        if (usedRepUserId === userId) {
            // already initialized for this user
            return;
        }
        else {
            await rep.close();
        }
    }
    console.log("Initializing replicache...");
    usedRepUserId = userId;
    rep = new Jr({
        licenseKey: "l83e0df86778d44fba2909e3618d7965f",
        pushURL: `${apiHost }/api/replicache/push?spaceID=${userId}`,
        pullURL: `${apiHost }/api/replicache/pull?spaceID=${userId}`,
        name: userId,
        mutators,
        auth: jwt,
    });
    // rep.createIndex({
    //     name: "articlesByTopic",
    //     // @ts-ignore
    //     keyPrefix: "/articles/",
    //     jsonPointer: "/topic_id",
    //     allowEmpty: true,
    // });
    rep.createIndex({
        name: "annotationsPerArticle",
        // @ts-ignore
        keyPrefix: "/annotations/",
        jsonPointer: "/article_id",
        allowEmpty: true,
    });
    // TODO enable poke
    // use common package to avoid dealing with bundling issues again
    // pull large data chunks in batches
    rep.subscribe(accessors.getPartialSyncState, {
        onData: (partialSync) => {
            console.log("partialSync", partialSync);
            if (partialSync !== "PARTIAL_SYNC_COMPLETE") {
                rep === null || rep === void 0 ? void 0 : rep.pull();
            }
        },
    });
    return rep;
}
async function processActualReplicacheMessage({ type, methodName, args, }) {
    if (!rep) {
        return;
    }
    // console.log(methodName, args);
    if (type === "query") {
        return await rep.query((tx) => accessors[methodName](tx, ...args));
    }
    else if (type === "mutate") {
        return await rep.mutate[methodName](args);
    }
    else if (type === "pull") {
        return rep.pull();
    }
}
async function processActualReplicacheSubscribe(port) {
    if (!rep) {
        return;
    }
    port.onMessage.addListener((msg) => {
        const { methodName, args } = msg;
        // console.log("subscribe", methodName);
        // port.onDisconnect.addListener(() => {
        //     console.log("subscribe disconnect", methodName);
        // });
        const cancel = rep.subscribe((tx) => accessors[methodName](tx, ...args), {
            onData: (data) => {
                port.postMessage(data);
            },
            onDone: () => {
                port.disconnect();
            },
            onError: (err) => {
                console.error(err);
                port.disconnect();
            },
        });
        port.onDisconnect.addListener(cancel);
    });
}
function processActualReplicacheWatch(prefix, onDataChanged) {
    if (!rep) {
        return;
    }
    rep.experimentalWatch((diff) => {
        const added = diff
            .filter((op) => op.op === "add" || op.op === "change")
            .map((e) => e.newValue);
        const removed = diff.filter((op) => op.op === "del").map((e) => e.oldValue);
        onDataChanged(added, removed);
    }, {
        prefix: prefix,
        initialValuesInFirstDiff: false,
    });
}
async function importEntries(entries) {
    rep.mutate.importEntries(entries);
}

export { importEntries, initReplicache, processActualReplicacheMessage, processActualReplicacheSubscribe, processActualReplicacheWatch, rep, usedRepUserId };
