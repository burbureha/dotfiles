import { parseFeed } from '../../../../node_modules/htmlparser2/lib/esm/index.js';
import { getDomain } from '../common/util.js';
import ky from '../../../../node_modules/ky/distribution/index.js';
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
import { FEED_EXTENSIONS } from './discover.js';

async function getMainFeed(sourceUrl, rssUrls) {
  for (const feedUrl of rssUrls) {
    try {
      const feed = await fetchRssFeed(feedUrl);

      if (feed && feed.items.length > 0) {
        const subscription = constructFeedSubscription(sourceUrl, feedUrl, feed);
        console.log(`Parsed valid feed at ${feedUrl}`);
        return subscription;
      }
    } catch {}
  }

  return null;
}
async function fetchRssFeed(feedUrl) {
  const html = await ky.get(feedUrl).then(r => r.text());
  return parseFeed(html);
}

function constructFeedSubscription(sourceUrl, rssUrl, feed) {
  if (!feed) {
    return null;
  }

  const postFrequency = getPostFrequency(feed);
  const domain = getDomain(sourceUrl);

  if (!domain) {
    return null;
  } // ignore rss links, e.g. for http://liuliu.me/atom.xml


  if (feed.link && FEED_EXTENSIONS.some(e => feed.link.endsWith(e))) {
    feed.link = undefined;
  }

  return {
    id: rssUrl,
    rss_url: rssUrl,
    link: feed.link || `https://${domain}`,
    domain,
    title: feed.title,
    description: feed.description,
    author: feed.author,
    post_frequency: postFrequency,
    time_added: Math.round(new Date().getTime() / 1000)
  };
}

function getPostFrequency(feed) {
  if (feed.items.length < 5) {
    return undefined;
  } // sort reverse-chronologically
  // ignore very old feed items, e.g. for https://signal.org/blog/introducing-stories/


  feed.items = feed.items.filter(i => i.pubDate).sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()).slice(0, 10);
  const start = feed.items[feed.items.length - 1].pubDate;

  if (!start) {
    return undefined;
  }

  const end = new Date();
  const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  const articlesPerDay = Math.round(feed.items.length / days);
  const articlesPerWeek = Math.round(feed.items.length / (days / 7));
  const articlesPerMonth = Math.round(feed.items.length / (days / 30));
  const articlesPerYear = Math.round(feed.items.length / (days / 365));

  if (articlesPerDay >= 1) {
    return {
      per_week: articlesPerWeek,
      count: articlesPerDay,
      period: "day"
    };
  } else if (articlesPerWeek >= 1) {
    return {
      per_week: articlesPerWeek,
      count: articlesPerWeek,
      period: "week"
    };
  } else if (articlesPerMonth >= 1) {
    return {
      per_week: articlesPerWeek,
      count: articlesPerMonth,
      period: "month"
    };
  } else if (articlesPerYear >= 1) {
    return {
      per_week: articlesPerWeek,
      count: articlesPerYear,
      period: "year"
    };
  }

  return undefined;
}

export { fetchRssFeed, getMainFeed, getPostFrequency };
