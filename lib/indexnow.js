const INDEXNOW_KEY = "8606918adee84595b42261573aea1aa8";
const INDEXNOW_HOST = "ghulammujtaba.com";
const INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow";

/**
 * Submit one or more URLs to IndexNow (Bing, Yandex, Seznam real-time indexing).
 * Call this whenever a new article or project is published or updated.
 *
 * @param {string|string[]} urls - Absolute URL(s) to submit
 * @returns {Promise<boolean>} true on success
 */
export async function submitToIndexNow(urls) {
  const list = Array.isArray(urls) ? urls : [urls];
  if (!list.length) return false;

  try {
    const body = {
      host: INDEXNOW_HOST,
      key: INDEXNOW_KEY,
      keyLocation: `https://${INDEXNOW_HOST}/${INDEXNOW_KEY}.txt`,
      urlList: list,
    };

    const res = await fetch(INDEXNOW_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify(body),
    });

    // 200 or 202 means accepted
    return res.status === 200 || res.status === 202;
  } catch {
    return false;
  }
}
