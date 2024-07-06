import '../../../../../node_modules/lodash/lodash.js';
import { addUpdateArticles, getPocketArticles, deletePocketArticle } from './pocket.js';
import { l as lodash } from '../../../../../node_modules/_virtual/lodash.js';

async function syncDownloadArticles(rep, ignoreArticleIds = new Set()) {
  const syncState = await rep.query.getSyncState("pocket");

  if (!syncState) {
    return;
  }

  await rep.mutate.updateSyncState({
    id: "pocket",
    is_syncing: true
  });
  const lastDownload = syncState.last_download ? new Date(syncState.last_download) : undefined;
  const newDownload = new Date(); // get last updated time before async fetching & uploading

  let articles = await getPocketArticles(syncState.api_token, lastDownload);

  if (articles === null) {
    return;
  } // can't easily exclude locally present articles, since updated time set remotely


  articles = articles.filter(a => !ignoreArticleIds.has(a.id));
  console.log(`Downloading ${articles === null || articles === void 0 ? void 0 : articles.length} pocket articles since ${lastDownload === null || lastDownload === void 0 ? void 0 : lastDownload.toUTCString()}`);

  if (articles === null || articles === void 0 ? void 0 : articles.length) {
    await rep.mutate.importArticles({
      articles
    });
  }

  await rep.mutate.updateSyncState({
    id: "pocket",
    last_download: newDownload.getTime(),
    is_syncing: false
  });
}
async function syncUploadArticles(rep) {
  const syncState = await rep.query.getSyncState("pocket");

  if (!syncState) {
    return new Set();
  }

  await rep.mutate.updateSyncState({
    id: "pocket",
    is_syncing: true
  });
  const lastUpload = syncState.last_upload ? new Date(syncState.last_upload) : undefined;
  const newUpload = new Date(); // get before async fetching & uploading
  // filter annotations to upload

  const lastUploadUnixMillis = (lastUpload === null || lastUpload === void 0 ? void 0 : lastUpload.getTime()) || 0;
  let articles = await rep.query.listRecentArticles(lastUploadUnixMillis); // if the syncState got lost, we'd try to patch all previously uploaded annotations

  if (!lastUpload) {
    articles = articles.filter(a => !a.pocket_id);
  }

  if (articles === null || articles === void 0 ? void 0 : articles.length) {
    console.log(`Uploading ${articles.length} articles since ${lastUpload === null || lastUpload === void 0 ? void 0 : lastUpload.toUTCString()} to Pocket`); // pocket api can't handle more than ~ 100 articles at once

    for (const chunkedArticles of lodash.exports.chunk(articles, 50)) {
      const remoteIds = await addUpdateArticles(syncState.api_token, chunkedArticles);
      await Promise.all(remoteIds.map((remoteId, i) => rep.mutate.updateArticleRaw({
        id: chunkedArticles[i].id,
        pocket_id: remoteId
      })));
    }
  }

  await rep.mutate.updateSyncState({
    id: "pocket",
    is_syncing: false,
    last_upload: newUpload.getTime()
  });
  return new Set(articles.map(a => a.id));
}
const syncUploadArticlesDebounced = lodash.exports.debounce(syncUploadArticles, 10 * 1000); // only handle deletes using store watch for reslience

let watchActive = false;
async function syncWatchArticles(rep) {
  if (watchActive) {
    return;
  }

  watchActive = true;
  console.log("Watching annotations for changes...");
  rep.watch("articles/", async (changed, removed) => {
    if (changed.length > 0) {
      // process based on edit timestamp for resilience
      syncUploadArticlesDebounced(rep);
    }

    removed = removed.filter(a => a.pocket_id);

    if (removed.length > 0) {
      console.log(`Deleting ${removed.length} articles on Pocket`);
      const syncState = await rep.query.getSyncState("pocket");

      if (!syncState) {
        return;
      }

      await Promise.all(removed.map(article => deletePocketArticle(syncState.api_token, article)));
    }
  });
}

export { syncDownloadArticles, syncUploadArticles, syncWatchArticles };
