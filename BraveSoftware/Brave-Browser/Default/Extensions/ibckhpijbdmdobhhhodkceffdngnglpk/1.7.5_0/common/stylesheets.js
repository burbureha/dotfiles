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

export { createStylesheetLink, overrideClassname };
