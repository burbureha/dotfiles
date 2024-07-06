import browserObj from './polyfill.js';

// In seperate file to prevent tree-shake overwrite during bundling
async function getAllCustomDomainSettings() {
    const config = await browserObj.storage.sync.get(["domain-allowlist", "domain-denylist"]);
    return {
        allow: Object.keys(config["domain-allowlist"] || {}),
        deny: Object.keys(config["domain-denylist"] || {}),
    };
}
async function getAllElementBlockSelectors() {
    const config = await browserObj.storage.sync.get(["blocked-element-selectors"]);
    return [...Object.values(config["blocked-element-selectors"] || [])].flat();
}

export { getAllCustomDomainSettings, getAllElementBlockSelectors };
