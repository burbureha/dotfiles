import React from '../node_modules/react/index.js';
import ReactDOM from '../node_modules/react-dom/index.js';
import browserObj, { getBrowserType } from '../common/polyfill.js';
import { createStylesheetLink } from '../common/stylesheets.js';
import './index.css.js';
import OptionsPage from './Options.js';

const browserType = getBrowserType();
if (browserType === "firefox") {
    createStylesheetLink(browserObj.runtime.getURL("settings-page/indexFirefoxOverride.css"), "dark-mode-ui-style");
}
const domContainer = document.querySelector("#react-root");
ReactDOM.render(React.createElement(OptionsPage, null), domContainer);
