(function () {
    'use strict';

    // use same api for chromium and firefox
    const browserObj = typeof browser !== "undefined" ? browser : chrome;
    browserObj.action = chrome.action || browserObj.browserAction;

    const overrideClassname = "lindylearn-document-override";
    function createStylesheetLink(url, styleId, insertAfter = null, usedDocument = document) {
        const link = usedDocument.createElement("link");
        link.classList.add(overrideClassname);
        link.classList.add(styleId);
        link.id = styleId;
        link.type = "text/css";
        link.rel = "stylesheet";
        link.href = url;
        if (insertAfter) {
            insertAfter.parentElement.insertBefore(link, (insertAfter === null || insertAfter === void 0 ? void 0 : insertAfter.nextSibling) || insertAfter);
        }
        else {
            usedDocument.head.appendChild(link);
        }
        return link;
    }

    window.addEventListener("message", ({ data }) => {
        if (data.event === "setCssVariable") {
            document.body.style.setProperty(data.key, data.value);
        }
        else if (data.event === "setDarkMode") {
            if (data.darkModeEnabled) {
                document.body.classList.add("dark");
                createStylesheetLink(browserObj.runtime.getURL("sidebar/dark.css"), "dark-mode-ui-style", document === null || document === void 0 ? void 0 : document.head.lastChild);
            }
            else {
                document.body.classList.remove("dark");
                document === null || document === void 0 ? void 0 : document.querySelectorAll(".dark-mode-ui-style").forEach((e) => e.remove());
            }
        }
    });
    window.top.postMessage({ event: "sidebarIframeLoaded" }, "*");

})();
