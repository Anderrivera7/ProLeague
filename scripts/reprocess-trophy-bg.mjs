/** Reprocesa un trofeo PNG quitando fondo blanco o negro. */
import sharp from "sharp";
import path from "path";

const file = process.argv[2];
const mode = process.argv[3] || "white";
if (!file) {
  console.error("Usage: node reprocess-trophy-bg.mjs public/trophies/foo.png white|black");
  process.exit(1);
}

const SRC = path.join(process.cwd(), file);
const OUT = SRC;

function isBg(r, g, b, a, m) {
  if (a < 16) return true;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const sat = max === 0 ? 0 : (max - min) / max;
  const br = (r + g + b) / 3;
  if (m === "black") {
    if (br < 42 && sat < 0.22) return true;
    if (br < 28) return true;
    return false;
  }
  if (br >= 245) return true;
  if (br >= 230 && sat < 0.08) return true;
  if (br >= 210 && sat < 0.06) return true;
  return false;
}

const { data, info } = await sharp(SRC)
  .ensureAlpha()
  .resize({ height: 1200, fit: "inside" })
  .raw()
  .toBuffer({ resolveWithObject: true });

const buf = Buffer.from(data);
const N = info.width * info.height;
for (let p = 0; p < N; p++) {
  const i = p * 4;
  if (isBg(buf[i], buf[i + 1], buf[i + 2], buf[i + 3], mode)) {
    buf[i + 3] = 0;
  }
}

const cut = await sharp(buf, {
  raw: { width: info.width, height: info.height, channels: 4 },
})
  .trim({ threshold: 10 })
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

await sharp({
  create: {
    width: SIZE,
    height: SIZE,
    channels: 4,
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  },
})
  .composite([{ input: scaled, gravity: "centre" }])
  .png({ compressionLevel: 9 })
  .toFile(OUT);

console.log("wrote", OUT);
