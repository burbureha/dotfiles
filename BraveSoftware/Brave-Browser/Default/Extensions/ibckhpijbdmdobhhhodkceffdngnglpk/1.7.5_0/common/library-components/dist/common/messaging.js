import { sendMessage } from './extension.js';

async function getUserInfoSimple() {
  return await sendMessage({
    event: "getUserInfo"
  });
}
function reportEventContentScript(name, data = {}) {
  sendMessage({
    event: "reportEvent",
    name,
    data
  });
}

export { getUserInfoSimple, reportEventContentScript };
