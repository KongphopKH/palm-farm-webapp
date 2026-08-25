// Mirrors the basePath logic in next.config.ts. Next.js does NOT
// automatically prefix manifest/icon URLs in generated metadata with
// basePath (unlike <Link>/<Image> and its own JS/CSS chunks), so pages that
// reference /manifest.json or /icon-*.png directly need this prefix applied
// by hand when building for GitHub Pages.
export const basePath = process.env.GITHUB_PAGES === "true" ? "/palm-farm-webapp" : "";
