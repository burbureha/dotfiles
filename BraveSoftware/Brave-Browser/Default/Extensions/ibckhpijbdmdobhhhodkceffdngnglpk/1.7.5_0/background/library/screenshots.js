import { createStore, clear, set, get } from '../../node_modules/idb-keyval/dist/index.js';
import browserObj from '../../common/polyfill.js';

const screenshotStore = createStore("screenshots-local", "keyval");
// Capture a screenshot of the current article page to display as thumbnail inside the library UI.
// These screenshots are saved inside a local indexedDB database. This avoids sending network requests to generate
// thumbnails for every article the user visits.
async function captureActiveTabScreenshot(articleId, bodyRect, devicePixelRatio) {
    let start = performance.now();
    let base64Screenshot;
    try {
        const options = {
            format: "png",
        };
        base64Screenshot = await browserObj.tabs.captureVisibleTab(null, options);
    }
    catch (err) {
        console.error("Error taking page screenshot:", err);
        return;
    }
    let duration = Math.round(performance.now() - start);
    console.log(`Captured library article screenshot in ${duration}ms.`);
    await new Promise((resolve) => setTimeout(resolve, 1000)); // wait a bit
    start = performance.now();
    base64Screenshot = await scaleImage(base64Screenshot, bodyRect, devicePixelRatio);
    duration = Math.round(performance.now() - start);
    console.log(`Cropped article screenshot in ${duration}ms.`);
    await set(articleId, base64Screenshot, screenshotStore);
}
// chrome can only take screenshots of the entire tab, so need to crop to article manually
// also scale-down image to reduce size
async function scaleImage(base64Screenshot, bodyRect, devicePixelRatio) {
    // use physical displayed pixel size
    const targetWidth = 144 * devicePixelRatio;
    const targetHeight = 160 * devicePixelRatio;
    // @ts-ignore
    const canvas = new OffscreenCanvas(targetWidth, targetHeight);
    const context = canvas.getContext("2d");
    // Image() not accessible in workers
    const sourceBlob = await fetch(base64Screenshot).then((r) => r.blob());
    const img = await createImageBitmap(sourceBlob);
    // see https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/drawImage
    const drawScale = targetWidth / bodyRect.width;
    context.drawImage(img, 
    // screenshot uses physical pixels, DOMReact virtual
    bodyRect.x * devicePixelRatio, bodyRect.y * devicePixelRatio, bodyRect.width * devicePixelRatio, bodyRect.height * devicePixelRatio, 0, 0, targetWidth, bodyRect.height * drawScale // keep same width/height ratio
    );
    // convert to base64 (do now instead of when using images)
    // can take a few seconds due to low execution priority
    const blob = await canvas.convertToBlob({
        type: "image/webp",
        quality: 70,
    });
    const reader = new FileReader();
    reader.readAsDataURL(blob); // could run too fast?
    await new Promise((resolve) => reader.addEventListener("load", resolve));
    console.log(`Screenshot size: ${Math.round(blob.size / 1000)}KB`);
    return reader.result;
}
// called from modal app
async function getLocalScreenshot(articleId) {
    return (await get(articleId, screenshotStore)) || null;
}
// delete if user creates a library account: uses remote insert anyways for import
async function deleteAllLocalScreenshots() {
    await clear(screenshotStore);
}

export { captureActiveTabScreenshot, deleteAllLocalScreenshots, getLocalScreenshot };
