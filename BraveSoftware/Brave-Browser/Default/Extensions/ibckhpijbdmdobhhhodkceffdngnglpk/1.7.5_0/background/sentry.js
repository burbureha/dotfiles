import { wrap, init } from '../node_modules/@sentry/browser/esm/sdk.js';

function initErrorLogs(isDev) {
    init({
        enabled: !isDev,
        dsn: "https://284d55f388b5433c8ab4ae9a21c5ac2d@o1388847.ingest.sentry.io/6711548",
        tracesSampleRate: 1.0,
    });
}
function captureErrors(wrappedFunction) {
    return wrap(wrappedFunction);
}

export { captureErrors, initErrorLogs };
