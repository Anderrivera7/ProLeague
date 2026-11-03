/**
 * Banderas → public/flags/{code}.png
 */
import fs from "fs";
import path from "path";

const CODES = ["fr", "ma", "ar", "br", "es", "de", "it", "pt", "nl", "cl", "gb-eng"];

const OUT = path.join(process.cwd(), "public/flags");
fs.mkdirSync(OUT, { recursive: true });

async function download(code) {
  const flagcdnCode = code === "gb-eng" ? "gb-eng" : code;
  const sources = [
    `https://flagcdn.com/w160/${flagcdnCode}.png`,
    `https://cdn.sofifa.net/flags/${code}.png`,
  ];
  for (const url of sources) {
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": "Mozilla/5.0", Referer: "https://flagcdn.com/" },
      });
      if (!res.ok) continue;
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length > 400) return buf;
    } catch {
      /* next */
    }
  }
  return null;
}

for (const code of CODES) {
  const dest = path.join(OUT, `${code}.png`);
  if (fs.existsSync(dest) && fs.statSync(dest).size > 400) {
    console.log("skip", code);
    continue;
  }
  const buf = await download(code);
  if (buf) {
    fs.writeFileSync(dest, buf);
    console.log("ok", code, buf.length);
  } else {
    console.warn("fail", code);
  }
}
