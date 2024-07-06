import { ReplicacheProxy } from '../../common/library-components/dist/common/replicache.js';
import { getLibraryUser } from '../../common/storage.js';
import { migrateMetricsUser } from '../metrics.js';
import { initReplicache, importEntries, processActualReplicacheMessage, processActualReplicacheWatch, processActualReplicacheSubscribe } from './replicache.js';
import { processLocalReplicacheMessage, processLocalReplicacheWatch, LocalWriteTransaction, processLocalReplicacheSubscribe } from './replicacheLocal.js';
import { deleteAllLocalScreenshots } from './screenshots.js';
import '../../node_modules/seedrandom/index.js';
import '../../node_modules/flexsearch/dist/flexsearch.bundle.js';
import '../../node_modules/crypto-js/sha256.js';
import '../../node_modules/react/index.js';
import '../../common/library-components/dist/common/sync/highlights.js';
import '../../common/library-components/dist/store/_schema.js';
import '../../common/library-components/dist/store/accessors.js';
import '../../common/library-components/dist/store/mutators.js';
import '../../node_modules/react-dom/index.js';
import '../../common/library-components/dist/common/sync/articles.js';
import '../../node_modules/linkedom/esm/index.js';
import { initHighlightsSync, initArticlesSync } from './sync.js';

let userId; // actual replicache id, don't change in dev
let rep = null;
async function initLibrary(isDev = false) {
    rep = getBackgroundReplicacheProxy();
    userId = await getLibraryUser();
    if (userId) {
        console.log(`Init Library for registered user ${userId}`);
        await initReplicache();
        await migrateToAccount();
    }
    // deleteSearchIndex("");
    // deleteSearchIndex("-articles");
    // if (isDev) {
    //     await rep.mutate.updateUserInfo({ id: "dev-user", aiEnabled: true });
    // }
    await rep.query.getUserInfo();
    await initHighlightsSync();
    await initArticlesSync();
}
function getBackgroundReplicacheProxy() {
    return new ReplicacheProxy(null, (type, methodName, args, targetExtension = null) => {
        return processReplicacheMessage({
            type,
            methodName,
            args,
        });
    }, processReplicacheWatch);
}
async function migrateToAccount() {
    const localTx = new LocalWriteTransaction();
    const allLocalEntries = await localTx.scan().entries().toArray();
    if (allLocalEntries.length === 0) {
        return false;
    }
    console.log(`Migrating ${allLocalEntries.length} local replicache entries to library account...`);
    // @ts-ignore
    await importEntries(allLocalEntries);
    await Promise.all(allLocalEntries.map(([key, value]) => localTx.del(key)));
    // other migration tasks
    await deleteAllLocalScreenshots();
    await migrateMetricsUser();
    return true;
}
async function processReplicacheMessage(message) {
    if (userId) {
        return await processActualReplicacheMessage(message);
    }
    else {
        return await processLocalReplicacheMessage(message);
    }
}
// only supported for content scripts
async function processReplicacheSubscribe(port) {
    if (userId) {
        await processActualReplicacheSubscribe(port);
    }
    else {
        await processLocalReplicacheSubscribe(port);
    }
}
// only supported in background
function processReplicacheWatch(prefix, onDataChanged) {
    if (userId) {
        return processActualReplicacheWatch(prefix, onDataChanged);
    }
    else {
        return processLocalReplicacheWatch(prefix, onDataChanged);
    }
}

export { initLibrary, processReplicacheMessage, processReplicacheSubscribe, processReplicacheWatch, rep, userId };
