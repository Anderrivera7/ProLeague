/**
 * Descarga escudos Sofifa → public/crests/cache/{clubId}.png
 */
import fs from "fs";
import path from "path";

const IDS = [
  9, 10, 11, 21, 44, 78, 86, 179, 181, 234, 236, 237, 240, 241, 246, 247, 383,
  1041, 1876, 1877, 110740, 110980, 111017, 112893,
];

const OUT = path.join(process.cwd(), "public/crests/cache");
fs.mkdirSync(OUT, { recursive: true });

async function fetchCrest(id) {
  const urls = [
    `https://cdn.sofifa.net/teams/${id}/120.png`,
    `https://cdn.sofifa.net/teams/${id}/60.png`,
    `https://cdn.futbin.com/content/fifa26/img/clubs/${id}.png`,
    `https://cdn.futbin.com/content/fifa25/img/clubs/${id}.png`,
  ];
  for (const url of urls) {
    try {
      const res = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0",
          Referer: url.includes("sofifa")
            ? "https://sofifa.com/"
            : "https://www.futbin.com/",
        },
      });
      if (!res.ok) continue;
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length < 200) continue;
      return buf;
    } catch {
      /* next */
    }
  }
  return null;
}

for (const id of IDS) {
  const dest = path.join(OUT, `${id}.png`);
  if (fs.existsSync(dest) && fs.statSync(dest).size > 500) {
    console.log("skip", id);
    continue;
  }
  const buf = await fetchCrest(id);
  if (buf) {
    fs.writeFileSync(dest, buf);
    console.log("ok", id, buf.length);
  } else {
    console.warn("fail", id);
  }
}
