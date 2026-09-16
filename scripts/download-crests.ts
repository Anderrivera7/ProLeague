/**
 * Descarga escudos PNG de los clubes de los títulos de Anderson.
 */
import fs from "fs";
import path from "path";
import sharp from "sharp";

const OUT = path.join(process.cwd(), "public", "crests");

const CRESTS: Array<{ file: string; url: string }> = [
  {
    file: "flamengo.png",
    url: "https://r2.thesportsdb.com/images/media/team/badge/syptwx1473538074.png",
  },
  {
    file: "river-plate.png",
    url: "https://r2.thesportsdb.com/images/media/team/badge/03dmi31645539717.png",
  },
  {
    file: "monaco.png",
    url: "https://r2.thesportsdb.com/images/media/team/badge/exjf5l1678808044.png",
  },
  {
    file: "liverpool.png",
    url: "https://r2.thesportsdb.com/images/media/team/badge/kfaher1737969724.png",
  },
  {
    file: "portugal.png",
    url: "https://r2.thesportsdb.com/images/media/team/badge/swqvpy1455466083.png",
  },
  {
    file: "besiktas.png",
    url: "https://r2.thesportsdb.com/images/media/team/badge/svo05k1776827439.png",
  },
  {
    file: "dortmund.png",
    url: "https://r2.thesportsdb.com/images/media/team/badge/tqo8ge1716960353.png",
  },
  {
    file: "milan.png",
    url: "https://r2.thesportsdb.com/images/media/team/badge/wvspur1448806617.png",
  },
  {
    file: "porto.png",
    url: "https://r2.thesportsdb.com/images/media/team/badge/xu47rb1628855600.png",
  },
  {
    file: "real-madrid.png",
    url: "https://r2.thesportsdb.com/images/media/team/badge/vwvwrw1473502969.png",
  },
  {
    file: "racing.png",
    url: "https://r2.thesportsdb.com/images/media/team/badge/vi4mu41695734959.png",
  },
  {
    file: "ldu-quito.png",
    url: "https://r2.thesportsdb.com/images/media/team/badge/5tf5ch1736404372.png",
  },
  {
    file: "universitario.png",
    url: "https://r2.thesportsdb.com/images/media/team/badge/xt290m1603137966.png",
  },
  {
    file: "premier-league.png",
    url: "https://r2.thesportsdb.com/images/media/league/badge/i6o0kh1549879062.png",
  },
];

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  for (const item of CRESTS) {
    try {
      const res = await fetch(item.url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const buf = Buffer.from(await res.arrayBuffer());
      const out = path.join(OUT, item.file);
      await sharp(buf).png({ compressionLevel: 9 }).toFile(out);
      console.log("ok", item.file);
    } catch (e) {
      console.error("fail", item.file, e);
    }
  }
}

main();
