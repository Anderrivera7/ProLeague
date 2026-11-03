/** Copa América: quita el damero claro y deja PNG transparente. */
import sharp from "sharp";
import path from "path";

const SRC =
  "C:/Users/User/.cursor/projects/c-Users-User-Desktop-ProLeague/assets/c__Users_User_AppData_Roaming_Cursor_User_workspaceStorage_625a766b24ff156271486631d256fdb6_images_7e53aed83032f61ca95fc6e39f132e14-912f44f4-d22c-4b7a-aa3c-df01b2c39330.png";
const OUT = path.join(process.cwd(), "public/trophies/copa-america.png");

function isChecker(r, g, b) {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const br = (r + g + b) / 3;
  return max - min < 14 && br >= 220;
}

const { data, info } = await sharp(SRC)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

const buf = Buffer.from(data);
const { width, height } = info;
const N = width * height;
const mark = new Uint8Array(N);
const queue = new Int32Array(N);
let qh = 0;
let qt = 0;

const tryPush = (p) => {
  if (p < 0 || p >= N || mark[p]) return;
  const i = p * 4;
  if (!isChecker(buf[i], buf[i + 1], buf[i + 2])) return;
  mark[p] = 1;
  queue[qt++] = p;
};

for (let x = 0; x < width; x++) {
  tryPush(x);
  tryPush((height - 1) * width + x);
}
for (let y = 0; y < height; y++) {
  tryPush(y * width);
  tryPush(y * width + width - 1);
}

while (qh < qt) {
  const p = queue[qh++];
  const x = p % width;
  if (x > 0) tryPush(p - 1);
  if (x < width - 1) tryPush(p + 1);
  if (p >= width) tryPush(p - width);
  if (p + width < N) tryPush(p + width);
}

for (let p = 0; p < N; p++) {
  if (!mark[p]) continue;
  buf[p * 4 + 3] = 0;
}

const cut = await sharp(buf, {
  raw: { width, height, channels: 4 },
})
  .trim({ threshold: 8 })
  .png()
  .toBuffer();

const SIZE = 512;
const meta = await sharp(cut).metadata();
const tw = meta.width || 400;
const th = meta.height || 500;
const scale = Math.min((SIZE * 0.9) / tw, (SIZE * 0.92) / th);
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
