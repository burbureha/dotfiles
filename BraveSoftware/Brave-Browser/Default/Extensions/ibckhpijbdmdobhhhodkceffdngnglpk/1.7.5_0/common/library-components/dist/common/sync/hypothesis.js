import ky from '../../../../../node_modules/ky/distribution/index.js';
import { getUrlHash } from '../url.js';
import { constructLocalArticle } from '../util.js';

const hypothesisApi = "https://api.hypothes.is/api"; // from https://github.com/lindylearn/obsidian-annotations/blob/master/src/api/api.ts

async function getHypothesisAnnotationsSince(username, apiToken, lastSyncDate, limit = 5000) {
  var _a;

  let hypothesisAnnotations = [];
  let newestTimestamp = (lastSyncDate === null || lastSyncDate === void 0 ? void 0 : lastSyncDate.toUTCString()) || "1970-01-01";

  try {
    // Paginate API calls via search_after param
    // search_after=null starts with the earliest annotations
    while (hypothesisAnnotations.length < limit) {
      const response = await ky.get(`${hypothesisApi}/search`, {
        headers: {
          Authorization: `Bearer ${apiToken}`
        },
        searchParams: {
          limit: 200,
          sort: "updated",
          order: "asc",
          search_after: newestTimestamp,
          user: `acct:${username}@hypothes.is`
        }
      }).json();
      const newAnnotations = response.rows;

      if (!newAnnotations.length) {
        // No more annotations
        break;
      }

      hypothesisAnnotations.push(...newAnnotations);
      newestTimestamp = newAnnotations[newAnnotations.length - 1].updated;
    }
  } catch (e) {
    console.error(e);
  }

  const annotations = hypothesisAnnotations.map(parseHypothesisAnnotation);
  const articles = [];
  const seenArticleIds = new Set();

  for (let i = 0; i < annotations.length; i++) {
    const annotation = annotations[i];
    const hypothesisAnnotation = hypothesisAnnotations[i];

    if (!seenArticleIds.has(annotation.article_id)) {
      seenArticleIds.add(annotation.article_id);
      articles.push({ ...constructLocalArticle(hypothesisAnnotation.uri, annotation.article_id, (_a = hypothesisAnnotation.document.title) === null || _a === void 0 ? void 0 : _a[0]),
        reading_progress: 1
      });
    }
  }

  return [annotations, articles, newestTimestamp];
}
function parseHypothesisAnnotation(annotation) {
  var _a, _b;

  const article_id = getUrlHash(annotation.uri);
  return {
    id: annotation.id,
    h_id: annotation.id,
    article_id,
    created_at: Math.round(new Date(annotation.created).getTime() / 1000),
    updated_at: annotation.updated ? Math.round(new Date(annotation.updated).getTime() / 1000) : undefined,
    quote_text: (_b = (_a = annotation.target) === null || _a === void 0 ? void 0 : _a[0].selector) === null || _b === void 0 ? void 0 : _b.filter(s => s.type == "TextQuoteSelector")[0].exact,
    text: annotation.text,
    tags: annotation.tags,
    quote_html_selector: annotation.target[0].selector
  };
}
async function createHypothesisAnnotation(username, apiToken, localAnnotation, page_url, page_title) {
  const response = await fetch(`${hypothesisApi}/annotations`, {
    headers: {
      Authorization: `Bearer ${apiToken}`
    },
    method: "POST",
    body: JSON.stringify({
      uri: page_url,
      text: localAnnotation.text,
      target: [{
        source: page_url,
        ...(localAnnotation.quote_html_selector ? {
          selector: localAnnotation.quote_html_selector
        } : {})
      }],
      document: {
        title: [page_title]
      },
      tags: localAnnotation.tags,
      permissions: {
        read: [`acct:${username}@hypothes.is`]
      },
      references: [] // localAnnotation.reply_to ? [localAnnotation.reply_to] : [],

    })
  });
  const json = await response.json();
  return json.id;
}
async function deleteHypothesisAnnotation(username, apiToken, annotation) {
  await fetch(`${hypothesisApi}/annotations/${annotation.h_id}`, {
    headers: {
      Authorization: `Bearer ${apiToken}`
    },
    method: "DELETE"
  });
}
async function updateHypothesisAnnotation(username, apiToken, annotation) {
  await fetch(`${hypothesisApi}/annotations/${annotation.h_id}`, {
    headers: {
      Authorization: `Bearer ${apiToken}`
    },
    method: "PATCH",
    body: JSON.stringify({
      text: annotation.text,
      tags: annotation.tags,
      permissions: {
        read: [`acct:${username}@hypothes.is`]
      }
    })
  }); // const json = await response.json();
  // return json;
}

export { createHypothesisAnnotation, deleteHypothesisAnnotation, getHypothesisAnnotationsSince, parseHypothesisAnnotation, updateHypothesisAnnotation };
