import { NextRequest, NextResponse } from "next/server";

type ResponseItem = { reviewId: string; message: string; createdAt: string };
const memory: ResponseItem[] = [];

export async function GET() {
  return NextResponse.json({ rows: memory });
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as { reviewId?: string; message?: string };
  if (!body.reviewId || !body.message) {
    return NextResponse.json({ status: "error", message: "reviewId and message required" }, { status: 400 });
  }
  const item: ResponseItem = { reviewId: body.reviewId, message: body.message, createdAt: new Date().toISOString() };
  memory.push(item);
  return NextResponse.json({ status: "ok", item });
}

