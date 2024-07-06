import { migrateMetricsUser } from '../background/metrics.js';
import browserObj from './polyfill.js';

async function setUserSettingsForDomain(domain, status) {
    const config = await browserObj.storage.sync.get(["domain-allowlist", "domain-denylist"]);
    if (!config["domain-allowlist"]) {
        config["domain-allowlist"] = {};
    }
    if (!config["domain-denylist"]) {
        config["domain-denylist"] = {};
    }
    if (status === "allow") {
        config["domain-allowlist"][domain] = true;
        delete config["domain-denylist"][domain];
    }
    else if (status === "deny") {
        config["domain-denylist"][domain] = true;
        delete config["domain-allowlist"][domain];
    }
    else {
        delete config["domain-denylist"][domain];
        delete config["domain-allowlist"][domain];
    }
    await browserObj.storage.sync.set({
        "domain-allowlist": config["domain-allowlist"],
        "domain-denylist": config["domain-denylist"],
    });
}
async function getPageReportCount() {
    const config = await browserObj.storage.sync.get(["reported-pages-count"]);
    return config["reported-pages-count"] || 0;
}
async function incrementPageReportCount() {
    const config = await browserObj.storage.sync.get(["reported-pages-count"]);
    await browserObj.storage.sync.set({
        "reported-pages-count": (config["reported-pages-count"] || 0) + 1,
    });
}
async function getDistinctId() {
    const config = await browserObj.storage.sync.get(["distinctId"]);
    return config["distinctId"] || null;
}
async function getLibraryUser() {
    const config = await browserObj.storage.sync.get(["library-user-id"]);
    return config["library-user-id"] || null;
}
async function getLibraryUserJwt() {
    const config = await browserObj.storage.sync.get(["library-web-jwt"]);
    return config["library-web-jwt"] || null;
}
async function setLibraryAuth(userId, webJwt) {
    await browserObj.storage.sync.set({ "library-user-id": userId });
    await browserObj.storage.sync.set({ "library-web-jwt": webJwt });
    await migrateMetricsUser();
}
async function getHypothesisSyncState() {
    const config = await browserObj.storage.sync.get(["hypothesis-sync-state"]);
    return config["hypothesis-sync-state"] || {};
}

export { getDistinctId, getHypothesisSyncState, getLibraryUser, getLibraryUserJwt, getPageReportCount, incrementPageReportCount, setLibraryAuth, setUserSettingsForDomain };
