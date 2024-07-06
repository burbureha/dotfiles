import { getDomain } from '../common/util.js';
import '../../../../node_modules/seedrandom/index.js';
import '../../../../node_modules/flexsearch/dist/flexsearch.bundle.js';
import '../../../../node_modules/crypto-js/sha256.js';
import '../../../../node_modules/react/index.js';
import '../common/sync/highlights.js';
import '../store/_schema.js';
import '../store/accessors.js';
import '../store/mutators.js';
import '../../../../node_modules/react-dom/index.js';
import '../common/sync/articles.js';
import { getMainFeed } from './parse.js';

const FEED_TYPES = ["application/atom+xml", "application/json", "application/rdf+xml", "application/rss+xml", "application/x.atom+xml", "application/x-atom+xml", "text/atom+xml", "text/plain", "text/rdf+xml", "text/rss+xml", "text/xml"];
async function discoverFeedsInDocument(document, sourceUrl) {
  // adapted from https://github.com/adbar/trafilatura/blob/aa0f0a55ec40b0d9347a771bbeed9e4f5ef72dd9/trafilatura/feeds.py and https://github.com/DIYgod/RSSHub-Radar/blob/master/src/js/content/utils.js
  let feedUrls = []; // parse HTML

  document.querySelectorAll("link[href]").forEach(link => {
    if (link.type && FEED_TYPES.includes(link.type)) {
      feedUrls.push(link.href);
    } else if (link.href.includes("rss") || link.href.includes("atom")) {
      feedUrls.push(link.href);
    }
  });

  if (feedUrls.length === 0) {
    document.querySelectorAll("a[href]").forEach(link => {
      if ([".rss", ".rdf", ".xml", ".atom"].some(end => link.href.toLowerCase().endsWith(end))) {
        feedUrls.push(link.href);
      } else if (link.href.includes("rss") || link.href.includes("atom")) {
        feedUrls.push(link.href);
      }
    });
  } // filter out invalid URLs


  feedUrls = feedUrls.map(url => {
    if (url.startsWith("/")) {
      return new URL(url, new URL(sourceUrl).origin).href;
    }

    if (url === sourceUrl) {
      return null;
    }

    if (url.includes("comments")) {
      return null;
    }

    try {
      new URL(url);
    } catch {
      return null;
    }

    return url;
  }).filter(url => url !== null); // try most specific feeds first
  // often this means the second listed link
  // TODO try longest link first?

  feedUrls.reverse();
  console.log("Discovered feeds in html", feedUrls);
  return feedUrls;
} // fallback
const FEED_SUFFIXES = ["/feed", "/index", "/rss", "/atom"];
const FEED_EXTENSIONS = [".rss", ".xml", ".rss", ".atom"];
function getHeuristicFeedUrls(sourceUrl) {
  const url = new URL(sourceUrl);
  const feedUrls = [];
  FEED_SUFFIXES.forEach(suffix => {
    FEED_EXTENSIONS.concat([""]).forEach(extension => {
      if (suffix === "/index" && extension === "") {
        return;
      }

      feedUrls.push(url.origin + suffix + extension);
    });
  });
  return feedUrls;
} // try rss feed of google news search results
// this works well for popular news sites, e.g. economist.com

async function getGoogleNewsFeed(sourceUrl) {
  const domain = getDomain(sourceUrl);

  if (!domain) {
    return null;
  }

  let feed = await getMainFeed(sourceUrl, [`https://news.google.com/rss/search?q=site:${domain}&scoring=n&num=20`]);

  if (feed && feed.post_frequency) {
    feed.domain = domain;
    feed.link = `https://${domain}`;
    feed.title = domain;
    feed.description = undefined;
    feed.author = undefined;
    console.log("Found valid Google News feed", feed);
  } else {
    feed = null;
  }

  return feed;
}

export { FEED_EXTENSIONS, FEED_SUFFIXES, discoverFeedsInDocument, getGoogleNewsFeed, getHeuristicFeedUrls };
