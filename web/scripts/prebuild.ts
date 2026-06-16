/**
 * prebuild.ts — Build-time data synchronization
 *
 * Copies data/ directory from project root into web/src/data/
 * so that data-loader.ts can import YAML files at build time.
 *
 * Run: npx tsx scripts/prebuild.ts
 */

import fs from "fs";
import path from "path";

const PROJECT_ROOT = path.join(import.meta.dirname, "..", "..");
const SRC = path.join(PROJECT_ROOT, "data");
const DST = path.join(PROJECT_ROOT, "web", "src", "data");

function copyDir(src: string, dst: string) {
  if (!fs.existsSync(dst)) {
    fs.mkdirSync(dst, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const dstPath = path.join(dst, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, dstPath);
    } else {
      fs.copyFileSync(srcPath, dstPath);
    }
  }
}

// Clean destination first
if (fs.existsSync(DST)) {
  fs.rmSync(DST, { recursive: true });
}

copyDir(SRC, DST);

// Count files copied
function countFiles(dir: string): number {
  let count = 0;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory()) {
      count += countFiles(path.join(dir, entry.name));
    } else {
      count++;
    }
  }
  return count;
}

console.log(`✅ Prebuild: copied ${countFiles(DST)} files from data/ → web/src/data/`);
