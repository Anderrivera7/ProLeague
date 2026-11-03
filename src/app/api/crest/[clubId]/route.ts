import { readFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { LOCAL_CREST_FILENAME_BY_CLUB_ID } from "@/lib/fc-data/local-crests";

export const runtime = "nodejs";
export const revalidate = 86400;

/**
 * Proxy de escudos: Sofifa bloquea hotlinking (403) sin Referer.
 * El cliente usa /api/crest/[clubId] en vez del CDN directo.
 */
export async function GET(
  _request: Request,
  context: { params: Promise<{ clubId: string }> }
) {
  const { clubId } = await context.params;
  if (!/^\d+$/.test(clubId)) {
    return new NextResponse("Invalid club id", { status: 400 });
  }

  const cachePath = path.join(
    process.cwd(),
    "public",
    "crests",
    "cache",
    `${clubId}.png`
  );
  try {
    const cached = await readFile(cachePath);
    if (cached.byteLength > 200) {
      return new NextResponse(cached, {
        status: 200,
        headers: {
          "Content-Type": "image/png",
          "Cache-Control": "public, max-age=86400, s-maxage=86400",
        },
      });
    }
  } catch {
    /* named / remote */
  }

  const localFile = LOCAL_CREST_FILENAME_BY_CLUB_ID[clubId];
  if (localFile) {
    try {
      const buf = await readFile(
        path.join(process.cwd(), "public", "crests", localFile)
      );
      return new NextResponse(buf, {
        status: 200,
        headers: {
          "Content-Type": "image/png",
          "Cache-Control": "public, max-age=86400, s-maxage=86400",
        },
      });
    } catch {
      /* remote fallback */
    }
  }

  const sources = [
    `https://cdn.sofifa.net/teams/${clubId}/60.png`,
    `https://cdn.sofifa.net/teams/${clubId}/120.png`,
    `https://cdn.futbin.com/content/fifa26/img/clubs/${clubId}.png`,
    `https://cdn.futbin.com/content/fifa25/img/clubs/${clubId}.png`,
  ];

  for (const url of sources) {
    try {
      const res = await fetch(url, {
        signal: AbortSignal.timeout(8000),
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          Referer: url.includes("sofifa")
            ? "https://sofifa.com/"
            : "https://www.futbin.com/",
          Accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
        },
        next: { revalidate: 86400 },
      });
      if (!res.ok) continue;
      const contentType = res.headers.get("content-type") ?? "image/png";
      if (!contentType.startsWith("image/")) continue;
      const buf = await res.arrayBuffer();
      if (buf.byteLength < 200) continue;
      return new NextResponse(buf, {
        status: 200,
        headers: {
          "Content-Type": contentType,
          "Cache-Control": "public, max-age=86400, s-maxage=86400",
        },
      });
    } catch {
      /* try next */
    }
  }

  return new NextResponse("Crest not found", { status: 404 });
}
