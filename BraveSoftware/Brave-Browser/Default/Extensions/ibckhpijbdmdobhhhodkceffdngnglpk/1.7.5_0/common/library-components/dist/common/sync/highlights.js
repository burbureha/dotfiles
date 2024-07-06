import '../../../../../node_modules/lodash/lodash.js';
import es9 from '../../../../../node_modules/tiny-async-pool/lib/es9.js';
import { getHypothesisAnnotationsSince, updateHypothesisAnnotation, createHypothesisAnnotation, deleteHypothesisAnnotation } from './hypothesis.js';
import { l as lodash } from '../../../../../node_modules/_virtual/lodash.js';

async function syncDownloadAnnotations(rep, ignoreAnnotationsIds = new Set()) {
  const syncState = await rep.query.getSyncState("hypothesis");

  if (!syncState) {
    return;
  }

  await rep.mutate.updateSyncState({
    id: "hypothesis",
    is_syncing: true
  });
  const lastDownload = syncState.last_download ? new Date(syncState.last_download) : undefined;
  const newDownload = new Date(); // get last updated time before async fetching & uploading

  let [annotations, articles, newDownloadTimestamp] = await getHypothesisAnnotationsSince(syncState.username, syncState.api_token, lastDownload, 10000);
  console.log(`Downloading ${annotations.length} hypothes.is annotations since ${lastDownload === null || lastDownload === void 0 ? void 0 : lastDownload.toUTCString()}`);

  if (articles === null || articles === void 0 ? void 0 : articles.length) {
    if (articles.length >= 10) {
      // reduce mutation size to stay below vercel 4.5mb request limit
      const existingArticles = await rep.query.listArticles();
      const existingArticleIds = new Set(existingArticles.map(a => a.id));
      articles = articles.filter(a => !existingArticleIds.has(a.id));
    }

    await rep.mutate.importArticles({
      articles
    });

    if (articles.length >= 10) {
      await new Promise(resolve => setTimeout(resolve, 10 * 1000));
    }
  }

  if (annotations === null || annotations === void 0 ? void 0 : annotations.length) {
    // handles updating remote ids
    annotations = annotations.filter(a => !ignoreAnnotationsIds.has(a.id)); // can't easily exclude locally present annotations, since updated time set remotely

    if (annotations.length >= 1000) {
      for (const annotationsChunk of lodash.exports.chunk(annotations, 1000)) {
        await rep.mutate.mergeRemoteAnnotations(annotationsChunk); // wait for replicache push to stay below vercel 4.5mb request limit

        await new Promise(resolve => setTimeout(resolve, 10 * 1000));
      }
    } else {
      await rep.mutate.mergeRemoteAnnotations(annotations);
    }
  }

  await rep.mutate.updateSyncState({
    id: "hypothesis",
    last_download: newDownload.getTime(),
    is_syncing: false
  });
}
async function syncUploadAnnotations(rep) {
  const syncState = await rep.query.getSyncState("hypothesis");

  if (!syncState) {
    return new Set();
  }

  await rep.mutate.updateSyncState({
    id: "hypothesis",
    is_syncing: true
  });
  const lastUpload = syncState.last_upload ? new Date(syncState.last_upload) : undefined;
  const newUpload = new Date(); // get before async fetching & uploading
  // filter annotations to upload

  let annotations = await rep.query.listAnnotations();
  const lastUploadUnixMillis = (lastUpload === null || lastUpload === void 0 ? void 0 : lastUpload.getTime()) || 0;
  annotations = annotations.filter(a => (a.updated_at || a.created_at) > lastUploadUnixMillis / 1000).filter(a => !a.ai_created || a.text); // if the syncState got lost, we'd try to patch all previously uploaded annotations

  if (!lastUpload) {
    annotations = annotations.filter(a => !a.h_id);
  } // short circuit if nothing to upload


  if (annotations.length === 0) {
    await rep.mutate.updateSyncState({
      id: "hypothesis",
      is_syncing: false,
      last_upload: newUpload.getTime()
    });
    return new Set();
  }

  const createdCount = annotations.filter(a => !a.h_id).length;
  const updatedCount = annotations.filter(a => a.h_id).length;
  console.log(`Uploading ${createdCount} new and ${updatedCount} updated annotations since ${lastUpload === null || lastUpload === void 0 ? void 0 : lastUpload.toUTCString()} to hypothes.is`); // fetch articles

  const articleIds = [...new Set(annotations.map(a => a.article_id))];
  const articles = await Promise.all(articleIds.map(articleId => rep.query.getArticle(articleId)));
  const articleMap = articles.reduce((acc, article) => {
    if (article) {
      acc[article.id] = article;
    }

    return acc;
  }, {}); // upload changes

  for await (const _ of es9(5, annotations, annotation => uploadAnnotation(rep, syncState, annotation, articleMap[annotation.article_id]))) {// TODO add progress indication?
  }

  await rep.mutate.updateSyncState({
    id: "hypothesis",
    is_syncing: false,
    last_upload: newUpload.getTime()
  });
  return new Set(annotations.map(a => a.id));
}

async function uploadAnnotation(rep, syncState, annotation, article) {
  if (!article) {
    return;
  }

  try {
    if (annotation.h_id) {
      // already exists remotely
      await updateHypothesisAnnotation(syncState.username, syncState.api_token, annotation);
    } else {
      // create remotely, then save id
      const remoteId = await createHypothesisAnnotation(syncState.username, syncState.api_token, annotation, article.url, article.title || ""); // don't change updated_at

      await rep.mutate.updateAnnotationRaw({
        id: annotation.id,
        h_id: remoteId
      });
    }
  } catch (err) {
    console.error(err);
  }
}

const syncUploadAnnotationsDebounced = lodash.exports.debounce(syncUploadAnnotations, 10 * 1000); // only handle deletes using store watch for reslience

let watchActive = false;
async function syncWatchAnnotations(rep) {
  if (watchActive) {
    return;
  }

  watchActive = true;
  console.log("Watching annotations for changes...");
  rep.watch("annotations/", async (changed, removed) => {
    if (changed.length > 0) {
      // process based on edit timestamp for resilience
      syncUploadAnnotationsDebounced(rep);
    }

    removed = removed.filter(a => a.h_id);

    if (removed.length > 100) {
      // is trying to replace entries?
      return;
    }

    if (removed.length > 0) {
      console.log(`Deleting ${removed.length} annotations on hypothesis`);
      const syncState = await rep.query.getSyncState("hypothesis");

      if (!syncState) {
        return;
      }

      await Promise.all(removed.map(annotation => deleteHypothesisAnnotation(syncState.username, syncState.api_token, annotation)));
    }
  });
}

export { syncDownloadAnnotations, syncUploadAnnotations, syncWatchAnnotations };
