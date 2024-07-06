import browserObj from './polyfill.js';

async function getFeatureFlag(key) {
    if (key in featureFlagLocalOverrides) {
        return featureFlagLocalOverrides[key];
    }
    const config = await browserObj.storage.sync.get([key]);
    return (config[key] !== undefined ? config[key] : defaultFeatureFlags[key]) || false;
}
async function setFeatureFlag(key, status) {
    await browserObj.storage.sync.set({ [key]: status });
}
async function getAllFeatureFlags() {
    const reportedFlags = [
        allowlistDomainOnManualActivationFeatureFlag,
        enableBootUnclutterMessage,
        hypothesisSyncFeatureFlag,
        enableSocialCountsFeatureFlag,
        enableAnnotationsFeatureFlag,
        enableSocialCommentsFeatureFlag,
        submittedFeedbackFlag,
        enableExperimentalFeatures,
        dismissedLibrarySignupMessage,
    ];
    // does not include defaultFeatureFlags
    const config = await browserObj.storage.sync.get(reportedFlags);
    return config;
}
const allowlistDomainOnManualActivationFeatureFlag = "allowlist-domain-manual-activation";
const enableBootUnclutterMessage = "enable-boot-unclutter-message";
const isDevelopmentFeatureFlag = "is-dev";
const hypothesisSyncFeatureFlag = "hypothesis-sync";
const enableSocialCountsFeatureFlag = "social-annotations-counts-enabled";
const enableExperimentalFeatures = "enable-experimental-features";
// sticky user setting
const enableAnnotationsFeatureFlag = "annotations-enabled2";
const enableSocialCommentsFeatureFlag = "social-annotations-enabled";
const submittedFeedbackFlag = "submitted-feedback";
const dismissedLibrarySignupMessage = "dismissed-library-signup-message";
// remote
const showFeedbackMessage = "show-feedback-message";
const showLibrarySignupFlag = "show-library-signup";
const defaultFeatureFlags = {
    [allowlistDomainOnManualActivationFeatureFlag]: false,
    [enableBootUnclutterMessage]: false,
    [isDevelopmentFeatureFlag]: false,
    [enableSocialCountsFeatureFlag]: true,
    [enableAnnotationsFeatureFlag]: true,
    [enableSocialCommentsFeatureFlag]: true,
    [submittedFeedbackFlag]: false,
};
const featureFlagLocalOverrides = {};

export { allowlistDomainOnManualActivationFeatureFlag, defaultFeatureFlags, dismissedLibrarySignupMessage, enableAnnotationsFeatureFlag, enableBootUnclutterMessage, enableExperimentalFeatures, enableSocialCommentsFeatureFlag, enableSocialCountsFeatureFlag, getAllFeatureFlags, getFeatureFlag, hypothesisSyncFeatureFlag, isDevelopmentFeatureFlag, setFeatureFlag, showFeedbackMessage, showLibrarySignupFlag, submittedFeedbackFlag };
