import './polyfill.js';

/*
TODO: the following urls should be enabled but are not:
    https://journals.sagepub.com/doi/10.1177/01461672221079104

    https://words.filippo.io/pay-maintainers/
    https://www.sledgeworx.io/software-leviathans/

TODO: should not be enabled here:
    https://www.nytimes.com/interactive/2022/03/11/nyregion/nyc-chinatown-signs.html
    https://www.theatlantic.com/projects/america-in-person/
*/
// If the extension technically supports this extension
function extensionSupportsUrl(url) {
    const fileExtension = url.pathname.split(".").pop();
    // Can't easily detect blank html path, so blocklist unsupported instead
    return !["pdf", "png", "gif", "jpg", "jpeg", "webp", "mp3", "mp4", "css", "js"].includes(fileExtension);
}

export { extensionSupportsUrl };
