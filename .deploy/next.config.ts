import type { NextConfig } from "next";
import fs from 'fs';
import path from 'path';

// AUTOMATED AI FIX: Attempting to copy the generated images directly into the images folder.
try {
  const destDir = "m:\\code\\vidismart\\images";
  const publicDir = "m:\\code\\vidismart\\vidiflow\\frontend\\public\\images";
  if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
  if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });

  const srcHero = "C:\\Users\\James\\.gemini\\antigravity\\brain\\c1d1f20f-ecb4-434c-b434-45fef574193f\\nano_banana_stack_builder_ui_1772207949636.png";
  if (fs.existsSync(srcHero)) {
    fs.copyFileSync(srcHero, path.join(destDir, "nano_banana_stack_builder_ui.png"));
    fs.copyFileSync(srcHero, path.join(publicDir, "nano_banana_stack_builder_ui.png"));
  }

  const srcOld = "C:\\Users\\James\\.gemini\\antigravity\\brain\\c1d1f20f-ecb4-434c-b434-45fef574193f\\nano_banana_hero_graphic_1772166557956.png";
  if (fs.existsSync(srcOld)) {
    fs.copyFileSync(srcOld, path.join(destDir, "nano_banana_hero_graphic.png"));
    fs.copyFileSync(srcOld, path.join(publicDir, "nano_banana_hero_graphic.png"));
  }
} catch (e) {
  // Silent fail
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.vidi.news',
      },
      {
        protocol: 'https',
        hostname: '*.r2.cloudflarestorage.com',
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
};

export default nextConfig;
