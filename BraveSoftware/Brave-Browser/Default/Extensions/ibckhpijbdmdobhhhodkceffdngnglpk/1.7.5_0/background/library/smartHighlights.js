import { indexAnnotationVectors } from '../../common/library-components/dist/common/api.js';
import { rep } from './library.js';

async function saveAIAnnotations(userInfo, annotations) {
    if (!userInfo || !(annotations === null || annotations === void 0 ? void 0 : annotations.length)) {
        return;
    }
    console.log(`Saving ${annotations.length} AI highlights...`);
    await Promise.all(annotations.map(async (annotation) => rep.mutate.putAnnotation(annotation)));
    // save embeddings
    await indexAnnotationVectors(userInfo.id, annotations[0].article_id, annotations.map((a) => a.quote_text), annotations.map((a) => a.id), false);
}
async function getRelatedAnnotationsCount(userInfo, annotations) {
    if (!userInfo || !(annotations === null || annotations === void 0 ? void 0 : annotations.length)) {
        return;
    }
    // disabled for now
    return 0;
}

export { getRelatedAnnotationsCount, saveAIAnnotations };
