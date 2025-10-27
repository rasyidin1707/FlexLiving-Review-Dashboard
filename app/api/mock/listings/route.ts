import { NextResponse } from "next/server";
import { mockListings } from "@/data/mock/seed";

export async function GET() {
  return NextResponse.json({ rows: mockListings });
}

