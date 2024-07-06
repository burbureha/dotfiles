import { generate as generate_1 } from '../../../../node_modules/@rocicorp/rails/out/index.js';
import sha256 from '../../../../node_modules/crypto-js/sha256.js';
import { listArticleAnnotations, getSafeArticleSortPosition, getSettings, getUserInfo } from './accessors.js';
import { articleSchema, articleTextSchema, articleLinkSchema, topicSchema, annotationSchema, feedSubscriptionSchema, syncStateSchema } from './_schema.js';
import { readingProgressFullClamp } from './constants.js';

/* ***** articles & topics ***** */

const {
  get: getArticle,
  list: listArticles,
  put: putArticle,
  update: updateArticleRaw,
  delete: deleteArticleRaw
} = generate_1("articles", articleSchema);
const {
  put: putArticleText,
  update: updateArticleText,
  delete: deleteArticleText
} = generate_1("text", articleTextSchema);
const {
  put: putArticleLink
} = generate_1("link", articleLinkSchema);
const {
  put: putTopic,
  list: listTopics,
  delete: deleteTopic
} = generate_1("topics", topicSchema);

async function putArticleIfNotExists(tx, article) {
  const existing = await getArticle(tx, article.id);

  if (existing) {
    return;
  } // use time as sort position


  const fullArticle = article;
  fullArticle.recency_sort_position = fullArticle.time_added * 1000;
  fullArticle.topic_sort_position = fullArticle.time_added * 1000;
  await putArticle(tx, fullArticle);
}

async function updateArticle(tx, article) {
  await updateArticleRaw(tx, { ...article,
    time_updated: Math.round(new Date().getTime() / 1000)
  });
} // batch large inserts to have fewer mutations to sync


async function importArticles(tx, {
  articles
}) {
  await Promise.all(articles.map(async a => {
    await putArticleIfNotExists(tx, a);
  }));
}

async function importArticleTexts(tx, {
  article_texts
}) {
  await Promise.all(article_texts.map(async article_text => {
    await putArticleText(tx, article_text);
  }));
}

async function importArticleLinks(tx, {
  links
}) {
  await Promise.all(links.map(async link => {
    // use one entry for both directions
    const nodeIds = [link.source, link.target].sort();
    link.id = sha256(`${nodeIds.join("-")}-${link.type}`).toString();
    await putArticleLink(tx, link);
  }));
}

async function deleteArticle(tx, articleId) {
  const articleAnnotations = await listArticleAnnotations(tx, articleId);
  await Promise.all(articleAnnotations.map(a => deleteAnnotation(tx, a.id)));
  await deleteArticleRaw(tx, articleId);
  await deleteArticleText(tx, articleId);
}

async function updateArticleReadingProgress(tx, {
  articleId,
  readingProgress
}) {
  const diff = {
    id: articleId,
    reading_progress: readingProgress
  }; // dequeue if completed article

  if (readingProgress >= readingProgressFullClamp) {
    diff.is_queued = false;
    diff.is_new = false;
  }

  return updateArticle(tx, diff);
}

async function articleSetFavorite(tx, {
  id,
  is_favorite
}) {
  let favorites_sort_position = null;

  if (is_favorite) {
    favorites_sort_position = new Date().getTime();
  }

  await updateArticle(tx, {
    id,
    is_favorite,
    favorites_sort_position
  });
}

async function articleTrackOpened(tx, articleId) {
  const timeNow = new Date().getTime();
  await updateArticle(tx, {
    id: articleId,
    recency_sort_position: timeNow,
    topic_sort_position: timeNow,
    domain_sort_position: timeNow
  });
} // noted: this may be batched into multiple mutations in backend


async function updateAllTopics(tx, {
  newTopics,
  articleTopics,
  skip_topics_delete = false
}) {
  // replace existing topic entries
  if (!skip_topics_delete) {
    const existingTopics = await listTopics(tx);
    await Promise.all(existingTopics.map(t => deleteTopic(tx, t.id)));
  }

  await Promise.all(newTopics.map(t => putTopic(tx, t))); // update article topic ids

  const articleTopicEntries = Object.entries(articleTopics); // read before write

  const existingArticles = await Promise.all(articleTopicEntries.map(([articleId, topicId]) => getArticle(tx, articleId)));
  await Promise.all(articleTopicEntries.map(async ([articleId, topicId], index) => {
    const existing = existingArticles[index];

    if ((existing === null || existing === void 0 ? void 0 : existing.topic_id) !== topicId) {
      console.log(`update ${existing === null || existing === void 0 ? void 0 : existing.topic_id} -> ${topicId}`);
      await updateArticle(tx, {
        id: articleId,
        topic_id: topicId
      });
    }
  }));
}

async function moveArticlePosition(tx, {
  articleId,
  articleIdBeforeNewPosition,
  articleIdAfterNewPosition,
  sortPosition
}) {
  const activeArticle = await getArticle(tx, articleId);
  const beforeArticle = articleIdBeforeNewPosition ? await getArticle(tx, articleIdBeforeNewPosition) : null;
  const afterArticle = articleIdAfterNewPosition ? await getArticle(tx, articleIdAfterNewPosition) : null;

  if (!activeArticle || !beforeArticle && !afterArticle) {
    return;
  } // higest indexes first


  let newUpperBound = beforeArticle && getSafeArticleSortPosition(beforeArticle, sortPosition);
  let newLowerBound = afterArticle && getSafeArticleSortPosition(afterArticle, sortPosition); // don't floor to 0 or present in case of reordering on sliced / filtered list

  if (!newUpperBound) {
    newUpperBound = newLowerBound + 1000;
  } else if (!newLowerBound) {
    newLowerBound = newUpperBound - 1000;
  } // creates floats


  const newPosition = (newLowerBound + newUpperBound) / 2;
  await updateArticle(tx, {
    id: articleId,
    [sortPosition]: newPosition
  });
} // combine queue status update & move within a single mutation (to prevent UI flicker)


async function articleAddMoveToQueue(tx, {
  articleId,
  isQueued,
  articleIdBeforeNewPosition,
  articleIdAfterNewPosition,
  sortPosition
}) {
  const articleDiff = {
    id: articleId,
    is_queued: isQueued,
    queue_sort_position: isQueued ? new Date().getTime() : undefined
  };

  if (isQueued) {
    // reset reading progress if completed article is queued
    const article = await getArticle(tx, articleId);

    if (article && article.reading_progress >= readingProgressFullClamp) {
      articleDiff.reading_progress = 0;
    }
  }

  await updateArticle(tx, articleDiff);
  await moveArticlePosition(tx, {
    articleId,
    articleIdBeforeNewPosition,
    articleIdAfterNewPosition,
    sortPosition
  });
}

async function articleAddMoveToLibrary(tx, {
  temporaryArticle,
  articleIdBeforeNewPosition,
  articleIdAfterNewPosition,
  sortPosition
}) {
  await putArticleIfNotExists(tx, { ...temporaryArticle,
    is_temporary: false,
    is_new: false,
    time_added: Math.round(new Date().getTime() / 1000) // keep description to avoid display changes

  });
  await moveArticlePosition(tx, {
    articleId: temporaryArticle.id,
    articleIdBeforeNewPosition,
    articleIdAfterNewPosition,
    sortPosition
  });
}
/* ***** annotations ***** */


const {
  get: getAnnotation,
  list: listAnnotations,
  put: putAnnotationRaw,
  update: updateAnnotationRaw,
  delete: deleteAnnotation
} = generate_1("annotations", annotationSchema);

async function putAnnotation(tx, annotation) {
  await putAnnotationRaw(tx, { ...annotation,
    updated_at: annotation.updated_at || annotation.created_at
  });
}

async function mergeRemoteAnnotations(tx, annotations) {
  const allAnnotations = await listAnnotations(tx);
  await Promise.all(annotations.map(async annotation => {
    let existing;

    if (annotation.h_id) {
      existing = allAnnotations.find(a => a.h_id === annotation.h_id);

      if (existing) {
        annotation.id = existing.id;
      }
    } else {
      existing = allAnnotations.find(a => a.id === annotation.id);
    }

    if (!existing) {
      await putAnnotation(tx, annotation);
      return;
    } // setting .h_id will trigger another PATCH request
    // this is ok for manually created annotations, but not for all existing


    await updateAnnotationRaw(tx, annotation);
  }));
}

async function updateAnnotation(tx, annotation) {
  await updateAnnotationRaw(tx, { ...annotation,
    updated_at: Math.round(new Date().getTime() / 1000)
  });
}
/* ***** settings & useInfo ***** */


async function updateSettings(tx, diff) {
  const savedValue = await getSettings(tx);
  await tx.put("settings", { ...savedValue,
    ...diff
  });
}
async function updateUserInfo(tx, diff) {
  const savedValue = await getUserInfo(tx);
  await tx.put("userInfo", { ...(savedValue || {}),
    ...diff
  });
}
async function importEntries(tx, entries) {
  await Promise.all(entries.map(([key, value]) => tx.put(key, value)));
}
/* ***** FeedSubscription ***** */

const {
  get: getSubscription,
  put: putSubscription,
  update: updateSubscription,
  delete: deleteSubscription
} = generate_1("subscription", feedSubscriptionSchema);

async function toggleSubscriptionActive(tx, subscriptionId) {
  const subscription = await getSubscription(tx, subscriptionId);

  if (!subscription) {
    return;
  }

  await updateSubscription(tx, {
    id: subscriptionId,
    is_subscribed: !subscription.is_subscribed,
    last_fetched: Math.round(new Date().getTime() / 1000) // check for new articles starting now

  });
}
/* ***** sync state ***** */


const {
  get: getSyncState,
  put: putSyncState,
  update: updateSyncState,
  delete: deleteSyncState
} = generate_1("sync", syncStateSchema);
const mutators = {
  updateArticle,
  updateArticleRaw,
  articleSetFavorite,
  articleTrackOpened,
  deleteArticle,
  updateArticleReadingProgress,
  putArticleIfNotExists,
  importArticles,
  importArticleTexts,
  importArticleLinks,
  putTopic,
  updateAllTopics,
  moveArticlePosition,
  articleAddMoveToQueue,
  articleAddMoveToLibrary,
  putAnnotation,
  mergeRemoteAnnotations,
  updateAnnotation,
  updateAnnotationRaw,
  deleteAnnotation,
  updateSettings,
  importEntries,
  updateUserInfo,
  putSubscription,
  updateSubscription,
  toggleSubscriptionActive,
  deleteSubscription,
  getSyncState,
  putSyncState,
  updateSyncState,
  deleteSyncState
};

export { importEntries, mutators, updateSettings, updateUserInfo };
