/**
 * Build an internal URL that respects the Astro `base` config
 * (e.g. "/explain-machine-learning-in-cricket-terms/" on GitHub Pages).
 *
 * url()                      -> "<base>/"
 * url("favicon.svg")         -> "<base>/favicon.svg"
 * url("first-innings/")      -> "<base>/first-innings/"
 */
export function url(path: string = ""): string {
  const base = import.meta.env.BASE_URL.replace(/\/+$/, "");
  const p = path.replace(/^\/+/, "");
  return p ? `${base}/${p}` : `${base}/`;
}
