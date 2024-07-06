import browserObj from '../common/polyfill.js';

async function enableInTab(tabId) {
    try {
        const response = await browserObj.tabs.sendMessage(tabId, {
            event: "ping",
        });
        const pageViewEnabled = response === null || response === void 0 ? void 0 : response.pageViewEnabled;
        console.log("Got ping response from content script", { pageViewEnabled });
        // toggle the page view if not active
        if (!pageViewEnabled) {
            togglePageViewMessage(tabId);
            return true;
        }
        return false;
    }
    catch (err) {
        // throws error if message listener not loaded
        // in that case, just load the content script
        console.log("Injecting enhance.js...");
        await injectScript(tabId, "content-script/enhance.js");
        return true;
    }
}
async function togglePageViewMessage(tabId) {
    await browserObj.tabs.sendMessage(tabId, { event: "togglePageView" });
}
// inject a content script
async function injectScript(tabId, filePath) {
    // different calls for v2 and v3 manifest
    // @ts-ignore
    if (chrome === null || chrome === void 0 ? void 0 : chrome.scripting) {
        // default runAt=document_idle
        // @ts-ignore
        await chrome.scripting.executeScript({
            target: { tabId },
            files: [filePath],
        });
    }
    else {
        await browserObj.tabs.executeScript(tabId, {
            file: browserObj.runtime.getURL(filePath),
        });
    }
}

export { enableInTab, injectScript, togglePageViewMessage };
