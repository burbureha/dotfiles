import { getHeuristicFeedUrls, getGoogleNewsFeed } from '../../common/library-components/dist/feeds/discover.js';
import { getMainFeed } from '../../common/library-components/dist/feeds/parse.js';
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
import { fetchParseFeedForUrl } from '../../common/library-components/dist/feeds/document.js';

async function discoverRssFeed(sourceUrl, feedCandidates, tagLinkCandidates) {
    // try specific tag feeds
    if (tagLinkCandidates.length > 0) {
        // use only first tag
        const feed = await fetchParseFeedForUrl(tagLinkCandidates[0]);
        console.log("Fetched tag feeds", tagLinkCandidates, feed);
        if (feed) {
            return feed;
        }
    }
    // try feeds correctly linked in html
    let feed = await getMainFeed(sourceUrl, feedCandidates);
    if (feed) {
        return feed;
    }
    // try common feed urls
    feed = await getMainFeed(sourceUrl, getHeuristicFeedUrls(sourceUrl));
    if (feed) {
        return feed;
    }
    // try google news search
    feed = await getGoogleNewsFeed(sourceUrl);
    if (feed) {
        return feed;
    }
    return null;
}

export { discoverRssFeed };
