import '../../../../node_modules/react/index.js';
import { r as react } from '../../../../node_modules/_virtual/index.js';

function useAutoDarkMode() {
  if (typeof window === "undefined") {
    return false;
  }

  const [darkModeEnabled, setDarkModeEnabled] = react.exports.useState(window.matchMedia("(prefers-color-scheme: dark)").matches);
  react.exports.useEffect(() => {
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", event => {
      setDarkModeEnabled(event.matches);
    });
  }, []);
  return darkModeEnabled;
}

export { useAutoDarkMode };
