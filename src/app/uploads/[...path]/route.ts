import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path: pathSegments } = await params;
  const newPath = pathSegments.join("/");
  const url = new URL(`/api/files/${newPath}`, request.url);
  return NextResponse.redirect(url, 307);
}
