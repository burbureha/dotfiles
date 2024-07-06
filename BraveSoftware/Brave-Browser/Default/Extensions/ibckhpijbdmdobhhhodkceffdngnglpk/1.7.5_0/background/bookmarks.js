import browserObj from '../common/polyfill.js';
import { getDomain } from '../common/library-components/dist/common/util.js';

function requestBookmarksPermission() {
    return browserObj.permissions.request({
        permissions: ["bookmarks"],
    });
}
const excludedDomains = ["mozilla.org", "support.mozilla.org"]; // ignore default bookmark on Firefox
async function getAllBookmarks() {
    const bookmarks = await browserObj.bookmarks.search({});
    return bookmarks
        .filter((b) => b.url !== undefined && !excludedDomains.includes(getDomain(b.url)))
        .map((b) => ({
        url: b.url,
        time_added: Math.round(b.dateAdded / 1000),
        favorite: false,
    }));
}

export { getAllBookmarks, requestBookmarksPermission };
