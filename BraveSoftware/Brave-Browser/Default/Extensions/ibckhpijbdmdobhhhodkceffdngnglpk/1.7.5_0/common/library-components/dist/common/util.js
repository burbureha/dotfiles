function getDomain(url) {
  try {
    return new URL(url).hostname.replace("www.", "");
  } catch {
    return;
  }
}
function cleanTitle(title) {
  title = (title === null || title === void 0 ? void 0 : title.trim().split("\n")[0]) || "";

  while (title.includes("  ")) {
    title = title.replace(/  /g, " ");
  }

  if (title.endsWith(":")) {
    title = title.slice(0, title.length - 1);
  }

  title = title.split("|")[0].split(" - ")[0].split("–")[0].trim();
  return title;
}
function constructLocalArticle(articleUrl, articleId, articleTitle) {
  return {
    id: articleId,
    url: articleUrl,
    title: cleanTitle(articleTitle || ""),
    word_count: 0,
    publication_date: null,
    time_added: Math.round(new Date().getTime() / 1000),
    reading_progress: 0.0,
    topic_id: null,
    is_favorite: false
  };
}

export { cleanTitle, constructLocalArticle, getDomain };
