import { reportEvent } from '../background/metrics.js';
import browserObj, { getBrowserType } from './polyfill.js';
import { incrementPageReportCount, getPageReportCount } from './storage.js';

async function handleReportBrokenPage(data) {
    const browserType = getBrowserType();
    const extensionInfo = await browserObj.management.getSelf();
    await incrementPageReportCount();
    const userReportCount = await getPageReportCount();
    let base64Screenshot;
    try {
        // take page screenshot showing the issue (bugs are hard to reproduce otherwise)
        // this code only runs when the user actively clicked the "report page" UI button, with the expectation
        // that the extension developer should take look at issues present on this URL
        base64Screenshot = await browserObj.tabs.captureVisibleTab({
            format: "jpeg",
            quality: 80,
        });
    }
    catch (err) {
        console.error("Error taking page screenshot:", err);
    }
    try {
        await fetch(`https://api2.lindylearn.io/report_broken_page`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                ...data,
                userAgent: navigator.userAgent,
                browserType,
                unclutterVersion: extensionInfo.version,
                screenshot: base64Screenshot,
                userReportCount,
            }),
        });
    }
    catch { }
    reportEvent("reportPage", { domain: data.domain });
}

export { handleReportBrokenPage };
