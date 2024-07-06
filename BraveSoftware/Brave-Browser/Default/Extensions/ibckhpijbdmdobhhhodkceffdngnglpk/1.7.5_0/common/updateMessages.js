import browserObj from './polyfill.js';

async function getInitialInstallVersion() {
    const config = await browserObj.storage.sync.get("initial-install-version");
    return config["initial-install-version"];
}
// introduced with 0.12.0
async function saveInitialInstallVersionIfMissing(version) {
    const savedVersion = await getInitialInstallVersion();
    if (!savedVersion) {
        await browserObj.storage.sync.set({ "initial-install-version": version });
    }
}

export { getInitialInstallVersion, saveInitialInstallVersionIfMissing };
