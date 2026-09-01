import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Project routes render zero per-request content of their own — all
    // real data comes from ProjectDataProvider's separate client-side
    // fetch/cache, not from these pages' RSC output, so there's no
    // staleness risk in reusing it. Without this, Next's client Router
    // Cache defaults to 0s for dynamic routes (since v15), meaning every
    // switch between Review/Manage/Prioritize/Configure re-fetches the
    // page from the server even though nothing about it could have
    // changed — the remaining cost behind GitHub issue #12 after fixing
    // the auth check itself.
    staleTimes: {
      dynamic: 3600,
    },
  },
};

export default nextConfig;
