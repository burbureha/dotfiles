import { getFeatureFlag, isDevelopmentFeatureFlag, getAllFeatureFlags, showLibrarySignupFlag, showFeedbackMessage } from '../common/featureFlags.js';
import browserObj from '../common/polyfill.js';
import { getLibraryUser, getDistinctId } from '../common/storage.js';
import { getAllCustomDomainSettings } from '../common/storage2.js';
import { getInitialInstallVersion } from '../common/updateMessages.js';

// Anonymously report usage events (if the user allowed it)
// See https://github.com/lindylearn/unclutter/blob/main/docs/metrics.md
async function reportEvent(name, data = {}) {
    const isDev = await getFeatureFlag(isDevelopmentFeatureFlag);
    if (isDev) {
        console.log(`Metric ${name}:`, data);
        return;
    }
    await sendEvent(name, data, isDev);
}
async function sendEvent(name, data, isDev) {
    try {
        await fetch(`https://app.posthog.com/capture`, {
            method: "POST",
            body: JSON.stringify({
                api_key: "phc_BQHO9btvNLVEbFC4ihMIS8deK5T6P4d8EF75Ihvkfaw",
                distinct_id: distinctId,
                event: name,
                properties: {
                    $useragent: navigator.userAgent,
                    $current_url: "unclutter",
                    isDev,
                    ...data,
                },
            }),
        });
    }
    catch (err) {
        console.error(`Error reporting metric:`, err);
    }
}
// Report anonymous aggregates on enabled extension features (if the user allowed it)
async function reportSettings(version, isNewInstall) {
    // true / false state of enabled features
    const featureFlagSettings = await getAllFeatureFlags();
    // count allowlisted and blocklisted domains
    // do not report the actual domains
    const lists = await getAllCustomDomainSettings();
    const domainSettings = {
        allowlistedCount: lists.allow.length,
        blocklistedCount: lists.deny.length,
    };
    const isDev = await getFeatureFlag(isDevelopmentFeatureFlag);
    reportEvent("reportSettings", {
        version,
        isNewInstall,
        ...featureFlagSettings,
        ...domainSettings,
        $set: {
            ...featureFlagSettings,
            isDev,
            version,
            initialInstallVersion: await getInitialInstallVersion(),
        },
    });
}
let pageViewEnableTrigger;
let pageViewEnableStartTime;
async function reportEnablePageView(trigger, socialCommentsCount) {
    reportEvent("enablePageview", { trigger, socialCommentsCount });
    pageViewEnableTrigger = trigger;
    pageViewEnableStartTime = new Date();
}
async function reportDisablePageView(trigger, pageHeightPx) {
    let activeSeconds;
    if (pageViewEnableStartTime) {
        // @ts-ignore
        activeSeconds = (new Date() - pageViewEnableStartTime) / 1000;
    }
    reportEvent("disablePageview", {
        trigger,
        enableTrigger: pageViewEnableTrigger,
        elapsedTime: _bucketMetric(secondsBuckets, activeSeconds),
        pageHeightPx: _bucketMetric(pageHeightPxBuckets, pageHeightPx),
    });
}
const secondsBuckets = [0, 5, 10, 15, 30, 60, 120, 240, 480, 960, 1920, 3840];
const pageHeightPxBuckets = [0, 500, 2000, 10000, 50000, 200000];
function _bucketMetric(buckets, value) {
    const matchingBuckets = buckets.filter((breakpoint) => value >= breakpoint);
    // return last bucket the numbers falls into
    return matchingBuckets[matchingBuckets.length - 1];
}
let distinctId = null;
async function startMetrics(isDev) {
    if (isDev) {
        distinctId = "test-user";
    }
    else {
        distinctId = await _getSavedDistinctId();
        await migrateMetricsUser();
    }
}
async function migrateMetricsUser() {
    const libraryUser = await getLibraryUser();
    if (libraryUser && distinctId !== libraryUser) {
        // migrate temp user ids to library id
        reportEvent("$create_alias", {
            alias: libraryUser,
            distinct_id: distinctId, // old
        });
        distinctId = libraryUser;
        await browserObj.storage.sync.set({
            distinctId,
        });
    }
}
async function _getSavedDistinctId() {
    let distinctId = await getDistinctId();
    if (distinctId) {
        return distinctId;
    }
    distinctId = crypto.getRandomValues(new Uint32Array(5)).join("");
    await browserObj.storage.sync.set({
        distinctId,
    });
    return distinctId;
}
// roll out some features gradually for testing
let cachedRemoteFeatureFlags = null;
let lastFeatureFlagFetch;
async function getRemoteFeatureFlags() {
    if (cachedRemoteFeatureFlags !== null) {
        // @ts-ignore
        const fetchSecondsAgo = (new Date() - lastFeatureFlagFetch) / 1000;
        // use for 15 minutes
        if (fetchSecondsAgo < 60 * 15) {
            return cachedRemoteFeatureFlags;
        }
    }
    const isDev = await getFeatureFlag(isDevelopmentFeatureFlag);
    if (isDev) {
        lastFeatureFlagFetch = new Date();
        cachedRemoteFeatureFlags = {
            [showLibrarySignupFlag]: true,
            [showFeedbackMessage]: false,
        };
        return cachedRemoteFeatureFlags;
    }
    try {
        const response = await fetch(`https://app.posthog.com/decide`, {
            method: "POST",
            body: JSON.stringify({
                api_key: "phc_BQHO9btvNLVEbFC4ihMIS8deK5T6P4d8EF75Ihvkfaw",
                distinct_id: distinctId,
            }),
        });
        const enabledFeatureFlags = (await response.json()).featureFlags;
        cachedRemoteFeatureFlags = enabledFeatureFlags.reduce((obj, flag) => ({ ...obj, [flag]: true }), {});
        lastFeatureFlagFetch = new Date();
        return cachedRemoteFeatureFlags;
    }
    catch (err) {
        console.error(`Error getting remote feature flags:`, err);
        return {};
    }
}

export { getRemoteFeatureFlags, migrateMetricsUser, reportDisablePageView, reportEnablePageView, reportEvent, reportSettings, startMetrics };
