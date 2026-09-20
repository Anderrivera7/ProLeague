/**
 * Descarga trofeos remotos como PNG locales en public/trophies.
 */
import { config } from "dotenv";
config({ path: ".env" });

import fs from "fs";
import path from "path";
import sharp from "sharp";

const OUT = path.join(process.cwd(), "public", "trophies");

const FILES: Array<{ file: string; url: string }> = [
  {
    file: "premier-league.png",
    url: "https://r2.thesportsdb.com/images/media/league/trophy/9a6kw51689108793.png",
  },
  {
    file: "serie-a.png",
    url: "https://r2.thesportsdb.com/images/media/league/trophy/83l94y1684416466.png",
  },
  {
    file: "bundesliga.png",
    url: "https://r2.thesportsdb.com/images/media/league/trophy/0o56hs1684416407.png",
  },
  {
    file: "ligue-1.png",
    url: "https://r2.thesportsdb.com/images/media/league/trophy/ygfgeq1684416349.png",
  },
  {
    file: "primeira-liga.png",
    url: "https://r2.thesportsdb.com/images/media/league/trophy/3v5npc1726462062.png",
  },
  {
    file: "eredivisie.png",
    url: "https://r2.thesportsdb.com/images/media/league/trophy/wx9n831722781060.png",
  },
  {
    file: "la-liga.png",
    url: "https://r2.thesportsdb.com/images/media/league/trophy/vc2z6q1684416521.png",
  },
  {
    file: "super-lig.png",
    url: "https://r2.thesportsdb.com/images/media/league/trophy/2oirc41681158648.png",
  },
  {
    file: "liga-argentina.png",
    url: "https://r2.thesportsdb.com/images/media/league/trophy/9sj4611777273081.png",
  },
  {
    file: "ucl.png",
    url: "https://r2.thesportsdb.com/images/media/league/trophy/31y13d1747884950.png",
  },
  {
    file: "libertadores.png",
    url: "https://www.thesportsdb.com/images/media/league/trophy/4k9p861687241077.png",
  },
  {
    file: "sudamericana.png",
    url: "https://www.thesportsdb.com/images/media/league/trophy/xtvtut1448813925.png",
  },
  {
    file: "liga-1-peru.png",
    url: "https://www.thesportsdb.com/images/media/league/trophy/vwsrsw1422053586.png",
  },
  {
    file: "taca-portugal.png",
    url: "https://www.thesportsdb.com/images/media/league/trophy/spqxps1422053380.png",
  },
  {
    file: "brasileirao.png",
    url: "https://r2.thesportsdb.com/images/media/league/trophy/02ftjh1684945323.png",
  },
  {
    file: "liga-mx.png",
    url: "https://r2.thesportsdb.com/images/media/league/trophy/rpqwss1422012934.png",
  },
  {
    file: "saudi-pro-league.png",
    url: "https://r2.thesportsdb.com/images/media/league/trophy/tkaj2z1747536256.png",
  },
  {
    file: "mls.png",
    url: "https://r2.thesportsdb.com/images/media/league/trophy/k50lm81684415987.png",
  },
  {
    file: "belgium-pro-league.png",
    url: "https://r2.thesportsdb.com/images/media/league/trophy/tvuvwy1422267731.png",
  },
  {
    file: "scottish-premiership.png",
    url: "https://r2.thesportsdb.com/images/media/league/trophy/qsqruv1422282072.png",
  },
  {
    file: "denmark-superliga.png",
    url: "https://r2.thesportsdb.com/images/media/league/trophy/uqywpu1422281651.png",
  },
  {
    file: "allsvenskan.png",
    url: "https://r2.thesportsdb.com/images/media/league/trophy/0zpqqm1610917265.png",
  },
  {
    file: "eliteserien.png",
    url: "https://r2.thesportsdb.com/images/media/league/trophy/uz9kw61778714637.png",
  },
  {
    file: "greece-super-league.png",
    url: "https://r2.thesportsdb.com/images/media/league/trophy/y96u431716371640.png",
  },
  {
    file: "a-league.png",
    url: "https://r2.thesportsdb.com/images/media/league/trophy/uxssyx1422266419.png",
  },
  {
    file: "world-cup.png",
    url: "https://r2.thesportsdb.com/images/media/league/trophy/mmyv4f1724782185.png",
  },
];

async function downloadAsPng(url: string, outFile: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  const outPath = path.join(OUT, outFile);
  await sharp(buf).png({ compressionLevel: 9 }).toFile(outPath);
  console.log("ok", outFile, fs.statSync(outPath).size);
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  for (const item of FILES) {
    try {
      await downloadAsPng(item.url, item.file);
    } catch (e) {
      console.error("fail", item.file, e);
    }
  }
}

main();
