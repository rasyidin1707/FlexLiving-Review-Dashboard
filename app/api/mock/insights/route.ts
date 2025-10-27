import { NextResponse } from "next/server";
import { getInsights } from "@/data/mock/seed";

export async function GET() {
  return NextResponse.json(getInsights());
}
