import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Two lockfiles exist (this app lives inside the MICRORITM workspace copy);
  // pin Turbopack's root to this project so module resolution stays correct.
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
