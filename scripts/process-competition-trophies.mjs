/**
 * Trofeos de competición (PNG 512 transparente).
 */
import sharp from "sharp";
import path from "path";
import fs from "fs";

const ASSETS = path.join(
  process.env.USERPROFILE || "",
  ".cursor/projects/c-Users-User-Desktop-ProLeague/assets"
);

const MAP = [
  {
    out: "europa-league.png",
    src: "c__Users_User_AppData_Roaming_Cursor_User_workspaceStorage_625a766b24ff156271486631d256fdb6_images_c59985d41946aeb1079274de1d3315d0-652c9496-b556-44c3-8003-eff37a09d50b.png",
    mode: "white",
  },
  {
    out: "eurocopa.png",
    src: "c__Users_User_AppData_Roaming_Cursor_User_workspaceStorage_625a766b24ff156271486631d256fdb6_images_images-ed9b33f0-994d-46bf-89f5-f77d5a1434ad.png",
    mode: "white",
  },
  {
    out: "copa-africana.png",
    src: "c__Users_User_AppData_Roaming_Cursor_User_workspaceStorage_625a766b24ff156271486631d256fdb6_images_images-3deece35-eb8c-4905-a09b-3659b2b33a99.png",
    mode: "white",
  },
  {
    out: "liga-chile.png",
    src: "c__Users_User_AppData_Roaming_Cursor_User_workspaceStorage_625a766b24ff156271486631d256fdb6_images_5250792-8ff2b539-91fa-43fc-9a01-bfa5ed4ca141.png",
    mode: "black",
  },
  {
    out: "conference-league.png",
    src: "c__Users_User_AppData_Roaming_Cursor_User_workspaceStorage_625a766b24ff156271486631d256fdb6_images_images-083b815a-5047-4c43-9443-e1a51376c223.png",
    mode: "white",
  },
  {
    out: "scottish-premiership.png",
    src: "c__Users_User_AppData_Roaming_Cursor_User_workspaceStorage_625a766b24ff156271486631d256fdb6_images_images-81060a1f-8e91-4824-b83c-b4b0ec9ad573.png",
    mode: "black",
  },
];

const OUT_DIR = path.join(process.cwd(), "public/trophies");

function bgScore(r, g, b, a, mode) {
  if (a < 16) return 1;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const sat = max === 0 ? 0 : (max - min) / max;
  const br = (r + g + b) / 3;

  if (mode === "black") {
    if (br < 35 && sat < 0.15) return 1;
    if (br < 55 && sat < 0.12) return 0.9;
    return 0;
  }

  if (br >= 245) return 1;
  if (br >= 230 && sat < 0.08) return 0.95;
  if (br >= 210 && sat < 0.06) return 0.85;
  return 0;
}

function flood(data, width, height, mode) {
  const N = width * height;
  const mark = new Float32Array(N);
  const queue = new Int32Array(N + 8);
  let qh = 0;
  let qt = 0;

  const tryPush = (p) => {
    if (p < 0 || p >= N || mark[p] > 0) return;
    const i = p * 4;
    const s = bgScore(data[i], data[i + 1], data[i + 2], data[i + 3], mode);
    if (s < 0.65) return;
    mark[p] = s;
    queue[qt++] = p;
  };

  for (let x = 0; x < width; x++) {
    tryPush(x);
    tryPush((height - 1) * width + x);
  }
  for (let y = 0; y < height; y++) {
    tryPush(y * width);
    tryPush(y * width + (width - 1));
  }

  const dirs = [-1, 1, -width, width];
  while (qh < qt) {
    const p = queue[qh++];
    const x = p % width;
    for (const d of dirs) {
      const n = p + d;
      if (n < 0 || n >= N) continue;
      if (d === -1 && x === 0) continue;
      if (d === 1 && x === width - 1) continue;
      tryPush(n);
    }
  }

  for (let p = 0; p < N; p++) {
    if (!(mark[p] > 0)) continue;
    const i = p * 4;
    data[i] = 0;
    data[i + 1] = 0;
    data[i + 2] = 0;
    data[i + 3] = 0;
  }
}

async function build({ out, src, mode }) {
  const file = path.join(ASSETS, src);
  if (!fs.existsSync(file)) throw new Error(`Missing ${file}`);

  const { data, info } = await sharp(file)
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
    .toFile(path.join(OUT_DIR, out));

  console.log("wrote", out);
}

for (const item of MAP) {
  await build(item);
}
