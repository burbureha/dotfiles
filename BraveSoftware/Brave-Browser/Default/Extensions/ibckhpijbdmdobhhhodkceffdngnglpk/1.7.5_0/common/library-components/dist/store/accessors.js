import { generate as generate_1 } from '../../../../node_modules/@rocicorp/rails/out/index.js';
import { getDomain } from '../common/util.js';
import '../../../../node_modules/seedrandom/index.js';
import { getWeekNumber, subtractWeeks, getWeekStart } from '../common/time.js';
import '../../../../node_modules/flexsearch/dist/flexsearch.bundle.js';
import '../../../../node_modules/crypto-js/sha256.js';
import '../../../../node_modules/react/index.js';
import '../common/sync/highlights.js';
import { articleSchema, articleTextSchema, articleLinkSchema, topicSchema, annotationSchema, feedSubscriptionSchema, syncStateSchema, PARTIAL_SYNC_STATE_KEY, partialSyncStateSchema } from './_schema.js';
import './mutators.js';
import '../../../../node_modules/react-dom/index.js';
import { readingProgressFullClamp } from './constants.js';
import '../common/sync/articles.js';

/* ***** articles ***** */

const {
  get: getArticle,
  list: listArticles
} = generate_1("articles", articleSchema);
const {
  get: getArticleText,
  list: listArticleTexts
} = generate_1("text", articleTextSchema);
const {
  list: listArticleLinks
} = generate_1("link", articleLinkSchema);
async function getArticlesCount(tx) {
  const articles = await listArticles(tx);
  return articles.length;
}
async function listRecentArticles(tx, sinceMs, stateFilter, selectedTopicId, setAnnotationCount = false) {
  const allArticles = await listArticles(tx);
  let allowedTopicIds = null;

  if (selectedTopicId) {
    const topic = await getTopic(tx, selectedTopicId);

    if (topic.group_id) {
      // individual topic
      allowedTopicIds = new Set([selectedTopicId]);
    } else {
      // selected group
      const topicChildren = await getGroupTopicChildren(tx, selectedTopicId);
      allowedTopicIds = new Set(topicChildren.map(t => t.id));
    }
  }

  const sinceSeconds = sinceMs ? sinceMs / 1000 : 0;
  const filteredArticles = allArticles.filter(a => (a.time_updated || a.time_added) >= sinceSeconds).filter(a => allowedTopicIds === null || allowedTopicIds.has(a.topic_id)).filter(a => (stateFilter !== "unread" || a.reading_progress < readingProgressFullClamp) && (stateFilter !== "read" || a.reading_progress >= readingProgressFullClamp)).filter(a => stateFilter !== "favorite" || a.is_favorite);

  if (setAnnotationCount) {
    const allAnnotations = await listAnnotations(tx);
    const annotationsPerArticle = new Map();

    for (const a of allAnnotations) {
      annotationsPerArticle.set(a.article_id, (annotationsPerArticle.get(a.article_id) || 0) + 1);
    }

    for (const a of filteredArticles) {
      a.annotation_count = annotationsPerArticle.get(a.id) || 0;
    }
  }

  return sortArticlesPosition(filteredArticles, "recency_sort_position");
}
async function groupRecentArticles(tx, sinceMs, stateFilter, selectedTopicId, aggregateYears = true // returning 'object' due to replicache type issues
) {
  const recentArticles = await listRecentArticles(tx, sinceMs, stateFilter, selectedTopicId);
  const currentYear = new Date().getFullYear();
  const currentWeek = `${currentYear}-99${getWeekNumber(new Date())}`;
  const lastWeek = `${currentYear}-99${getWeekNumber(new Date()) - 1}`;
  `${currentYear}-${new Date().getMonth()}`; // group into time buckets
  // const weekBuckets: { [week: number]: Article[] } = {};

  const monthBuckets = {};
  recentArticles.forEach(article => {
    const date = new Date(article.time_added * 1000);
    const year = date.getFullYear();
    const week = `${year}-99${getWeekNumber(date)}`;
    const month = `${year}-${date.getMonth()}`;

    if (week === currentWeek || week === lastWeek) {
      if (!monthBuckets[week]) {
        monthBuckets[week] = {
          key: week,
          title: week === currentWeek ? "This week" : "Last week",
          articles: []
        };
      }

      monthBuckets[week].articles.push(article);
    } else {
      if (!monthBuckets[month]) {
        const monthName = date.toLocaleString("en-us", {
          month: "long"
        });
        monthBuckets[month] = {
          key: month,
          title: `${monthName}`,
          articles: []
        };
      }

      monthBuckets[month].articles.push(article);
    }
  });

  if (aggregateYears) {
    const yearBuckets = {};
    Object.values(monthBuckets).sort((a, b) => parseInt(b.key.slice(5)) > parseInt(a.key.slice(5)) ? 1 : -1) // newest month first
    .forEach(monthBucket => {
      const [year, month] = monthBucket.key.split("-");

      if (!yearBuckets[year]) {
        yearBuckets[year] = {
          key: year,
          title: year,
          children: []
        };
      }

      yearBuckets[year].children.push(monthBucket);
    });

    if (yearBuckets["1970"]) {
      yearBuckets["1970"] = {
        key: "1970",
        title: "Imported",
        articles: yearBuckets["1970"].children[0].articles
      };
    }

    return yearBuckets;
  } else {
    return monthBuckets;
  }
}
async function listFavoriteArticles(tx) {
  const allArticles = await listArticles(tx);
  const articles = allArticles.filter(a => a.is_favorite);
  sortArticlesPosition(articles, "favorites_sort_position");
  return articles;
}
async function listQueueArticles(tx) {
  const allArticles = await listArticles(tx);
  const articles = allArticles.filter(a => a.is_queued);
  sortArticlesPosition(articles, "queue_sort_position");
  return articles;
}
async function listDomainArticles(tx, domain) {
  const allArticles = await listArticles(tx);
  const articles = allArticles.filter(a => getDomain(a.url) === domain);
  sortArticlesPosition(articles, "domain_sort_position");
  return articles;
}
async function listTopicArticles(tx, topic_id) {
  if (!topic_id) {
    return [];
  }

  const result = tx.scan({
    indexName: "articlesByTopic",
    prefix: topic_id
  });
  const articles = await result.values().toArray();
  sortArticlesPosition(articles, "topic_sort_position");
  return articles;
} // can't use scan() on server

async function listTopicArticlesServer(tx, topic_id) {
  const allArticles = await listArticles(tx);
  const topicArticles = allArticles.filter(a => a.topic_id === topic_id);
  sortArticlesPosition(topicArticles, "topic_sort_position");
  return topicArticles;
}
function getSafeArticleSortPosition(article, sortPosition) {
  // no manual position
  if (article[sortPosition] === undefined || article[sortPosition] === null) {
    return article.time_added * 1000;
  } // uses old index positioning
  // @ts-ignore


  if (article[sortPosition] < 1000) {
    return article.time_added * 1000;
  } // valid time-based position
  // @ts-ignore


  return article[sortPosition];
}
function sortArticlesPosition(articles, key) {
  // sort reverse to easily append items in front
  articles.sort((a, b) => {
    // highest indexes first
    return getSafeArticleSortPosition(b, key) - getSafeArticleSortPosition(a, key);
  });
  return articles;
}
async function getTopicArticlesCount(tx, topic_id) {
  const articles = await listTopicArticles(tx, topic_id);
  return articles.length;
}
async function getReadingProgress(tx) {
  const start = subtractWeeks(getWeekStart(), 3);
  let articles = await listRecentArticles(tx, start.getTime());
  const articleIds = new Set(articles.map(a => a.id));
  const annotations = (await listAnnotations(tx)).filter(a => articleIds.has(a.article_id));
  const allArticles = await listArticles(tx);
  return {
    articleCount: articles.length,
    completedCount: articles.filter(a => a.reading_progress >= readingProgressFullClamp).length,
    queueCount: allArticles.filter(a => a.is_queued).length,
    annotationCount: annotations.length
  };
}
/* ***** topics ***** */

const {
  get: getTopicRaw,
  list: listTopics
} = generate_1("topics", topicSchema);
async function getTopic(tx, topic_id) {
  return await getTopicRaw(tx, topic_id);
}
async function getTopicIdMap(tx) {
  const allTopics = await listTopics(tx);
  const idMap = {};
  allTopics.forEach(topic => {
    idMap[topic.id] = topic;
  });
  return idMap;
}
async function groupTopics(tx) {
  const allTopics = await listTopics(tx);
  const groupTopics = [];
  const topicChildren = {};
  allTopics.forEach(topic => {
    if (topic.group_id == null) {
      groupTopics.push(topic);
      return;
    }

    if (!topicChildren[topic.group_id]) {
      topicChildren[topic.group_id] = [];
    }

    topicChildren[topic.group_id].push(topic);
  });
  return groupTopics.map(groupTopic => ({
    groupTopic,
    children: topicChildren[groupTopic.id].sort((a, b) => parseInt(a.id) - parseInt(b.id))
  })).filter(group => group.children.length > 0).sort((a, b) => b.children.length - a.children.length);
}
async function getGroupTopicChildren(tx, topic_id) {
  const allTopics = await listTopics(tx);
  return allTopics.filter(topic => topic.group_id === topic_id).sort((a, b) => parseInt(a.id) - parseInt(b.id));
}
/* ***** annotations ***** */

const {
  get: getAnnotation,
  list: listAnnotations
} = generate_1("annotations", annotationSchema);

async function listAnnotationsWithArticles(tx) {
  const annotations = await listAnnotations(tx);
  const articles = await listArticles(tx);
  const articleMap = {};
  articles.forEach(article => {
    articleMap[article.id] = article;
  });
  return annotations.map(annotation => {
    return { ...annotation,
      article: articleMap[annotation.article_id]
    };
  });
}

async function listArticleAnnotations(tx, articleId) {
  const result = tx.scan({
    indexName: "annotationsPerArticle",
    prefix: articleId
  });
  return await result.values().toArray();
}

async function listTopicAnnotations(tx, topic_id) {
  const selectedArticles = await listTopicArticles(tx, topic_id);
  const selectedArticleIds = new Set(selectedArticles.map(a => a.id));
  const annotations = await listAnnotations(tx);
  return annotations.filter(a => selectedArticleIds.has(a.article_id));
}

async function getAnnotationsCount(tx) {
  const annotations = await listAnnotations(tx);
  return annotations.length;
}
/* ***** partialSyncState ***** */

async function getPartialSyncState(tx) {
  const val = await tx.get(PARTIAL_SYNC_STATE_KEY);

  if (val === undefined) {
    return undefined;
  }

  return partialSyncStateSchema.parse(JSON.parse((val === null || val === void 0 ? void 0 : val.toString()) || "null"));
}
/* ***** settings ***** */

async function getSettings(tx) {
  const savedValue = await tx.get("settings");
  return savedValue || {};
}
/* ***** userInfo ***** */

async function getUserInfo(tx) {
  const savedValue = await tx.get("userInfo");
  return savedValue || null;
}
/* ***** FeedSubscription ***** */

const {
  get: getSubscription,
  list: listSubscriptions
} = generate_1("subscription", feedSubscriptionSchema);

async function getDomainSubscriptions(tx, domain) {
  const subscriptions = await listSubscriptions(tx);
  return subscriptions.filter(s => s.domain === domain);
}
/* ***** sync state ***** */


const {
  get: getSyncState,
  list: listSyncStates
} = generate_1("sync", syncStateSchema);
const accessors = {
  getArticle,
  listArticles,
  getArticleText,
  listArticleTexts,
  listArticleLinks,
  getArticlesCount,
  listRecentArticles,
  groupRecentArticles,
  listFavoriteArticles,
  listQueueArticles,
  listDomainArticles,
  listTopicArticles,
  listTopicArticlesServer,
  getTopicArticlesCount,
  getReadingProgress,
  getTopic,
  listTopics,
  getTopicIdMap,
  groupTopics,
  getGroupTopicChildren,
  getAnnotation,
  listAnnotations,
  listAnnotationsWithArticles,
  listArticleAnnotations,
  getAnnotationsCount,
  listTopicAnnotations,
  getPartialSyncState,
  getSettings,
  getUserInfo,
  getSubscription,
  getDomainSubscriptions,
  listSubscriptions,
  getSyncState,
  listSyncStates
};

export { accessors, getAnnotation, getAnnotationsCount, getArticle, getArticleText, getArticlesCount, getGroupTopicChildren, getPartialSyncState, getReadingProgress, getSafeArticleSortPosition, getSettings, getSubscription, getTopic, getTopicArticlesCount, getTopicIdMap, getUserInfo, groupRecentArticles, groupTopics, listAnnotations, listArticleAnnotations, listArticleLinks, listArticleTexts, listArticles, listDomainArticles, listFavoriteArticles, listQueueArticles, listRecentArticles, listSubscriptions, listTopicArticles, listTopicArticlesServer, sortArticlesPosition };
