import sharp from "sharp";
import fs from "fs";
import path from "path";

async function blackBgToTransparentSquare(
  input: Buffer | string,
  outFile: string
) {
  const { data, info } = await sharp(input)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    if (r < 28 && g < 28 && b < 28) {
      data[i + 3] = 0;
    }
  }

  const trimmed = await sharp(data, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .trim({ threshold: 5 })
    .resize({ height: 460, width: 460, fit: "inside" })
    .png()
    .toBuffer();

  const meta = await sharp(trimmed).metadata();
  const w = meta.width ?? 460;
  const h = meta.height ?? 460;
  const padX = Math.max(0, Math.floor((512 - w) / 2));
  const padY = Math.max(0, Math.floor((512 - h) / 2));

  await sharp(trimmed)
    .extend({
      top: padY,
      bottom: 512 - h - padY,
      left: padX,
      right: 512 - w - padX,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png({ compressionLevel: 9 })
    .toFile(outFile);

  const final = await sharp(outFile).metadata();
  console.log("trophy", path.basename(outFile), `${final.width}x${final.height}`);
}

async function normalizeToSquare(file: string) {
  const p = path.join("public/trophies", file);
  if (!fs.existsSync(p)) return;
  const trimmed = await sharp(p)
    .trim({ threshold: 12 })
    .resize({ height: 460, width: 460, fit: "inside" })
    .png()
    .toBuffer();
  const meta = await sharp(trimmed).metadata();
  const w = meta.width ?? 460;
  const h = meta.height ?? 460;
  const padX = Math.max(0, Math.floor((512 - w) / 2));
  const padY = Math.max(0, Math.floor((512 - h) / 2));
  await sharp(trimmed)
    .extend({
      top: padY,
      bottom: 512 - h - padY,
      left: padX,
      right: 512 - w - padX,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png({ compressionLevel: 9 })
    .toFile(p);
  const final = await sharp(p).metadata();
  console.log("normalized", file, `${final.width}x${final.height}`);
}

async function writeAllStarsCrest() {
  const base = await sharp("public/crests/premier-league.png")
    .resize(512, 512, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();

  const overlaySvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="ban" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#2a0a3d"/>
      <stop offset="100%" stop-color="#12041c"/>
    </linearGradient>
  </defs>
  <g fill="#c9a227" stroke="#7a5a10" stroke-width="2">
    <polygon points="256,28 268,56 298,56 274,74 283,102 256,84 229,102 238,74 214,56 244,56"/>
    <polygon points="170,58 179,80 203,80 184,94 191,116 170,102 149,116 156,94 137,80 161,80"/>
    <polygon points="342,58 351,80 375,80 356,94 363,116 342,102 321,116 328,94 309,80 333,80"/>
  </g>
  <rect x="86" y="400" width="340" height="58" rx="14" fill="url(#ban)" stroke="#c9a227" stroke-width="3"/>
  <text x="256" y="438" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-size="28" font-weight="800" fill="#ffffff" letter-spacing="3">ALL STARS</text>
</svg>`;

  const overlay = await sharp(Buffer.from(overlaySvg)).png().toBuffer();
  await sharp(base)
    .composite([{ input: overlay, blend: "over" }])
    .png({ compressionLevel: 9 })
    .toFile("public/crests/pl-all-stars.png");
  console.log("crest pl-all-stars.png");
}

async function downloadAndSquare(url: string, out: string) {
  const res = await fetch(url, {
    headers: { "User-Agent": "ProLeagueBot/1.0 (local asset sync)" },
    redirect: "follow",
  });
  if (!res.ok) throw new Error(`${out} ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  // Si tiene fondo negro, quitar; si ya es transparente, normalizar
  await blackBgToTransparentSquare(buf, out);
}

async function main() {
  fs.mkdirSync("public/trophies", { recursive: true });
  fs.mkdirSync("public/crests", { recursive: true });

  await downloadAndSquare(
    "https://upload.wikimedia.org/wikipedia/commons/0/0c/Ligue_1_Trophy_2024.png",
    "public/trophies/ligue-1.png"
  );

  // Confederaciones real (SportsDB tiene mal etiquetado el CWC viejo)
  await downloadAndSquare(
    "https://upload.wikimedia.org/wikipedia/commons/b/b5/Confed_trophy.png",
    "public/trophies/confederations.png"
  );

  await normalizeToSquare("liga-ecuador.png");
  await writeAllStarsCrest();

  if (fs.existsSync("public/trophies/_ligue1-raw.png")) {
    fs.unlinkSync("public/trophies/_ligue1-raw.png");
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
