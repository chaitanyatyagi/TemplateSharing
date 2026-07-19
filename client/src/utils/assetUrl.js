const API_BASE_URL = "http://localhost:6300/api";

export const SERVER_BASE_URL = API_BASE_URL.replace(/\/api\/?$/, "");

// Resolves a relative path returned by the backend (e.g. "/api/blog/stream/x.webp")
// into an absolute URL pointing at the API server, since the client and server
// run on different origins in dev. Absolute URLs (http(s)://...) pass through untouched.
export const getServerAssetUrl = (path) => {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  return `${SERVER_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
};

export const getTemplateImageUrl = (filename) => {
  if (!filename) return "";
  return `${SERVER_BASE_URL}/public/templates/${filename}`;
};
