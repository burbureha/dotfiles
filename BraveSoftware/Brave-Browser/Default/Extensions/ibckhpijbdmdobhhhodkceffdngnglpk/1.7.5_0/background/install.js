import browserObj, { getBrowserType } from '../common/polyfill.js';
import { injectScript } from './inject.js';
import { reportEnablePageView } from './metrics.js';
import { rep } from './library/library.js';
import { constructLocalArticle } from '../common/library-components/dist/common/util.js';
import { getUrlHash } from '../common/library-components/dist/common/url.js';
import { syncPull } from './library/sync.js';

function onNewInstall(version) {
    browserObj.tabs.create({
        url: "https://unclutter.it/welcome",
        active: true,
    });
    browserObj.runtime.setUninstallURL("https://unclutter.it/uninstalled");
}
// only run one time after each update
let installed = false;
function setupWithPermissions() {
    if (installed) {
        return;
    }
    try {
        // test if already have permissions
        installContextMenu();
        installAlarms();
        installed = true;
        return;
    }
    catch { }
    // need to request permissions as part of user action, so can't use async functions
    try {
        console.log("Requesting optional permissions ...");
        browserObj.permissions
            .request({
            permissions: ["contextMenus", "alarms"],
        })
            .then(() => {
            installContextMenu();
            installAlarms();
            installed = true;
        });
    }
    catch (err) {
        console.error(err);
    }
}
function installContextMenu() {
    console.log("Registering context menu ...");
    createOrUpdateContextMenu("unclutter-link", {
        title: "Open Link with Unclutter",
        contexts: ["link"],
    });
    let rightClickContext = "action";
    if (getBrowserType() === "firefox") {
        rightClickContext = "browser_action";
    }
    createOrUpdateContextMenu("open-library", {
        title: "Open library",
        contexts: [rightClickContext],
    });
    createOrUpdateContextMenu("save-article", {
        title: "Save article for later",
        contexts: [rightClickContext],
    });
    // TODO use seperate entries for unregistered users?
    // throws error if no permission
    browserObj.contextMenus.onClicked.addListener((info, tab) => {
        if (info.menuItemId === "unclutter-link") {
            browserObj.tabs.create({ url: info.linkUrl, active: true }, (tab) => {
                // need to wait until loaded, as have no permissions on new tab page
                setTimeout(() => {
                    injectScript(tab.id, "content-script/enhance.js");
                }, 1000);
                reportEnablePageView("contextMenu");
            });
        }
        else if (info.menuItemId === "open-library") {
            browserObj.tabs.create({
                url: "https://my.unclutter.it/articles",
                active: true,
            });
        }
        else if (info.menuItemId === "open-signup") {
            browserObj.tabs.create({
                url: "https://my.unclutter.it/signup",
                active: true,
            });
        }
        else if (info.menuItemId === "save-article") {
            (async () => {
                var _a;
                const activeTab = (_a = (await browserObj.tabs.query({ currentWindow: true, active: true }))) === null || _a === void 0 ? void 0 : _a[0];
                if (!activeTab) {
                    console.error("No active tab found");
                    return;
                }
                const article = constructLocalArticle(activeTab.url, getUrlHash(activeTab.url), activeTab.title);
                await rep.mutate.putArticleIfNotExists(article);
            })();
        }
    });
}
function createOrUpdateContextMenu(id, menuOptions) {
    // try update first
    try {
        browserObj.contextMenus.update(id, menuOptions);
    }
    catch { }
    try {
        browserObj.contextMenus.create({ ...menuOptions, id });
    }
    catch {
        browserObj.runtime.lastError;
    }
}
async function installAlarms() {
    console.log("Registering periodic alarms...");
    // createAlarmIfNotExists("unclutter-library-feed-refresh", 12);
    createAlarmIfNotExists("unclutter-library-sync-pull", 4);
    createAlarmListeners();
}
async function createAlarmIfNotExists(id, everyXHour) {
    if (await browserObj.alarms.get()) {
        return;
    }
    browserObj.alarms.create(id, {
        delayInMinutes: 1,
        periodInMinutes: 60 * everyXHour,
    });
}
function createAlarmListeners() {
    var _a;
    // browser.alarms?.onAlarm.addListener((alarm: Alarms.Alarm) => {
    //     if (alarm.name === "unclutter-library-feed-refresh") {
    //         refreshLibraryFeeds();
    //     }
    // });
    (_a = browserObj.alarms) === null || _a === void 0 ? void 0 : _a.onAlarm.addListener((alarm) => {
        if (alarm.name === "unclutter-library-sync-pull") {
            syncPull();
        }
    });
}

export { createAlarmListeners, onNewInstall, setupWithPermissions };
