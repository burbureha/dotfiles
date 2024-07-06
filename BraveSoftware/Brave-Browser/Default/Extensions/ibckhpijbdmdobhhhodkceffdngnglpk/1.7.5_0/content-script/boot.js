(function () {
    'use strict';

    function getBrowser() {
        // @ts-ignore
        return typeof browser !== "undefined" ? browser : chrome;
    }
    function getBrowserType() {
        // @ts-ignore
        if (typeof browser !== "undefined") {
            return "firefox";
        }
        else {
            return "chromium";
        }
    }
    function getUnclutterExtensionId() {
        return getBrowserType() === "chromium"
            ? "ibckhpijbdmdobhhhodkceffdngnglpk"
            : "{8f8c4c52-216c-4c6f-aae0-c214a870d9d9}";
    }
    function getNewTabExtensionId() {
        return getBrowserType() === "chromium"
            ? "bghgkooimeljolohebojceacblokenjn"
            : "{bb10288b-838a-4429-be0a-5268ee1560b8}";
    }
    // send a message to the Unclutter or Unclutter library extension
    function sendMessage(message, toLibrary = false) {
        return new Promise((resolve, reject) => {
            try {
                // preferrable send message to extension directly (https://developer.chrome.com/docs/extensions/mv3/messaging/#external-webpage)
                // this is the only way to send data from extension to extension
                getBrowser().runtime.sendMessage(toLibrary ? getNewTabExtensionId() : getUnclutterExtensionId(), message, resolve);
            }
            catch (err) {
                if (toLibrary) {
                    return;
                }
                // proxy with boot.js content script, e.g. for Firefox (see listenForPageEvents())
                const messageId = Math.random().toString(36).slice(2);
                const listener = (event) => {
                    if (event.data.event === "proxyUnclutterMessageResponse" &&
                        event.data.messageId === messageId) {
                        resolve(event.data.response);
                        window.removeEventListener("message", listener);
                    }
                };
                window.addEventListener("message", listener);
                window.postMessage({
                    event: "proxyUnclutterMessage",
                    messageId,
                    message,
                }, "*");
                // pre 1.7.1 fallback, does not support responses
                window.postMessage(message, "*");
            }
        });
    }

    // handle events from the browser extension install page & integrated article library
    // adding externally_connectable may not work for existing installs, and isn't supported on firefox
    function listenForPageEvents() {
        // events from unclutter companion website
        window.addEventListener("message", function (event) {
            if (event.data.event === "proxyUnclutterMessage") {
                const messageId = event.data.messageId;
                getBrowser().runtime.sendMessage(event.data.message, (response) => {
                    window.postMessage({
                        event: "proxyUnclutterMessageResponse",
                        messageId,
                        response,
                    }, "*");
                });
            }
        });
        // events from background worker
        getBrowser().runtime.onMessage.addListener((message, sender, sendResponse) => {
            if (message.event === "returnBrowserBookmarks") {
                // return browser bookmarks to import into the extension's companion website
                // this is triggered when the user clicks the extension icon on the Unclutter import website
                window.postMessage(message, "*");
            }
            return false;
        });
    }
    async function getUserInfoSimple() {
        return await sendMessage({ event: "getUserInfo" });
    }

    function getDomain(url) {
        try {
            return new URL(url).hostname.replace("www.", "");
        }
        catch {
            return;
        }
    }

    const defaultExcludedDomains = [
        "google.com",
        "yahoo.com",
        "bing.com",
        "duckduckgo.com",
        "keep.google.com",
        "docs.google.com",
        "calendar.google.com",
        "drive.google.com",
        "mail.google.com",
        "news.google.com",
        "mail.protonmail.com",
        "youtube.com",
        "news.ycombinator.com",
        "twitter.com",
        "linkedin.com",
        "reddit.com",
        "github.com",
        "stackoverflow.com",
        "developer.mozilla.org",
        "css-tricks.com",
        "twitch.tv",
        "amazon.com",
        "amazon.co.uk",
        "amazon.de",
        "ebay.com",
        "tailwindcss.com",
        "consent.yahoo.com",
        "messenger.com",
        "facebook.com",
        "scanofthemonth.com",
        "instagram.com",
        "pinterest.com",
        "netflix.com",
        "zoom.us",
        "tiktok.com",
        "discord.com",
        "microsoft.com",
        "imgur.com",
        "i.imgur.com",
        "producthunt.com",
        "awwwards.com",
        "figma.com",
        "Unsplash.com",
        "pudding.cool",
        "feedly.com",
        "notion.so",
        "lever.co",
        "angel.co",
        "archive.org",
    ];

    // use same api for chromium and firefox
    const browserObj = typeof browser !== "undefined" ? browser : chrome;
    browserObj.action = chrome.action || browserObj.browserAction;

    async function getUserSettingForDomain(domain) {
        var _a, _b;
        const config = await browserObj.storage.sync.get(["domain-allowlist", "domain-denylist"]);
        if ((_a = config["domain-allowlist"]) === null || _a === void 0 ? void 0 : _a[domain]) {
            return "allow";
        }
        if ((_b = config["domain-denylist"]) === null || _b === void 0 ? void 0 : _b[domain]) {
            return "deny";
        }
        return null;
    }

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
    // Exclude non-leaf directory pages like bbc.com or bcc.com/news.
    // This uses heurstics and won't always be accurate.
    function isNonLeafPage(url) {
        var _a;
        // Very likely not articles
        if (url.pathname === "/") {
            return true;
        }
        /*
        Exclude specific cases where the following checks fail:
            https://alexanderell.is/posts/tuner/
            https://en.wikipedia.org/wiki/Supernatural
            https://ae.studio/blog/victims-of-vimeo
            https://www.atlasobscura.com/articles/what-is-tomato-soup-cake
            https://www.moderndescartes.com/essays/deep_learning_emr/
        */
        if (url.pathname.match(/\/(post|posts|wiki|blog|article|articles|essays|doi|papers)\//)) {
            return false;
        }
        /*
        Specific directory pages
            https://www.newyorker.com/magazine/annals-of-medicine
        */
        if (url.pathname.match(/\/(magazine|category|author)\//) &&
            !url.pathname.match(/\/([0-9]+)\//)) {
            return true;
        }
        // Exlude URLs where the following checks fail
        const excludedDomains = [
            "paulgraham.com",
            "sive.rs",
            "fs.blog",
            "danluu.com",
            "xkcd.com",
            "ourworldindata.org",
        ];
        if (excludedDomains.includes(getDomain(url))) {
            return false;
        }
        /*
        Heuristic: articles usually include title in URL:
            https://thoughtspile.github.io/2022/03/21/bad-tech-interview/

        While directory pages do not:
            https://www.theatlantic.com/world/
            https://www.cbsnews.com/ukraine-crisis/
            https://www.axios.com/hard-truths/
            https://www.marketwatch.com/personal-finance
            https://www.msn.com/nl-nl/
        */
        const dashCount = ((_a = url.pathname.match(/\-/g)) === null || _a === void 0 ? void 0 : _a.length) || 0;
        if (dashCount >= 2) {
            return false;
        }
        return true;
    }
    async function isDeniedForDomain(domain) {
        const domainUserSetting = await getUserSettingForDomain(domain);
        return domainUserSetting === "deny" || defaultExcludedDomains.includes(domain);
    }
    // Determine whether to unclutter a specific web page
    // See docs in /docs/article-detection.md
    async function isConfiguredToEnable(domain) {
        // Follow user settings for domain
        const domainUserSetting = await getUserSettingForDomain(domain);
        if (domainUserSetting === "allow") {
            return true;
        }
        return false;
    }
    function isArticleByTextContent() {
        const readingTimeMinutes = document.body.innerText.trim().split(/\s+/).length / 200;
        document.querySelectorAll("a").length;
        // console.log({ readingTimeMinutes, linkCount, linksPerMinute });
        return readingTimeMinutes >= 3;
    }

    // script injected into every tab before dom construction
    // if configured by the user, initialize the extension functionality
    async function boot() {
        const url = new URL(window.location.href);
        const domain = getDomain(window.location.href);
        // reset badge count for tab after navigation
        browserObj.runtime.sendMessage(null, {
            event: "clearTabState",
        });
        // hard denylists
        if (!extensionSupportsUrl(url) || (await isDeniedForDomain(domain))) {
            return;
        }
        // events from the Unclutter companion websites
        if ([
            "unclutter.lindylearn.io",
            "my.unclutter.it",
            "localhost", // dev testing
        ].includes(domain)) {
            listenForPageEvents();
        }
        // check if the user already annotated this page
        const foundCount = await browserObj.runtime.sendMessage(null, {
            event: "checkHasLocalAnnotations",
        });
        if (foundCount) {
            onIsLikelyArticle(domain);
        }
        // url heuristic check to detect likely article pages (has many false negatives)
        if (!isNonLeafPage(url)) {
            onIsLikelyArticle(domain);
        }
        // accessing text content requires ready dom
        await waitUntilDomLoaded();
        if (isArticleByTextContent()) {
            onIsLikelyArticle(domain);
            // parse the article for annotations if enabled
            const userInfo = await getUserInfoSimple();
            if (userInfo === null || userInfo === void 0 ? void 0 : userInfo.aiEnabled) {
                // handle rest in highlights.ts
                requestEnhance("boot", "highlights");
            }
        }
    }
    async function onIsLikelyArticle(domain) {
        // enabled the extension if enabled by the user
        const automaticEnable = await isConfiguredToEnable(domain);
        if (automaticEnable) {
            requestEnhance("allowlisted");
        }
    }
    function requestEnhance(trigger, type = "full") {
        browserObj.runtime.sendMessage(null, {
            event: "requestEnhance",
            trigger,
            type,
        });
    }
    async function waitUntilDomLoaded() {
        return new Promise((resolve) => {
            if (document.readyState === "loading") {
                document.addEventListener("DOMContentLoaded", () => resolve());
            }
            else {
                resolve();
            }
        });
    }
    boot();

})();
