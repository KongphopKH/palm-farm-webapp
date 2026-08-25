import type { NextConfig } from "next";

// This app has no server-only code (no API routes, no server actions — every
// page talks to Supabase directly from the browser), so it can be built as a
// fully static site and hosted for free on GitHub Pages via GitHub Actions.
//
// GitHub Pages serves a "project site" like this one under a sub-path
// (https://<user>.github.io/palm-farm-webapp/), so when building for Pages
// we tell Next.js about that base path. Locally (`npm run dev`) and on
// Vercel this env var is unset, so the app still runs at the domain root
// with no extra configuration.
const isGithubPages = process.env.GITHUB_PAGES === "true";
const repoName = "palm-farm-webapp";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  basePath: isGithubPages ? `/${repoName}` : undefined,
  assetPrefix: isGithubPages ? `/${repoName}/` : undefined,
};

export default nextConfig;
