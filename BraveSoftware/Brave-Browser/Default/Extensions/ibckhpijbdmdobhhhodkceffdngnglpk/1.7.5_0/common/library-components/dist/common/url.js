import sha256 from '../../../../node_modules/crypto-js/sha256.js';

function getUrlHash(url) {
  const normalizedUrl = normalizeUrl(url);
  const hash = sha256(normalizedUrl).toString();
  return hash;
} // NOTE: Keep in sync with backend WebpageConstuctor.normalize_url()

function normalizeUrl(url) {
  // remove protocol
  url = url.toLowerCase().replace("www.", "").replace(".html", "").replace(".htm", ""); // remove url params
  // NOTE: be careful here -- e.g. substack adds ?s=r

  const url_obj = new URL(url);
  Object.entries(url_obj.searchParams).map(([param, _]) => {
    if (param.includes("id")) {
      return;
    }

    if (["p", "q", "t", "e"].includes(param)) {
      return;
    }

    delete url_obj.searchParams[param];
  });
  url_obj.pathname = trimRight(url_obj.pathname, "/"); // convert back to string

  url = url_obj.toString().replace("https://", "").replace("http://", "");
  return url;
}

function trimRight(s, chars) {
  let r = s.length - 1;

  while (chars.indexOf(s[r]) >= 0 && r >= 0) {
    r--;
  }

  return s.slice(0, r + 1);
}

export { getUrlHash, normalizeUrl };
