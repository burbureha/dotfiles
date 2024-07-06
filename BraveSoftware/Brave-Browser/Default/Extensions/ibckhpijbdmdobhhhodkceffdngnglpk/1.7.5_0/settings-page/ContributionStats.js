import React from '../node_modules/react/index.js';
import { getPageReportCount } from '../common/storage.js';
import { getAllElementBlockSelectors } from '../common/storage2.js';
import { r as react } from '../node_modules/_virtual/index.js';

function ContributionStats() {
    const [reportCount, setReportCount] = react.exports.useState(0);
    const [selectorCount, setSelectorCount] = react.exports.useState(0);
    react.exports.useEffect(() => {
        (async function () {
            const count = await getPageReportCount();
            setReportCount(count);
            const selectors = await getAllElementBlockSelectors();
            setSelectorCount(selectors.length);
        })();
    }, []);
    return (React.createElement("div", { className: "" },
        "You reported ",
        reportCount,
        " broken article",
        reportCount !== 1 ? "s" : "",
        " and submitted ",
        selectorCount,
        " ",
        React.createElement("a", { href: "https://github.com/lindylearn/unclutter/tree/main/docs/element-blocking.md", target: "_blank", rel: "noopener noreferrer", className: "underline" },
            "block selector",
            selectorCount !== 1 ? "s" : ""),
        ".",
        reportCount + selectorCount > 0 && React.createElement("span", null, " Thank you! ")));
}

export { ContributionStats as default };
