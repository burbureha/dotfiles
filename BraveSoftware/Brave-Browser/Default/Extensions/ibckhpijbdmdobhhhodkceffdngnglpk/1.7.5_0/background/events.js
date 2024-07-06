import { getHeatmapRemote } from '../common/library-components/dist/common/api.js';
import '../node_modules/seedrandom/index.js';
import '../node_modules/flexsearch/dist/flexsearch.bundle.js';
import { getUrlHash } from '../common/library-components/dist/common/url.js';
import '../node_modules/react/index.js';
import '../common/library-components/dist/common/sync/highlights.js';
import '../common/library-components/dist/store/_schema.js';
import '../common/library-components/dist/store/accessors.js';
import '../common/library-components/dist/store/mutators.js';
import '../node_modules/react-dom/index.js';
import '../common/library-components/dist/common/sync/articles.js';
import { fetchRssFeed } from '../common/library-components/dist/feeds/parse.js';
import '../node_modules/linkedom/esm/index.js';
import { extensionSupportsUrl } from '../common/articleDetection.js';
import { handleReportBrokenPage } from '../common/bugReport.js';
import { setFeatureFlag, isDevelopmentFeatureFlag, enableExperimentalFeatures } from '../common/featureFlags.js';
import browserObj from '../common/polyfill.js';
import { setLibraryAuth } from '../common/storage.js';
import { saveInitialInstallVersionIfMissing } from '../common/updateMessages.js';
import { fetchCss } from './actions.js';
import { requestBookmarksPermission, getAllBookmarks } from './bookmarks.js';
import { enableInTab, togglePageViewMessage, injectScript } from './inject.js';
import { setupWithPermissions, createAlarmListeners, onNewInstall } from './install.js';
import { discoverRssFeed } from './library/feeds.js';
import { initLibrary, rep, processReplicacheMessage, processReplicacheSubscribe } from './library/library.js';
import { captureActiveTabScreenshot, getLocalScreenshot } from './library/screenshots.js';
import { search } from './library/search.js';
import { startMetrics, reportEnablePageView, reportDisablePageView, reportEvent, getRemoteFeatureFlags, reportSettings } from './metrics.js';
import { tabsManager } from './tabs.js';
import { initHighlightsSync, initArticlesSync } from './library/sync.js';
import { captureErrors, initErrorLogs } from './sentry.js';

// toggle page view on extension icon click
browserObj.action.onClicked.addListener((tab) => captureErrors(() => {
    const url = new URL(tab.url);
    if (url.href === "https://my.unclutter.it/sync?from=bookmarks") {
        // Support importing browser bookmarks into the extension companion website (which allows the user to organize & easily open articles with the extension).
        // This code only runs if the user explicitly triggered it: they selected the browser import on the companion website, clicked the extension icon as stated in the instructions, then granted the optional bookmarks permission.
        requestBookmarksPermission().then(async (granted) => {
            if (granted) {
                console.log("Starting bookmarks library import");
                const bookmarks = await getAllBookmarks();
                await browserObj.tabs.sendMessage(tab.id, {
                    event: "returnBrowserBookmarks",
                    bookmarks,
                });
            }
        });
    }
    else if (extensionSupportsUrl(url)) {
        // enable reader mode on current site
        enableInTab(tab.id).then((didEnable) => {
            if (!didEnable) {
                // already active, so disable
                togglePageViewMessage(tab.id);
                return;
            }
            if (didEnable) {
                tabsManager.onActivateReaderMode(tab.id);
                reportEnablePageView("manual");
            }
        });
    }
    // can only request permissions from user action, use this opportunity
    // can't make callback a promise for this to work
    setupWithPermissions();
}));
// handle events from content scripts and seperate Unclutter New Tab extension
browserObj.runtime.onMessage.addListener(handleMessage);
browserObj.runtime.onMessageExternal.addListener(handleMessage);
function handleMessage(message, sender, sendResponse) {
    return captureErrors(() => {
        if (message.event === "disabledPageView") {
            reportDisablePageView(message.trigger, message.pageHeightPx);
        }
        else if (message.event === "requestEnhance") {
            // event sent from boot.js to inject additional functionality
            // browser apis are only available in scripts injected from background scripts or manifest.json
            console.log(`Requested ${message.type} script injection`);
            if (message.type === "full") {
                injectScript(sender.tab.id, "content-script/enhance.js");
                tabsManager.onActivateReaderMode(sender.tab.id);
                reportEnablePageView(message.trigger);
            }
            else if (message.type === "highlights") {
                if (tabsManager.hasAIAnnotations(sender.tab.id)) {
                    // already parsed page for annotations before
                    return;
                }
                injectScript(sender.tab.id, "content-script/highlights.js");
            }
        }
        else if (message.event === "openOptionsPage") {
            browserObj.runtime.openOptionsPage();
        }
        else if (message.event === "fetchCss") {
            fetchCss(message.url).then(sendResponse);
            return true;
        }
        else if (message.event === "reportEvent") {
            reportEvent(message.name, message.data);
        }
        else if (message.event === "getRemoteFeatureFlags") {
            getRemoteFeatureFlags().then(sendResponse);
            return true;
        }
        else if (message.event === "reportBrokenPage") {
            handleReportBrokenPage(message.data);
        }
        else if (message.event === "openLink") {
            if (message.newTab) {
                browserObj.tabs.create({ url: message.url, active: true });
            }
            else {
                browserObj.tabs.update(undefined, { url: message.url });
            }
        }
        else if (message.event === "openLinkWithUnclutter") {
            const onTabActive = async (tab) => {
                // need to wait until site loaded, as have no permissions on new tab page
                await new Promise((resolve) => setTimeout(resolve, 100));
                await injectScript(tab.id, "content-script/enhance.js");
                tabsManager.onActivateReaderMode(sender.tab.id);
                if (message.annotationId) {
                    await new Promise((resolve) => setTimeout(resolve, 200));
                    await browserObj.tabs.sendMessage(tab.id, {
                        event: "focusAnnotation",
                        annotationId: message.annotationId,
                    });
                }
            };
            if (message.newTab) {
                browserObj.tabs.create({ url: message.url, active: true }, onTabActive);
            }
            else {
                browserObj.tabs.update(undefined, { url: message.url }, onTabActive);
            }
        }
        else if (message.event === "focusAnnotation") {
            // direct message back to listeners in same tab
            browserObj.tabs.sendMessage(sender.tab.id, message);
        }
        else if (message.event === "setLibraryAuth") {
            setLibraryAuth(message.userId, message.webJwt).then(() => initLibrary());
        }
        else if (message.event === "initLibrary") {
            initLibrary();
        }
        else if (message.event === "initSync") {
            if (message.syncState.id === "hypothesis") {
                initHighlightsSync(message.syncState);
            }
            else {
                initArticlesSync(message.syncState);
            }
        }
        else if (message.event === "getUserInfo") {
            rep === null || rep === void 0 ? void 0 : rep.query.getUserInfo().then(sendResponse);
            return true;
        }
        else if (message.event === "processReplicacheMessage") {
            processReplicacheMessage(message).then(sendResponse);
            return true;
        }
        else if (message.event === "captureActiveTabScreenshot") {
            captureActiveTabScreenshot(message.articleId, message.bodyRect, message.devicePixelRatio);
        }
        else if (message.event === "getLocalScreenshot") {
            getLocalScreenshot(message.articleId).then(sendResponse);
            return true;
        }
        else if (message.event === "getUnclutterVersion") {
            browserObj.management
                .getSelf()
                .then((extensionInfo) => sendResponse(extensionInfo.version));
            return true;
        }
        else if (message.event === "searchLibrary") {
            search(message.type, message.query).then(sendResponse);
            return true;
        }
        else if (message.event === "discoverRssFeed") {
            discoverRssFeed(message.sourceUrl, message.feedCandidates, message.tagLinkCandidates).then(sendResponse);
            return true;
        }
        else if (message.event === "fetchRssFeed") {
            fetchRssFeed(message.feedUrl).then(sendResponse);
            return true;
        }
        else if (message.event === "getHeatmap") {
            // getHeatmap(message.paragraphs).then(sendResponse);
            getHeatmapRemote(message.paragraphs).then(sendResponse);
            return true;
        }
        else if (message.event === "clearTabState") {
            tabsManager.onCloseTab(sender.tab.id);
        }
        else if (message.event === "checkHasLocalAnnotations") {
            const articleId = getUrlHash(sender.tab.url);
            tabsManager.checkHasLocalAnnotations(sender.tab.id, articleId).then(sendResponse);
            return true;
        }
        else if (message.event === "setParsedAnnotations") {
            tabsManager.setParsedAnnotations(sender.tab.id, message.annotations);
        }
        return false;
    });
}
// handle long-lived connections e.g. for replicache data change subscribes
browserObj.runtime.onConnect.addListener(handleConnect);
browserObj.runtime.onConnectExternal.addListener(handleConnect);
function handleConnect(port) {
    return captureErrors(() => {
        if (port.name === "replicache-subscribe") {
            processReplicacheSubscribe(port);
        }
        // ports will be disconnected when the modal iframe is closed
    });
}
// run on install, extension update, or browser update
browserObj.runtime.onInstalled.addListener(async ({ reason }) => captureErrors(async () => {
    const extensionInfo = await browserObj.management.getSelf();
    const isNewInstall = reason === "install";
    const isDev = extensionInfo.installType === "development";
    if (isDev) {
        await setFeatureFlag(isDevelopmentFeatureFlag, true);
        await setFeatureFlag(enableExperimentalFeatures, true);
    }
    // report aggregates on enabled extension features
    // this function should be executed every few days
    reportSettings(extensionInfo.version, isNewInstall);
    if (isNewInstall && !isDev) {
        onNewInstall(extensionInfo.version);
    }
    saveInitialInstallVersionIfMissing(extensionInfo.version);
    // update default shortcut based on os
    browserObj.runtime.getPlatformInfo().then(({ os }) => {
        const shortcut = os === "mac" ? "⌥+C" : "Alt+C";
        browserObj.action.setTitle({
            title: `Unclutter Current Article (${shortcut})`,
        });
    });
}));
// track tab changes to update extension icon badge
browserObj.tabs.onActivated.addListener((info) => captureErrors(() => tabsManager.onChangeActiveTab(info.tabId)));
browserObj.tabs.onUpdated.addListener((tabId, change) => captureErrors(() => {
    if (change.url) {
        // clear state for old url, checkLocalAnnotationCount will be sent for likely articles again
        tabsManager.onCloseTab(tabId);
    }
}));
browserObj.tabs.onRemoved.addListener((tabId) => captureErrors(() => tabsManager.onCloseTab(tabId)));
// initialize on every service worker start
async function initializeServiceWorker() {
    // isDevelopmentFeatureFlag not available during initial install yet
    const extensionInfo = await browserObj.management.getSelf();
    const isDev = extensionInfo.installType === "development";
    initErrorLogs(isDev);
    startMetrics(isDev);
    await initLibrary(isDev);
    // if (userInfo?.aiEnabled) {
    //     // load tensorflow model
    //     // unfortunately cannot create nested service workers, see https://bugs.chromium.org/p/chromium/issues/detail?id=1219164
    //     // another option: importScript()? https://stackoverflow.com/questions/66406672/how-do-i-import-scripts-into-a-service-worker-using-chrome-extension-manifest-ve
    //     loadHeatmapModel();
    // }
}
initializeServiceWorker();
setupWithPermissions(); // needs to run after every reload to configure event handlers
createAlarmListeners();
