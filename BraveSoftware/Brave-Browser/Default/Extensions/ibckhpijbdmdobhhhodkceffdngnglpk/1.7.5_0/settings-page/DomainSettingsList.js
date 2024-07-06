import React from '../node_modules/react/index.js';
import { setUserSettingsForDomain } from '../common/storage.js';
import { getAllCustomDomainSettings } from '../common/storage2.js';
import { reportEventContentScript } from '../common/library-components/dist/common/messaging.js';
import { r as react } from '../node_modules/_virtual/index.js';

function DomainSettingsList({}) {
    const [overrideList, setOverrideList] = React.useState(null);
    React.useEffect(() => {
        (async function () {
            const customSettings = await getAllCustomDomainSettings();
            const allowedDomains = customSettings.allow.map((domain) => ({
                domain,
                status: "allow",
            }));
            const blockedDomains = customSettings.deny.map((domain) => ({
                domain,
                status: "deny",
            }));
            const completeList = allowedDomains.concat(blockedDomains).map((obj) => ({
                ...obj,
            }));
            setOverrideList(completeList);
        })();
    }, []);
    function updateDomainStatus(domain, newStatus) {
        // save in storage
        setUserSettingsForDomain(domain, newStatus);
        // Patch locally to retain current list order
        const updatedList = overrideList.map(({ domain: innerDomain, status, ...rest }) => ({
            ...rest,
            domain: innerDomain,
            status: innerDomain === domain ? newStatus : status,
        }));
        reportEventContentScript("changeDomainSetting", {
            newState: newStatus,
            trigger: "settings-page",
        });
        setOverrideList(updatedList);
    }
    function deleteDomainSettings(domain) {
        setUserSettingsForDomain(domain, null);
        const updatedList = overrideList.filter(({ domain: innerDomain }) => innerDomain !== domain);
        setOverrideList(updatedList);
        reportEventContentScript("changeDomainSetting", {
            newState: null,
            trigger: "settings-page",
        });
    }
    const [adderDomain, setAdderDomain] = React.useState("");
    React.useState("allow");
    react.exports.useLayoutEffect(() => {
        listRef.current.scrollTop = listRef.current.scrollHeight;
    }, [adderDomain === ""]);
    const listRef = react.exports.useRef();
    return (React.createElement("div", { className: "mt-1" },
        React.createElement("ul", { className: "flex h-40 flex-col items-stretch gap-1 overflow-y-auto px-3 py-2 shadow-inner", style: { background: "var(--embedded-background)" }, ref: listRef },
            (overrideList === null || overrideList === void 0 ? void 0 : overrideList.length) === 0 && (React.createElement("li", { className: "text-gray-500 dark:text-gray-300" }, "There are no automatic activation settings yet!")), overrideList === null || overrideList === void 0 ? void 0 :
            overrideList.map(({ domain, status }) => (React.createElement("li", { className: "flex items-center justify-between gap-3" },
                React.createElement("div", { className: "flex-grow underline" },
                    React.createElement("a", { href: `https://${domain}`, target: "_blank", rel: "noopener noreferrer" }, domain)),
                React.createElement("select", { value: status, onChange: (e) => updateDomainStatus(domain, e.target.value), className: "rounded-sm p-1 outline-none " + getDomainStatusStyle(status) },
                    React.createElement("option", { value: "allow", className: "bg-white" }, "Always unclutter"),
                    React.createElement("option", { value: "deny", className: "bg-white" }, "Never unclutter")),
                React.createElement("svg", { className: "h-4 w-4 cursor-pointer opacity-50 dark:text-white", viewBox: "0 0 448 512", onClick: () => deleteDomainSettings(domain) },
                    React.createElement("path", { fill: "currentColor", d: "M135.2 17.69C140.6 6.848 151.7 0 163.8 0H284.2C296.3 0 307.4 6.848 312.8 17.69L320 32H416C433.7 32 448 46.33 448 64C448 81.67 433.7 96 416 96H32C14.33 96 0 81.67 0 64C0 46.33 14.33 32 32 32H128L135.2 17.69zM394.8 466.1C393.2 492.3 372.3 512 346.9 512H101.1C75.75 512 54.77 492.3 53.19 466.1L31.1 128H416L394.8 466.1z" }))))))));
}
function getDomainStatusStyle(status) {
    if (status === "allow") {
        return "bg-green-300 dark:bg-green-500";
    }
    else if (status === "deny") {
        return "bg-red-300 dark:bg-red-500";
    }
    return "";
}

export { DomainSettingsList as default, getDomainStatusStyle };
