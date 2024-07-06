import React from '../node_modules/react/index.js';
import { getFeatureFlag, setFeatureFlag } from '../common/featureFlags.js';
import { reportEventContentScript } from '../common/library-components/dist/common/messaging.js';

// there's a weird bundling error on firefox when importing React, {useState}
// so use React.useState
function FeatureFlagSwitch({ featureFlagKey, children, onChange = (enabled) => { }, }) {
    const [state, setState] = React.useState(null);
    React.useEffect(() => {
        (async function () {
            const newState = await getFeatureFlag(featureFlagKey);
            setState(newState);
        })();
    }, []);
    async function toggleStateLocalFirst() {
        const newState = !state;
        setState(newState);
        await reportEventContentScript("changeSetting", {
            flag: featureFlagKey,
            state: newState ? "enabled" : "disabled",
        });
        setFeatureFlag(featureFlagKey, newState);
        onChange(newState);
    }
    return (React.createElement("div", { className: "flex" },
        React.createElement("p", { className: "mr-2" }, children),
        React.createElement("div", { className: "switch" },
            React.createElement("input", { type: "checkbox", id: featureFlagKey, className: "switch__input", checked: state, onChange: toggleStateLocalFirst }),
            React.createElement("label", { htmlFor: featureFlagKey, className: "switch__label" }))));
}

export { FeatureFlagSwitch as default };
