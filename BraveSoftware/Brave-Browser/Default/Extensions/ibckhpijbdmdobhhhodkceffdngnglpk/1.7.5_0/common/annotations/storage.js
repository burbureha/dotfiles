import browserObj from '../polyfill.js';

async function getHypothesisToken() {
    var _a;
    return (_a = (await getUserInfo())) === null || _a === void 0 ? void 0 : _a["hypothesis-api-token"];
}
async function getHypothesisUsername() {
    var _a;
    return (_a = (await getUserInfo())) === null || _a === void 0 ? void 0 : _a["hypothesis-username"];
}
async function getUserInfo() {
    return await browserObj.storage.sync.get(["hypothesis-api-token", "hypothesis-username"]);
}

export { getHypothesisToken, getHypothesisUsername, getUserInfo };
