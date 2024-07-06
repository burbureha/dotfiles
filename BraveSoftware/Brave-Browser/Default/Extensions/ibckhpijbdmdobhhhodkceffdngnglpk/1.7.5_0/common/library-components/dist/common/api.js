// new annotations are indexed through the fetchRelatedAnnotations() call

async function indexAnnotationVectors(user_id, article_id, highlights, highlight_ids = undefined, delete_previous = false) {
  await fetch(`https://related4-jumq7esahq-ue.a.run.app?action=insert`, // `${lindyApiUrl}/related/insert`,
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      user_id: user_id,
      article_id,
      highlights,
      highlight_ids,
      delete_previous
    })
  });
}
async function getHeatmapRemote(paragraphs, score_threshold = 0.6) {
  const response = await fetch("https://serverless-import-jumq7esahq-ue.a.run.app", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      paragraphs,
      score_threshold
    })
  });

  if (!response.ok) {
    return;
  }

  const data = await response.json();
  return data === null || data === void 0 ? void 0 : data.sentences;
}

export { getHeatmapRemote, indexAnnotationVectors };
