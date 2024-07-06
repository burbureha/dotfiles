import '../store/_schema.js';
import { accessors } from '../store/accessors.js';
import { mutators } from '../store/mutators.js';
import '../../../../node_modules/react/index.js';
import '../../../../node_modules/react-dom/index.js';
import { getBrowser } from './extension.js';

async function processReplicacheContentScript(type, methodName, args, targetExtension = null) {
  return await getBrowser().runtime.sendMessage(targetExtension, {
    event: "processReplicacheMessage",
    type,
    methodName,
    args
  });
} // @ts-ignore

class ReplicacheProxy {
  constructor(targetExtension = null, processMessage = processReplicacheContentScript, processWatch = () => {}) {
    this.processMessage = processReplicacheContentScript; // @ts-ignore

    this.query = Object.keys(accessors).reduce((obj, fnName) => {
      obj[fnName] = (...args) => this.processMessage("query", fnName, args, this.targetExtension);

      return obj;
    }, {}); // @ts-ignore

    this.mutate = Object.keys(mutators).reduce((obj, fnName) => {
      obj[fnName] = args => this.processMessage("mutate", fnName, args, this.targetExtension);

      return obj;
    }, {}); // only supported for content scripts
    // @ts-ignore

    this.subscribe = Object.keys(accessors).reduce((obj, fnName) => {
      obj[fnName] = (...args) => subscribeOptions => {
        const port = getBrowser().runtime.connect(this.targetExtension, {
          name: `replicache-subscribe`
        });
        port.onMessage.addListener(message => {
          subscribeOptions.onData(message);
        });
        port.onDisconnect.addListener(() => {
          var _a;

          return (_a = subscribeOptions.onDone) === null || _a === void 0 ? void 0 : _a.call(subscribeOptions);
        });
        port.postMessage({
          methodName: fnName,
          args
        });
        return () => port.disconnect();
      };

      return obj;
    }, {});

    this.pull = () => {
      this.processMessage("pull", undefined, undefined, this.targetExtension);
    };

    this.targetExtension = targetExtension;
    this.processMessage = processMessage;
    this.watch = processWatch;
  }

}

export { ReplicacheProxy, processReplicacheContentScript };
