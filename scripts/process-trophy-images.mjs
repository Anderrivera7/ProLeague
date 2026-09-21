/**
 * Convierte las fotos del usuario a PNG de trofeo (fondo negro, como el resto).
 */
import sharp from "sharp";
import path from "path";
import fs from "fs";

const ASSETS = path.join(
  process.env.USERPROFILE || "",
  ".cursor/projects/c-Users-User-Desktop-ProLeague/assets"
);

const LA_LIGA_SRC = path.join(
  ASSETS,
  "c__Users_User_AppData_Roaming_Cursor_User_workspaceStorage_625a766b24ff156271486631d256fdb6_images_images-f58bb656-c860-4f8e-806a-ab058a9f1481.png"
);
const LIGUE1_SRC = path.join(
  ASSETS,
  "c__Users_User_AppData_Roaming_Cursor_User_workspaceStorage_625a766b24ff156271486631d256fdb6_images_images-29f85d40-c814-4893-9e2d-bd60a82a1d38.png"
);

const OUT_DIR = path.join(process.cwd(), "public/trophies");

async function toBlackBackground(src, outName, opts) {
  if (!fs.existsSync(src)) throw new Error(`Missing source: ${src}`);

  const img = sharp(src).ensureAlpha();
  const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });

  const out = Buffer.from(data);
  const channels = info.channels;

  for (let i = 0; i < out.length; i += channels) {
    const r = out[i];
    const g = out[i + 1];
    const b = out[i + 2];
    const a = channels === 4 ? out[i + 3] : 255;

    if (a < 20) {
      out[i] = 0;
      out[i + 1] = 0;
      out[i + 2] = 0;
      if (channels === 4) out[i + 3] = 255;
      continue;
    }

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const sat = max === 0 ? 0 : (max - min) / max;
    const brightness = (r + g + b) / 3;

    let isBg = false;

    if (opts.removeNearWhite) {
      if (brightness > 235 && sat < 0.08) isBg = true;
      if (brightness > 220 && sat < 0.04) isBg = true;
    }

    if (opts.removeChecker) {
      const isNeutral =
        Math.abs(r - g) < 14 && Math.abs(g - b) < 14 && sat < 0.07;
      if (isNeutral && brightness > 155) isBg = true;
      if (brightness > 240 && sat < 0.05) isBg = true;
    }

    if (isBg) {
      out[i] = 0;
      out[i + 1] = 0;
      out[i + 2] = 0;
      if (channels === 4) out[i + 3] = 255;
    }
  }

  const targetH = 900;
  const composed = await sharp(out, {
    raw: { width: info.width, height: info.height, channels },
  })
    .resize({ height: targetH, fit: "inside", withoutEnlargement: false })
    .png({ compressionLevel: 9 })
    .toBuffer();

  const meta = await sharp(composed).metadata();
  const padW = Math.max(meta.width ?? 600, 520);
  const padH = Math.max(meta.height ?? 900, 780);

  await sharp({
    create: {
      width: padW,
      height: padH,
      channels: 3,
      background: { r: 0, g: 0, b: 0 },
    },
  })
    .composite([{ input: composed, gravity: "centre" }])
    .png({ compressionLevel: 9 })
    .toFile(path.join(OUT_DIR, outName));

  console.log("wrote", outName, padW, "x", padH);
}

await toBlackBackground(LA_LIGA_SRC, "la-liga.png", {
  removeChecker: true,
  removeNearWhite: true,
});
await toBlackBackground(LIGUE1_SRC, "ligue-1.png", {
  removeNearWhite: true,
});
