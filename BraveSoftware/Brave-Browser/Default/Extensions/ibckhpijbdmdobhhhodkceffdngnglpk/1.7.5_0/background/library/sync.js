import { getHypothesisUsername, getHypothesisToken } from '../../common/annotations/storage.js';
import { getFeatureFlag, hypothesisSyncFeatureFlag } from '../../common/featureFlags.js';
import { getHypothesisSyncState } from '../../common/storage.js';
import { rep } from './library.js';
import { syncDownloadAnnotations, syncUploadAnnotations, syncWatchAnnotations } from '../../common/library-components/dist/common/sync/highlights.js';
import { syncDownloadArticles, syncUploadArticles, syncWatchArticles } from '../../common/library-components/dist/common/sync/articles.js';

let highlightsSyncActive = false;
async function initHighlightsSync(setSyncState = undefined) {
    if (highlightsSyncActive) {
        return;
    }
    highlightsSyncActive = true;
    let syncState = await rep.query.getSyncState("hypothesis");
    console.log("Starting highlights sync", syncState, setSyncState);
    if (!syncState && setSyncState && setSyncState.id === "hypothesis") {
        // in case not pulled yet
        syncState = setSyncState;
        await rep.mutate.putSyncState(syncState);
    }
    // try migration from extension settings
    if (!syncState) {
        const hypothesisSyncEnabled = await getFeatureFlag(hypothesisSyncFeatureFlag);
        const username = await getHypothesisUsername();
        const api_token = await getHypothesisToken();
        if (!hypothesisSyncEnabled || !username || !api_token) {
            highlightsSyncActive = false;
            return;
        }
        const oldSyncState = await getHypothesisSyncState();
        console.log("Migrating legacy hypothesis sync state", oldSyncState);
        syncState = {
            id: "hypothesis",
            username,
            api_token,
            last_download: (oldSyncState === null || oldSyncState === void 0 ? void 0 : oldSyncState.lastDownloadTimestamp) &&
                new Date(oldSyncState === null || oldSyncState === void 0 ? void 0 : oldSyncState.lastDownloadTimestamp).getTime(),
            last_upload: (oldSyncState === null || oldSyncState === void 0 ? void 0 : oldSyncState.lastUploadTimestamp) &&
                new Date(oldSyncState === null || oldSyncState === void 0 ? void 0 : oldSyncState.lastUploadTimestamp).getTime(),
        };
        await rep.mutate.putSyncState(syncState);
        // TODO delete after migration?
    }
    try {
        // upload before download to not endlessly loop
        const uploadedIds = await syncUploadAnnotations(rep);
        await syncDownloadAnnotations(rep, uploadedIds);
        await syncWatchAnnotations(rep);
    }
    catch (err) {
        console.error(err);
    }
    console.log("Annotations sync done");
    highlightsSyncActive = false;
}
let articlesSyncActive = false;
async function initArticlesSync(setSyncState = undefined) {
    if (articlesSyncActive) {
        return;
    }
    articlesSyncActive = true;
    let syncState = await rep.query.getSyncState("pocket");
    console.log("Starting articles sync", syncState, setSyncState);
    if (!syncState && setSyncState && setSyncState.id === "pocket") {
        // in case not pulled yet
        syncState = setSyncState;
        await rep.mutate.putSyncState(syncState);
    }
    if (!syncState) {
        articlesSyncActive = false;
        return;
    }
    try {
        // upload before download to not endlessly loop
        const uploadedIds = await syncUploadArticles(rep);
        await syncDownloadArticles(rep, uploadedIds);
        await syncWatchArticles(rep);
    }
    catch (err) {
        console.error(err);
    }
    console.log("Articles sync done");
    articlesSyncActive = false;
}
async function syncPull() {
    try {
        if (!highlightsSyncActive) {
            highlightsSyncActive = true;
            await syncDownloadAnnotations(rep);
        }
        if (!articlesSyncActive) {
            articlesSyncActive = true;
            await syncDownloadArticles(rep);
        }
    }
    catch (err) {
        console.error(err);
    }
    highlightsSyncActive = false;
    articlesSyncActive = false;
}

export { initArticlesSync, initHighlightsSync, syncPull };
