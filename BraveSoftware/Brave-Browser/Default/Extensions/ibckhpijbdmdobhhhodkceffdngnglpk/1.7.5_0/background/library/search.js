import '../../node_modules/flexsearch/dist/flexsearch.bundle.js';
import '../../common/library-components/dist/store/_schema.js';
import '../../common/library-components/dist/store/accessors.js';
import '../../common/library-components/dist/store/mutators.js';
import '../../node_modules/react/index.js';
import '../../node_modules/react-dom/index.js';
import '../../common/polyfill.js';
import '../../node_modules/replicache/out/replicache.mjs.js';
import './replicacheLocal.js';
import './screenshots.js';
import '../../node_modules/seedrandom/index.js';
import '../../node_modules/crypto-js/sha256.js';
import '../../common/library-components/dist/common/sync/highlights.js';
import '../../common/library-components/dist/common/sync/articles.js';
import '../../node_modules/linkedom/esm/index.js';

async function search(type, query) {
    if (type === "annotations") {
        return searchAnnotations();
    }
}
async function searchAnnotations(query) {
    {
        return;
    }
}

export { search, searchAnnotations };
