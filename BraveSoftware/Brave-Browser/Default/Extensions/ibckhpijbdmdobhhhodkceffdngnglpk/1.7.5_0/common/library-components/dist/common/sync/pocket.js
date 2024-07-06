import ky from '../../../../../node_modules/ky/distribution/index.js';
import '../../store/_schema.js';
import '../../store/accessors.js';
import '../../store/mutators.js';
import '../../../../../node_modules/react/index.js';
import '../../../../../node_modules/react-dom/index.js';
import { readingProgressFullClamp } from '../../store/constants.js';

const apiHost = "https://library.lindylearn.io"; // my. somehow doesn't work inside firefox extension?
// const apiHost = "http://localhost:3000";

const pocketConsumerKey = "106099-bc04e91092ca30bacd08f96";
async function getPocketArticles(apiToken, lastSyncDate) {
  try {
    // see https://getpocket.com/developer/docs/v3/retrieve
    // proxy via api function to avoid CORS and other issues
    const articles = await ky.post(`${apiHost}/api/pocket/get`, {
      json: {
        consumer_key: pocketConsumerKey,
        access_token: apiToken,
        since: Math.round(((lastSyncDate === null || lastSyncDate === void 0 ? void 0 : lastSyncDate.getTime()) || 0) / 1000)
      },
      timeout: false,
      retry: 0
    }).json();
    return articles;
  } catch (err) {
    console.error(err);
    return null;
  }
}
async function addUpdateArticles(apiToken, articles) {
  // send actions in batch to pass time_added
  // see https://getpocket.com/developer/docs/v3/modify
  const actions = [];
  articles.forEach(article => {
    var _a, _b;

    if (article.pocket_id) {
      // already exists remotely
      const isArchived = article.reading_progress >= readingProgressFullClamp;
      actions.push({
        action: isArchived ? "archive" : "readd",
        item_id: article.pocket_id,
        time: (_a = article.time_updated) === null || _a === void 0 ? void 0 : _a.toString()
      });
    } else {
      actions.push({
        action: "add",
        url: article.url,
        title: article.title,
        time: (_b = article.time_added) === null || _b === void 0 ? void 0 : _b.toString()
      });
    }
  });
  const response = await ky.post(`${apiHost}/api/pocket/send`, {
    json: {
      consumer_key: pocketConsumerKey,
      access_token: apiToken,
      actions
    },
    timeout: false,
    retry: 0
  }).json();
  return response.action_results.map((result, i) => (result === null || result === void 0 ? void 0 : result.item_id) || undefined);
}
async function deletePocketArticle(apiToken, article) {
  await ky.post(`${apiHost}/api/pocket/send`, {
    json: {
      consumer_key: pocketConsumerKey,
      access_token: apiToken,
      actions: [{
        action: "delete",
        item_id: article.pocket_id
      }]
    }
  });
}

export { addUpdateArticles, deletePocketArticle, getPocketArticles, pocketConsumerKey };
