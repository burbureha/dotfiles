import ky from '../../../../node_modules/ky/distribution/index.js';
import { parseHTML } from '../../../../node_modules/linkedom/esm/index.js';
import { discoverFeedsInDocument } from './discover.js';
import { getMainFeed } from './parse.js';

async function fetchParseFeedForUrl(url) {
  const html = await ky.get(url).then(r => r.text());
  const {
    document
  } = parseHTML(html);

  if (!document) {
    return null;
  }

  const feedUrls = await discoverFeedsInDocument(document, url);
  return await getMainFeed(url, feedUrls);
}

export { fetchParseFeedForUrl };
