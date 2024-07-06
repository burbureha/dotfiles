import browserObj from '../common/polyfill.js';
import { rep } from './library/library.js';
import { getRelatedAnnotationsCount, saveAIAnnotations } from './library/smartHighlights.js';

class TabStateManager {
    constructor() {
        this.tabReaderModeActive = {};
        this.tabAnnotations = {};
        this.unsavedAnnotations = {};
        this.relatedAnnotationsCount = {};
    }
    onChangeActiveTab(tabId) {
        this.renderBadgeCount(tabId);
    }
    onCloseTab(tabId) {
        // release storage
        delete this.tabReaderModeActive[tabId];
        delete this.tabAnnotations[tabId];
        delete this.relatedAnnotationsCount[tabId];
        // clear badge
        this.renderBadgeCount(tabId);
    }
    // check saved annotations for a given url (without any network requests), to
    // determine if the user previously used the extension on this page
    async checkHasLocalAnnotations(tabId, articleId) {
        var _a;
        if (!(await this.checkAIEnabled())) {
            return;
        }
        // clear immediately after navigation
        this.onCloseTab(tabId);
        this.tabAnnotations[tabId] = await rep.query.listArticleAnnotations(articleId);
        this.relatedAnnotationsCount[tabId] = await getRelatedAnnotationsCount(this.userInfo, this.tabAnnotations[tabId]);
        this.renderBadgeCount(tabId);
        return !!((_a = this.tabAnnotations[tabId]) === null || _a === void 0 ? void 0 : _a.length);
    }
    hasAIAnnotations(tabId) {
        var _a;
        const aiAnnotations = ((_a = this.tabAnnotations[tabId]) === null || _a === void 0 ? void 0 : _a.filter((a) => a.ai_created)) || [];
        return !!(aiAnnotations === null || aiAnnotations === void 0 ? void 0 : aiAnnotations.length);
    }
    async setParsedAnnotations(tabId, annotations) {
        if (!(await this.checkAIEnabled())) {
            return;
        }
        // highlights.ts may be injected by reader mode itself, so immediately save annotations once available
        if (this.tabReaderModeActive[tabId]) {
            saveAIAnnotations(this.userInfo, annotations);
            this.unsavedAnnotations[tabId] = false;
        }
        else {
            this.unsavedAnnotations[tabId] = true;
        }
        this.tabAnnotations[tabId] = annotations;
        this.relatedAnnotationsCount[tabId] = await getRelatedAnnotationsCount(this.userInfo, annotations);
        this.renderBadgeCount(tabId);
    }
    async onActivateReaderMode(tabId) {
        this.tabReaderModeActive[tabId] = true;
        const annotations = this.tabAnnotations[tabId];
        if (this.unsavedAnnotations[tabId] && (annotations === null || annotations === void 0 ? void 0 : annotations.length)) {
            await saveAIAnnotations(this.userInfo, annotations);
            this.unsavedAnnotations[tabId] = false;
        }
    }
    async renderBadgeCount(tabId) {
        const badgeCount = this.relatedAnnotationsCount[tabId];
        // const badgeCount = this.tabAnnotations[tabId]?.length;
        const text = badgeCount ? badgeCount.toString() : "";
        browserObj.action.setBadgeBackgroundColor({ color: "#facc15" });
        browserObj.action.setBadgeText({ text });
    }
    // update enabled status on every reader mode call
    // TODO cache this? but how to show counts once enabled?
    async checkAIEnabled() {
        var _a;
        this.userInfo = await (rep === null || rep === void 0 ? void 0 : rep.query.getUserInfo());
        return (_a = this.userInfo) === null || _a === void 0 ? void 0 : _a.aiEnabled;
    }
}
const tabsManager = new TabStateManager();

export { TabStateManager, tabsManager };
