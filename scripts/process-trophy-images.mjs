/**
 * PNG transparentes profesionales vía flood-fill + limpieza de huecos.
 */
import sharp from "sharp";
import path from "path";
import fs from "fs";

const ASSETS = path.join(
  process.env.USERPROFILE || "",
  ".cursor/projects/c-Users-User-Desktop-ProLeague/assets"
);

const SOURCES = {
  "la-liga.png": {
    file: path.join(
      ASSETS,
      "c__Users_User_AppData_Roaming_Cursor_User_workspaceStorage_625a766b24ff156271486631d256fdb6_images_images-f58bb656-c860-4f8e-806a-ab058a9f1481.png"
    ),
    mode: "light",
  },
  "ligue-1.png": {
    file: path.join(
      ASSETS,
      "c__Users_User_AppData_Roaming_Cursor_User_workspaceStorage_625a766b24ff156271486631d256fdb6_images_images-29f85d40-c814-4893-9e2d-bd60a82a1d38.png"
    ),
    mode: "white",
  },
};

const OUT_DIR = path.join(process.cwd(), "public/trophies");

function bgScore(r, g, b, a, mode) {
  if (a < 16) return 1;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const sat = max === 0 ? 0 : (max - min) / max;
  const br = (r + g + b) / 3;

  if (mode === "white") {
    if (br >= 245) return 1;
    if (br >= 230 && sat < 0.08) return 0.95;
    if (br >= 210 && sat < 0.06) return 0.85;
    if (br >= 195 && sat < 0.05) return 0.7;
    return 0;
  }

  // light / checker baked
  if (br >= 248 && sat < 0.12) return 1;
  if (br >= 220 && sat < 0.07) return 0.95;
  if (br >= 200 && sat < 0.06) return 0.9;
  if (br >= 175 && sat < 0.05) return 0.75;
  // casilla gris del damero
  if (br >= 150 && br < 200 && sat < 0.05) return 0.7;
  return 0;
}

function flood(data, width, height, mode) {
  const N = width * height;
  const mark = new Float32Array(N);
  const queue = new Int32Array(N + 8);
  let qh = 0;
  let qt = 0;

  const push = (p, score) => {
    if (p < 0 || p >= N) return;
    if (mark[p] >= score) return;
    const i = p * 4;
    const s = bgScore(data[i], data[i + 1], data[i + 2], data[i + 3], mode);
    if (s < 0.65) return;
    mark[p] = Math.max(mark[p], s);
    queue[qt++] = p;
  };

  // Semillas: borde completo
  for (let x = 0; x < width; x++) {
    push(x, 1);
    push((height - 1) * width + x, 1);
  }
  for (let y = 0; y < height; y++) {
    push(y * width, 1);
    push(y * width + (width - 1), 1);
  }

  // Semillas interiores en cuadrícula (huecos entre asas)
  for (let y = 2; y < height - 2; y += 3) {
    for (let x = 2; x < width - 2; x += 3) {
      const p = y * width + x;
      const i = p * 4;
      const s = bgScore(data[i], data[i + 1], data[i + 2], data[i + 3], mode);
      if (s >= 0.9) push(p, s);
    }
  }

  const dirs = [-1, 1, -width, width, -width - 1, -width + 1, width - 1, width + 1];
  while (qh < qt) {
    const p = queue[qh++];
    const x = p % width;
    for (const d of dirs) {
      const n = p + d;
      if (n < 0 || n >= N) continue;
      const nx = n % width;
      if (Math.abs(nx - x) > 1) continue;
      if (mark[n] > 0) continue;
      const i = n * 4;
      const s = bgScore(data[i], data[i + 1], data[i + 2], data[i + 3], mode);
      // umbral un poco más bajo si ya estamos en zona de fondo
      if (s >= 0.65 || (mark[p] >= 0.9 && s >= 0.55)) {
        mark[n] = s || 0.7;
        queue[qt++] = n;
      }
    }
  }

  // Suavizar bordes: vecinos de fondo casi-claros
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const p = y * width + x;
      if (mark[p] > 0) continue;
      let near = 0;
      for (const d of [-1, 1, -width, width]) if (mark[p + d] > 0) near++;
      if (near < 2) continue;
      const i = p * 4;
      const s = bgScore(data[i], data[i + 1], data[i + 2], data[i + 3], mode);
      if (s >= 0.45) mark[p] = s;
    }
  }

  for (let p = 0; p < N; p++) {
    if (!(mark[p] > 0)) continue;
    const i = p * 4;
    // alpha suave según score
    const alpha = mark[p] >= 0.85 ? 0 : Math.round(255 * (1 - mark[p]));
    data[i] = 0;
    data[i + 1] = 0;
    data[i + 2] = 0;
    data[i + 3] = alpha;
  }
}

async function build(outName, src, mode) {
  if (!fs.existsSync(src)) throw new Error(`Missing ${src}`);

  const { data, info } = await sharp(src)
    .ensureAlpha()
    .resize({ height: 1000, fit: "inside" })
    .raw()
    .toBuffer({ resolveWithObject: true });

  const buf = Buffer.from(data);
  flood(buf, info.width, info.height, mode);

  const cut = await sharp(buf, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .trim({ threshold: 8 })
    .png()
    .toBuffer();

  const SIZE = 512;
  const meta = await sharp(cut).metadata();
  const tw = meta.width || 400;
  const th = meta.height || 500;
  const scale = Math.min((SIZE * 0.88) / tw, (SIZE * 0.92) / th);
  const scaled = await sharp(cut)
    .resize(Math.round(tw * scale), Math.round(th * scale))
    .png()
    .toBuffer();

  const outPath = path.join(OUT_DIR, outName);
  await sharp({
    create: {
      width: SIZE,
      height: SIZE,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([{ input: scaled, gravity: "centre" }])
    .png({ compressionLevel: 9, palette: false })
    .toFile(outPath);

  const check = await sharp(outPath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  let transparent = 0;
  let opaque = 0;
  let blackOpaque = 0;
  for (let i = 0; i < check.data.length; i += 4) {
    if (check.data[i + 3] < 10) transparent++;
    else {
      opaque++;
      if (check.data[i] < 10 && check.data[i + 1] < 10 && check.data[i + 2] < 10)
        blackOpaque++;
    }
  }
  console.log(outName, {
    transparent,
    opaque,
    blackOpaque,
    cornerA: check.data[3],
  });
}

for (const [name, cfg] of Object.entries(SOURCES)) {
  await build(name, cfg.file, cfg.mode);
}
