// use same api for chromium and firefox
const browserObj = typeof browser !== "undefined" ? browser : chrome;
browserObj.action = chrome.action || browserObj.browserAction;
function getBrowserType() {
    if (typeof browser !== "undefined") {
        return "firefox";
    }
    else {
        return "chromium";
    }
}

export { browserObj as default, getBrowserType };
