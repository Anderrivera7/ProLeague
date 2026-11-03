import { readFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const revalidate = 86400;

const ALLOWED = /^[a-z0-9-]+$/i;

export async function GET(
  _request: Request,
  context: { params: Promise<{ code: string }> }
) {
  const { code } = await context.params;
  if (!ALLOWED.test(code)) {
    return new NextResponse("Invalid code", { status: 400 });
  }

  const local = path.join(process.cwd(), "public", "flags", `${code}.png`);
  try {
    const buf = await readFile(local);
    if (buf.byteLength > 200) {
      return new NextResponse(buf, {
        headers: {
          "Content-Type": "image/png",
          "Cache-Control": "public, max-age=86400",
        },
      });
    }
  } catch {
    /* remote */
  }

  const sources = [
    `https://flagcdn.com/w160/${code}.png`,
    `https://cdn.sofifa.net/flags/${code}.png`,
  ];

  for (const url of sources) {
    try {
      const res = await fetch(url, {
        signal: AbortSignal.timeout(8000),
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0",
          Referer: url.includes("sofifa")
            ? "https://sofifa.com/"
            : "https://flagcdn.com/",
        },
        next: { revalidate: 86400 },
      });
      if (!res.ok) continue;
      const buf = await res.arrayBuffer();
      if (buf.byteLength < 200) continue;
      return new NextResponse(buf, {
        headers: {
          "Content-Type": "image/png",
          "Cache-Control": "public, max-age=86400, s-maxage=86400",
        },
      });
    } catch {
      /* try next */
    }
  }

  return new NextResponse("Flag not found", { status: 404 });
}
